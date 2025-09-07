-- Reset Results Tables Migration
-- This migration clears all assessment results and related data

-- Clear assessment_results table
DELETE FROM assessment_results;

-- Clear overall_assessments table
DELETE FROM overall_assessments;

-- Optional: Clear conversation_progress table (assessment chat history)
-- DELETE FROM conversation_progress;

-- Optional: Reset assessment metadata (be careful with this!)
-- UPDATE assessments SET completed_count = 0, average_score = NULL WHERE completed_count > 0;

-- Log the reset operation
DO $$
BEGIN
    RAISE NOTICE 'Assessment results tables have been reset successfully';
    RAISE NOTICE 'Deleted all records from assessment_results and overall_assessments tables';
END $$;
