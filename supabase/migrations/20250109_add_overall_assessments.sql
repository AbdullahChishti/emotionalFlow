-- Add overall assessments table
-- This migration creates a table to store comprehensive overall assessment results

CREATE TABLE IF NOT EXISTS overall_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  overall_assessment_data JSONB NOT NULL, -- Complete OverallAssessmentData object
  ai_analysis JSONB NOT NULL, -- AI-generated comprehensive analysis
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_overall_assessments_user_id ON overall_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_overall_assessments_updated_at ON overall_assessments(updated_at);

-- Add updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_overall_assessments_updated_at') THEN
    CREATE TRIGGER update_overall_assessments_updated_at
      BEFORE UPDATE ON overall_assessments
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE overall_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ BEGIN
  CREATE POLICY overall_assessments_select_own ON overall_assessments
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY overall_assessments_insert_own ON overall_assessments
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY overall_assessments_update_own ON overall_assessments
    FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Add comments for documentation
COMMENT ON TABLE overall_assessments IS 'Stores comprehensive overall assessment results combining all individual assessments';
COMMENT ON COLUMN overall_assessments.overall_assessment_data IS 'Complete assessment data including all individual assessments and summary';
COMMENT ON COLUMN overall_assessments.ai_analysis IS 'AI-generated comprehensive analysis and recommendations';
