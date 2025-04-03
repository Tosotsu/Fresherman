import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';

interface EmploymentRecord {
  id?: string;
  user_id: string;
  current_employer: string;
  position: string;
  start_date: string;
  salary: string;
  work_experience: string;
  skills: string;
  education: string;
  certifications: string;
  created_at?: string;
}

export default function Employment() {
  const [user, setUser] = useState<any>(null);
  
  const [employmentInfo, setEmploymentInfo] = useState<EmploymentRecord>({
    user_id: '',
    current_employer: '',
    position: '',
    start_date: '',
    salary: '',
    work_experience: '',
    skills: '',
    education: '',
    certifications: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      
      if (data.user) {
        fetchEmploymentInfo(data.user.id);
      }
    };
    
    getUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user;
      setUser(currentUser);
      
      if (currentUser) {
        fetchEmploymentInfo(currentUser.id);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function fetchEmploymentInfo(userId: string) {
    try {
      const { data, error } = await supabase
        .from('employment_records')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setEmploymentInfo(data);
      }
    } catch (error) {
      console.error('Error fetching employment info:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('employment_records')
        .upsert({
          ...employmentInfo,
          user_id: user.id,
        });

      if (error) throw error;
      setMessage('Employment information saved successfully!');
      toast.success('Employment information saved successfully!');
    } catch (error) {
      console.error('Error saving employment info:', error);
      setMessage('Error saving employment information. Please try again.');
      toast.error('Error saving employment information. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-center">Please sign in to view your employment information.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Employment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current_employer">Current Employer</Label>
              <Input
                id="current_employer"
                value={employmentInfo.current_employer}
                onChange={(e) => setEmploymentInfo({ ...employmentInfo, current_employer: e.target.value })}
                placeholder="Enter current employer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={employmentInfo.position}
                onChange={(e) => setEmploymentInfo({ ...employmentInfo, position: e.target.value })}
                placeholder="Enter your position"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={employmentInfo.start_date}
                onChange={(e) => setEmploymentInfo({ ...employmentInfo, start_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary">Salary</Label>
              <Input
                id="salary"
                value={employmentInfo.salary}
                onChange={(e) => setEmploymentInfo({ ...employmentInfo, salary: e.target.value })}
                placeholder="Enter your salary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="work_experience">Work Experience</Label>
              <Textarea
                id="work_experience"
                value={employmentInfo.work_experience}
                onChange={(e) => setEmploymentInfo({ ...employmentInfo, work_experience: e.target.value })}
                placeholder="Describe your work experience"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <Textarea
                id="skills"
                value={employmentInfo.skills}
                onChange={(e) => setEmploymentInfo({ ...employmentInfo, skills: e.target.value })}
                placeholder="List your skills"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="education">Education</Label>
              <Textarea
                id="education"
                value={employmentInfo.education}
                onChange={(e) => setEmploymentInfo({ ...employmentInfo, education: e.target.value })}
                placeholder="List your education"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certifications">Certifications</Label>
              <Textarea
                id="certifications"
                value={employmentInfo.certifications}
                onChange={(e) => setEmploymentInfo({ ...employmentInfo, certifications: e.target.value })}
                placeholder="List your certifications"
                className="min-h-[100px]"
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Employment Information'}
            </Button>

            {message && (
              <p className={`mt-4 ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                {message}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 