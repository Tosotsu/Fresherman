import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { deleteItem } from '@/utils/syncHelpers';

// Interface for emergency contact
interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

// Interface for medical record
interface MedicalRecord {
  id?: string;
  user_id: string;
  record_type: string;
  date: string;
  blood_type: string;
  height: string;
  weight: string;
  allergies: string[];
  emergency_contact: EmergencyContact;
  description: string;
  created_at?: string;
  updated_at?: string;
}

function Medical() {
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // State for medical records
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  
  // State for current record being edited or added
  const [currentRecord, setCurrentRecord] = useState<MedicalRecord>({
    user_id: '',
    record_type: 'General',
    date: new Date().toISOString().split('T')[0],
    blood_type: '',
    height: '',
    weight: '',
    allergies: [],
    emergency_contact: {
      name: '',
      relationship: '',
      phone: ''
    },
    description: ''
  });
  
  // State for editing modes
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  // State for allergy input
  const [allergyInput, setAllergyInput] = useState('');
  
  // Function to toggle sidebar
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  // Fetch user data on component mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      
      if (error || !data?.user) {
        toast({
          title: "Authentication Error",
          description: "Please sign in to view your medical records",
          variant: "destructive",
        });
        return;
      }
      
      setUserId(data.user.id);
      fetchMedicalRecords(data.user.id);
    };
    
    fetchUser();
  }, [toast]);
  
  // Fetch medical records
  const fetchMedicalRecords = async (id: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('user_id', id)
        .order('date', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setMedicalRecords(data);
      }
    } catch (error) {
      console.error('Error fetching medical records:', error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load your medical records",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle adding an allergy
  const handleAddAllergy = () => {
    if (!allergyInput.trim()) return;
    
    setCurrentRecord(prev => ({
      ...prev,
      allergies: [...(prev.allergies || []), allergyInput.trim()]
    }));
    
    setAllergyInput('');
  };
  
  // Handle removing an allergy
  const handleRemoveAllergy = (index: number) => {
    setCurrentRecord(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentRecord(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle emergency contact change
  const handleEmergencyContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentRecord(prev => ({
      ...prev,
      emergency_contact: {
        ...prev.emergency_contact,
        [name]: value
      }
    }));
  };
  
  // Start adding new record
  const handleStartAdd = () => {
    setCurrentRecord({
      user_id: userId || '',
      record_type: 'General',
      date: new Date().toISOString().split('T')[0],
      blood_type: '',
      height: '',
      weight: '',
      allergies: [],
      emergency_contact: {
        name: '',
        relationship: '',
        phone: ''
      },
      description: ''
    });
    setIsAdding(true);
    setIsEditing(false);
  };
  
  // Start editing a record
  const handleStartEdit = (record: MedicalRecord) => {
    setCurrentRecord(record);
    setIsEditing(true);
    setIsAdding(false);
  };
  
  // Cancel editing/adding
  const handleCancel = () => {
    setIsEditing(false);
    setIsAdding(false);
  };
  
  // Handle form submission
  const handleSave = async () => {
    if (!userId) {
      toast({
        title: "Authentication Error",
        description: "Please sign in to save your medical record",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const recordToSave = {
        ...currentRecord,
        user_id: userId
      };
      
      if (isAdding) {
        recordToSave.id = uuidv4();
      }
      
      const { error } = await supabase
        .from('medical_records')
        .upsert(recordToSave);
      
      if (error) throw error;
      
      toast({
        title: isAdding ? "Medical Record Added" : "Medical Record Updated",
        description: "Your medical record has been saved successfully",
      });
      
      fetchMedicalRecords(userId);
      setIsEditing(false);
      setIsAdding(false);
    } catch (error) {
      console.error('Error saving medical record:', error);
      toast({
        title: "Error Saving Record",
        description: "Failed to save your medical record",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete a record
  const handleDelete = async (id: string) => {
    if (!userId) {
      toast({
        title: "Authentication Error",
        description: "Please sign in to delete medical records",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Use the deleteItem helper which includes user_id check
      const result = await deleteItem('medical_records', id, userId);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete record from database');
      }
      
      // Update local state to reflect deletion
      setMedicalRecords(prev => prev.filter(record => record.id !== id));
      
      toast({
        title: "Medical Record Deleted",
        description: "Your medical record has been deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting medical record:', error);
      toast({
        title: "Error Deleting Record",
        description: error instanceof Error ? error.message : "Failed to delete your medical record",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Medical Information</h1>
            {!isAdding && !isEditing && (
              <Button onClick={handleStartAdd}>Add Medical Record</Button>
            )}
          </div>
          
          {/* Form for adding/editing */}
          {(isAdding || isEditing) && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{isAdding ? 'Add New Medical Record' : 'Edit Medical Record'}</CardTitle>
                <CardDescription>
                  Enter your medical information below
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="record_type">Record Type</Label>
                      <Input
                        id="record_type"
                        name="record_type"
                        value={currentRecord.record_type}
                        onChange={handleInputChange}
                        placeholder="e.g., General, Vaccination, Checkup"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        value={currentRecord.date}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="blood_type">Blood Type</Label>
                      <Input
                        id="blood_type"
                        name="blood_type"
                        value={currentRecord.blood_type}
                        onChange={handleInputChange}
                        placeholder="e.g., A+, O-, AB+"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input
                        id="height"
                        name="height"
                        value={currentRecord.height}
                        onChange={handleInputChange}
                        placeholder="e.g., 175"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        name="weight"
                        value={currentRecord.weight}
                        onChange={handleInputChange}
                        placeholder="e.g., 70"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Allergies</Label>
                    <div className="flex space-x-2 mb-2">
                      <Input
                        value={allergyInput}
                        onChange={(e) => setAllergyInput(e.target.value)}
                        placeholder="Add an allergy"
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        onClick={handleAddAllergy}
                        variant="secondary"
                      >
                        Add
                      </Button>
                    </div>
                    
                    {currentRecord.allergies && currentRecord.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {currentRecord.allergies.map((allergy, index) => (
                          <div key={index} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full flex items-center text-sm">
                            {allergy}
                            <button
                              type="button"
                              className="ml-2 text-secondary-foreground/70 hover:text-secondary-foreground"
                              onClick={() => handleRemoveAllergy(index)}
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No allergies added</p>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Emergency Contact</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={currentRecord.emergency_contact?.name || ''}
                          onChange={handleEmergencyContactChange}
                          placeholder="Contact name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="relationship">Relationship</Label>
                        <Input
                          id="relationship"
                          name="relationship"
                          value={currentRecord.emergency_contact?.relationship || ''}
                          onChange={handleEmergencyContactChange}
                          placeholder="e.g., Parent, Spouse"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={currentRecord.emergency_contact?.phone || ''}
                          onChange={handleEmergencyContactChange}
                          placeholder="Phone number"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Additional Information</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={currentRecord.description}
                      onChange={handleInputChange}
                      placeholder="Enter any additional medical information here"
                      className="min-h-[120px]"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                <Button 
                  onClick={handleSave}
                  disabled={isLoading || !currentRecord.record_type || !currentRecord.date}
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {/* Display existing records */}
          {!isAdding && !isEditing && (
            <div className="space-y-4">
              {medicalRecords.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No medical records found. Click 'Add Medical Record' to create one.</p>
                  </CardContent>
                </Card>
              ) : (
                medicalRecords.map((record) => (
                  <Card key={record.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{record.record_type}</CardTitle>
                          <CardDescription className="mt-1">
                            {new Date(record.date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </CardDescription>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleStartEdit(record)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => record.id && handleDelete(record.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm border-t pt-3">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          {record.blood_type && (
                            <div>
                              <h4 className="font-medium">Blood Type</h4>
                              <p className="text-muted-foreground">{record.blood_type}</p>
                            </div>
                          )}
                          
                          {record.height && (
                            <div>
                              <h4 className="font-medium">Height</h4>
                              <p className="text-muted-foreground">{record.height} cm</p>
                            </div>
                          )}
                          
                          {record.weight && (
                            <div>
                              <h4 className="font-medium">Weight</h4>
                              <p className="text-muted-foreground">{record.weight} kg</p>
                            </div>
                          )}
                        </div>
                        
                        {record.allergies && record.allergies.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium">Allergies</h4>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {record.allergies.map((allergy, index) => (
                                <span key={index} className="bg-secondary/50 text-secondary-foreground px-2 py-0.5 rounded-full text-xs">
                                  {allergy}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {record.emergency_contact && (record.emergency_contact.name || record.emergency_contact.phone) && (
                          <div className="mb-4">
                            <h4 className="font-medium">Emergency Contact</h4>
                            <div className="text-muted-foreground">
                              {record.emergency_contact.name && (
                                <p>{record.emergency_contact.name} 
                                  {record.emergency_contact.relationship && ` (${record.emergency_contact.relationship})`}
                                </p>
                              )}
                              {record.emergency_contact.phone && <p>{record.emergency_contact.phone}</p>}
                            </div>
                          </div>
                        )}
                        
                        {record.description && (
                          <div>
                            <h4 className="font-medium">Additional Information</h4>
                            <p className="text-muted-foreground">{record.description}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Medical; 