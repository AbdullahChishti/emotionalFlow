-- Create mood_entries table
CREATE TABLE IF NOT EXISTS mood_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
  emotional_capacity TEXT NOT NULL CHECK (emotional_capacity IN ('low', 'medium', 'high')),
  seeking_support BOOLEAN DEFAULT false,
  willing_to_listen BOOLEAN DEFAULT false,
  notes TEXT
);

-- Enable RLS
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own mood entries" ON mood_entries;
CREATE POLICY "Users can view their own mood entries" ON mood_entries
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own mood entries" ON mood_entries;
CREATE POLICY "Users can insert their own mood entries" ON mood_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own mood entries" ON mood_entries;
CREATE POLICY "Users can update their own mood entries" ON mood_entries
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own mood entries" ON mood_entries;
CREATE POLICY "Users can delete their own mood entries" ON mood_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger
DROP TRIGGER IF EXISTS update_mood_entries_updated_at ON mood_entries;
CREATE TRIGGER update_mood_entries_updated_at BEFORE UPDATE ON mood_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
