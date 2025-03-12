-- ============================================================================
-- REMOVE EMAIL CONFIRMATION REQUIREMENT
-- ============================================================================
-- Run this in the Supabase SQL Editor

-- 1. Set all existing users to have confirmed email status
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email_confirmed_at IS NULL;

-- 2. Specifically ensure the demo user is confirmed
UPDATE auth.users
SET email_confirmed_at = now(),
    updated_at = now()
WHERE email = 'demo@example.com';

-- 3. Turn off email confirmation requirement in auth settings
-- Note: This requires admin access and isn't directly possible via SQL
-- You'll need to do this manually in the Supabase dashboard:
--   1. Go to Authentication > Settings > Email
--   2. Disable "Enable Email Confirmations"
--   3. Click "Save"

-- Output confirmation
SELECT 'Updated ' || COUNT(*) || ' users to have confirmed email status.'
FROM auth.users
WHERE email_confirmed_at IS NOT NULL;

-- Check if demo user exists and is confirmed
DO $$
DECLARE
    demo_user_exists BOOLEAN;
    demo_user_confirmed BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE email = 'demo@example.com'
    ) INTO demo_user_exists;
    
    IF demo_user_exists THEN
        SELECT (email_confirmed_at IS NOT NULL) INTO demo_user_confirmed
        FROM auth.users
        WHERE email = 'demo@example.com';
        
        IF demo_user_confirmed THEN
            RAISE NOTICE 'Demo user exists and has confirmed email status.';
        ELSE
            RAISE NOTICE 'Demo user exists but email is NOT confirmed. This should not happen after running this script.';
        END IF;
    ELSE
        RAISE NOTICE 'Demo user does not exist. Please create one using the other setup scripts.';
    END IF;
END $$; 