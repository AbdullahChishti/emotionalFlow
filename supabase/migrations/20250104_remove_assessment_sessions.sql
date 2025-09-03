-- Remove assessment sessions table and related complexity
-- This simplifies the system to focus on individual assessments only

-- First, remove the foreign key constraint from user_assessment_profiles
ALTER TABLE user_assessment_profiles 
DROP CONSTRAINT IF EXISTS user_assessment_profiles_session_id_fkey;

-- Remove the session_id column from user_assessment_profiles
ALTER TABLE user_assessment_profiles 
DROP COLUMN IF EXISTS session_id;

-- Drop the assessment_sessions table entirely
DROP TABLE IF EXISTS assessment_sessions;

-- Remove any indexes related to assessment_sessions
DROP INDEX IF EXISTS idx_assessment_sessions_user_id;
DROP INDEX IF EXISTS idx_assessment_sessions_status;

-- Clean up any triggers related to assessment_sessions (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assessment_sessions') THEN
        DROP TRIGGER IF EXISTS update_assessment_sessions_updated_at ON assessment_sessions;
    END IF;
END $$;

-- Add a comment to document the simplification
COMMENT ON TABLE assessment_results IS 'Individual assessment results - simplified system without session tracking';
COMMENT ON TABLE user_assessment_profiles IS 'Processed user assessment data - no longer linked to sessions';
