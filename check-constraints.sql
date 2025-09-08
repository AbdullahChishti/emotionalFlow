-- Check current foreign key constraints on assessment_results
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE
    tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'assessment_results'
    AND tc.table_schema = 'public';

-- Check if profiles table has the user
SELECT 'Profile exists check:' as info;
SELECT id, user_id, display_name, created_at FROM profiles WHERE id = '09eb68b7-3807-4cef-9bff-ac8be093f661';

-- Check profiles table structure
SELECT 'Profiles table structure:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;
