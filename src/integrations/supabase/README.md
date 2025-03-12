# Secure Life Hub - Supabase Authentication Setup

This document explains how to set up and fix authentication issues in the Secure Life Hub application.

## Authentication Issues

If you're experiencing authentication issues, such as:
- "Too many sign-up attempts"
- "Invalid login credentials"
- Demo account not working
- Profile not being created for new users

Follow the steps below to fix these issues.

## Setup Steps

### 1. Run the Database Schema

The first step is to set up your database schema correctly:

1. Log in to your [Supabase Dashboard](https://app.supabase.com/)
2. Navigate to your project
3. Go to the SQL Editor (in the sidebar)
4. Create a new query
5. Copy and paste the contents of `schema.sql` file in this directory
6. Run the query

This will:
- Create all necessary tables with proper structures
- Set up Row Level Security (RLS) policies
- Create a trigger to automatically create profiles for new users

### 2. Create a Demo User

You can create a demo user in two ways:

#### Option A: Using the SQL Script

1. Go to the SQL Editor in your Supabase Dashboard
2. Create a new query
3. Copy and paste the contents of `create-demo-user.sql` file in this directory
4. Run the query

#### Option B: Manually in the Dashboard

1. Go to Authentication > Users in your Supabase Dashboard
2. Click "Add User"
3. Enter:
   - Email: demo@example.com
   - Password: password
4. Click "Create User"

### 3. Handle Rate Limits

If you're still seeing rate limit errors:

1. Wait 10-15 minutes before trying again
2. Sign up/sign in attempts are limited by Supabase to prevent abuse
3. The application now has better error handling and delays to avoid hitting rate limits

## Troubleshooting

- **Profile not created for new users**: Make sure you've run the schema.sql script which contains the trigger to create profiles.
- **Demo login fails**: Verify that the demo user exists in your Auth > Users section.
- **Rate limit errors persist**: Wait longer between sign-up/sign-in attempts. Supabase rate limits are strict.
- **Personal info not showing**: Check if there's a record in the personal_info table for your user. If not, create one manually or through the application.

## Testing the Authentication

After following the steps above:

1. Run the application: `npm run dev`
2. Navigate to http://localhost:8084/ (or your configured port)
3. Try signing in with the demo account (demo@example.com / password)
4. If that works, try creating a new account

## File Reference

- `schema.sql`: Main database schema with tables, policies, and triggers
- `create-demo-user.sql`: SQL script to create a demo user
- `setup.js`: Helper script with instructions for setup
- `client.ts`: Supabase client configuration

## Additional Help

If you continue to have issues, check:

1. That your Supabase URL and anon key are correct in your .env file
2. That your database tables and RLS policies are set up correctly
3. That the trigger for creating user profiles is active
4. For any error messages in the browser console or server logs 