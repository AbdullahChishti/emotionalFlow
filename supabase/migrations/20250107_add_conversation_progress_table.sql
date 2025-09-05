-- Add conversation_progress table
-- This migration creates the conversation_progress table for tracking chat session analytics

-- Create conversation_progress table
CREATE TABLE IF NOT EXISTS conversation_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  message_count INTEGER NOT NULL DEFAULT 0,
  average_sentiment DECIMAL(3,2) CHECK (average_sentiment >= -1 AND average_sentiment <= 1),
  emotional_tone TEXT,
  crisis_indicators TEXT[] DEFAULT '{}',
  therapeutic_themes TEXT[] DEFAULT '{}',
  user_engagement TEXT CHECK (user_engagement IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversation_progress_user_id ON conversation_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_progress_session_id ON conversation_progress(session_id);
CREATE INDEX IF NOT EXISTS idx_conversation_progress_timestamp ON conversation_progress(timestamp);

-- Enable Row Level Security
ALTER TABLE conversation_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversation_progress
DO $$ BEGIN
  CREATE POLICY conversation_progress_select_own ON conversation_progress
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY conversation_progress_insert_own ON conversation_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY conversation_progress_update_own ON conversation_progress
    FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Add updated_at trigger
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_conversation_progress_updated_at') THEN
        CREATE TRIGGER update_conversation_progress_updated_at
          BEFORE UPDATE ON conversation_progress
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Add comment for documentation
COMMENT ON TABLE conversation_progress IS 'Tracks conversation analytics and progress for chat sessions';
