-- Add missing DELETE RLS policies for assessment deletion
-- This migration ensures users can delete their own assessment data

-- Add DELETE policy for overall_assessments table
DO $$ BEGIN
  CREATE POLICY "overall_assessments_delete_own" ON overall_assessments
    FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN 
  RAISE NOTICE 'Policy overall_assessments_delete_own already exists';
END $$;

-- Verify the policy was created
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'overall_assessments' 
    AND policyname = 'overall_assessments_delete_own'
  ) THEN
    RAISE NOTICE 'Successfully created overall_assessments_delete_own policy';
  ELSE
    RAISE WARNING 'Failed to create overall_assessments_delete_own policy';
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON POLICY "overall_assessments_delete_own" ON overall_assessments 
IS 'Allows users to delete their own overall assessment records';

-- Verify all required DELETE policies exist
DO $$
DECLARE
  missing_policies TEXT[] := ARRAY[]::TEXT[];
  policy_name TEXT;
  required_policies TEXT[] := ARRAY[
    'assessment_results_delete_own',
    'overall_assessments_delete_own'
  ];
BEGIN
  -- Check each required policy
  FOREACH policy_name IN ARRAY required_policies
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE policyname = policy_name
    ) THEN
      missing_policies := array_append(missing_policies, policy_name);
    END IF;
  END LOOP;
  
  -- Report results
  IF array_length(missing_policies, 1) > 0 THEN
    RAISE WARNING 'Missing DELETE policies: %', array_to_string(missing_policies, ', ');
  ELSE
    RAISE NOTICE 'All required DELETE policies are present';
  END IF;
END $$;
