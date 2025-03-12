-- ============================================================================
-- FIX USER CREDENTIALS SCRIPT
-- ============================================================================
-- Run this in the Supabase SQL Editor to fix demo user credentials
-- This specifically addresses "Invalid login credentials" errors

-- First, check if demo user exists and get their ID
DO $$
DECLARE
    demo_user_id UUID;
    instance_id_var UUID;
BEGIN
    -- Get instance ID (needed for creating users)
    SELECT u.instance_id INTO instance_id_var FROM auth.users u LIMIT 1;
    
    -- Check if the demo user exists
    SELECT id INTO demo_user_id FROM auth.users WHERE email = 'demo@example.com';
    
    IF demo_user_id IS NULL THEN
        RAISE NOTICE 'Demo user does not exist. Creating demo user...';
        
        -- Create the demo user
        BEGIN
            INSERT INTO auth.users (
                instance_id,
                id,
                aud,
                role,
                email,
                encrypted_password,
                email_confirmed_at,
                created_at,
                updated_at,
                last_sign_in_at,
                raw_app_meta_data,
                raw_user_meta_data
            ) VALUES (
                instance_id_var, -- Using existing instance_id from variable
                gen_random_uuid(),
                'authenticated',
                'authenticated',
                'demo@example.com',
                -- This is a properly formatted hash for 'password'
                '$2a$10$NrAB9rypUQlMVukTxpI7UOFvZCf16/zr9JE9fPlK/ikmdoNWe5fn2',
                now(),
                now(),
                now(),
                now(),
                '{"provider": "email", "providers": ["email"]}',
                '{"name": "Demo User"}'
            );
            
            RAISE NOTICE 'Demo user created successfully!';
            
            -- Get the new user ID
            SELECT id INTO demo_user_id FROM auth.users WHERE email = 'demo@example.com';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not create demo user: %', SQLERRM;
            RAISE NOTICE 'Try creating the user manually in the Authentication dashboard instead.';
            RETURN;
        END;
    ELSE
        RAISE NOTICE 'Demo user exists with ID: %', demo_user_id;
        
        -- Update password for existing user
        UPDATE auth.users
        SET encrypted_password = '$2a$10$NrAB9rypUQlMVukTxpI7UOFvZCf16/zr9JE9fPlK/ikmdoNWe5fn2', -- Hash for 'password'
            updated_at = now(),
            email_confirmed_at = now() -- Ensure email is confirmed
        WHERE id = demo_user_id;
        
        RAISE NOTICE 'Updated password for demo user.';
    END IF;
    
    -- Make sure a profile exists for this user
    DECLARE
        profile_exists BOOLEAN;
    BEGIN
        SELECT EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = demo_user_id
        ) INTO profile_exists;
        
        IF NOT profile_exists THEN
            INSERT INTO public.profiles (id, email, created_at, updated_at)
            VALUES (demo_user_id, 'demo@example.com', now(), now());
            RAISE NOTICE 'Created missing profile for demo user.';
        ELSE
            RAISE NOTICE 'Profile exists for demo user.';
        END IF;
    END;
    
    -- Make sure personal_info exists for this user
    DECLARE
        personal_info_exists BOOLEAN;
    BEGIN
        SELECT EXISTS (
            SELECT 1 FROM public.personal_info 
            WHERE user_id = demo_user_id
        ) INTO personal_info_exists;
        
        IF NOT personal_info_exists THEN
            INSERT INTO public.personal_info (
                user_id, name, email, age, gender, country, state
            ) VALUES (
                demo_user_id, 'Demo User', 'demo@example.com', '30', 
                'Not specified', 'United States', 'California'
            );
            RAISE NOTICE 'Created personal_info for demo user.';
        ELSE
            RAISE NOTICE 'Personal info exists for demo user.';
        END IF;
    END;
    
    -- Create a very basic user if the demo user absolutely can't be created
    IF demo_user_id IS NULL THEN
        RAISE NOTICE 'Could not create the demo user with proper authentication.';
        RAISE NOTICE 'As a last resort, try creating a user manually in the Supabase Auth UI.';
        RAISE NOTICE 'Email: demo@example.com';
        RAISE NOTICE 'Password: password';
    ELSE
        RAISE NOTICE '-------------------------------------------------';
        RAISE NOTICE 'Demo user is now set up and ready to use!';
        RAISE NOTICE 'Email: demo@example.com';
        RAISE NOTICE 'Password: password';
        RAISE NOTICE '-------------------------------------------------';
    END IF;
END $$;

-- Add a check to see if RLS might be blocking access
DO $$
DECLARE
    rls_enabled BOOLEAN;
    policy_count INTEGER;
BEGIN
    -- Check profiles table
    SELECT rls_enabled INTO rls_enabled FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'profiles';
    
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles';
    
    IF rls_enabled AND policy_count = 0 THEN
        RAISE NOTICE 'WARNING: Row Level Security is enabled on profiles table but no policies exist!';
        RAISE NOTICE 'This will prevent all access. Either disable RLS or add policies.';
    END IF;
    
    -- Check personal_info table
    SELECT rls_enabled INTO rls_enabled FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'personal_info';
    
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'personal_info';
    
    IF rls_enabled AND policy_count = 0 THEN
        RAISE NOTICE 'WARNING: Row Level Security is enabled on personal_info table but no policies exist!';
        RAISE NOTICE 'This will prevent all access. Either disable RLS or add policies.';
    END IF;
END $$; 