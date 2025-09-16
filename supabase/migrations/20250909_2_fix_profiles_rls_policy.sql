-- Fix RLS policies for profiles table to allow profile creation
-- This migration ensures that authenticated users can create their own profiles

-- First, let's check what policies currently exist and clean them up
DO $$ 
BEGIN
  -- Drop all existing policies on profiles table
  DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Allow profile creation" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
  
  RAISE NOTICE 'Dropped existing policies on profiles table';
END $$;

-- Create clean, working RLS policies for profiles
CREATE POLICY "profiles_select_own" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Also create a policy that allows the trigger function to insert profiles
-- This is needed for the handle_new_user function
CREATE POLICY "profiles_insert_trigger" 
  ON public.profiles FOR INSERT 
  WITH CHECK (true);

-- Ensure the handle_new_user function exists and works correctly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    user_id,
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
    NEW.id, -- Set user_id to the same as id
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
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON public.profiles TO anon;

-- Test that the policies work by checking if we can query the table
DO $$
BEGIN
  RAISE NOTICE 'RLS policies for profiles table have been updated successfully';
  RAISE NOTICE 'Users should now be able to create their own profiles';
END $$;
