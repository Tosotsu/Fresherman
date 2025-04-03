// This is a setup script to run the SQL commands to initialize your Supabase database
// Run this script with: node setup.js

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSetup() {
  try {
    console.log('Running Supabase setup script...');
    
    // Read SQL file - using the new schema.sql file
    const sqlFilePath = path.join(__dirname, 'src', 'integrations', 'supabase', 'schema.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('SQL file read successfully. In a real implementation, you would execute these SQL commands against your Supabase database.');
    console.log('For now, please copy the contents of schema.sql and run them in the Supabase SQL Editor.');
    console.log('\nAttempting to create demo user...');
    
    // Check if demo user already exists
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'demo@example.com',
        password: 'password',
      });
      
      if (!signInError) {
        console.log('Demo user already exists and credentials are valid.');
        return;
      }
    } catch (err) {
      console.log('Could not sign in as demo user. Will attempt to create it.');
    }
    
    // Try to create demo user with admin privileges (won't work in most cases without service role key)
    try {
      // First, try to delete any existing demo user to avoid conflicts
      // Note: This requires admin privileges and won't work with anon key
      console.log('Attempting to delete any existing demo user...');
      try {
        await supabase.auth.admin.deleteUser('demo@example.com');
      } catch (deleteErr) {
        console.log('Could not delete existing user or user does not exist:', deleteErr.message);
      }
      
      // Create the demo user
      console.log('Creating demo user...');
      const { data, error } = await supabase.auth.admin.createUser({
        email: 'demo@example.com',
        password: 'password',
        email_confirm: true,
        user_metadata: { full_name: 'Demo User' }
      });
      
      if (error) {
        throw error;
      }
      
      console.log('Demo user created successfully:', data.user.id);
      
    } catch (adminErr) {
      console.log('Admin API not available with current key. Falling back to regular signup.');
      
      // Try regular signup instead
      try {
        const { data, error } = await supabase.auth.signUp({
          email: 'demo@example.com',
          password: 'password',
          options: {
            data: {
              full_name: 'Demo User',
            },
          },
        });
        
        if (error) {
          if (error.message.includes('rate limit')) {
            console.log('Rate limit exceeded. Please wait a while before trying again or use the Supabase dashboard to create users directly.');
          } else {
            console.log('Could not create demo user:', error.message);
          }
        } else if (data?.user) {
          console.log('Demo user signup initiated:', data.user.id);
          console.log('Note: You may need to confirm the email address in the Supabase dashboard.');
        }
      } catch (signUpErr) {
        console.log('Error during signup:', signUpErr.message);
      }
    }
    
    console.log('\nSetup complete!');
    console.log('Next steps:');
    console.log('1. Run the SQL commands in the Supabase SQL Editor');
    console.log('2. If demo user creation failed, manually create a user in the Authentication -> Users section');
    console.log('3. Try signing in with:');
    console.log('   Email: demo@example.com');
    console.log('   Password: password');
    
  } catch (error) {
    console.error('Setup failed:', error);
  }
}

runSetup().catch(console.error); 