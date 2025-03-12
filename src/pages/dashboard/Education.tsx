import { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { GraduationCap, Plus, Edit, Save, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

type EducationRecord = {
  id: string;
  user_id: string;
  degree: string | null;
  field_of_study: string | null;
  institution: string | null;
  start_year: string | null;
  end_year: string | null;
  gpa: string | null;
  created_at: string;
  updated_at: string;
};

const Education = () => {
  const navigate = useNavigate();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [education, setEducation] = useState<EducationRecord[]>([]);
  const [newEducation, setNewEducation] = useState<Partial<EducationRecord>>({
    degree: '',
    field_of_study: '',
    institution: '',
    start_year: '',
    end_year: '',
    gpa: ''
  });

  // Fetch education data on component mount
  useEffect(() => {
    const fetchEducation = async () => {
      try {
        setIsLoading(true);
        
        // Get the current user's ID
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast.error('You must be logged in to view your education history');
          navigate('/signin');
          return;
        }
        
        // Fetch education records for the current user
        const { data, error } = await supabase
          .from('education')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        setEducation(data || []);
      } catch (error) {
        console.error('Error fetching education data:', error);
        toast.error('Failed to load education data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEducation();
  }, [navigate]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setNewEducation({
      degree: '',
      field_of_study: '',
      institution: '',
      start_year: '',
      end_year: '',
      gpa: ''
    });
  };

  const handleSaveNew = async () => {
    if (!newEducation.degree || !newEducation.institution) {
      toast.error('Please enter at least the degree and institution.');
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to add education history');
        return;
      }
      
      // Insert new education record
      const { data, error } = await supabase
        .from('education')
        .insert({
          user_id: user.id,
          degree: newEducation.degree || null,
          field_of_study: newEducation.field_of_study || null,
          institution: newEducation.institution || null,
          start_year: newEducation.start_year || null,
          end_year: newEducation.end_year || null,
          gpa: newEducation.gpa || null
        })
        .select();
        
      if (error) {
        throw error;
      }
      
      // Add the new record to the state
      if (data && data.length > 0) {
        setEducation([data[0], ...education]);
        toast.success('Education record added successfully');
        setIsAdding(false);
      }
    } catch (error) {
      console.error('Error adding education record:', error);
      toast.error('Failed to add education record');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelNew = () => {
    setIsAdding(false);
  };

  const handleChange = (id: string, field: string, value: string) => {
    setEducation(
      education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    );
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Update each modified education record
      const updatePromises = education.map(async (edu) => {
        const { error } = await supabase
          .from('education')
          .update({
            degree: edu.degree,
            field_of_study: edu.field_of_study,
            institution: edu.institution,
            start_year: edu.start_year,
            end_year: edu.end_year,
            gpa: edu.gpa,
          })
          .eq('id', edu.id);
          
        if (error) {
          console.error('Error updating education record:', error);
          return false;
        }
        
        return true;
      });
      
      const results = await Promise.all(updatePromises);
      
      // Check if all updates were successful
      if (results.every(result => result)) {
        toast.success('Education information updated successfully');
        setIsEditing(false);
      } else {
        toast.error('Some updates failed. Please try again.');
      }
    } catch (error) {
      console.error('Error updating education records:', error);
      toast.error('Failed to update education information');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async () => {
    try {
      setIsLoading(true);
      
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to view your education history');
        return;
      }
      
      // Refetch education records to discard changes
      const { data, error } = await supabase
        .from('education')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setEducation(data || []);
      setIsEditing(false);
    } catch (error) {
      console.error('Error fetching education data:', error);
      toast.error('Failed to load education data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('education')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      setEducation(education.filter(edu => edu.id !== id));
      toast.success('Education record deleted successfully');
    } catch (error) {
      console.error('Error deleting education record:', error);
      toast.error('Failed to delete education record');
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
                <GraduationCap className="h-6 w-6 mr-2 text-primary" />
                Educational Qualifications
              </h1>
            </div>
          </div>
        </div>
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none p-4 md:p-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Education History</CardTitle>
                  <CardDescription>
                    Manage your academic history, degrees, and qualifications
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  {!isEditing && !isAdding && !isLoading && (
                    <>
                      <Button onClick={handleAdd} size="sm" className="h-8 gap-1">
                        <Plus className="h-4 w-4" />
                        <span>Add</span>
                      </Button>
                      {education.length > 0 && (
                        <Button onClick={handleEdit} variant="outline" size="sm" className="h-8 gap-1">
                          <Edit className="h-4 w-4" />
                          <span>Edit</span>
                        </Button>
                      )}
                    </>
                  )}
                  {isEditing && (
                    <>
                      <Button 
                        onClick={handleSave} 
                        size="sm" 
                        className="h-8 gap-1"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        <span>Save</span>
                      </Button>
                      <Button 
                        onClick={handleCancel} 
                        variant="outline" 
                        size="sm" 
                        className="h-8 gap-1"
                        disabled={isSaving}
                      >
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading education data...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {education.length === 0 && !isAdding ? (
                    <div className="text-center p-8">
                      <GraduationCap className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No education records found</h3>
                      <p className="text-muted-foreground mb-4">
                        Add your educational qualifications to showcase your academic achievements.
                      </p>
                      <Button onClick={handleAdd} size="sm" className="gap-1">
                        <Plus className="h-4 w-4" />
                        <span>Add Education</span>
                      </Button>
                    </div>
                  ) : (
                    <>
                      {education.map((edu) => (
                        <div key={edu.id} className="p-4 rounded-lg border border-border/60 bg-card/50">
                          <div className="flex justify-between mb-2">
                            <h3 className="font-medium">
                              {edu.degree} {edu.field_of_study ? `in ${edu.field_of_study}` : ''}
                            </h3>
                            {isEditing && (
                              <Button 
                                onClick={() => handleDelete(edu.id)} 
                                variant="ghost" 
                                size="sm"
                                className="h-7 w-7 p-0 text-destructive hover:text-destructive/80"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`degree-${edu.id}`}>Degree</Label>
                              {isEditing ? (
                                <Input
                                  id={`degree-${edu.id}`}
                                  value={edu.degree || ''}
                                  onChange={(e) => handleChange(edu.id, 'degree', e.target.value)}
                                />
                              ) : (
                                <div className="mt-1 text-sm">{edu.degree || '—'}</div>
                              )}
                            </div>
                            
                            <div>
                              <Label htmlFor={`field-${edu.id}`}>Field of Study</Label>
                              {isEditing ? (
                                <Input
                                  id={`field-${edu.id}`}
                                  value={edu.field_of_study || ''}
                                  onChange={(e) => handleChange(edu.id, 'field_of_study', e.target.value)}
                                />
                              ) : (
                                <div className="mt-1 text-sm">{edu.field_of_study || '—'}</div>
                              )}
                            </div>
                            
                            <div>
                              <Label htmlFor={`institution-${edu.id}`}>Institution</Label>
                              {isEditing ? (
                                <Input
                                  id={`institution-${edu.id}`}
                                  value={edu.institution || ''}
                                  onChange={(e) => handleChange(edu.id, 'institution', e.target.value)}
                                />
                              ) : (
                                <div className="mt-1 text-sm">{edu.institution || '—'}</div>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`start-${edu.id}`}>Start Year</Label>
                                {isEditing ? (
                                  <Input
                                    id={`start-${edu.id}`}
                                    value={edu.start_year || ''}
                                    onChange={(e) => handleChange(edu.id, 'start_year', e.target.value)}
                                  />
                                ) : (
                                  <div className="mt-1 text-sm">{edu.start_year || '—'}</div>
                                )}
                              </div>
                              
                              <div>
                                <Label htmlFor={`end-${edu.id}`}>End Year</Label>
                                {isEditing ? (
                                  <Input
                                    id={`end-${edu.id}`}
                                    value={edu.end_year || ''}
                                    onChange={(e) => handleChange(edu.id, 'end_year', e.target.value)}
                                  />
                                ) : (
                                  <div className="mt-1 text-sm">{edu.end_year || '—'}</div>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <Label htmlFor={`gpa-${edu.id}`}>GPA</Label>
                              {isEditing ? (
                                <Input
                                  id={`gpa-${edu.id}`}
                                  value={edu.gpa || ''}
                                  onChange={(e) => handleChange(edu.id, 'gpa', e.target.value)}
                                />
                              ) : (
                                <div className="mt-1 text-sm">{edu.gpa || '—'}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                  
                  {isAdding && (
                    <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
                      <h3 className="font-medium mb-4">Add New Education</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="new-degree">Degree</Label>
                          <Input
                            id="new-degree"
                            value={newEducation.degree || ''}
                            onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                            placeholder="Bachelor of Science"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="new-field">Field of Study</Label>
                          <Input
                            id="new-field"
                            value={newEducation.field_of_study || ''}
                            onChange={(e) => setNewEducation({...newEducation, field_of_study: e.target.value})}
                            placeholder="Computer Science"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="new-institution">Institution</Label>
                          <Input
                            id="new-institution"
                            value={newEducation.institution || ''}
                            onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})}
                            placeholder="University"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="new-start">Start Year</Label>
                            <Input
                              id="new-start"
                              value={newEducation.start_year || ''}
                              onChange={(e) => setNewEducation({...newEducation, start_year: e.target.value})}
                              placeholder="2017"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="new-end">End Year</Label>
                            <Input
                              id="new-end"
                              value={newEducation.end_year || ''}
                              onChange={(e) => setNewEducation({...newEducation, end_year: e.target.value})}
                              placeholder="2021"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="new-gpa">GPA</Label>
                          <Input
                            id="new-gpa"
                            value={newEducation.gpa || ''}
                            onChange={(e) => setNewEducation({...newEducation, gpa: e.target.value})}
                            placeholder="3.8"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-end space-x-2">
                        <Button 
                          onClick={handleSaveNew} 
                          size="sm"
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Save
                        </Button>
                        <Button 
                          onClick={handleCancelNew} 
                          variant="outline" 
                          size="sm"
                          disabled={isSaving}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Education; 