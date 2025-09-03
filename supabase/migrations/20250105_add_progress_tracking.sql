-- Add progress tracking tables
-- This migration creates tables to track user progress and conversation analytics

-- Conversation progress table - tracks conversation analytics
CREATE TABLE IF NOT EXISTS conversation_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message_count INTEGER NOT NULL DEFAULT 0,
  average_sentiment DECIMAL(3,2) NOT NULL DEFAULT 0.0, -- -1.0 to 1.0 scale
  emotional_tone TEXT NOT NULL DEFAULT 'neutral',
  crisis_indicators TEXT[] DEFAULT '{}',
  therapeutic_themes TEXT[] DEFAULT '{}',
  user_engagement TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recommendation tracking table - tracks completion of personalized recommendations
CREATE TABLE IF NOT EXISTS recommendation_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recommendation_id TEXT NOT NULL,
  recommendation_type TEXT NOT NULL, -- 'therapy', 'content', 'activity', 'resource', 'community', 'crisis'
  recommendation_title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  feedback TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress insights table - stores generated insights and recommendations
CREATE TABLE IF NOT EXISTS progress_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL, -- 'improvement', 'concern', 'milestone', 'recommendation'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  category TEXT NOT NULL,
  actionable BOOLEAN NOT NULL DEFAULT FALSE,
  action_url TEXT,
  metadata JSONB,
  viewed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversation_progress_user_id ON conversation_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_progress_timestamp ON conversation_progress(timestamp);
CREATE INDEX IF NOT EXISTS idx_conversation_progress_session_id ON conversation_progress(session_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_tracking_user_id ON recommendation_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_tracking_recommendation_id ON recommendation_tracking(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_tracking_completed ON recommendation_tracking(completed);
CREATE INDEX IF NOT EXISTS idx_progress_insights_user_id ON progress_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_insights_priority ON progress_insights(priority);
CREATE INDEX IF NOT EXISTS idx_progress_insights_viewed ON progress_insights(viewed);
CREATE INDEX IF NOT EXISTS idx_progress_insights_created_at ON progress_insights(created_at);

-- Add updated_at triggers
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_conversation_progress_updated_at') THEN
        CREATE TRIGGER update_conversation_progress_updated_at 
          BEFORE UPDATE ON conversation_progress 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_recommendation_tracking_updated_at') THEN
        CREATE TRIGGER update_recommendation_tracking_updated_at 
          BEFORE UPDATE ON recommendation_tracking 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_progress_insights_updated_at') THEN
        CREATE TRIGGER update_progress_insights_updated_at 
          BEFORE UPDATE ON progress_insights 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE conversation_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_insights ENABLE ROW LEVEL SECURITY;

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

-- RLS Policies for recommendation_tracking
DO $$ BEGIN
  CREATE POLICY recommendation_tracking_select_own ON recommendation_tracking
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY recommendation_tracking_insert_own ON recommendation_tracking
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY recommendation_tracking_update_own ON recommendation_tracking
    FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- RLS Policies for progress_insights
DO $$ BEGIN
  CREATE POLICY progress_insights_select_own ON progress_insights
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY progress_insights_insert_own ON progress_insights
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY progress_insights_update_own ON progress_insights
    FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Add comments for documentation
COMMENT ON TABLE conversation_progress IS 'Tracks conversation analytics and sentiment analysis';
COMMENT ON TABLE recommendation_tracking IS 'Tracks completion of personalized recommendations';
COMMENT ON TABLE progress_insights IS 'Stores generated insights and progress recommendations';
