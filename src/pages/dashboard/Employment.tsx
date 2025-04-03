import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Interface for employment record
interface EmploymentRecord {
  id?: string;
  user_id: string;
  company_name: string;
  position: string;
  start_date: string;
  end_date?: string;
  is_current_job: boolean;
  description: string;
  location: string;
  salary?: number;
  supervisor_name?: string;
  supervisor_contact?: string;
  responsibilities: string;
  achievements?: string;
  reason_for_leaving?: string;
  created_at?: string;
  updated_at?: string;
}

function Employment() {
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // State for employment records
  const [employmentRecords, setEmploymentRecords] = useState<EmploymentRecord[]>([]);
  
  // State for new/editing record
  const [currentRecord, setCurrentRecord] = useState<EmploymentRecord>({
    user_id: '',
    company_name: '',
    position: '',
    start_date: '',
    is_current_job: false,
    description: '',
    location: '',
    responsibilities: '',
  });
  
  // State for editing mode
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
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
          description: "Please sign in to view your employment records",
          variant: "destructive",
        });
        return;
      }
      
      setUserId(data.user.id);
      fetchEmploymentRecords(data.user.id);
    };
    
    fetchUser();
  }, [toast]);
  
  // Fetch employment records
  const fetchEmploymentRecords = async (id: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('employment')
        .select('*')
        .eq('user_id', id)
        .order('start_date', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setEmploymentRecords(data);
      }
    } catch (error) {
      console.error('Error fetching employment records:', error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load your employment records",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Convert string to number for salary field
    if (name === 'salary') {
      setCurrentRecord(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setCurrentRecord(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle checkbox change
  const handleCheckboxChange = (checked: boolean) => {
    setCurrentRecord(prev => ({ 
      ...prev, 
      is_current_job: checked,
      end_date: checked ? undefined : prev.end_date
    }));
  };
  
  // Start adding new record
  const handleStartAdd = () => {
    setCurrentRecord({
      user_id: userId || '',
      company_name: '',
      position: '',
      start_date: '',
      is_current_job: false,
      description: '',
      location: '',
      responsibilities: '',
    });
    setIsAdding(true);
    setIsEditing(false);
  };
  
  // Start editing a record
  const handleStartEdit = (record: EmploymentRecord) => {
    setCurrentRecord(record);
    setIsEditing(true);
    setIsAdding(false);
  };
  
  // Cancel editing/adding
  const handleCancel = () => {
    setIsEditing(false);
    setIsAdding(false);
  };
  
  // Save record (add or update)
  const handleSave = async () => {
    if (!userId) {
      toast({
        title: "Authentication Error",
        description: "Please sign in to save employment records",
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
        .from('employment')
        .upsert(recordToSave);
      
      if (error) throw error;
      
      toast({
        title: isAdding ? "Employment Record Added" : "Employment Record Updated",
        description: "Your employment record has been saved successfully",
      });
      
      fetchEmploymentRecords(userId);
      setIsEditing(false);
      setIsAdding(false);
    } catch (error) {
      console.error('Error saving employment record:', error);
      toast({
        title: "Error Saving Record",
        description: "Failed to save your employment record",
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
        description: "Please sign in to delete employment records",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('employment')
        .delete()
        .match({ id, user_id: userId });
      
      if (error) throw error;
      
      toast({
        title: "Employment Record Deleted",
        description: "Your employment record has been deleted successfully",
      });
      
      fetchEmploymentRecords(userId);
    } catch (error) {
      console.error('Error deleting employment record:', error);
      toast({
        title: "Error Deleting Record",
        description: "Failed to delete your employment record",
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
            <h1 className="text-2xl font-bold">Employment Information</h1>
            {!isAdding && !isEditing && (
              <Button onClick={handleStartAdd}>Add Employment</Button>
            )}
          </div>
          
          {/* Form for adding/editing */}
          {(isAdding || isEditing) && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{isAdding ? 'Add New Employment' : 'Edit Employment'}</CardTitle>
                <CardDescription>
                  Enter your employment details below
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_name">Company Name</Label>
                      <Input
                        id="company_name"
                        name="company_name"
                        value={currentRecord.company_name}
                        onChange={handleInputChange}
                        placeholder="Company name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        name="position"
                        value={currentRecord.position}
                        onChange={handleInputChange}
                        placeholder="Job title"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input
                        id="start_date"
                        name="start_date"
                        type="date"
                        value={currentRecord.start_date}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="end_date">End Date</Label>
                      <Input
                        id="end_date"
                        name="end_date"
                        type="date"
                        value={currentRecord.end_date || ''}
                        onChange={handleInputChange}
                        disabled={currentRecord.is_current_job}
                      />
                    </div>
                    
                    <div className="space-y-2 col-span-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="is_current_job" 
                          checked={currentRecord.is_current_job}
                          onCheckedChange={handleCheckboxChange}
                        />
                        <Label htmlFor="is_current_job">Current Job</Label>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        value={currentRecord.location}
                        onChange={handleInputChange}
                        placeholder="City, State, Country"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="salary">Salary</Label>
                      <Input
                        id="salary"
                        name="salary"
                        type="number"
                        value={currentRecord.salary || ''}
                        onChange={handleInputChange}
                        placeholder="Annual salary"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="supervisor_name">Supervisor Name</Label>
                      <Input
                        id="supervisor_name"
                        name="supervisor_name"
                        value={currentRecord.supervisor_name || ''}
                        onChange={handleInputChange}
                        placeholder="Name of supervisor"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="supervisor_contact">Supervisor Contact</Label>
                      <Input
                        id="supervisor_contact"
                        name="supervisor_contact"
                        value={currentRecord.supervisor_contact || ''}
                        onChange={handleInputChange}
                        placeholder="Email or phone"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Job Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={currentRecord.description}
                      onChange={handleInputChange}
                      placeholder="Brief job description"
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="responsibilities">Responsibilities</Label>
                    <Textarea
                      id="responsibilities"
                      name="responsibilities"
                      value={currentRecord.responsibilities}
                      onChange={handleInputChange}
                      placeholder="Main job responsibilities"
                      className="min-h-[120px]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="achievements">Achievements</Label>
                    <Textarea
                      id="achievements"
                      name="achievements"
                      value={currentRecord.achievements || ''}
                      onChange={handleInputChange}
                      placeholder="Your key achievements in this role"
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  {!currentRecord.is_current_job && (
                    <div className="space-y-2">
                      <Label htmlFor="reason_for_leaving">Reason for Leaving</Label>
                      <Textarea
                        id="reason_for_leaving"
                        name="reason_for_leaving"
                        value={currentRecord.reason_for_leaving || ''}
                        onChange={handleInputChange}
                        placeholder="Why did you leave this job?"
                        className="min-h-[80px]"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                <Button 
                  onClick={handleSave}
                  disabled={isLoading || !currentRecord.company_name || !currentRecord.position}
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {/* Display existing records */}
          {!isAdding && !isEditing && (
            <div className="space-y-4">
              {employmentRecords.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No employment records found. Click 'Add Employment' to create one.</p>
                  </CardContent>
                </Card>
              ) : (
                employmentRecords.map((record) => (
                  <Card key={record.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{record.position}</CardTitle>
                          <CardDescription className="flex flex-col mt-1">
                            <span>{record.company_name}</span>
                            <span className="text-xs">{record.location}</span>
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
                        <div className="flex justify-between mb-3">
                          <div className="font-medium">
                            <span>
                              {new Date(record.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                              {' - '}
                              {record.is_current_job 
                                ? 'Present' 
                                : record.end_date 
                                  ? new Date(record.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                                  : 'N/A'
                              }
                            </span>
                            
                            {record.is_current_job && (
                              <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                          
                          {record.salary && (
                            <div className="text-right">
                              Salary: ${record.salary.toLocaleString()}
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          {record.description && (
                            <div>
                              <h4 className="font-medium">Description</h4>
                              <p className="text-muted-foreground">{record.description}</p>
                            </div>
                          )}
                          
                          {record.responsibilities && (
                            <div>
                              <h4 className="font-medium">Responsibilities</h4>
                              <p className="text-muted-foreground">{record.responsibilities}</p>
                            </div>
                          )}
                          
                          {record.achievements && (
                            <div>
                              <h4 className="font-medium">Achievements</h4>
                              <p className="text-muted-foreground">{record.achievements}</p>
                            </div>
                          )}
                          
                          {!record.is_current_job && record.reason_for_leaving && (
                            <div>
                              <h4 className="font-medium">Reason for Leaving</h4>
                              <p className="text-muted-foreground">{record.reason_for_leaving}</p>
                            </div>
                          )}
                        </div>
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

export default Employment; 