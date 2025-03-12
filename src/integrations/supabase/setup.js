const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not found in environment variables.');
  console.error('Please make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.');
  process.exit(1);
}

console.log('Setting up Supabase database...');

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function setup() {
  try {
    console.log('Reading SQL schema...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const createDemoUserPath = path.join(__dirname, 'create-demo-user.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.error(`Error: Schema file not found at ${schemaPath}`);
      console.error('Please make sure the schema.sql file exists in the integrations/supabase directory.');
      process.exit(1);
    }

    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Note: This script cannot run the SQL schema directly.');
    console.log('Please run the schema.sql file in the Supabase SQL Editor:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Create a new query');
    console.log('4. Copy and paste the contents of schema.sql');
    console.log('5. Run the query');

    console.log('\nAttempting to create demo user...');
    
    // Check if demo user exists
    const { data: existingUser, error: userCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'demo@example.com')
      .maybeSingle();
    
    if (userCheckError) {
      console.log('Error checking for existing demo user:', userCheckError.message);
      console.log('If tables don\'t exist yet, run the schema.sql first, then try again.');
    } else if (existingUser) {
      console.log('Demo user already exists.');
    } else {
      console.log('Demo user not found.');
      console.log('Creating demo user through Supabase auth API is not possible from this script.');
      console.log('To create a demo user:');
      
      if (fs.existsSync(createDemoUserPath)) {
        const createDemoUserSQL = fs.readFileSync(createDemoUserPath, 'utf8');
        console.log('1. Run the create-demo-user.sql file in the Supabase SQL Editor');
      } else {
        console.log('1. Go to Authentication > Users in your Supabase dashboard');
        console.log('2. Click "Add User"');
        console.log('3. Enter:');
        console.log('   - Email: demo@example.com');
        console.log('   - Password: password');
        console.log('4. Click "Create User"');
      }
    }

    console.log('\nSetup instructions complete!');
    console.log('If you encounter any issues during setup, please check the error messages above.');

  } catch (error) {
    console.error('Unexpected error during setup:', error.message);
    process.exit(1);
  }
}

// Run setup
setup(); 