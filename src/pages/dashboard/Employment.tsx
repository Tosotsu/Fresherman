import { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { Briefcase, PlusCircle, Save, Trash2, Calendar, Building, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { v4 as uuidv4 } from 'uuid';
import useLocalStorage from '@/hooks/useLocalStorage';
import { syncDataWithSupabase, fetchUserData, deleteItem, getCurrentUser } from '@/utils/syncHelpers';

interface EmploymentRecord {
  id?: string;
  employer: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrentEmployer: boolean;
  location: string;
  description: string;
  responsibilities: string[];
  skills: string[];
  user_id?: string;
}

interface Education {
  id?: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
  user_id?: string;
}

interface Certification {
  id?: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  description: string;
  user_id?: string;
}

const Employment = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('employment');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Use localStorage to persist data between page navigations
  const [employmentRecords, setEmploymentRecords] = useLocalStorage<EmploymentRecord[]>('user-employment-records', []);
  const [educationRecords, setEducationRecords] = useLocalStorage<Education[]>('user-education-records', []);
  const [certifications, setCertifications] = useLocalStorage<Certification[]>('user-certifications', []);

  // New records
  const [newEmployment, setNewEmployment] = useState<Omit<EmploymentRecord, 'id' | 'responsibilities' | 'skills' | 'user_id'>>({
    employer: '',
    position: '',
    startDate: '',
    endDate: '',
    isCurrentEmployer: false,
    location: '',
    description: ''
  });
  
  const [newResponsibilities, setNewResponsibilities] = useState('');
  const [newSkills, setNewSkills] = useState('');
  
  const [newEducation, setNewEducation] = useState<Omit<Education, 'id' | 'user_id'>>({
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    description: ''
  });
  
  const [newCertification, setNewCertification] = useState<Omit<Certification, 'id' | 'user_id'>>({
    name: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    description: ''
  });

  const supabase = createClientComponentClient();

  // Fetch data when component mounts
  useEffect(() => {
    const fetchEmploymentData = async () => {
      setIsLoading(true);
      
      try {
        // Get current user
        const user = await getCurrentUser();
        
        if (!user) {
          toast.error('Please sign in to view your employment records');
          setIsLoading(false);
          return;
        }
        
        setUserId(user.id);
        
        // Fetch employment records
        const employmentResult = await fetchUserData<EmploymentRecord>('employment', user.id);
        
        if (employmentResult.error) {
          console.error('Error fetching employment records:', employmentResult.error);
        } else if (employmentResult.data && employmentResult.data.length > 0) {
          const formattedRecords = employmentResult.data.map(item => ({
            id: item.id,
            employer: item.employer || item.company, // Handle different field names
            position: item.position,
            startDate: item.startDate || item.start_date,
            endDate: item.endDate || item.end_date,
            isCurrentEmployer: item.isCurrentEmployer || item.is_current,
            location: item.location || '',
            description: item.description || '',
            responsibilities: Array.isArray(item.responsibilities) ? item.responsibilities : 
              (typeof item.responsibilities === 'string' ? JSON.parse(item.responsibilities) : []),
            skills: Array.isArray(item.skills) ? item.skills : 
              (typeof item.skills === 'string' ? JSON.parse(item.skills) : []),
            user_id: item.user_id
          }));
          
          setEmploymentRecords(formattedRecords);
        }
        
        // Fetch education records
        const educationResult = await fetchUserData<Education>('education', user.id);
        
        if (educationResult.error) {
          console.error('Error fetching education records:', educationResult.error);
        } else if (educationResult.data && educationResult.data.length > 0) {
          const formattedEducation = educationResult.data.map(item => ({
            id: item.id,
            institution: item.institution,
            degree: item.degree,
            field: item.field || item.field_of_study,
            startDate: item.startDate || item.start_year,
            endDate: item.endDate || item.end_year,
            description: item.description || '',
            user_id: item.user_id
          }));
          
          setEducationRecords(formattedEducation);
        }
        
        // Fetch certifications
        const certResult = await fetchUserData<Certification>('certifications', user.id);
        
        if (certResult.error) {
          console.error('Error fetching certifications:', certResult.error);
        } else if (certResult.data && certResult.data.length > 0) {
          const formattedCertifications = certResult.data.map(item => ({
            id: item.id,
            name: item.name,
            issuer: item.issuer,
            issueDate: item.issueDate || item.issue_date,
            expiryDate: item.expiryDate || item.expiry_date,
            credentialId: item.credentialId || item.credential_id,
            description: item.description || '',
            user_id: item.user_id
          }));
          
          setCertifications(formattedCertifications);
        }
      } catch (error) {
        console.error('Error fetching employment data:', error);
        toast.error('Failed to load your employment information');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEmploymentData();
  }, []);

  // Toggle functions
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  
  // Handler functions
  const handleNewEmploymentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEmployment(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCurrentEmployerToggle = (checked: boolean) => {
    setNewEmployment(prev => ({
      ...prev,
      isCurrentEmployer: checked,
      endDate: checked ? '' : prev.endDate
    }));
  };
  
  const handleNewEducationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEducation(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNewCertificationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCertification(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddEmployment = async () => {
    if (!newEmployment.employer || !newEmployment.position || !newEmployment.startDate) {
      toast.error('Employer, position, and start date are required');
      return;
    }
    
    if (!userId) {
      toast.error('You must be logged in to add employment information');
      return;
    }

    setIsLoading(true);
    
    // Parse responsibilities and skills from comma-separated strings
    const responsibilities = newResponsibilities
      .split(',')
      .map(item => item.trim())
      .filter(item => item !== '');
    
    const skills = newSkills
      .split(',')
      .map(item => item.trim())
      .filter(item => item !== '');
    
    try {
      const employmentId = uuidv4();
      const employmentWithId = {
        ...newEmployment,
        id: employmentId,
        user_id: userId,
        responsibilities,
        skills
      };
      
      // Add to local state first for immediate UI update
      setEmploymentRecords(prev => [...prev, employmentWithId]);
      
      // Then sync with Supabase
      const result = await syncDataWithSupabase('employment', [{
        id: employmentId,
        user_id: userId,
        company: newEmployment.employer,
        position: newEmployment.position,
        start_date: newEmployment.startDate,
        end_date: newEmployment.endDate,
        is_current: newEmployment.isCurrentEmployer,
        location: newEmployment.location,
        description: newEmployment.description,
        responsibilities: JSON.stringify(responsibilities),
        skills: JSON.stringify(skills)
      }], userId);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Reset form
      setNewEmployment({
        employer: '',
        position: '',
        startDate: '',
        endDate: '',
        isCurrentEmployer: false,
        location: '',
        description: ''
      });
      setNewResponsibilities('');
      setNewSkills('');
      
      toast.success('Employment record added successfully');
    } catch (error) {
      console.error('Error adding employment record:', error);
      toast.error('Failed to add employment record');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteEmployment = async (id: string) => {
    if (!userId) {
      toast.error('You must be logged in to delete an employment record');
      return;
    }

    setIsLoading(true);
    
    try {
      // Delete from Supabase first
      const result = await deleteItem('employment', id, userId);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Then update local state
      setEmploymentRecords(prev => prev.filter(record => record.id !== id));
      toast.success('Employment record removed');
    } catch (error) {
      console.error('Error deleting employment record:', error);
      toast.error('Failed to remove employment record');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddEducation = async () => {
    if (!newEducation.institution || !newEducation.degree || !newEducation.startDate) {
      toast.error('Institution, degree, and start date are required');
      return;
    }
    
    if (!userId) {
      toast.error('You must be logged in to add education information');
      return;
    }

    setIsLoading(true);
    
    try {
      const educationId = uuidv4();
      const educationWithId = {
        ...newEducation,
        id: educationId,
        user_id: userId
      };
      
      // Add to local state first for immediate UI update
      setEducationRecords(prev => [...prev, educationWithId]);
      
      // Then sync with Supabase
      const result = await syncDataWithSupabase('education', [{
        id: educationId,
        user_id: userId,
        institution: newEducation.institution,
        degree: newEducation.degree,
        field_of_study: newEducation.field,
        start_year: newEducation.startDate,
        end_year: newEducation.endDate,
        description: newEducation.description
      }], userId);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Reset form
      setNewEducation({
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        description: ''
      });
      
      toast.success('Education record added successfully');
    } catch (error) {
      console.error('Error adding education record:', error);
      toast.error('Failed to add education record');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteEducation = async (id: string) => {
    if (!userId) {
      toast.error('You must be logged in to delete an education record');
      return;
    }

    setIsLoading(true);
    
    try {
      // Delete from Supabase first
      const result = await deleteItem('education', id, userId);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Then update local state
      setEducationRecords(prev => prev.filter(record => record.id !== id));
      toast.success('Education record removed');
    } catch (error) {
      console.error('Error deleting education record:', error);
      toast.error('Failed to remove education record');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddCertification = async () => {
    if (!newCertification.name || !newCertification.issuer || !newCertification.issueDate) {
      toast.error('Name, issuer, and issue date are required');
      return;
    }
    
    if (!userId) {
      toast.error('You must be logged in to add a certification');
      return;
    }

    setIsLoading(true);
    
    try {
      const certificationId = uuidv4();
      const certificationWithId = {
        ...newCertification,
        id: certificationId,
        user_id: userId
      };
      
      // Add to local state first for immediate UI update
      setCertifications(prev => [...prev, certificationWithId]);
      
      // Then sync with Supabase
      const result = await syncDataWithSupabase('certifications', [{
        id: certificationId,
        user_id: userId,
        name: newCertification.name,
        issuer: newCertification.issuer,
        issue_date: newCertification.issueDate,
        expiry_date: newCertification.expiryDate,
        credential_id: newCertification.credentialId,
        description: newCertification.description
      }], userId);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Reset form
      setNewCertification({
        name: '',
        issuer: '',
        issueDate: '',
        expiryDate: '',
        credentialId: '',
        description: ''
      });
      
      toast.success('Certification added successfully');
    } catch (error) {
      console.error('Error adding certification:', error);
      toast.error('Failed to add certification');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteCertification = async (id: string) => {
    if (!userId) {
      toast.error('You must be logged in to delete a certification');
      return;
    }

    setIsLoading(true);
    
    try {
      // Delete from Supabase first
      const result = await deleteItem('certifications', id, userId);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Then update local state
      setCertifications(prev => prev.filter(cert => cert.id !== id));
      toast.success('Certification removed');
    } catch (error) {
      console.error('Error deleting certification:', error);
      toast.error('Failed to remove certification');
    } finally {
      setIsLoading(false);
    }
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
                <Briefcase className="h-6 w-6 mr-2 text-primary" />
                Employment & Education
              </h1>
            </div>
          </div>
        </div>
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none p-4 md:p-6">
          <div className="space-y-6">
            <div className="flex justify-start space-x-4 border-b pb-2">
              <Button 
                variant={activeSection === 'employment' ? 'default' : 'ghost'} 
                onClick={() => setActiveSection('employment')}
                className="flex items-center gap-2"
              >
                <Briefcase className="h-4 w-4" />
                Employment
              </Button>
              <Button 
                variant={activeSection === 'education' ? 'default' : 'ghost'} 
                onClick={() => setActiveSection('education')}
                className="flex items-center gap-2"
              >
                <Building className="h-4 w-4" />
                Education
              </Button>
              <Button 
                variant={activeSection === 'certifications' ? 'default' : 'ghost'} 
                onClick={() => setActiveSection('certifications')}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Certifications
              </Button>
            </div>
            
            {/* Employment Section */}
            {activeSection === 'employment' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Employment History</CardTitle>
                    <CardDescription>
                      Record your employment history and work experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Existing employment records */}
                    {employmentRecords.length > 0 ? (
                      <div className="space-y-6">
                        {employmentRecords.map((record) => (
                          <div key={record.id} className="p-4 border rounded-lg relative">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="absolute top-2 right-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteEmployment(record.id!)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3 pr-8">
                              <div>
                                <h3 className="text-lg font-semibold">{record.position}</h3>
                                <div className="flex items-center text-muted-foreground">
                                  <Building className="h-4 w-4 mr-1" />
                                  <span className="font-medium">{record.employer}</span>
                                </div>
                              </div>
                              
                              <div className="flex flex-col items-start md:items-end">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{record.location}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    {new Date(record.startDate).toLocaleDateString()} - 
                                    {record.isCurrentEmployer 
                                      ? ' Present' 
                                      : record.endDate
                                        ? ` ${new Date(record.endDate).toLocaleDateString()}`
                                        : ' Unknown'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {record.description && (
                              <div className="mb-3">
                                <p className="text-sm">{record.description}</p>
                              </div>
                            )}
                            
                            {record.responsibilities.length > 0 && (
                              <div className="mb-3">
                                <h4 className="text-sm font-medium mb-1">Responsibilities:</h4>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                  {record.responsibilities.map((responsibility, index) => (
                                    <li key={index}>{responsibility}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {record.skills.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {record.skills.map((skill, index) => (
                                  <Badge key={index} variant="secondary">{skill}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-4 text-muted-foreground">
                        No employment records found
                      </div>
                    )}
                    
                    <Separator />
                    
                    {/* Add new employment record */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Add New Employment</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="employer">Employer*</Label>
                          <Input 
                            id="employer" 
                            name="employer" 
                            value={newEmployment.employer} 
                            onChange={handleNewEmploymentChange} 
                            placeholder="Company name"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="position">Position*</Label>
                          <Input 
                            id="position" 
                            name="position" 
                            value={newEmployment.position} 
                            onChange={handleNewEmploymentChange} 
                            placeholder="Job title"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input 
                            id="location" 
                            name="location" 
                            value={newEmployment.location} 
                            onChange={handleNewEmploymentChange} 
                            placeholder="City, State"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="startDate">Start Date*</Label>
                          <Input 
                            id="startDate" 
                            name="startDate" 
                            type="date" 
                            value={newEmployment.startDate} 
                            onChange={handleNewEmploymentChange} 
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="currentEmployer">Current Employer</Label>
                            <Switch 
                              id="currentEmployer"
                              checked={newEmployment.isCurrentEmployer}
                              onCheckedChange={handleCurrentEmployerToggle}
                            />
                          </div>
                        </div>
                        
                        {!newEmployment.isCurrentEmployer && (
                          <div className="space-y-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input 
                              id="endDate" 
                              name="endDate" 
                              type="date" 
                              value={newEmployment.endDate} 
                              onChange={handleNewEmploymentChange} 
                              disabled={newEmployment.isCurrentEmployer}
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea 
                          id="description" 
                          name="description" 
                          value={newEmployment.description} 
                          onChange={handleNewEmploymentChange} 
                          placeholder="Brief description of your role and achievements"
                          rows={2}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="responsibilities">Responsibilities (comma separated)</Label>
                        <Textarea 
                          id="responsibilities" 
                          value={newResponsibilities} 
                          onChange={(e) => setNewResponsibilities(e.target.value)} 
                          placeholder="Led team of 5 developers, Implemented new features, etc."
                          rows={2}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="skills">Skills (comma separated)</Label>
                        <Input 
                          id="skills" 
                          value={newSkills} 
                          onChange={(e) => setNewSkills(e.target.value)} 
                          placeholder="React, JavaScript, Project Management, etc."
                        />
                      </div>
                      
                      <Button onClick={handleAddEmployment}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Employment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* Education Section */}
            {activeSection === 'education' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Education</CardTitle>
                    <CardDescription>
                      Record your educational background and qualifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Existing education records */}
                    {educationRecords.length > 0 ? (
                      <div className="space-y-6">
                        {educationRecords.map((record) => (
                          <div key={record.id} className="p-4 border rounded-lg relative">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="absolute top-2 right-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteEducation(record.id!)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                              <div>
                                <h3 className="text-lg font-semibold">{record.degree} in {record.field}</h3>
                                <div className="text-muted-foreground">
                                  <span className="font-medium">{record.institution}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {new Date(record.startDate).toLocaleDateString()} - 
                                  {record.endDate ? ` ${new Date(record.endDate).toLocaleDateString()}` : ' Present'}
                                </span>
                              </div>
                            </div>
                            
                            {record.description && (
                              <div>
                                <p className="text-sm">{record.description}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-4 text-muted-foreground">
                        No education records found
                      </div>
                    )}
                    
                    <Separator />
                    
                    {/* Add new education record */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Add New Education</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="institution">Institution*</Label>
                          <Input 
                            id="institution" 
                            name="institution" 
                            value={newEducation.institution} 
                            onChange={handleNewEducationChange} 
                            placeholder="University or school name"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="degree">Degree*</Label>
                          <Input 
                            id="degree" 
                            name="degree" 
                            value={newEducation.degree} 
                            onChange={handleNewEducationChange} 
                            placeholder="Bachelor of Science, Master's, etc."
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="field">Field of Study</Label>
                          <Input 
                            id="field" 
                            name="field" 
                            value={newEducation.field} 
                            onChange={handleNewEducationChange} 
                            placeholder="Computer Science, Business, etc."
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="educationStartDate">Start Date*</Label>
                          <Input 
                            id="educationStartDate" 
                            name="startDate" 
                            type="date" 
                            value={newEducation.startDate} 
                            onChange={handleNewEducationChange} 
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="educationEndDate">End Date</Label>
                          <Input 
                            id="educationEndDate" 
                            name="endDate" 
                            type="date" 
                            value={newEducation.endDate} 
                            onChange={handleNewEducationChange} 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="educationDescription">Description</Label>
                        <Textarea 
                          id="educationDescription" 
                          name="description" 
                          value={newEducation.description} 
                          onChange={handleNewEducationChange} 
                          placeholder="Notable achievements, activities, or GPA"
                          rows={2}
                        />
                      </div>
                      
                      <Button onClick={handleAddEducation}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Education
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* Certifications Section */}
            {activeSection === 'certifications' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Certifications & Licenses</CardTitle>
                    <CardDescription>
                      Record your professional certifications and licenses
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Existing certifications */}
                    {certifications.length > 0 ? (
                      <div className="space-y-6">
                        {certifications.map((cert) => (
                          <div key={cert.id} className="p-4 border rounded-lg relative">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="absolute top-2 right-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteCertification(cert.id!)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                              <div>
                                <h3 className="text-lg font-semibold">{cert.name}</h3>
                                <div className="text-muted-foreground">
                                  <span className="font-medium">Issued by {cert.issuer}</span>
                                </div>
                                {cert.credentialId && (
                                  <div className="text-sm text-muted-foreground">
                                    Credential ID: {cert.credentialId}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  Issued: {new Date(cert.issueDate).toLocaleDateString()}
                                  {cert.expiryDate && ` (Expires: ${new Date(cert.expiryDate).toLocaleDateString()})`}
                                </span>
                              </div>
                            </div>
                            
                            {cert.description && (
                              <div>
                                <p className="text-sm">{cert.description}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-4 text-muted-foreground">
                        No certifications found
                      </div>
                    )}
                    
                    <Separator />
                    
                    {/* Add new certification */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Add New Certification</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="certName">Certification Name*</Label>
                          <Input 
                            id="certName" 
                            name="name" 
                            value={newCertification.name} 
                            onChange={handleNewCertificationChange} 
                            placeholder="Name of certification or license"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="issuer">Issuing Organization*</Label>
                          <Input 
                            id="issuer" 
                            name="issuer" 
                            value={newCertification.issuer} 
                            onChange={handleNewCertificationChange} 
                            placeholder="Organization that issued the certification"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="issueDate">Issue Date*</Label>
                          <Input 
                            id="issueDate" 
                            name="issueDate" 
                            type="date" 
                            value={newCertification.issueDate} 
                            onChange={handleNewCertificationChange} 
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate">Expiry Date (if applicable)</Label>
                          <Input 
                            id="expiryDate" 
                            name="expiryDate" 
                            type="date" 
                            value={newCertification.expiryDate} 
                            onChange={handleNewCertificationChange} 
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="credentialId">Credential ID</Label>
                          <Input 
                            id="credentialId" 
                            name="credentialId" 
                            value={newCertification.credentialId} 
                            onChange={handleNewCertificationChange} 
                            placeholder="Unique identifier for your credential"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="certDescription">Description</Label>
                        <Textarea 
                          id="certDescription" 
                          name="description" 
                          value={newCertification.description} 
                          onChange={handleNewCertificationChange} 
                          placeholder="Brief description of what this certification covers"
                          rows={2}
                        />
                      </div>
                      
                      <Button onClick={handleAddCertification}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Certification
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Employment; 