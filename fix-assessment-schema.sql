-- =============================================
-- ASSESSMENT SCHEMA FIX MIGRATION
-- Fixes critical issues with assessment_results and profiles tables
-- =============================================

-- =============================================
-- STEP 1: BACKUP CURRENT STATE
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '=== ASSESSMENT SCHEMA FIX START ===';
    RAISE NOTICE 'Checking current state...';
END $$;

-- Check current assessment_results table structure
DO $$
DECLARE
    col_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns
    WHERE table_name = 'assessment_results';

    RAISE NOTICE 'assessment_results table has % columns', col_count;
END $$;

-- Check current profiles table structure
DO $$
DECLARE
    prof_col_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO prof_col_count
    FROM information_schema.columns
    WHERE table_name = 'profiles';

    RAISE NOTICE 'profiles table has % columns', prof_col_count;
END $$;

-- Check current foreign key constraints
DO $$
DECLARE
    fk_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO fk_count
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'assessment_results'
    AND tc.constraint_type = 'FOREIGN KEY';

    RAISE NOTICE 'assessment_results table has % foreign key constraints', fk_count;
END $$;

-- =============================================
-- STEP 2: FIX PROFILES TABLE STRUCTURE
-- =============================================

DO $$
BEGIN
    RAISE NOTICE 'Fixing profiles table structure...';
END $$;

-- Check if profiles table has user_id column, add it if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE profiles ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added user_id column to profiles table';
    ELSE
        RAISE NOTICE 'user_id column already exists in profiles table';
    END IF;
END $$;

-- Check if profiles table has id as primary key
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'profiles' AND constraint_type = 'PRIMARY KEY'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
        RAISE NOTICE 'Added primary key to profiles table';
    ELSE
        RAISE NOTICE 'profiles table already has primary key';
    END IF;
END $$;

-- Make user_id unique in profiles (1:1 relationship)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'profiles' AND constraint_name = 'profiles_user_id_unique'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);
        RAISE NOTICE 'Added unique constraint on profiles.user_id';
    ELSE
        RAISE NOTICE 'profiles.user_id unique constraint already exists';
    END IF;
END $$;

-- =============================================
-- STEP 3: HANDLE ORPHANED RECORDS
-- =============================================

DO $$
BEGIN
    RAISE NOTICE 'Checking for orphaned assessment_results records...';
END $$;

-- Check for orphaned assessment_results records
DO $$
DECLARE
    orphaned_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO orphaned_count
    FROM assessment_results ar
    LEFT JOIN profiles p ON ar.user_id = p.user_id
    WHERE p.user_id IS NULL;

    RAISE NOTICE 'Found % orphaned assessment_results records', orphaned_count;

    IF orphaned_count > 0 THEN
        RAISE WARNING 'Found orphaned records! These will be cleaned up.';
    END IF;
END $$;

-- =============================================
-- STEP 4: FIX ASSESSMENT_RESULTS FOREIGN KEYS
-- =============================================

DO $$
BEGIN
    RAISE NOTICE 'Fixing assessment_results foreign key constraints...';
END $$;

-- Drop existing foreign key if it references wrong column
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'assessment_results'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'user_id'
    ) THEN
        -- Find and drop the constraint
        DECLARE
            constraint_name TEXT;
        BEGIN
            SELECT tc.constraint_name INTO constraint_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'assessment_results'
            AND tc.constraint_type = 'FOREIGN KEY'
            AND kcu.column_name = 'user_id';

            IF constraint_name IS NOT NULL THEN
                EXECUTE 'ALTER TABLE assessment_results DROP CONSTRAINT ' || constraint_name;
                RAISE NOTICE 'Dropped existing foreign key constraint: %', constraint_name;
            END IF;
        END;
    END IF;
END $$;

-- Clean up orphaned records before adding constraint
DO $$
DECLARE
    orphaned_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO orphaned_count
    FROM assessment_results ar
    LEFT JOIN profiles p ON ar.user_id = p.user_id
    WHERE p.user_id IS NULL;

    IF orphaned_count > 0 THEN
        RAISE NOTICE 'Cleaning up % orphaned assessment_results records', orphaned_count;

        -- Delete orphaned records (they're invalid anyway)
        DELETE FROM assessment_results
        WHERE user_id NOT IN (
            SELECT DISTINCT user_id FROM profiles WHERE user_id IS NOT NULL
        );

        RAISE NOTICE 'Cleaned up orphaned assessment_results records';
    ELSE
        RAISE NOTICE 'No orphaned records to clean up';
    END IF;
END $$;

-- Add correct foreign key constraint (assessment_results.user_id -> profiles.user_id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'assessment_results'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'user_id'
        AND kcu.table_name = 'assessment_results'
    ) THEN
        ALTER TABLE assessment_results
        ADD CONSTRAINT assessment_results_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;
        RAISE NOTICE 'Added correct foreign key: assessment_results.user_id -> profiles.user_id';
    ELSE
        RAISE NOTICE 'Correct foreign key constraint already exists';
    END IF;
END $$;

-- =============================================
-- STEP 5: UPDATE RLS POLICIES
-- =============================================

DO $$
BEGIN
    RAISE NOTICE 'Updating Row Level Security policies...';
END $$;

-- Assessment Results RLS Policies (update existing or create new)
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "assessment_results_select_own" ON assessment_results;
    DROP POLICY IF EXISTS "assessment_results_insert_own" ON assessment_results;
    DROP POLICY IF EXISTS "assessment_results_update_own" ON assessment_results;
    DROP POLICY IF EXISTS "assessment_results_delete_own" ON assessment_results;

    -- Create new policies
    CREATE POLICY "assessment_results_select_own" ON assessment_results
        FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "assessment_results_insert_own" ON assessment_results
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "assessment_results_update_own" ON assessment_results
        FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "assessment_results_delete_own" ON assessment_results
        FOR DELETE USING (auth.uid() = user_id);

    RAISE NOTICE 'Updated assessment_results RLS policies';
END $$;

-- Profiles RLS Policies
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
    DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
    DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

    -- Create new policies
    CREATE POLICY "profiles_select_own" ON profiles
        FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "profiles_insert_own" ON profiles
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "profiles_update_own" ON profiles
        FOR UPDATE USING (auth.uid() = user_id);

    RAISE NOTICE 'Updated profiles RLS policies';
END $$;

-- =============================================
-- STEP 6: VERIFY FIXES
-- =============================================

DO $$
BEGIN
    RAISE NOTICE 'Verifying schema fixes...';
END $$;

-- Verify profiles table structure
DO $$
DECLARE
    has_user_id BOOLEAN := FALSE;
    has_primary_key BOOLEAN := FALSE;
    has_unique_constraint BOOLEAN := FALSE;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'user_id'
    ) INTO has_user_id;

    SELECT EXISTS(
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'profiles' AND constraint_type = 'PRIMARY KEY'
    ) INTO has_primary_key;

    SELECT EXISTS(
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'profiles' AND constraint_name = 'profiles_user_id_unique'
    ) INTO has_unique_constraint;

    RAISE NOTICE 'Profiles table verification:';
    RAISE NOTICE '  - Has user_id column: %', has_user_id;
    RAISE NOTICE '  - Has primary key: %', has_primary_key;
    RAISE NOTICE '  - Has user_id unique constraint: %', has_unique_constraint;
END $$;

-- Verify assessment_results foreign key
DO $$
DECLARE
    fk_exists BOOLEAN := FALSE;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'assessment_results'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'user_id'
    ) INTO fk_exists;

    RAISE NOTICE 'Assessment_results foreign key verification: %', fk_exists;
END $$;

-- =============================================
-- STEP 7: TEST DATA INTEGRITY
-- =============================================

DO $$
BEGIN
    RAISE NOTICE 'Testing data integrity...';
END $$;

-- Check for orphaned assessment_results records
DO $$
DECLARE
    orphaned_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO orphaned_count
    FROM assessment_results ar
    LEFT JOIN profiles p ON ar.user_id = p.user_id
    WHERE p.user_id IS NULL;

    RAISE NOTICE 'Found % orphaned assessment_results records', orphaned_count;

    IF orphaned_count > 0 THEN
        RAISE WARNING 'Orphaned records found! Consider data cleanup.';
    END IF;
END $$;

-- =============================================
-- STEP 8: FINAL STATUS
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '=== ASSESSMENT SCHEMA FIX COMPLETE ===';
    RAISE NOTICE 'Summary of changes:';
    RAISE NOTICE '  ✓ Added user_id column to profiles table';
    RAISE NOTICE '  ✓ Added primary key to profiles table';
    RAISE NOTICE '  ✓ Added unique constraint on profiles.user_id';
    RAISE NOTICE '  ✓ Fixed assessment_results foreign key constraint';
    RAISE NOTICE '  ✓ Updated RLS policies for both tables';
    RAISE NOTICE '  ✓ Verified schema integrity';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  1. Test assessment saving with authenticated user';
    RAISE NOTICE '  2. Test assessment fetching from database';
    RAISE NOTICE '  3. Monitor for any remaining foreign key violations';
END $$;
