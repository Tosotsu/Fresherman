# Manual Demo Account Setup Instructions

If you're still experiencing issues with the demo account login, follow these manual steps to ensure everything is set up correctly:

## Step 1: Delete Existing Demo User (if any)

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Navigate to your project
3. Go to Authentication > Users
4. Find any user with email "demo@example.com"
5. Click the three dots (⋮) menu next to the user and select "Delete User"

## Step 2: Create New Demo User Through the UI

1. In the Supabase Dashboard, go to Authentication > Users
2. Click "Add User"
3. Enter the following information:
   - Email: `demo@example.com`
   - Password: `password`
4. Click "Create User"
5. Note the new user's ID (you'll need it for the next steps)

## Step 3: Set Up Database Records for the Demo User

After creating the user, run the following SQL in the SQL Editor:

```sql
-- Replace 'YOUR-USER-ID-HERE' with the actual user ID from Step 2
DO $$
DECLARE
    demo_user_id UUID := 'YOUR-USER-ID-HERE';
BEGIN
    -- Make sure a profile exists
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = demo_user_id) THEN
        INSERT INTO public.profiles (id, email, created_at, updated_at)
        VALUES (demo_user_id, 'demo@example.com', now(), now());
        RAISE NOTICE 'Created profile for demo user';
    END IF;
    
    -- Make sure personal_info exists
    IF NOT EXISTS (SELECT 1 FROM public.personal_info WHERE user_id = demo_user_id) THEN
        INSERT INTO public.personal_info (
            user_id, name, email, age, gender, country, state
        ) VALUES (
            demo_user_id, 'Demo User', 'demo@example.com', '30', 
            'Not specified', 'United States', 'California'
        );
        RAISE NOTICE 'Created personal_info for demo user';
    END IF;
END $$;
```

## Step 4: Disable Row Level Security Temporarily (if needed)

If you're still having issues, you might need to temporarily disable RLS:

```sql
-- Disable RLS on critical tables
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_info DISABLE ROW LEVEL SECURITY;
```

## Step 5: Check for Existing Policies

Run this query to see if you have any RLS policies that might be blocking access:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

## Step 6: Manual Login Test

1. Go to your application (http://localhost:8084/ or whatever port you're using)
2. Click "Sign In" or "Use Demo Account"
3. If using the sign-in form, enter:
   - Email: `demo@example.com`
   - Password: `password`

## Troubleshooting Tips

1. **Check Browser Console**: Open your browser's developer tools (F12) and look for any error messages in the console when attempting to log in.

2. **Check Supabase Logs**: In your Supabase Dashboard, go to Database > Logs to see if there are any errors or issues when login attempts are made.

3. **Verify Environment Variables**: Make sure your `.env` file has the correct Supabase URL and anon key.

4. **Clear Browser Cache**: Sometimes old authentication tokens can cause issues. Try clearing your browser cache or using a private/incognito window.

5. **Check Network Requests**: Using the browser's Network tab in developer tools, look at the requests made during login attempts to see what specific errors are being returned from Supabase.

6. **Last Resort**: If nothing else works, you could try recreating your Supabase project from scratch and importing your schema. 