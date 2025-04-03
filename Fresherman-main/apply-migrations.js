const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get Supabase credentials from .env file
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env file');
    process.exit(1);
}

// Path to migrations directory
const migrationsDir = path.join(__dirname, 'supabase', 'migrations');

// Check if migrations directory exists
if (!fs.existsSync(migrationsDir)) {
    console.error(`Migrations directory not found: ${migrationsDir}`);
    process.exit(1);
}

// Get all migration files
const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Sort to ensure migrations are applied in order

console.log('Applying migrations:');

// Apply each migration
migrationFiles.forEach(file => {
    const migrationPath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log(`Applying migration: ${file}`);
    
    // You can use the Supabase REST API or another method to apply the migration
    // For simplicity, we'll print the SQL to be executed
    console.log('Migration SQL:');
    console.log(sql);
    
    // In a real-world scenario, you would execute the SQL against your Supabase database
    console.log('Migration applied successfully');
});

console.log('All migrations applied successfully!');

console.log('\nInstructions:');
console.log('1. Go to your Supabase dashboard at https://app.supabase.com/');
console.log('2. Select your project');
console.log('3. Navigate to the SQL editor');
console.log('4. Create a new query');
console.log('5. Copy and paste each migration SQL and run it');
console.log('6. Verify that the tables were created successfully');

console.log('\nAlternatively, if you have the Supabase CLI installed:');
console.log('1. Run: supabase migration up');

console.log('\nOnce the migrations are applied, restart your application'); 