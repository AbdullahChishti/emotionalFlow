-- Manual fix for foreign key constraint issue
-- Run this in Supabase SQL Editor

-- Step 1: Drop ALL existing foreign key constraints on assessment_results.user_id
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    RAISE NOTICE 'Dropping all foreign key constraints on assessment_results.user_id...';

    -- Drop any existing foreign key constraints on user_id column
    FOR constraint_name IN
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'assessment_results'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'user_id'
    LOOP
        EXECUTE 'ALTER TABLE assessment_results DROP CONSTRAINT ' || constraint_name;
        RAISE NOTICE 'Dropped foreign key constraint: %', constraint_name;
    END LOOP;

    RAISE NOTICE 'Foreign key constraint cleanup completed';
END $$;

-- Step 2: Add the correct foreign key constraint
ALTER TABLE assessment_results
ADD CONSTRAINT assessment_results_user_id_fkey_correct
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Step 3: Verify the constraint was applied
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

-- Step 4: Verify the profile exists
SELECT 'Profile check:' as info;
SELECT id, user_id, display_name FROM profiles WHERE id = '09eb68b7-3807-4cef-9bff-ac8be093f661';
