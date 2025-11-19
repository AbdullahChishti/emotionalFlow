-- Create Test Super User for Development
-- Run this in your Supabase SQL Editor

-- Test user credentials:
-- Email: test@mindwell.com
-- Password: TestUser123!

-- Step 1: Create the auth user
-- Note: You'll need to run this in Supabase Dashboard > SQL Editor
-- because we can't directly insert into auth.users via SQL

-- After creating the user in Supabase Auth UI, run this to create the profile:

-- Step 2: Create profile for the test user
INSERT INTO public.profiles (
  id,
  email,
  display_name,
  is_anonymous,
  total_credits_earned,
  created_at,
  updated_at
)
VALUES (
  -- Replace this UUID with the actual user ID from auth.users after creating the user
  '00000000-0000-0000-0000-000000000001',
  'test@mindwell.com',
  'Test User',
  false,
  100, -- Give them 100 credits to start
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  display_name = EXCLUDED.display_name,
  total_credits_earned = EXCLUDED.total_credits_earned,
  updated_at = NOW();

-- Step 3: Add some sample data for the test user
-- Add a sample mood entry
INSERT INTO public.mood_entries (
  user_id,
  mood_score,
  notes,
  created_at
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  8,
  'Feeling great today!',
  NOW()
)
ON CONFLICT DO NOTHING;

-- Add a sample assessment result
INSERT INTO public.assessment_results (
  user_id,
  assessment_type,
  score,
  responses,
  created_at
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'PHQ-9',
  5,
  '{"q1": 1, "q2": 0, "q3": 1, "q4": 1, "q5": 0, "q6": 1, "q7": 0, "q8": 1, "q9": 0}'::jsonb,
  NOW()
)
ON CONFLICT DO NOTHING;

-- Verify the test user was created
SELECT 
  id,
  email,
  display_name,
  total_credits_earned,
  created_at
FROM public.profiles
WHERE email = 'test@mindwell.com';
