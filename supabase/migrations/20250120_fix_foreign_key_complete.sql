-- Complete fix for foreign key constraint issue
-- This migration ensures there are no conflicting foreign key constraints

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
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'assessment_results'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'user_id'
        AND tc.constraint_name = 'assessment_results_user_id_fkey_correct'
    ) THEN
        ALTER TABLE assessment_results
        ADD CONSTRAINT assessment_results_user_id_fkey_correct
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added correct foreign key: assessment_results.user_id -> profiles.id';
    ELSE
        RAISE NOTICE 'Correct foreign key constraint already exists';
    END IF;
END $$;

-- Step 3: Verify the constraint was applied
DO $$
BEGIN
    RAISE NOTICE 'Verifying foreign key constraints...';

    -- List all foreign key constraints on assessment_results
    FOR constraint_name IN
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        WHERE tc.table_name = 'assessment_results'
        AND tc.constraint_type = 'FOREIGN KEY'
    LOOP
        RAISE NOTICE 'Found constraint: %', constraint_name;
    END LOOP;
END $$;
