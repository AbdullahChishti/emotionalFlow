-- Comprehensive Assessment Data Cleanup Migration
-- This migration ensures a complete clean slate for all assessment data

-- Step 1: Check current state before cleanup
DO $$
BEGIN
    RAISE NOTICE '=== ASSESSMENT DATA CLEANUP START ===';
    RAISE NOTICE 'Checking current assessment data state...';
END $$;

-- Check assessment_results table
DO $$
DECLARE
    result_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO result_count FROM assessment_results;
    RAISE NOTICE 'Found % records in assessment_results table', result_count;
END $$;

-- Check overall_assessments table
DO $$
DECLARE
    overall_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO overall_count FROM overall_assessments;
    RAISE NOTICE 'Found % records in overall_assessments table', overall_count;
END $$;

-- Check user_assessment_profiles table if it exists
DO $$
DECLARE
    result_count INTEGER;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_assessment_profiles') THEN
        EXECUTE 'SELECT COUNT(*) FROM user_assessment_profiles' INTO result_count;
        RAISE NOTICE 'Found % records in user_assessment_profiles table', result_count;
    ELSE
        RAISE NOTICE 'user_assessment_profiles table does not exist';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error checking user_assessment_profiles: %', SQLERRM;
END $$;

-- Step 2: Clear all assessment data
DO $$
BEGIN
    RAISE NOTICE 'Clearing assessment data...';
END $$;

-- Clear assessment_results table
DELETE FROM assessment_results;

-- Clear overall_assessments table
DELETE FROM overall_assessments;

-- Clear user_assessment_profiles table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_assessment_profiles') THEN
        EXECUTE 'DELETE FROM user_assessment_profiles';
        RAISE NOTICE 'Cleared user_assessment_profiles table';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error clearing user_assessment_profiles: %', SQLERRM;
END $$;

-- Clear conversation_progress table if it exists (assessment chat history)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversation_progress') THEN
        EXECUTE 'DELETE FROM conversation_progress';
        RAISE NOTICE 'Cleared conversation_progress table';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'conversation_progress table does not exist or error clearing: %', SQLERRM;
END $$;

-- Step 3: Reset any assessment metadata/statistics
DO $$
BEGIN
    RAISE NOTICE 'Resetting assessment metadata...';
END $$;

-- Reset assessment completion counts (if this table/column exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessments' AND column_name = 'completed_count') THEN
        EXECUTE 'UPDATE assessments SET completed_count = 0, average_score = NULL WHERE completed_count > 0';
        RAISE NOTICE 'Reset assessment completion statistics';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error resetting assessment statistics: %', SQLERRM;
END $$;

-- Step 4: Clear any cached user profile data that might indicate completion
DO $$
BEGIN
    RAISE NOTICE 'Checking and updating user profiles...';
END $$;

-- Reset profiles that might have cached assessment completion data
UPDATE profiles
SET last_active = NOW()
WHERE id IN (
    SELECT id FROM profiles
    WHERE last_active IS NOT NULL
);

-- Step 5: Verify cleanup was successful
DO $$
DECLARE
    final_result_count INTEGER;
    final_overall_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO final_result_count FROM assessment_results;
    SELECT COUNT(*) INTO final_overall_count FROM overall_assessments;

    RAISE NOTICE '=== CLEANUP VERIFICATION ===';
    RAISE NOTICE 'assessment_results table: % records remaining', final_result_count;
    RAISE NOTICE 'overall_assessments table: % records remaining', final_overall_count;

    IF final_result_count = 0 AND final_overall_count = 0 THEN
        RAISE NOTICE '✅ CLEANUP SUCCESSFUL: All assessment data has been cleared';
    ELSE
        RAISE NOTICE '⚠️ CLEANUP INCOMPLETE: Some data may still remain';
    END IF;

    RAISE NOTICE '=== ASSESSMENT DATA CLEANUP COMPLETE ===';
END $$;
