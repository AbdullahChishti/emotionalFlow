-- Fix assessment schema to work with existing profile structure
-- The issue: Our previous migration added user_id column but the app uses profiles.id

-- Step 1: Drop ALL existing foreign key constraints on assessment_results.user_id
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
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

    IF NOT FOUND THEN
        RAISE NOTICE 'No foreign key constraints found on assessment_results.user_id';
    END IF;
END $$;

-- Step 2: Add correct foreign key that references profiles.id (not profiles.user_id)
-- This matches how the application creates profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'assessment_results'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'user_id'
        AND tc.constraint_name = 'assessment_results_user_id_profiles_id_fkey'
    ) THEN
        ALTER TABLE assessment_results
        ADD CONSTRAINT assessment_results_user_id_profiles_id_fkey
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added correct foreign key: assessment_results.user_id -> profiles.id';
    ELSE
        RAISE NOTICE 'Correct foreign key constraint already exists';
    END IF;
END $$;

-- Step 3: Update RLS policies for assessment_results to use correct auth check
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "assessment_results_select_own" ON public.assessment_results;
CREATE POLICY "assessment_results_select_own" ON public.assessment_results
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "assessment_results_insert_own" ON public.assessment_results;
CREATE POLICY "assessment_results_insert_own" ON public.assessment_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "assessment_results_update_own" ON public.assessment_results;
CREATE POLICY "assessment_results_update_own" ON public.assessment_results
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "assessment_results_delete_own" ON public.assessment_results;
CREATE POLICY "assessment_results_delete_own" ON public.assessment_results
    FOR DELETE USING (auth.uid() = user_id);

-- Step 4: Update RLS policies for profiles to use profiles.id (the standard approach)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow profile creation on signup" ON public.profiles;
CREATE POLICY "Allow profile creation on signup" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 5: Clean up - we can remove the user_id column since we're using id
-- But let's keep it for now in case we need to reference it later
-- ALTER TABLE profiles DROP COLUMN IF EXISTS user_id;

-- Step 6: Ensure profile creation trigger is working
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile with all required fields
  INSERT INTO public.profiles (
    id, 
    display_name, 
    avatar_url,
    empathy_credits,
    total_credits_earned,
    total_credits_spent,
    emotional_capacity,
    preferred_mode,
    is_anonymous,
    last_active
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name', 
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'name', 
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    10, -- empathy_credits
    10, -- total_credits_earned
    0,  -- total_credits_spent
    'medium', -- emotional_capacity
    'both',   -- preferred_mode
    false,    -- is_anonymous
    NOW()     -- last_active
  )
  ON CONFLICT (id) DO NOTHING; -- Don't fail if profile already exists
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Assessment schema fix completed - using profiles.id as foreign key reference
