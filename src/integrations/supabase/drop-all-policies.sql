-- ============================================================================
-- DROP ALL ROW LEVEL SECURITY POLICIES
-- ============================================================================
-- Run this in the Supabase SQL Editor to remove all security policies
-- WARNING: This will remove all access restrictions from your data
-- Only do this if you're sure you want to disable Row Level Security

-- Drop policies for profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Drop policies for personal_info table
DROP POLICY IF EXISTS "Users can view own personal info" ON public.personal_info;
DROP POLICY IF EXISTS "Users can insert own personal info" ON public.personal_info;
DROP POLICY IF EXISTS "Users can update own personal info" ON public.personal_info;
DROP POLICY IF EXISTS "Users can delete own personal info" ON public.personal_info;

-- Drop policies for education table
DROP POLICY IF EXISTS "Users can view own education" ON public.education;
DROP POLICY IF EXISTS "Users can insert own education" ON public.education;
DROP POLICY IF EXISTS "Users can update own education" ON public.education;
DROP POLICY IF EXISTS "Users can delete own education" ON public.education;

-- Drop policies for documents table
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;

-- Drop policies for medical_records table
DROP POLICY IF EXISTS "Users can view own medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Users can insert own medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Users can update own medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Users can delete own medical records" ON public.medical_records;

-- Drop policies for employment table
DROP POLICY IF EXISTS "Users can view own employment" ON public.employment;
DROP POLICY IF EXISTS "Users can insert own employment" ON public.employment;
DROP POLICY IF EXISTS "Users can update own employment" ON public.employment;
DROP POLICY IF EXISTS "Users can delete own employment" ON public.employment;

-- Drop policies for vehicles table
DROP POLICY IF EXISTS "Users can view own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can insert own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can update own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can delete own vehicles" ON public.vehicles;

-- Optionally: Disable RLS on all tables
-- Uncomment these if you want to completely disable RLS (not just remove policies)
/*
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_info DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.education DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.employment DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles DISABLE ROW LEVEL SECURITY;
*/

-- Confirm all policies have been dropped
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public';
    
    RAISE NOTICE 'Number of remaining policies: %', policy_count;
    
    IF policy_count > 0 THEN
        RAISE NOTICE 'Some policies may not have been dropped. Check pg_policies for details.';
    ELSE
        RAISE NOTICE 'All policies have been successfully dropped.';
    END IF;
END $$; 