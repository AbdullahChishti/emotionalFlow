-- Allow multiple assessment results per user per assessment type
-- This migration removes the unique constraint that was preventing users from retaking assessments

-- Drop the unique constraint that was causing overwrites
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assessment_results_user_assessment_unique') THEN
        ALTER TABLE assessment_results
        DROP CONSTRAINT assessment_results_user_assessment_unique;
        
        RAISE NOTICE 'Dropped unique constraint assessment_results_user_assessment_unique';
    ELSE
        RAISE NOTICE 'Unique constraint assessment_results_user_assessment_unique does not exist';
    END IF;
END $$;

-- Add a comment to document the change
COMMENT ON TABLE assessment_results IS 'Stores individual assessment completions. Users can retake assessments multiple times, creating new entries each time.';
COMMENT ON COLUMN assessment_results.taken_at IS 'Timestamp when the assessment was completed. Multiple entries per user/assessment are allowed for tracking progress over time.';

-- Create an index to optimize queries for latest results per assessment
CREATE INDEX IF NOT EXISTS idx_assessment_results_user_assessment_taken_at 
ON assessment_results(user_id, assessment_id, taken_at DESC);

-- Add a comment for the new index
COMMENT ON INDEX idx_assessment_results_user_assessment_taken_at IS 'Optimizes queries for finding the latest assessment result per user per assessment type';
