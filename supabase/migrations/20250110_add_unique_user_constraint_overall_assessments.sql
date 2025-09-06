-- Ensure one overall_assessments row per user for upsert on user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'overall_assessments_user_id_key'
  ) THEN
    ALTER TABLE overall_assessments
    ADD CONSTRAINT overall_assessments_user_id_key UNIQUE (user_id);
  END IF;
END $$;

