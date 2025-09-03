-- Add missing columns to mood_entries table
-- This script adds the missing columns that the application expects

-- Add missing columns to mood_entries table
DO $$ 
BEGIN
    -- Add emotional_capacity column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'mood_entries' AND column_name = 'emotional_capacity'
    ) THEN
        ALTER TABLE mood_entries 
        ADD COLUMN emotional_capacity TEXT CHECK (emotional_capacity IN ('low', 'medium', 'high'));
        RAISE NOTICE 'Added emotional_capacity column';
    ELSE
        RAISE NOTICE 'emotional_capacity column already exists';
    END IF;

    -- Add seeking_support column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'mood_entries' AND column_name = 'seeking_support'
    ) THEN
        ALTER TABLE mood_entries 
        ADD COLUMN seeking_support BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added seeking_support column';
    ELSE
        RAISE NOTICE 'seeking_support column already exists';
    END IF;

    -- Add willing_to_listen column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'mood_entries' AND column_name = 'willing_to_listen'
    ) THEN
        ALTER TABLE mood_entries 
        ADD COLUMN willing_to_listen BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Added willing_to_listen column';
    ELSE
        RAISE NOTICE 'willing_to_listen column already exists';
    END IF;

    -- Make mood_label nullable if it's not already
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'mood_entries' AND column_name = 'mood_label' AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE mood_entries ALTER COLUMN mood_label DROP NOT NULL;
        RAISE NOTICE 'Made mood_label column nullable';
    ELSE
        RAISE NOTICE 'mood_label column is already nullable';
    END IF;
END $$;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'mood_entries' 
AND column_name IN ('emotional_capacity', 'seeking_support', 'willing_to_listen', 'mood_label')
ORDER BY column_name;
