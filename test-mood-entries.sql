-- Test script to check mood_entries table structure and add missing columns
-- This can be run directly in the Supabase SQL editor

-- Check current table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'mood_entries' 
ORDER BY ordinal_position;

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add emotional_capacity column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'mood_entries' AND column_name = 'emotional_capacity'
    ) THEN
        ALTER TABLE mood_entries 
        ADD COLUMN emotional_capacity TEXT CHECK (emotional_capacity IN ('low', 'medium', 'high'));
    END IF;

    -- Add seeking_support column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'mood_entries' AND column_name = 'seeking_support'
    ) THEN
        ALTER TABLE mood_entries 
        ADD COLUMN seeking_support BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add willing_to_listen column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'mood_entries' AND column_name = 'willing_to_listen'
    ) THEN
        ALTER TABLE mood_entries 
        ADD COLUMN willing_to_listen BOOLEAN DEFAULT TRUE;
    END IF;

    -- Make mood_label nullable if it's not already
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'mood_entries' AND column_name = 'mood_label' AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE mood_entries ALTER COLUMN mood_label DROP NOT NULL;
    END IF;
END $$;
