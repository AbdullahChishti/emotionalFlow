-- Fix profile creation trigger to populate user_id field
-- This migration ensures the profile creation trigger sets user_id correctly

-- Update the trigger function to handle user_id properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile with all required fields including user_id
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
    NEW.id, -- Set user_id to the same as id (auth.users.id)
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
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
