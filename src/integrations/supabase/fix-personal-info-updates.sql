-- ============================================================================
-- FIX PERSONAL INFORMATION UPDATE ISSUE
-- ============================================================================
-- Run this in the Supabase SQL Editor to fix personal info update functionality

-- Check if RLS is enabled for personal_info
DO $$
DECLARE
    rls_enabled BOOLEAN;
    policy_exists BOOLEAN;
BEGIN
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class
    WHERE oid = 'public.personal_info'::regclass;
    
    RAISE NOTICE 'Row Level Security on personal_info table: %', 
        CASE WHEN rls_enabled THEN 'ENABLED' ELSE 'DISABLED' END;
    
    -- Check for update policy
    SELECT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'personal_info'
        AND cmd = 'UPDATE'
    ) INTO policy_exists;
    
    IF rls_enabled AND NOT policy_exists THEN
        RAISE NOTICE 'No UPDATE policy found for personal_info table. This will prevent updates!';
    ELSIF rls_enabled AND policy_exists THEN
        RAISE NOTICE 'UPDATE policy exists for personal_info table.';
    END IF;
END $$;

-- 1. Option A: Fix by adding or recreating update policy
DROP POLICY IF EXISTS "Users can update own personal info" ON public.personal_info;
CREATE POLICY "Users can update own personal info"
ON public.personal_info
FOR UPDATE
USING (auth.uid() = user_id);

-- 2. Option B: Temporarily disable RLS (less secure, but will work for testing)
-- Uncomment the line below to disable RLS entirely if the policy approach doesn't work
-- ALTER TABLE public.personal_info DISABLE ROW LEVEL SECURITY;

-- 3. Option C: Grant direct permissions to authenticated users
-- This approach can be used if RLS is not working properly
GRANT ALL ON public.personal_info TO authenticated;

-- 4. List all current policies for verification
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'personal_info'
ORDER BY cmd;

-- 5. Ensure the demo user has personal info record they can update
DO $$
DECLARE
    demo_user_id UUID;
    personal_info_id UUID;
BEGIN
    SELECT id INTO demo_user_id FROM auth.users WHERE email = 'demo@example.com';
    
    IF demo_user_id IS NULL THEN
        RAISE NOTICE 'Demo user not found!';
        RETURN;
    END IF;
    
    SELECT id INTO personal_info_id FROM public.personal_info WHERE user_id = demo_user_id;
    
    IF personal_info_id IS NULL THEN
        -- Create personal info for demo user
        INSERT INTO public.personal_info (
            user_id, name, email, age, gender, country, state, updated_at
        ) VALUES (
            demo_user_id, 'Demo User', 'demo@example.com', '30',
            'Not specified', 'United States', 'California', now()
        );
        RAISE NOTICE 'Created new personal info record for demo user.';
    ELSE
        -- Update timestamp to verify we can update this record
        UPDATE public.personal_info
        SET updated_at = now()
        WHERE user_id = demo_user_id;
        RAISE NOTICE 'Verified update capability for demo user personal info.';
    END IF;
END $$;

-- Add this diagnostic query to show table structure
SELECT 
    column_name, 
    data_type, 
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND table_name = 'personal_info'
ORDER BY 
    ordinal_position; 