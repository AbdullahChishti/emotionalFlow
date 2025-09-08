-- Fix the profile's user_id field to match the id
-- This ensures the foreign key constraint works properly

UPDATE profiles
SET user_id = id
WHERE id = '09eb68b7-3807-4cef-9bff-ac8be093f661'
  AND (user_id IS NULL OR user_id != id);

-- Verify the update
SELECT 'Profile after update:' as info;
SELECT id, user_id, display_name FROM profiles WHERE id = '09eb68b7-3807-4cef-9bff-ac8be093f661';

-- Also check all profiles to see if any others need fixing
SELECT 'All profiles check:' as info;
SELECT id, user_id, display_name FROM profiles WHERE user_id IS NULL OR user_id != id;
