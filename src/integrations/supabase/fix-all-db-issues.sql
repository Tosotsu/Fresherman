-- ============================================================================
-- COMPREHENSIVE FIX FOR ALL DATABASE ISSUES
-- ============================================================================
-- Run this in the Supabase SQL Editor

-- =====================================================
-- PART 1: FIX PERSONAL INFO UPDATES FOR ALL USERS
-- =====================================================

-- 1. Temporarily disable RLS to make global changes
ALTER TABLE public.personal_info DISABLE ROW LEVEL SECURITY;

-- 2. Fix timestamps and ensure all records have proper relationships
UPDATE public.personal_info
SET updated_at = NOW()
WHERE updated_at IS NULL;

-- 3. Add proper triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION handle_timestamp_updates()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_personal_info_timestamp ON public.personal_info;
DROP TRIGGER IF EXISTS update_documents_timestamp ON public.documents;

-- Create new triggers
CREATE TRIGGER update_personal_info_timestamp
BEFORE UPDATE ON public.personal_info
FOR EACH ROW EXECUTE FUNCTION handle_timestamp_updates();

CREATE TRIGGER update_documents_timestamp
BEFORE UPDATE ON public.documents
FOR EACH ROW EXECUTE FUNCTION handle_timestamp_updates();

-- 4. Fix RLS policies to allow proper updates
ALTER TABLE public.personal_info ENABLE ROW LEVEL SECURITY;

-- Drop all existing restrictive policies
DROP POLICY IF EXISTS "Users can view own personal info" ON public.personal_info;
DROP POLICY IF EXISTS "Users can insert own personal info" ON public.personal_info;
DROP POLICY IF EXISTS "Users can update own personal info" ON public.personal_info;
DROP POLICY IF EXISTS "Users can delete own personal info" ON public.personal_info;

-- Create new permissive policies with clear conditions
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

-- Create a verification function for personal info updates
CREATE OR REPLACE FUNCTION verify_personal_info_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the update attempt for debugging
    RAISE LOG 'Personal info update attempted: user_id=%, name=%, email=%', 
        NEW.user_id, NEW.name, NEW.email;
    
    -- Let all updates through but log them
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the validation trigger
DROP TRIGGER IF EXISTS personal_info_update_validation ON public.personal_info;
CREATE TRIGGER personal_info_update_validation
BEFORE UPDATE ON public.personal_info
FOR EACH ROW EXECUTE FUNCTION verify_personal_info_update();

-- =====================================================
-- PART 2: FIX DOCUMENT UPLOADS AND STORAGE
-- =====================================================

-- 1. Ensure documents table has proper structure
DO $$
BEGIN
    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'documents' AND column_name = 'file_size') THEN
        ALTER TABLE documents ADD COLUMN file_size TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'documents' AND column_name = 'file_type') THEN
        ALTER TABLE documents ADD COLUMN file_type TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'documents' AND column_name = 'file_url') THEN
        ALTER TABLE documents ADD COLUMN file_url TEXT;
    END IF;
END $$;

-- 2. Fix RLS for documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own documents" ON documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON documents;
DROP POLICY IF EXISTS "Users can update own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON documents;

-- Create new permissive policies
CREATE POLICY "Users can view own documents" 
ON documents FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" 
ON documents FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" 
ON documents FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" 
ON documents FOR DELETE 
USING (auth.uid() = user_id);

-- 3. Fix storage permissions for file uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('user_documents', 'User Documents', false, 5242880, ARRAY['image/jpeg', 'image/png', 'application/pdf', 'text/plain'])
ON CONFLICT (id) DO UPDATE SET 
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];

-- Create storage policies
DROP POLICY IF EXISTS "Users can select own documents from storage" ON storage.objects;
DROP POLICY IF EXISTS "Users can insert own documents to storage" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own documents in storage" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own documents from storage" ON storage.objects;

CREATE POLICY "Users can select own documents from storage"
ON storage.objects FOR SELECT
USING (bucket_id = 'user_documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can insert own documents to storage"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'user_documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own documents in storage"
ON storage.objects FOR UPDATE
USING (bucket_id = 'user_documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own documents from storage"
ON storage.objects FOR DELETE
USING (bucket_id = 'user_documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================
-- PART 3: EMAIL VERIFICATION AND USER INFO
-- =====================================================

-- Create a function to retrieve user email safely
CREATE OR REPLACE FUNCTION get_user_email(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    email_addr TEXT;
BEGIN
    SELECT email INTO email_addr FROM auth.users WHERE id = user_uuid;
    RETURN email_addr;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if a user exists and get their details
CREATE OR REPLACE FUNCTION verify_user_exists(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'exists', CASE WHEN COUNT(*) > 0 THEN true ELSE false END,
        'email', MAX(email),
        'created_at', MAX(created_at),
        'last_sign_in_at', MAX(last_sign_in_at)
    ) INTO result
    FROM auth.users
    WHERE id = user_uuid;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or update function to ensure personal info exists for a user
CREATE OR REPLACE FUNCTION ensure_personal_info_exists()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if personal info record exists
    IF NOT EXISTS (SELECT 1 FROM public.personal_info WHERE user_id = auth.uid()) THEN
        -- Create empty record
        INSERT INTO public.personal_info (user_id, created_at, updated_at)
        VALUES (auth.uid(), NOW(), NOW());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger that runs when user logs in
DROP TRIGGER IF EXISTS ensure_user_has_personal_info ON auth.users;
CREATE TRIGGER ensure_user_has_personal_info
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION ensure_personal_info_exists();

-- =====================================================
-- PART 4: DIAGNOSTIC QUERIES FOR VERIFICATION
-- =====================================================

-- 1. Print schema of personal_info table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_name = 'personal_info'
ORDER BY 
    ordinal_position;

-- 2. Print schema of documents table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_name = 'documents'
ORDER BY 
    ordinal_position;

-- 3. Print all RLS policies for relevant tables
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM
    pg_policies
WHERE
    tablename IN ('personal_info', 'documents')
    OR tablename LIKE '%objects%';

-- 4. Verify all users have personal_info records
DO $$
DECLARE
    user_record RECORD;
BEGIN
    RAISE NOTICE '=== User Email Verification ===';
    
    FOR user_record IN
        SELECT id, email FROM auth.users
    LOOP
        RAISE NOTICE 'User: % (Email: %)', user_record.id, user_record.email;
        
        -- Check if user has personal_info
        IF EXISTS (SELECT 1 FROM public.personal_info WHERE user_id = user_record.id) THEN
            RAISE NOTICE '  Has personal_info record: YES';
        ELSE
            RAISE NOTICE '  Has personal_info record: NO - Creating one now';
            INSERT INTO public.personal_info (user_id, created_at, updated_at)
            VALUES (user_record.id, NOW(), NOW());
        END IF;
    END LOOP;
END $$;

-- 5. SQL example for updating personal info (for reference)
/*
-- This is the SQL that should work for updates from frontend:
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
WHERE user_id = auth.uid();  -- This should be replaced with the actual user ID
*/

-- 6. SQL example for uploading document record (after file upload to storage)
/*
-- This is how document records should be created after file upload:
INSERT INTO public.documents
(user_id, category, upload_date, file_size, file_type, file_url, created_at, updated_at)
VALUES
(auth.uid(), 'Passport', CURRENT_DATE, '1.2 MB', 'application/pdf', 
 'https://your-project.supabase.co/storage/v1/object/user_documents/' || auth.uid() || '/passport.pdf',
 NOW(), NOW());
*/

-- =====================================================
-- PART 5: TEST UPDATE FUNCTION FOR ALL USERS
-- =====================================================

-- Function to test if a specific user can update their personal info
CREATE OR REPLACE FUNCTION test_user_can_update(test_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    result TEXT;
    original_name TEXT;
    user_email TEXT;
BEGIN
    -- Get user's email for reference
    SELECT email INTO user_email FROM auth.users WHERE id = test_user_id;
    
    -- Store original name to restore it later
    SELECT name INTO original_name FROM public.personal_info WHERE user_id = test_user_id;
    
    -- Try to update a record
    UPDATE public.personal_info
    SET 
        name = 'Test Update ' || NOW()::TEXT,
        updated_at = NOW()
    WHERE user_id = test_user_id;
    
    IF FOUND THEN
        result := 'Update successful for user ' || user_email;
        
        -- Restore original name if it existed
        IF original_name IS NOT NULL THEN
            UPDATE public.personal_info
            SET name = original_name
            WHERE user_id = test_user_id;
        END IF;
    ELSE
        result := 'Update failed - no matching record found for user ' || user_email;
        
        -- Create a record if none exists
        INSERT INTO public.personal_info (user_id, created_at, updated_at)
        VALUES (test_user_id, NOW(), NOW());
        
        result := result || ' - Created new record';
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Test update capability for all users
DO $$
DECLARE
    user_record RECORD;
    test_result TEXT;
BEGIN
    RAISE NOTICE '=== Testing Update Capability for All Users ===';
    
    FOR user_record IN
        SELECT id, email FROM auth.users
    LOOP
        SELECT test_user_can_update(user_record.id) INTO test_result;
        RAISE NOTICE 'User %: %', user_record.email, test_result;
    END LOOP;
END $$; 