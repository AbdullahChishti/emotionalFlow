-- Add unique constraints for upsert operations
-- This migration adds the required unique constraints for assessment_results and user_assessment_profiles tables

-- Add unique constraint for assessment_results (user_id, assessment_id)
-- This allows upsert operations to work properly
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assessment_results_user_assessment_unique') THEN
        ALTER TABLE assessment_results
        ADD CONSTRAINT assessment_results_user_assessment_unique
        UNIQUE (user_id, assessment_id);
    END IF;
END $$;

-- Add unique constraint for user_assessment_profiles (user_id)
-- This allows upsert operations to work properly
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_assessment_profiles_user_unique') THEN
        ALTER TABLE user_assessment_profiles
        ADD CONSTRAINT user_assessment_profiles_user_unique
        UNIQUE (user_id);
    END IF;
END $$;
