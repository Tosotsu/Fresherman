import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';

const SignUp = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreedToTerms) {
      toast.error('You must agree to the terms and conditions');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    setIsLoading(true);

    try {
      // Add a delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // First check if email is already in use
      const { data: existingUsers, error: emailCheckError } = await supabase.auth.signInWithPassword({
        email,
        password: 'check-only-not-real-password',
      });
      
      if (emailCheckError && !emailCheckError.message.includes('Invalid login')) {
        // If we get an error other than invalid login, something went wrong
        if (emailCheckError.message.includes('rate limit')) {
          toast.error('Too many requests. Please wait a moment before trying again.');
        } else {
          toast.error(emailCheckError.message);
        }
        setIsLoading(false);
        return;
      }
      
      // If we didn't get "Invalid login", the email might exist
      if (!emailCheckError) {
        toast.error('This email is already registered. Please sign in instead.');
        setIsLoading(false);
        return;
      }

      // Proceed with sign up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        if (error.message.includes('rate limit')) {
          toast.error('Sign-up rate limit exceeded. Please wait a few minutes before trying again.');
        } else if (error.message.includes('Invalid email')) {
          toast.error('The email address format is invalid. Please check and try again.');
        } else if (error.message.includes('password')) {
          toast.error('Password issue: ' + error.message);
        } else {
          toast.error(error.message);
        }
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        if (data.session) {
          // User is directly signed in
          toast.success('Account created successfully! Setting up your account...');
          
          try {
            const { error: infoError } = await supabase
              .from('personal_info')
              .insert({
                user_id: data.user.id,
                name: fullName,
                email: email,
              });
              
            if (infoError) {
              console.error("Error creating personal info record:", infoError);
            }
          } catch (infoError) {
            console.error("Error creating personal info:", infoError);
          }
          
          navigate('/dashboard');
        } else {
          // Email confirmation is required
          toast.success('Account created successfully! Please check your email to verify your account.');
          navigate('/signin');
        }
      }
    } catch (error) {
      toast.error('An error occurred during sign up.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Create an Account</CardTitle>
            <CardDescription>
              Sign up to manage your personal information securely
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 6 characters long
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                />
                <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center border-t px-6 py-4">
            <div className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/signin" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default SignUp;
