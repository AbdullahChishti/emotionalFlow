-- Add soft delete functions for assessments
-- This migration creates the missing database functions for assessment deletion

-- Create soft_delete_assessment function
CREATE OR REPLACE FUNCTION soft_delete_assessment(
  p_user_id UUID,
  p_assessment_id TEXT,
  p_cascade BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER := 0;
  result JSONB;
BEGIN
  -- Soft delete assessment_results by setting deleted_at timestamp
  UPDATE assessment_results 
  SET deleted_at = NOW()
  WHERE user_id = p_user_id 
    AND assessment_id = p_assessment_id 
    AND deleted_at IS NULL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- If cascade is true, also soft delete related overall_assessments
  IF p_cascade THEN
    UPDATE overall_assessments 
    SET deleted_at = NOW()
    WHERE user_id = p_user_id 
      AND deleted_at IS NULL;
  END IF;
  
  -- Return result
  result := jsonb_build_object(
    'success', true,
    'deleted_count', deleted_count,
    'cascade', p_cascade
  );
  
  RETURN result;
END;
$$;

-- Create restore_assessment function
CREATE OR REPLACE FUNCTION restore_assessment(
  p_user_id UUID,
  p_assessment_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  restored_count INTEGER := 0;
  result JSONB;
BEGIN
  -- Restore assessment_results by removing deleted_at timestamp
  UPDATE assessment_results 
  SET deleted_at = NULL
  WHERE user_id = p_user_id 
    AND assessment_id = p_assessment_id 
    AND deleted_at IS NOT NULL;
  
  GET DIAGNOSTICS restored_count = ROW_COUNT;
  
  -- Return result
  result := jsonb_build_object(
    'success', true,
    'restored_count', restored_count
  );
  
  RETURN result;
END;
$$;

-- Create can_restore_assessment function
CREATE OR REPLACE FUNCTION can_restore_assessment(
  p_user_id UUID,
  p_assessment_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  grace_period_hours INTEGER := 24; -- 24 hour grace period
  deleted_at_timestamp TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Check if assessment was recently deleted (within grace period)
  SELECT deleted_at INTO deleted_at_timestamp
  FROM assessment_results 
  WHERE user_id = p_user_id 
    AND assessment_id = p_assessment_id 
    AND deleted_at IS NOT NULL
  ORDER BY deleted_at DESC
  LIMIT 1;
  
  -- Return true if deleted within grace period, false otherwise
  RETURN deleted_at_timestamp IS NOT NULL 
    AND deleted_at_timestamp > NOW() - INTERVAL '1 day' * grace_period_hours;
END;
$$;

-- Add deleted_at column to assessment_results if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assessment_results' 
    AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE assessment_results 
    ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Add deleted_at column to overall_assessments if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'overall_assessments' 
    AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE overall_assessments 
    ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Create index for soft delete queries
CREATE INDEX IF NOT EXISTS idx_assessment_results_deleted_at 
ON assessment_results(deleted_at) 
WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_overall_assessments_deleted_at 
ON overall_assessments(deleted_at) 
WHERE deleted_at IS NOT NULL;

-- Add RLS policies for soft delete
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "assessment_results_select_own" ON assessment_results;
  DROP POLICY IF EXISTS "assessment_results_insert_own" ON assessment_results;
  DROP POLICY IF EXISTS "assessment_results_update_own" ON assessment_results;
  DROP POLICY IF EXISTS "assessment_results_delete_own" ON assessment_results;
  
  -- Create new policies that respect soft delete
  CREATE POLICY "assessment_results_select_own" ON assessment_results
    FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
    
  CREATE POLICY "assessment_results_insert_own" ON assessment_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
  CREATE POLICY "assessment_results_update_own" ON assessment_results
    FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);
    
  CREATE POLICY "assessment_results_delete_own" ON assessment_results
    FOR DELETE USING (auth.uid() = user_id);
END $$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION soft_delete_assessment(UUID, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION restore_assessment(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION can_restore_assessment(UUID, TEXT) TO authenticated;

-- Add comment
COMMENT ON FUNCTION soft_delete_assessment IS 'Soft delete an assessment by setting deleted_at timestamp';
COMMENT ON FUNCTION restore_assessment IS 'Restore a soft-deleted assessment by removing deleted_at timestamp';
COMMENT ON FUNCTION can_restore_assessment IS 'Check if an assessment can be restored (within grace period)';
