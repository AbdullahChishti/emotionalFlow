-- Fix profile creation by updating RLS policies and trigger
-- This migration ensures profiles can be created during signup

-- First, let's make sure the trigger function has the right permissions
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
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix RLS policies for profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation on signup" ON public.profiles;

-- Create comprehensive policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow profile creation - either by authenticated user or by trigger
CREATE POLICY "Allow profile creation"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Fix RLS policies for user_assessment_profiles table
DROP POLICY IF EXISTS "Users can view own assessment profile" ON public.user_assessment_profiles;
DROP POLICY IF EXISTS "Users can update own assessment profile" ON public.user_assessment_profiles;
DROP POLICY IF EXISTS "Users can insert own assessment profile" ON public.user_assessment_profiles;

-- Create policies for user_assessment_profiles
CREATE POLICY "Users can view own assessment profile"
  ON public.user_assessment_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own assessment profile"
  ON public.user_assessment_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessment profile"
  ON public.user_assessment_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Also allow upsert operations
CREATE POLICY "Users can upsert own assessment profile"
  ON public.user_assessment_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
