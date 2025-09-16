-- Fix missing user_id values in profiles table
-- This will update all profiles that have NULL user_id to use their id value

-- First, let's see what we're working with
SELECT 
    id,
    user_id,
    display_name,
    created_at
FROM public.profiles 
WHERE user_id IS NULL 
ORDER BY created_at DESC
LIMIT 10;

-- Update profiles where user_id is NULL to use the id value
UPDATE public.profiles 
SET user_id = id 
WHERE user_id IS NULL;

-- Verify the fix
SELECT 
    'After fix' as status,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as profiles_without_user_id,
    COUNT(CASE WHEN user_id = id THEN 1 END) as profiles_with_matching_user_id
FROM public.profiles;

-- Check if there are any remaining issues
SELECT 
    'data_integrity_check' as category,
    'profiles_without_user_id' as issue,
    COUNT(*) as count
FROM public.profiles 
WHERE user_id IS NULL;
