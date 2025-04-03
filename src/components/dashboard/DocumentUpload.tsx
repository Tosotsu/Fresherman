import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Upload, File, Trash2, Download, Search, Link2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Document {
  id: string;
  name: string;
  category: string;
  date: string;
  size: string;
  type: string;
  url: string;
}

const DocumentUpload = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user and documents on component mount
  useEffect(() => {
    const fetchUserAndDocuments = async () => {
      setIsLoading(true);
      try {
        // Get current user
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) {
          toast.error('User not authenticated');
          return;
        }
        
        setUserId(userData.user.id);
        
        // Create storage bucket if it doesn't exist (this is handled in SQL script)
        
        // Fetch documents for this user
        const { data: docsData, error } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', userData.user.id)
          .order('upload_date', { ascending: false });
          
        if (error) {
          console.error('Error fetching documents:', error);
          toast.error('Failed to load documents');
          return;
        }
        
        if (docsData && docsData.length > 0) {
          // Convert from DB format to component format
          const formattedDocs = docsData.map(doc => ({
            id: doc.id,
            name: doc.title || doc.name || 'Unnamed Document',
            category: doc.category || 'Personal',
            date: doc.upload_date ? new Date(doc.upload_date).toISOString().split('T')[0] : '',
            size: doc.file_size || 'Unknown',
            type: doc.file_type || 'Unknown',
            url: doc.file_url || '#'
          }));
          
          setDocuments(formattedDocs);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load documents');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserAndDocuments();
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files: File[]) => {
    if (!userId) {
      toast.error('Please sign in to upload documents');
      return;
    }
    
    setIsUploading(true);
    
    try {
      const uploadPromises = files.map(async (file) => {
        // 1. Upload file to Supabase Storage
        const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const filePath = `${userId}/${fileName}`;
        
        // Upload to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('user_documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('user_documents')
          .getPublicUrl(filePath);
          
        const publicUrl = urlData.publicUrl;
        
        // 2. Create record in documents table
        const { data: docRecord, error: recordError } = await supabase
          .from('documents')
          .insert({
            user_id: userId,
            title: file.name,
            description: '',
            category: selectedCategory === 'all' ? 'Personal' : selectedCategory,
            upload_date: new Date().toISOString(),
            file_size: formatFileSize(file.size),
            file_type: file.type,
            file_url: publicUrl
          })
          .select()
          .single();
          
        if (recordError) {
          console.error('Record error:', recordError);
          throw new Error(`Failed to save record for ${file.name}`);
        }
        
        // Return formatted document for UI
        return {
          id: docRecord.id,
          name: file.name,
          category: docRecord.category || 'Personal',
          date: new Date().toISOString().split('T')[0],
          size: formatFileSize(file.size),
          type: file.type,
          url: publicUrl
        };
      });
      
      // Wait for all uploads to complete
      const newDocuments = await Promise.all(uploadPromises);
      
      // Add new documents to state
      setDocuments(prev => [...newDocuments, ...prev]);
      toast.success(`${files.length} document${files.length > 1 ? 's' : ''} uploaded successfully`);
    } catch (error) {
      console.error('Upload process failed:', error);
      toast.error(error instanceof Error ? error.message : 'Document upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDelete = async (id: string) => {
    if (!userId) {
      toast.error('Please sign in to delete documents');
      return;
    }
    
    try {
      // Get the document record to find the file path
      const { data: docData, error: fetchError } = await supabase
        .from('documents')
        .select('file_url')
        .eq('id', id)
        .single();
        
      if (fetchError) {
        throw new Error('Failed to fetch document details');
      }
      
      // Extract file path from URL
      if (docData?.file_url) {
        const url = new URL(docData.file_url);
        const pathParts = url.pathname.split('/');
        const filePath = pathParts.slice(pathParts.indexOf('user_documents') + 1).join('/');
        
        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('user_documents')
          .remove([filePath]);
          
        if (storageError) {
          console.warn('Failed to delete file from storage:', storageError);
        }
      }
      
      // Delete record from database
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);
        
      if (deleteError) {
        throw new Error('Failed to delete document record');
      }
      
      // Update UI
      setDocuments(documents.filter(doc => doc.id !== id));
      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete document');
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Card className="shadow-sm border-border/40">
      <CardHeader>
        <CardTitle>Document Management</CardTitle>
        <CardDescription>
          Upload, organize, and access your important documents securely
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
            isDragging ? "border-primary bg-primary/5" : "border-border"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-10 w-10 mb-2 mx-auto text-muted-foreground" />
          <h3 className="text-lg font-medium mb-1">Drop files here or click to upload</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Support for PDF, Word, Excel, and image files
          </p>
          <Button 
            onClick={() => fileInputRef.current?.click()}
            className="mx-auto"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              'Select Files'
            )}
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileInput} 
            className="hidden" 
            multiple
            disabled={isUploading}
          />
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/3">
            <Label htmlFor="category-filter">Filter by Category</Label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger id="category-filter">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Personal">Personal</SelectItem>
                <SelectItem value="Medical">Medical</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Employment">Employment</SelectItem>
                <SelectItem value="Vehicle">Vehicle</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-2/3">
            <Label htmlFor="document-search">Search Documents</Label>
            <div className="relative">
              <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="document-search"
                placeholder="Search by document name..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted px-4 py-3 text-sm font-medium grid grid-cols-12 gap-2">
            <div className="col-span-5">Name</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-1">Size</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          
          <div className="divide-y">
            {isLoading ? (
              <div className="px-4 py-12 text-center">
                <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading documents...</p>
              </div>
            ) : filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc) => (
                <div key={doc.id} className="px-4 py-3 grid grid-cols-12 gap-2 items-center hover:bg-muted/50 transition-colors">
                  <div className="col-span-5 flex items-center">
                    <File className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span className="truncate">{doc.name}</span>
                  </div>
                  <div className="col-span-2">{doc.category}</div>
                  <div className="col-span-2">{doc.date}</div>
                  <div className="col-span-1">{doc.size}</div>
                  <div className="col-span-2 flex justify-end space-x-1">
                    <Button variant="ghost" size="icon" asChild disabled={doc.url === '#'}>
                      <a href={doc.url} download>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="icon" asChild disabled={doc.url === '#'}>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        <Link2 className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-12 text-center">
                <p className="text-muted-foreground">No documents found</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Your First Document
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
