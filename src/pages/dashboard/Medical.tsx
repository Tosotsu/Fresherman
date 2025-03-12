import { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { Heart, PlusCircle, Save, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { v4 as uuidv4 } from 'uuid';
import useLocalStorage from '@/hooks/useLocalStorage';
import { syncDataWithSupabase, fetchUserData, deleteItem, getCurrentUser } from '@/utils/syncHelpers';

interface MedicalCondition {
  id?: string;
  name: string;
  diagnosedDate: string;
  medications: string;
  notes: string;
  user_id?: string;
}

interface Medication {
  id?: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  purpose: string;
  user_id?: string;
}

interface Allergy {
  id?: string;
  allergen: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  reaction: string;
  diagnosed: string;
  user_id?: string;
}

interface GeneralInfo {
  bloodType: string;
  height: string;
  weight: string;
  primaryPhysician: string;
  emergencyContact: string;
  lastCheckup: string;
  notes: string;
}

const Medical = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Use localStorage to persist data between page navigations
  const [generalInfo, setGeneralInfo] = useLocalStorage<GeneralInfo>('user-medical-general', {
    bloodType: 'O+',
    height: '175',
    weight: '70',
    primaryPhysician: 'Dr. Jane Smith',
    emergencyContact: 'John Doe (555-123-4567)',
    lastCheckup: '2023-06-10',
    notes: 'Generally in good health. Annual checkup recommended.'
  });
  
  const [conditions, setConditions] = useLocalStorage<MedicalCondition[]>('user-medical-conditions', []);
  const [medications, setMedications] = useLocalStorage<Medication[]>('user-medical-medications', []);
  const [allergies, setAllergies] = useLocalStorage<Allergy[]>('user-medical-allergies', []);

  // New records
  const [newCondition, setNewCondition] = useState<Omit<MedicalCondition, 'id' | 'user_id'>>({
    name: '',
    diagnosedDate: '',
    medications: '',
    notes: ''
  });
  
  const [newMedication, setNewMedication] = useState<Omit<Medication, 'id' | 'user_id'>>({
    name: '',
    dosage: '',
    frequency: '',
    startDate: '',
    endDate: '',
    purpose: ''
  });
  
  const [newAllergy, setNewAllergy] = useState<Omit<Allergy, 'id' | 'user_id'>>({
    allergen: '',
    severity: 'Mild',
    reaction: '',
    diagnosed: ''
  });

  const supabase = createClientComponentClient();

  // Fetch data when component mounts
  useEffect(() => {
    const fetchMedicalData = async () => {
      setIsLoading(true);
      
      try {
        // Get current user
        const user = await getCurrentUser();
        
        if (!user) {
          toast.error('Please sign in to view your medical records');
          setIsLoading(false);
          return;
        }
        
        setUserId(user.id);
        
        // Fetch medical conditions
        const conditionsResult = await fetchUserData<MedicalCondition>('medical_conditions', user.id);
        
        if (conditionsResult.error) {
          console.error('Error fetching conditions:', conditionsResult.error);
        } else if (conditionsResult.data) {
          setConditions(conditionsResult.data);
        }
        
        // Fetch medications
        const medicationsResult = await fetchUserData<Medication>('medications', user.id);
        
        if (medicationsResult.error) {
          console.error('Error fetching medications:', medicationsResult.error);
        } else if (medicationsResult.data) {
          setMedications(medicationsResult.data);
        }
        
        // Fetch allergies
        const allergiesResult = await fetchUserData<Allergy>('allergies', user.id);
        
        if (allergiesResult.error) {
          console.error('Error fetching allergies:', allergiesResult.error);
        } else if (allergiesResult.data) {
          setAllergies(allergiesResult.data);
        }
        
        // Fetch general info from medical_records
        const { data: medicalRecordsData, error: medicalRecordsError } = await supabase
          .from('medical_records')
          .select('*')
          .eq('record_type', 'general_info')
          .eq('user_id', user.id)
          .single();
        
        if (medicalRecordsError) {
          console.error('Error fetching general info:', medicalRecordsError);
        } else if (medicalRecordsData?.description) {
          try {
            const parsedInfo = JSON.parse(medicalRecordsData.description);
            setGeneralInfo(parsedInfo);
          } catch (e) {
            console.error('Failed to parse general info', e);
          }
        }
      } catch (error) {
        console.error('Error fetching medical data:', error);
        toast.error('Failed to load your medical information');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMedicalData();
  }, []);

  // Toggle functions
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  
  // Handler functions
  const handleGeneralInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGeneralInfo(prev => ({ ...prev, [name]: value }));
  };
  
  const handleBloodTypeChange = (value: string) => {
    setGeneralInfo(prev => ({ ...prev, bloodType: value }));
  };
  
  const handleSaveGeneralInfo = async () => {
    if (!userId) {
      toast.error('You must be logged in to save information');
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .upsert({
          user_id: userId,
          record_type: 'general_info',
          description: JSON.stringify(generalInfo),
          provider: generalInfo.primaryPhysician,
          date: generalInfo.lastCheckup
        })
        .select();
      
      if (error) throw error;
      toast.success('General medical information saved successfully');
    } catch (error) {
      console.error('Error saving general info:', error);
      toast.error('Failed to save medical information');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddCondition = async () => {
    if (!newCondition.name) {
      toast.error('Condition name is required');
      return;
    }
    
    if (!userId) {
      toast.error('You must be logged in to add a condition');
      return;
    }

    setIsLoading(true);
    
    try {
      const conditionId = uuidv4();
      const conditionWithId = { 
        ...newCondition, 
        id: conditionId,
        user_id: userId
      };
      
      // Add to local state first for immediate UI update
      setConditions(prev => [...prev, conditionWithId]);
      
      // Then sync with Supabase
      const result = await syncDataWithSupabase('medical_conditions', [conditionWithId], userId);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Clear the form
      setNewCondition({
        name: '',
        diagnosedDate: '',
        medications: '',
        notes: ''
      });
      
      toast.success('Medical condition added successfully');
    } catch (error) {
      console.error('Error adding condition:', error);
      toast.error('Failed to add medical condition');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteCondition = async (id: string) => {
    if (!userId) {
      toast.error('You must be logged in to delete a condition');
      return;
    }

    setIsLoading(true);
    
    try {
      // Delete from Supabase first
      const result = await deleteItem('medical_conditions', id, userId);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Then update local state
      setConditions(prev => prev.filter(condition => condition.id !== id));
      toast.success('Medical condition removed');
    } catch (error) {
      console.error('Error deleting condition:', error);
      toast.error('Failed to remove medical condition');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddMedication = async () => {
    if (!newMedication.name) {
      toast.error('Medication name is required');
      return;
    }
    
    if (!userId) {
      toast.error('You must be logged in to add a medication');
      return;
    }

    setIsLoading(true);
    
    try {
      const medicationId = uuidv4();
      const medicationWithId = { 
        ...newMedication, 
        id: medicationId,
        user_id: userId
      };
      
      // Add to local state first for immediate UI update
      setMedications(prev => [...prev, medicationWithId]);
      
      // Then sync with Supabase
      const result = await syncDataWithSupabase('medications', [medicationWithId], userId);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Clear the form
      setNewMedication({
        name: '',
        dosage: '',
        frequency: '',
        startDate: '',
        endDate: '',
        purpose: ''
      });
      
      toast.success('Medication added successfully');
    } catch (error) {
      console.error('Error adding medication:', error);
      toast.error('Failed to add medication');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteMedication = async (id: string) => {
    if (!userId) {
      toast.error('You must be logged in to delete a medication');
      return;
    }

    setIsLoading(true);
    
    try {
      // Delete from Supabase first
      const result = await deleteItem('medications', id, userId);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Then update local state
      setMedications(prev => prev.filter(medication => medication.id !== id));
      toast.success('Medication removed');
    } catch (error) {
      console.error('Error deleting medication:', error);
      toast.error('Failed to remove medication');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddAllergy = async () => {
    if (!newAllergy.allergen) {
      toast.error('Allergen name is required');
      return;
    }
    
    if (!userId) {
      toast.error('You must be logged in to add an allergy');
      return;
    }

    setIsLoading(true);
    
    try {
      const allergyId = uuidv4();
      const allergyWithId = { 
        ...newAllergy, 
        id: allergyId,
        user_id: userId
      };
      
      // Add to local state first for immediate UI update
      setAllergies(prev => [...prev, allergyWithId]);
      
      // Then sync with Supabase
      const result = await syncDataWithSupabase('allergies', [allergyWithId], userId);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Clear the form
      setNewAllergy({
        allergen: '',
        severity: 'Mild',
        reaction: '',
        diagnosed: ''
      });
      
      toast.success('Allergy added successfully');
    } catch (error) {
      console.error('Error adding allergy:', error);
      toast.error('Failed to add allergy');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteAllergy = async (id: string) => {
    if (!userId) {
      toast.error('You must be logged in to delete an allergy');
      return;
    }

    setIsLoading(true);
    
    try {
      // Delete from Supabase first
      const result = await deleteItem('allergies', id, userId);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Then update local state
      setAllergies(prev => prev.filter(allergy => allergy.id !== id));
      toast.success('Allergy removed');
    } catch (error) {
      console.error('Error deleting allergy:', error);
      toast.error('Failed to remove allergy');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNewConditionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCondition(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNewMedicationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewMedication(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNewAllergyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewAllergy(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSeverityChange = (value: string) => {
    setNewAllergy(prev => ({ ...prev, severity: value as 'Mild' | 'Moderate' | 'Severe' }));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Show sidebar for larger screens */}
      <div className="hidden md:block">
        <Sidebar 
          isCollapsed={isCollapsed} 
          toggleSidebar={toggleSidebar}
          onMobileClose={closeMobileMenu}
        />
      </div>
      
      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-full max-w-xs">
            <Sidebar 
              isCollapsed={false} 
              toggleSidebar={toggleSidebar}
              onMobileClose={closeMobileMenu}
            />
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <div className="relative flex-shrink-0 flex h-16 bg-card border-b border-border/40">
          <button
            type="button"
            className="md:hidden px-4 text-muted-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu">
              <line x1="4" x2="20" y1="12" y2="12"></line>
              <line x1="4" x2="20" y1="6" y2="6"></line>
              <line x1="4" x2="20" y1="18" y2="18"></line>
            </svg>
          </button>
          <div className="flex-1 flex justify-between px-4 md:px-6">
            <div className="flex-1 flex items-center">
              <h1 className="text-xl font-semibold flex items-center">
                <Heart className="h-6 w-6 mr-2 text-primary" />
                Medical Records
              </h1>
            </div>
          </div>
        </div>
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none p-4 md:p-6">
          <Tabs defaultValue="general" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="conditions">Conditions</TabsTrigger>
              <TabsTrigger value="medications">Medications</TabsTrigger>
              <TabsTrigger value="allergies">Allergies</TabsTrigger>
            </TabsList>
            
            {/* General Information */}
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Medical Information</CardTitle>
                  <CardDescription>
                    Manage your basic medical information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bloodType">Blood Type</Label>
                      <Select value={generalInfo.bloodType} onValueChange={handleBloodTypeChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input 
                        id="height" 
                        name="height" 
                        value={generalInfo.height} 
                        onChange={handleGeneralInfoChange} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input 
                        id="weight" 
                        name="weight" 
                        value={generalInfo.weight} 
                        onChange={handleGeneralInfoChange} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="primaryPhysician">Primary Physician</Label>
                      <Input 
                        id="primaryPhysician" 
                        name="primaryPhysician" 
                        value={generalInfo.primaryPhysician} 
                        onChange={handleGeneralInfoChange} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact">Emergency Contact</Label>
                      <Input 
                        id="emergencyContact" 
                        name="emergencyContact" 
                        value={generalInfo.emergencyContact} 
                        onChange={handleGeneralInfoChange} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastCheckup">Last Checkup</Label>
                      <Input 
                        id="lastCheckup" 
                        name="lastCheckup" 
                        type="date" 
                        value={generalInfo.lastCheckup} 
                        onChange={handleGeneralInfoChange} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea 
                      id="notes" 
                      name="notes" 
                      value={generalInfo.notes} 
                      onChange={handleGeneralInfoChange} 
                      rows={4}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveGeneralInfo} disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Information
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Medical Conditions */}
            <TabsContent value="conditions">
              <Card>
                <CardHeader>
                  <CardTitle>Medical Conditions</CardTitle>
                  <CardDescription>
                    Manage your medical conditions and diagnoses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* List of existing conditions */}
                  {conditions.length > 0 ? (
                    <div className="space-y-4">
                      {conditions.map((condition) => (
                        <div key={condition.id} className="p-4 border rounded-lg relative">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-2 right-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => condition.id && handleDeleteCondition(condition.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                              <h4 className="font-semibold">{condition.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                Diagnosed: {condition.diagnosedDate ? new Date(condition.diagnosedDate).toLocaleDateString() : 'Unknown'}
                              </p>
                            </div>
                            
                            {condition.medications && (
                              <div>
                                <p className="text-sm font-medium">Medications:</p>
                                <p className="text-sm text-muted-foreground">{condition.medications}</p>
                              </div>
                            )}
                          </div>
                          
                          {condition.notes && (
                            <div className="mt-2">
                              <p className="text-sm font-medium">Notes:</p>
                              <p className="text-sm text-muted-foreground">{condition.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 text-muted-foreground">
                      No medical conditions recorded
                    </div>
                  )}
                  
                  <Separator />
                  
                  {/* Add new condition */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Add New Condition</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="conditionName">Condition Name*</Label>
                        <Input 
                          id="conditionName"
                          name="name"
                          value={newCondition.name}
                          onChange={handleNewConditionChange}
                          placeholder="E.g., Hypertension"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="diagnosedDate">Diagnosed Date</Label>
                        <Input 
                          id="diagnosedDate"
                          name="diagnosedDate"
                          type="date"
                          value={newCondition.diagnosedDate}
                          onChange={handleNewConditionChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="medications">Medications</Label>
                        <Input 
                          id="medications"
                          name="medications"
                          value={newCondition.medications}
                          onChange={handleNewConditionChange}
                          placeholder="Current medications for this condition"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="conditionNotes">Notes</Label>
                      <Textarea 
                        id="conditionNotes"
                        name="notes"
                        value={newCondition.notes}
                        onChange={handleNewConditionChange}
                        placeholder="Additional information about this condition"
                        rows={3}
                      />
                    </div>
                    
                    <Button onClick={handleAddCondition} disabled={isLoading}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Condition
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Medications */}
            <TabsContent value="medications">
              <Card>
                <CardHeader>
                  <CardTitle>Medications</CardTitle>
                  <CardDescription>
                    Track your current and past medications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* List of existing medications */}
                  {medications.length > 0 ? (
                    <div className="space-y-4">
                      {medications.map((medication) => (
                        <div key={medication.id} className="p-4 border rounded-lg relative">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-2 right-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => medication.id && handleDeleteMedication(medication.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div>
                              <h4 className="font-semibold">{medication.name} {medication.dosage}</h4>
                              <p className="text-sm text-muted-foreground">{medication.frequency}</p>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium">Purpose:</p>
                              <p className="text-sm text-muted-foreground">{medication.purpose}</p>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium">Duration:</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(medication.startDate).toLocaleDateString()}
                                {medication.endDate ? ` to ${new Date(medication.endDate).toLocaleDateString()}` : ' to Present'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 text-muted-foreground">
                      No medications recorded
                    </div>
                  )}
                  
                  <Separator />
                  
                  {/* Add new medication */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Add New Medication</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="medicationName">Medication Name*</Label>
                        <Input 
                          id="medicationName"
                          name="name"
                          value={newMedication.name}
                          onChange={handleNewMedicationChange}
                          placeholder="E.g., Lisinopril"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="dosage">Dosage</Label>
                        <Input 
                          id="dosage"
                          name="dosage"
                          value={newMedication.dosage}
                          onChange={handleNewMedicationChange}
                          placeholder="E.g., 10mg"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="frequency">Frequency</Label>
                        <Input 
                          id="frequency"
                          name="frequency"
                          value={newMedication.frequency}
                          onChange={handleNewMedicationChange}
                          placeholder="E.g., Once daily"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="medicationStartDate">Start Date</Label>
                        <Input 
                          id="medicationStartDate"
                          name="startDate"
                          type="date"
                          value={newMedication.startDate}
                          onChange={handleNewMedicationChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="medicationEndDate">End Date (if applicable)</Label>
                        <Input 
                          id="medicationEndDate"
                          name="endDate"
                          type="date"
                          value={newMedication.endDate}
                          onChange={handleNewMedicationChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="purpose">Purpose</Label>
                        <Input 
                          id="purpose"
                          name="purpose"
                          value={newMedication.purpose}
                          onChange={handleNewMedicationChange}
                          placeholder="What is this medication treating?"
                        />
                      </div>
                    </div>
                    
                    <Button onClick={handleAddMedication} disabled={isLoading}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Medication
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Allergies */}
            <TabsContent value="allergies">
              <Card>
                <CardHeader>
                  <CardTitle>Allergies</CardTitle>
                  <CardDescription>
                    Manage your allergies and sensitivities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* List of existing allergies */}
                  {allergies.length > 0 ? (
                    <div className="space-y-4">
                      {allergies.map((allergy) => (
                        <div key={allergy.id} className="p-4 border rounded-lg relative">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-2 right-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => allergy.id && handleDeleteAllergy(allergy.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                              <h4 className="font-semibold flex items-center gap-2">
                                {allergy.allergen}
                                <Badge
                                  variant={
                                    allergy.severity === 'Severe' ? 'destructive' :
                                    allergy.severity === 'Moderate' ? 'secondary' : 'outline'
                                  }
                                >
                                  {allergy.severity}
                                </Badge>
                              </h4>
                              {allergy.diagnosed && (
                                <p className="text-sm text-muted-foreground">
                                  Diagnosed: {new Date(allergy.diagnosed).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium">Reaction:</p>
                              <p className="text-sm text-muted-foreground">{allergy.reaction}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 text-muted-foreground">
                      No allergies recorded
                    </div>
                  )}
                  
                  <Separator />
                  
                  {/* Add new allergy */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Add New Allergy</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="allergen">Allergen*</Label>
                        <Input 
                          id="allergen"
                          name="allergen"
                          value={newAllergy.allergen}
                          onChange={handleNewAllergyChange}
                          placeholder="E.g., Peanuts, Penicillin"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="allergySeverity">Severity</Label>
                        <Select value={newAllergy.severity} onValueChange={handleSeverityChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select severity" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Mild">Mild</SelectItem>
                            <SelectItem value="Moderate">Moderate</SelectItem>
                            <SelectItem value="Severe">Severe</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="reaction">Reaction</Label>
                        <Input 
                          id="reaction"
                          name="reaction"
                          value={newAllergy.reaction}
                          onChange={handleNewAllergyChange}
                          placeholder="E.g., Hives, Difficulty breathing"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="diagnosed">Diagnosed Date</Label>
                        <Input 
                          id="diagnosed"
                          name="diagnosed"
                          type="date"
                          value={newAllergy.diagnosed}
                          onChange={handleNewAllergyChange}
                        />
                      </div>
                    </div>
                    
                    <Button onClick={handleAddAllergy} disabled={isLoading}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Allergy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Medical; 