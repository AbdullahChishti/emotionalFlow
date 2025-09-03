-- Add assessment tracking tables
-- This migration creates tables to properly track user assessments and their results

-- Assessment results table - stores individual assessment completions
CREATE TABLE IF NOT EXISTS assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_id TEXT NOT NULL, -- 'phq9', 'gad7', 'ace', 'cd-risc', etc.
  assessment_title TEXT NOT NULL,
  score INTEGER NOT NULL,
  level TEXT NOT NULL, -- 'normal', 'mild', 'moderate', 'severe', 'critical'
  severity TEXT NOT NULL,
  responses JSONB NOT NULL, -- Raw user responses
  result_data JSONB NOT NULL, -- Processed result data (recommendations, insights, etc.)
  friendly_explanation TEXT, -- AI-generated friendly explanation
  taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessment sessions table - tracks assessment flows/sessions
CREATE TABLE IF NOT EXISTS assessment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL, -- 'onboarding', 'screening', 'comprehensive', 'single'
  session_name TEXT, -- User-friendly name for the session
  assessment_ids TEXT[] NOT NULL, -- Array of assessment IDs in this session
  status TEXT NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User assessment profiles table - stores processed user profile data
CREATE TABLE IF NOT EXISTS user_assessment_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES assessment_sessions(id) ON DELETE SET NULL,
  profile_data JSONB NOT NULL, -- Complete UserProfile object
  trauma_history JSONB,
  current_symptoms JSONB,
  resilience_data JSONB,
  risk_factors JSONB,
  preferences JSONB,
  personalization_data JSONB, -- Therapy, content, community recommendations
  last_assessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assessment_results_user_id ON assessment_results(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_assessment_id ON assessment_results(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_taken_at ON assessment_results(taken_at);
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_user_id ON assessment_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_status ON assessment_sessions(status);
CREATE INDEX IF NOT EXISTS idx_user_assessment_profiles_user_id ON user_assessment_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_assessment_profiles_last_assessed ON user_assessment_profiles(last_assessed);

-- Add updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers (with IF NOT EXISTS handling)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_assessment_results_updated_at') THEN
        CREATE TRIGGER update_assessment_results_updated_at 
          BEFORE UPDATE ON assessment_results 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_assessment_sessions_updated_at') THEN
        CREATE TRIGGER update_assessment_sessions_updated_at 
          BEFORE UPDATE ON assessment_sessions 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_assessment_profiles_updated_at') THEN
        CREATE TRIGGER update_user_assessment_profiles_updated_at 
          BEFORE UPDATE ON user_assessment_profiles 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_assessment_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assessment_results
DO $$ BEGIN
  CREATE POLICY assessment_results_select_own ON assessment_results
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY assessment_results_insert_own ON assessment_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY assessment_results_update_own ON assessment_results
    FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- RLS Policies for assessment_sessions
DO $$ BEGIN
  CREATE POLICY assessment_sessions_select_own ON assessment_sessions
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY assessment_sessions_insert_own ON assessment_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY assessment_sessions_update_own ON assessment_sessions
    FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- RLS Policies for user_assessment_profiles
DO $$ BEGIN
  CREATE POLICY user_assessment_profiles_select_own ON user_assessment_profiles
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY user_assessment_profiles_insert_own ON user_assessment_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY user_assessment_profiles_update_own ON user_assessment_profiles
    FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Add comments for documentation
COMMENT ON TABLE assessment_results IS 'Stores individual assessment completions with scores and results';
COMMENT ON TABLE assessment_sessions IS 'Tracks assessment flows/sessions that users complete';
COMMENT ON TABLE user_assessment_profiles IS 'Stores processed user profile data from completed assessments';
