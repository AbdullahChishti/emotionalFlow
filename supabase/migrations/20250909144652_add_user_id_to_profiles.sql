-- Add user_id column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing rows to set user_id = id
UPDATE profiles SET user_id = id WHERE user_id IS NULL;

-- Add NOT NULL constraint after backfilling
ALTER TABLE profiles ALTER COLUMN user_id SET NOT NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Update RLS policies to use user_id
DO $$ BEGIN
  DROP POLICY IF EXISTS profiles_select_own ON profiles;
  CREATE POLICY profiles_select_own ON profiles
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error updating profiles_select_own policy: %', SQLERRM;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS profiles_insert_own ON profiles;
  CREATE POLICY profiles_insert_own ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error updating profiles_insert_own policy: %', SQLERRM;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS profiles_update_own ON profiles;
  CREATE POLICY profiles_update_own ON profiles
    FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error updating profiles_update_own policy: %', SQLERRM;
END $$;
