import { supabase } from './client';

/**
 * This script can be run to set up the demo account
 * Run with: npx ts-node src/integrations/supabase/setupSupabase.ts
 */

async function setupDemoAccount() {
  console.log('Setting up demo account...');

  try {
    // Check if demo account exists
    const { data: existingUser, error: checkError } = await supabase.auth.admin.listUsers({
      // We don't have access to admin methods in the browser
      // This is just for reference if running on the server
    });

    if (checkError) {
      console.error('Error checking for existing users:', checkError);
      
      // Try an alternative approach - see if we can sign in with the demo account
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'demo@example.com',
        password: 'password',
      });

      if (signInError) {
        // Demo account doesn't exist, create it
        console.log('Creating demo account...');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: 'demo@example.com',
          password: 'password',
          options: {
            data: {
              full_name: 'Demo User',
            },
          },
        });

        if (signUpError) {
          console.error('Error creating demo account:', signUpError);
          return;
        }

        console.log('Created demo account:', signUpData);
        
        // Create personal info record for demo account
        if (signUpData?.user) {
          const { error: infoError } = await supabase
            .from('personal_info')
            .insert({
              user_id: signUpData.user.id,
              name: 'Demo User',
              email: 'demo@example.com',
              age: '30',
              gender: 'not-specified',
              country: 'United States',
              state: 'California',
            });

          if (infoError) {
            console.error('Error creating personal info for demo account:', infoError);
          } else {
            console.log('Created personal info for demo account');
          }
        }
      } else {
        console.log('Demo account already exists:', signInData);
      }
    } else {
      // Admin API worked, check if demo account exists
      const demoUser = existingUser?.users.find(user => user.email === 'demo@example.com');
      
      if (!demoUser) {
        // Create demo account
        console.log('Creating demo account...');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: 'demo@example.com',
          password: 'password',
          options: {
            data: {
              full_name: 'Demo User',
            },
          },
        });

        if (signUpError) {
          console.error('Error creating demo account:', signUpError);
          return;
        }

        console.log('Created demo account:', signUpData);
      } else {
        console.log('Demo account already exists:', demoUser);
      }
    }

    console.log('Demo account setup complete');
  } catch (error) {
    console.error('Unexpected error during setup:', error);
  }
}

setupDemoAccount().catch(console.error);

export default setupDemoAccount; 