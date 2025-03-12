-- ============================================================================
-- DEBUG AND FIX PERSONAL INFORMATION UPDATE ISSUE
-- ============================================================================
-- Run this in the Supabase SQL Editor

-- 1. First, disable RLS temporarily to isolate permission issues
ALTER TABLE public.personal_info DISABLE ROW LEVEL SECURITY;

-- 2. Create a test update function to verify basic update capability
CREATE OR REPLACE FUNCTION test_personal_info_update()
RETURNS TEXT AS $$
DECLARE
    demo_user_id UUID;
    update_result TEXT;
BEGIN
    -- Get demo user ID
    SELECT id INTO demo_user_id FROM auth.users WHERE email = 'demo@example.com';
    
    IF demo_user_id IS NULL THEN
        RETURN 'Demo user not found';
    END IF;
    
    -- Try to update a record
    UPDATE public.personal_info
    SET 
        name = 'Demo User Updated',
        updated_at = now()
    WHERE user_id = demo_user_id;
    
    IF FOUND THEN
        update_result := 'Update successful';
    ELSE
        update_result := 'Update failed - no rows affected';
    END IF;
    
    RETURN update_result;
END;
$$ LANGUAGE plpgsql;

-- Run the test update function
SELECT test_personal_info_update() AS update_test_result;

-- 3. Add INSERT and UPDATE triggers to handle UUID and timestamps automatically
CREATE OR REPLACE FUNCTION handle_personal_info_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Set updated_at timestamp on every update
    NEW.updated_at := now();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop triggers if they exist
DROP TRIGGER IF EXISTS personal_info_update_trigger ON public.personal_info;

-- Create update trigger
CREATE TRIGGER personal_info_update_trigger
BEFORE UPDATE ON public.personal_info
FOR EACH ROW EXECUTE FUNCTION handle_personal_info_changes();

-- 4. Re-enable RLS with proper policies
ALTER TABLE public.personal_info ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own personal info" ON public.personal_info;
DROP POLICY IF EXISTS "Users can insert own personal info" ON public.personal_info;
DROP POLICY IF EXISTS "Users can update own personal info" ON public.personal_info;
DROP POLICY IF EXISTS "Users can delete own personal info" ON public.personal_info;

-- Create new policies with simplified conditions
CREATE POLICY "Users can view own personal info" 
ON public.personal_info FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own personal info" 
ON public.personal_info FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own personal info" 
ON public.personal_info FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own personal info" 
ON public.personal_info FOR DELETE 
USING (auth.uid() = user_id);

-- 5. Create SQL example for frontend debugging
COMMENT ON TABLE public.personal_info IS 'Personal information for users with corrected update handling';

-- This is the SQL that should work for updates from frontend:
/*
UPDATE public.personal_info
SET 
    name = 'New Name',
    email = 'email@example.com',
    phone = 'New Phone',
    age = 'New Age',
    address = 'New Address',
    city = 'New City',
    state = 'New State',
    postal_code = 'New Postal Code',
    country = 'New Country',
    gender = 'New Gender',
    occupation = 'New Occupation',
    about = 'New About'
WHERE user_id = 'the-actual-user-id-uuid';
*/

-- 6. List existing data for demo user
DO $$
DECLARE
    demo_user_id UUID;
    user_record RECORD;
BEGIN
    SELECT id INTO demo_user_id FROM auth.users WHERE email = 'demo@example.com';
    
    IF demo_user_id IS NULL THEN
        RAISE NOTICE 'Demo user not found!';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Demo user profile data:';
    RAISE NOTICE '------------------------';
    
    FOR user_record IN
        SELECT * FROM public.personal_info WHERE user_id = demo_user_id
    LOOP
        RAISE NOTICE 'ID: %, Name: %, Email: %, Last Updated: %', 
               user_record.id, user_record.name, user_record.email, user_record.updated_at;
    END LOOP;
END $$; 