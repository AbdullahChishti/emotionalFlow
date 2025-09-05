-- Clean up unused database tables
-- This migration removes tables that are not used in the codebase

-- Drop unused assessment_sessions table
-- This table was created but never used in the application
DROP TABLE IF EXISTS assessment_sessions;

-- Note: We keep the conversation_progress table as it was added later and is used
-- Note: We keep all other tables as they are actively used

-- Add comment for documentation
COMMENT ON DATABASE CURRENT_DATABASE IS 'Emotion Economy Database - Cleaned up unused tables on 2025-01-08';
