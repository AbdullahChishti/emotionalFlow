-- Add missing tables: listening_sessions and mood_entries
-- This migration creates the missing tables that the dashboard is trying to query

-- Create listening_sessions table
CREATE TABLE IF NOT EXISTS listening_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  listener_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  speaker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL DEFAULT 'therapist' CHECK (session_type IN ('therapist', 'friend')),
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  credits_transferred INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  listener_rating INTEGER CHECK (listener_rating >= 1 AND listener_rating <= 5),
  speaker_rating INTEGER CHECK (speaker_rating >= 1 AND speaker_rating <= 5),
  listener_feedback TEXT,
  speaker_feedback TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Create mood_entries table
CREATE TABLE IF NOT EXISTS mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
  mood_label TEXT,
  emotional_capacity TEXT CHECK (emotional_capacity IN ('low', 'medium', 'high')),
  seeking_support BOOLEAN DEFAULT FALSE,
  willing_to_listen BOOLEAN DEFAULT TRUE,
  notes TEXT,
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  social_activity TEXT,
  physical_activity TEXT,
  triggers TEXT[],
  coping_strategies TEXT[],
  metadata JSONB
);

-- Create indexes for listening_sessions
CREATE INDEX IF NOT EXISTS idx_listening_sessions_listener_id ON listening_sessions(listener_id);
CREATE INDEX IF NOT EXISTS idx_listening_sessions_speaker_id ON listening_sessions(speaker_id);
CREATE INDEX IF NOT EXISTS idx_listening_sessions_status ON listening_sessions(status);
CREATE INDEX IF NOT EXISTS idx_listening_sessions_created_at ON listening_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_listening_sessions_session_type ON listening_sessions(session_type);

-- Create indexes for mood_entries
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON mood_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_created_at ON mood_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_mood_entries_mood_score ON mood_entries(mood_score);
CREATE INDEX IF NOT EXISTS idx_mood_entries_mood_label ON mood_entries(mood_label);

-- Note: updated_at triggers will be added later when the function is available

-- Enable Row Level Security
ALTER TABLE listening_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for listening_sessions
DO $$ BEGIN
  CREATE POLICY listening_sessions_select_own ON listening_sessions
    FOR SELECT USING (auth.uid() = listener_id OR auth.uid() = speaker_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY listening_sessions_insert_own ON listening_sessions
    FOR INSERT WITH CHECK (auth.uid() = listener_id OR auth.uid() = speaker_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY listening_sessions_update_own ON listening_sessions
    FOR UPDATE USING (auth.uid() = listener_id OR auth.uid() = speaker_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- RLS Policies for mood_entries
DO $$ BEGIN
  CREATE POLICY mood_entries_select_own ON mood_entries
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY mood_entries_insert_own ON mood_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY mood_entries_update_own ON mood_entries
    FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY mood_entries_delete_own ON mood_entries
    FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Add comments for documentation
COMMENT ON TABLE listening_sessions IS 'Tracks listening sessions between users (therapist/friend sessions)';
COMMENT ON TABLE mood_entries IS 'Tracks user mood entries and emotional state over time';
