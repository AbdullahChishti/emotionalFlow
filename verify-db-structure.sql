-- Comprehensive Database Verification Query
-- This query checks that all necessary tables, columns, and data exist

-- 1. Check if all required tables exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN (
        'profiles',
        'assessment_results', 
        'overall_assessments',
        'user_assessment_profiles',
        'assessment_types'
    )
ORDER BY table_name;

-- 2. Check profiles table structure and data
SELECT 
    'profiles' as table_name,
    COUNT(*) as row_count,
    COUNT(DISTINCT id) as unique_ids,
    COUNT(DISTINCT user_id) as unique_user_ids,
    COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as profiles_with_user_id
FROM public.profiles;

-- 3. Check assessment_results table structure and data
SELECT 
    'assessment_results' as table_name,
    COUNT(*) as row_count,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT assessment_id) as unique_assessments,
    MIN(created_at) as earliest_result,
    MAX(created_at) as latest_result
FROM public.assessment_results;

-- 4. Check overall_assessments table structure and data
SELECT 
    'overall_assessments' as table_name,
    COUNT(*) as row_count,
    COUNT(DISTINCT user_id) as unique_users,
    MIN(created_at) as earliest_assessment,
    MAX(created_at) as latest_assessment
FROM public.overall_assessments;

-- 5. Check user_assessment_profiles table structure and data
SELECT 
    'user_assessment_profiles' as table_name,
    COUNT(*) as row_count,
    COUNT(DISTINCT user_id) as unique_users
FROM public.user_assessment_profiles;

-- 6. Check assessment_types table structure and data
SELECT 
    'assessment_types' as table_name,
    COUNT(*) as row_count,
    string_agg(assessment_id, ', ') as available_assessments
FROM public.assessment_types;

-- 7. Check RLS policies on profiles table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename = 'profiles'
ORDER BY policyname;

-- 8. Check if profiles table has proper foreign key constraints
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'profiles'
    AND tc.table_schema = 'public';

-- 9. Check recent activity (last 24 hours)
SELECT 
    'recent_activity' as category,
    'profiles' as table_name,
    COUNT(*) as recent_profiles
FROM public.profiles 
WHERE created_at > NOW() - INTERVAL '24 hours'

UNION ALL

SELECT 
    'recent_activity' as category,
    'assessment_results' as table_name,
    COUNT(*) as recent_results
FROM public.assessment_results 
WHERE created_at > NOW() - INTERVAL '24 hours'

UNION ALL

SELECT 
    'recent_activity' as category,
    'overall_assessments' as table_name,
    COUNT(*) as recent_overall
FROM public.overall_assessments 
WHERE created_at > NOW() - INTERVAL '24 hours';

-- 10. Check for any data integrity issues
SELECT 
    'data_integrity' as category,
    'profiles_without_user_id' as issue,
    COUNT(*) as count
FROM public.profiles 
WHERE user_id IS NULL

UNION ALL

SELECT 
    'data_integrity' as category,
    'assessment_results_without_user_id' as issue,
    COUNT(*) as count
FROM public.assessment_results 
WHERE user_id IS NULL

UNION ALL

SELECT 
    'data_integrity' as category,
    'overall_assessments_without_user_id' as issue,
    COUNT(*) as count
FROM public.overall_assessments 
WHERE user_id IS NULL;
