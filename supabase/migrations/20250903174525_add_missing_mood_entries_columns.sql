-- Add missing columns to mood_entries table
-- This migration adds the missing columns that the application expects

-- Add missing columns to mood_entries table
ALTER TABLE mood_entries 
ADD COLUMN IF NOT EXISTS emotional_capacity TEXT CHECK (emotional_capacity IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS seeking_support BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS willing_to_listen BOOLEAN DEFAULT TRUE;

-- Make mood_label nullable since it wasn't in the original table
ALTER TABLE mood_entries ALTER COLUMN mood_label DROP NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN mood_entries.emotional_capacity IS 'User emotional capacity level';
COMMENT ON COLUMN mood_entries.seeking_support IS 'Whether user is seeking support';
COMMENT ON COLUMN mood_entries.willing_to_listen IS 'Whether user is willing to listen to others';
