-- This script creates a demo user in your Supabase project
-- Run this in the Supabase SQL Editor

-- First, check if demo user already exists
DO $$
DECLARE
    user_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE email = 'demo@example.com'
    ) INTO user_exists;
    
    IF user_exists THEN
        RAISE NOTICE 'Demo user already exists!';
    ELSE
        -- Create demo user - Method 1: Direct insert
        -- Note: This method may not work in all Supabase projects due to security restrictions
        -- If this fails, use Method 2 below
        BEGIN
            INSERT INTO auth.users (
                instance_id,
                id,
                aud,
                role,
                email,
                encrypted_password,
                email_confirmed_at,
                recovery_sent_at,
                last_sign_in_at,
                raw_app_meta_data,
                raw_user_meta_data,
                created_at,
                updated_at,
                confirmation_token,
                email_change,
                email_change_token_new,
                recovery_token
            ) VALUES (
                '00000000-0000-0000-0000-000000000000',
                gen_random_uuid(),
                'authenticated',
                'authenticated',
                'demo@example.com',
                -- This is a hash of the password 'password'
                -- Note: In a real application, you would never hardcode passwords like this
                '$2a$10$eDx0z4brgzXqXBtJqIxmfui7JMCMWpOUAuGPxRWO5MQAf/2FBMcH2', 
                now(),
                now(),
                now(),
                '{"provider": "email", "providers": ["email"]}',
                '{}',
                now(),
                now(),
                '',
                '',
                '',
                ''
            );
            
            RAISE NOTICE 'Demo user created successfully!';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not create demo user directly: %. Please use Method 2 below.', SQLERRM;
        END;
    END IF;
END $$;

-- Method 2: Create via Supabase Admin UI
-- If the above method fails, follow these steps:
--
-- 1. Go to the Supabase Dashboard for your project
-- 2. Navigate to Authentication > Users
-- 3. Click "Add User"
-- 4. Enter:
--    - Email: demo@example.com
--    - Password: password
-- 5. Click "Create User"
--
-- After creating the user, run this query to ensure a profile exists:

DO $$
BEGIN
    -- Check if demo user exists, get their ID
    DECLARE
        demo_user_id UUID;
    BEGIN
        SELECT id INTO demo_user_id FROM auth.users WHERE email = 'demo@example.com';
        
        IF demo_user_id IS NOT NULL THEN
            -- Check if a profile exists
            DECLARE
                profile_exists BOOLEAN;
            BEGIN
                SELECT EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE id = demo_user_id
                ) INTO profile_exists;
                
                IF NOT profile_exists THEN
                    -- Create a profile record
                    INSERT INTO public.profiles (id, email, created_at, updated_at)
                    VALUES (demo_user_id, 'demo@example.com', now(), now());
                    
                    RAISE NOTICE 'Created profile for demo user';
                ELSE
                    RAISE NOTICE 'Profile already exists for demo user';
                END IF;
                
                -- Check if personal_info exists
                DECLARE
                    personal_info_exists BOOLEAN;
                BEGIN
                    SELECT EXISTS (
                        SELECT 1 FROM public.personal_info 
                        WHERE user_id = demo_user_id
                    ) INTO personal_info_exists;
                    
                    IF NOT personal_info_exists THEN
                        -- Create a personal_info record
                        INSERT INTO public.personal_info (
                            user_id, name, email, age, gender, country, state
                        )
                        VALUES (
                            demo_user_id, 'Demo User', 'demo@example.com', '30', 
                            'Not specified', 'United States', 'California'
                        );
                        
                        RAISE NOTICE 'Created personal_info for demo user';
                    ELSE
                        RAISE NOTICE 'Personal info already exists for demo user';
                    END IF;
                END;
            END;
        END IF;
    END;
END $$; 