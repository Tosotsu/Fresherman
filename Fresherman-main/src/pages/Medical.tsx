import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';

interface MedicalRecord {
  id?: string;
  user_id: string;
  blood_type: string;
  allergies: string;
  medications: string;
  conditions: string;
  emergency_contact: string;
  insurance_info: string;
  created_at?: string;
}

export default function Medical() {
  const [user, setUser] = useState<any>(null);
  
  const [medicalInfo, setMedicalInfo] = useState<MedicalRecord>({
    user_id: '',
    blood_type: '',
    allergies: '',
    medications: '',
    conditions: '',
    emergency_contact: '',
    insurance_info: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      
      if (data.user) {
        fetchMedicalInfo(data.user.id);
      }
    };
    
    getUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user;
      setUser(currentUser);
      
      if (currentUser) {
        fetchMedicalInfo(currentUser.id);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function fetchMedicalInfo(userId: string) {
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setMedicalInfo(data);
      }
    } catch (error) {
      console.error('Error fetching medical info:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('medical_records')
        .upsert({
          ...medicalInfo,
          user_id: user.id,
        });

      if (error) throw error;
      setMessage('Medical information saved successfully!');
      toast.success('Medical information saved successfully!');
    } catch (error) {
      console.error('Error saving medical info:', error);
      setMessage('Error saving medical information. Please try again.');
      toast.error('Error saving medical information. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-center">Please sign in to view your medical information.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Medical Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="blood_type">Blood Type</Label>
              <Input
                id="blood_type"
                value={medicalInfo.blood_type}
                onChange={(e) => setMedicalInfo({ ...medicalInfo, blood_type: e.target.value })}
                placeholder="Enter blood type"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Input
                id="allergies"
                value={medicalInfo.allergies}
                onChange={(e) => setMedicalInfo({ ...medicalInfo, allergies: e.target.value })}
                placeholder="List any allergies"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medications">Current Medications</Label>
              <Input
                id="medications"
                value={medicalInfo.medications}
                onChange={(e) => setMedicalInfo({ ...medicalInfo, medications: e.target.value })}
                placeholder="List current medications"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conditions">Medical Conditions</Label>
              <Input
                id="conditions"
                value={medicalInfo.conditions}
                onChange={(e) => setMedicalInfo({ ...medicalInfo, conditions: e.target.value })}
                placeholder="List any medical conditions"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_contact">Emergency Contact</Label>
              <Input
                id="emergency_contact"
                value={medicalInfo.emergency_contact}
                onChange={(e) => setMedicalInfo({ ...medicalInfo, emergency_contact: e.target.value })}
                placeholder="Emergency contact information"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="insurance_info">Insurance Information</Label>
              <Input
                id="insurance_info"
                value={medicalInfo.insurance_info}
                onChange={(e) => setMedicalInfo({ ...medicalInfo, insurance_info: e.target.value })}
                placeholder="Insurance details"
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Medical Information'}
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