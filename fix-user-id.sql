-- Add user_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'profiles' AND column_name = 'user_id') THEN
    ALTER TABLE profiles ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added user_id column to profiles table';
  ELSE
    RAISE NOTICE 'user_id column already exists in profiles table';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error adding user_id column: %', SQLERRM;
END $$;

-- Update existing rows to set user_id = id
DO $$
BEGIN
  UPDATE profiles SET user_id = id WHERE user_id IS NULL;
  RAISE NOTICE 'Updated user_id values in profiles table';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error updating user_id values: %', SQLERRM;
END $$;

-- Add NOT NULL constraint if all rows have user_id set
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'user_id' 
    AND is_nullable = 'NO'
  ) AND NOT EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE user_id IS NULL
  ) THEN
    ALTER TABLE profiles ALTER COLUMN user_id SET NOT NULL;
    RAISE NOTICE 'Added NOT NULL constraint to user_id column';
  ELSE
    RAISE NOTICE 'NOT NULL constraint already exists on user_id or there are NULL values';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error adding NOT NULL constraint: %', SQLERRM;
END $$;
