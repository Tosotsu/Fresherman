import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Upload, Save, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PersonalInfo {
  id: string;
  name: string;
  age: string;
  stream: string;
  gender: string;
  email: string;
  contactNo: string;
  nextPhone: string;
  country: string;
  district: string;
  state: string;
  village: string;
  parentName: string;
  relation: string;
  occupation: string;
  postingDate: string;
  updationDate: string;
}

const defaultPersonalInfo: PersonalInfo = {
  id: '',
  name: '',
  age: '',
  stream: '',
  gender: '',
  email: '',
  contactNo: '',
  nextPhone: '',
  country: '',
  district: '',
  state: '',
  village: '',
  parentName: '',
  relation: '',
  occupation: '',
  postingDate: '',
  updationDate: '',
};

const PersonalInfoForm = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState<PersonalInfo>(defaultPersonalInfo);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  useEffect(() => {
    // Load profile image from localStorage if available
    const savedImage = localStorage.getItem('personalImage');
    if (savedImage) {
      setImagePreview(savedImage);
    }
    
    const fetchUserAndData = async () => {
      setIsLoading(true);
      try {
        // Get current user
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) {
          toast.error('Please sign in to view personal information');
          return;
        }
        
        setUserId(userData.user.id);
        
        console.log("Current user ID:", userData.user.id);
        
        // Fetch personal info for this user
        const { data: personalData, error } = await supabase
          .from('personal_info')
          .select('*')
          .eq('user_id', userData.user.id)
          .single();
          
        if (error) {
          if (error.code === 'PGRST116') { // "Not found" error
            console.log("No personal info found, will create on save");
          } else {
            console.error("Error fetching personal info:", error);
            toast.error('Error fetching personal information');
          }
        }
        
        if (personalData) {
          console.log("Retrieved personal info:", personalData);
          
          // Convert from snake_case (DB) to camelCase (frontend)
          setData({
            id: personalData.id,
            name: personalData.name || '',
            age: personalData.age || '',
            stream: personalData.stream || '',
            gender: personalData.gender || '',
            email: personalData.email || '',
            contactNo: personalData.contact_no || personalData.phone || '',
            nextPhone: personalData.next_phone || '',
            country: personalData.country || '',
            district: personalData.district || personalData.city || '',
            state: personalData.state || '',
            village: personalData.village || personalData.address || '',
            parentName: personalData.parent_name || '',
            relation: personalData.relation || '',
            occupation: personalData.occupation || '',
            postingDate: personalData.posting_date || personalData.created_at || '',
            updationDate: personalData.updation_date || personalData.updated_at || '',
          });
        } else {
          // If no data exists yet, prefill with user's email
          setData({
            ...defaultPersonalInfo,
            email: userData.user.email || '',
            name: userData.user.user_metadata?.full_name || '',
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load personal information');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserAndData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!userId) {
      toast.error('You must be signed in to save personal information');
      return;
    }
    
    setIsSaving(true);
    setDebugInfo(null);
    
    try {
      // Convert from camelCase (frontend) to snake_case (DB)
      const dbData = {
        user_id: userId,
        name: data.name,
        age: data.age,
        email: data.email,
        phone: data.contactNo,
        next_phone: data.nextPhone,
        address: data.village,
        city: data.district,
        state: data.state,
        country: data.country,
        gender: data.gender,
        occupation: data.occupation,
        stream: data.stream,
        parent_name: data.parentName,
        relation: data.relation,
        updated_at: new Date().toISOString()
      };
      
      console.log("Saving personal info with data:", dbData);
      
      let result;
      if (data.id) {
        // Update existing record
        console.log("Updating existing record with ID:", data.id);
        result = await supabase
          .from('personal_info')
          .update(dbData)
          .eq('id', data.id)
          .eq('user_id', userId) // Add this line for extra security
          .select();
      } else {
        // Insert new record
        console.log("Creating new personal info record");
        result = await supabase
          .from('personal_info')
          .insert({
            ...dbData,
            created_at: new Date().toISOString()
          })
          .select();
      }
      
      console.log("Supabase result:", result);
      
      if (result.error) {
        setDebugInfo(JSON.stringify({
          error: result.error,
          data: dbData,
          userId: userId,
          dataId: data.id
        }, null, 2));
        
        throw result.error;
      }
      
      if (result.data && result.data[0]) {
        setData(prev => ({ 
          ...prev, 
          id: result.data![0].id,
          updationDate: new Date().toISOString()
        }));
      }
      
      toast.success('Personal information updated successfully');
      setIsEditing(false);
      
      // Verify record was saved
      const { data: verifyData, error: verifyError } = await supabase
        .from('personal_info')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (verifyError) {
        console.warn("Verification query failed:", verifyError);
      } else {
        console.log("Verified saved data:", verifyData);
      }
      
    } catch (error: any) {
      console.error('Error saving personal info:', error);
      
      // Provide more specific error messages
      if (error.code === '23505') {
        toast.error('A record for this user already exists');
      } else if (error.code === '42501') {
        toast.error('Permission denied. Please check RLS policies.');
      } else {
        toast.error(`Failed to update personal information: ${error.message || 'Unknown error'}`);
      }
      
      // Try disabling RLS temporarily if this is in development mode
      if (import.meta.env.DEV && debugInfo) {
        console.log("Development mode: Consider running SQL to verify RLS policies");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    
    try {
      // Save image to browser for immediate preview
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImagePreview(result);
        localStorage.setItem('personalImage', result);
      };
      reader.readAsDataURL(file);
      
      // Also upload to Supabase Storage for permanent storage
      const fileName = `profile-${Date.now()}.${file.name.split('.').pop()}`;
      const filePath = `${userId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('user_profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) {
        console.error('Profile image upload error:', uploadError);
      }
      
    } catch (error) {
      console.error('Error handling image:', error);
      toast.error('Failed to upload profile image');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImagePreview(result);
        localStorage.setItem('personalImage', result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="shadow-sm border-border/40">
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Manage your personal and contact information
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className="mb-4">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="family">Family Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal" className="space-y-6">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-full md:w-1/3 flex flex-col items-center space-y-4">
                    <div
                      className={cn(
                        "w-40 h-40 rounded-full border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden",
                        isDragging ? "border-primary bg-primary/10" : "border-border",
                        isEditing ? "cursor-pointer" : ""
                      )}
                      onDragOver={isEditing ? handleDragOver : undefined}
                      onDragLeave={isEditing ? handleDragLeave : undefined}
                      onDrop={isEditing ? handleDrop : undefined}
                    >
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-4">
                          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            {isEditing ? "Drag or click to upload" : "No image"}
                          </p>
                        </div>
                      )}
                      
                      {isEditing && (
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={handleImageUpload}
                        />
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {isEditing 
                        ? "Click or drag an image to change your profile picture" 
                        : "Your profile picture"
                      }
                    </p>
                  </div>
                  
                  <div className="w-full md:w-2/3 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={data.name}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          name="age"
                          value={data.age}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="stream">Professional Stream</Label>
                        <Input
                          id="stream"
                          name="stream"
                          value={data.stream}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                          disabled={!isEditing}
                          value={data.gender}
                          onValueChange={(value) => handleSelectChange('gender', value)}
                        >
                          <SelectTrigger id="gender">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="non-binary">Non-binary</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="contact" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={data.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactNo">Contact Number</Label>
                    <Input
                      id="contactNo"
                      name="contactNo"
                      value={data.contactNo}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nextPhone">Alternative Phone</Label>
                    <Input
                      id="nextPhone"
                      name="nextPhone"
                      value={data.nextPhone}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Address Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        value={data.country}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        name="state"
                        value={data.state}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="district">District/City</Label>
                      <Input
                        id="district"
                        name="district"
                        value={data.district}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="village">Village/Town/Area</Label>
                      <Input
                        id="village"
                        name="village"
                        value={data.village}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="family" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="parentName">Parent/Guardian Name</Label>
                    <Input
                      id="parentName"
                      name="parentName"
                      value={data.parentName}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="relation">Relationship</Label>
                    <Input
                      id="relation"
                      name="relation"
                      value={data.relation}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      name="occupation"
                      value={data.occupation}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end space-x-2 pt-4 border-t">
              {isEditing ? (
                <>
                  <Button onClick={handleCancel} variant="outline" disabled={isSaving}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button onClick={handleEdit}>
                  Edit Information
                </Button>
              )}
            </div>
            
            {debugInfo && (
              <div className="mt-4 p-4 bg-red-50 text-red-900 rounded-md text-xs">
                <p className="font-semibold">Debug Info:</p>
                <pre className="mt-1 overflow-auto">{debugInfo}</pre>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonalInfoForm;
