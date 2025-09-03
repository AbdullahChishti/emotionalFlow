-- Add profiles table
-- This migration creates the profiles table for user profile data

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  empathy_credits INTEGER NOT NULL DEFAULT 10,
  total_credits_earned INTEGER NOT NULL DEFAULT 10,
  total_credits_spent INTEGER NOT NULL DEFAULT 0,
  emotional_capacity TEXT NOT NULL DEFAULT 'medium' CHECK (emotional_capacity IN ('low', 'medium', 'high')),
  preferred_mode TEXT NOT NULL DEFAULT 'both' CHECK (preferred_mode IN ('therapist', 'friend', 'both')),
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_emotional_capacity ON profiles(emotional_capacity);
CREATE INDEX IF NOT EXISTS idx_profiles_preferred_mode ON profiles(preferred_mode);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles(last_active);

-- Note: updated_at trigger will be added later when the function is available

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DO $$ BEGIN
  CREATE POLICY profiles_select_own ON profiles
    FOR SELECT USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY profiles_insert_own ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY profiles_update_own ON profiles
    FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Allow users to view other profiles for matching (but not all data)
DO $$ BEGIN
  CREATE POLICY profiles_select_public ON profiles
    FOR SELECT USING (
      auth.uid() IS NOT NULL AND (
        -- Allow viewing basic info for matching
        emotional_capacity IS NOT NULL AND
        preferred_mode IS NOT NULL
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Add comment for documentation
COMMENT ON TABLE profiles IS 'User profiles with empathy credits and preferences for therapy sessions';
