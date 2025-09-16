-- Verify DELETE policies exist for assessment deletion
SELECT 
  tablename, 
  policyname, 
  cmd,
  CASE 
    WHEN policyname = 'assessment_results_delete_own' THEN '✅ Required policy exists'
    WHEN policyname = 'overall_assessments_delete_own' THEN '✅ Required policy exists'
    ELSE 'ℹ️  Additional policy'
  END as status
FROM pg_policies 
WHERE tablename IN ('assessment_results', 'overall_assessments') 
  AND cmd = 'DELETE'
ORDER BY tablename, policyname;

-- Check if soft delete functions exist
SELECT 
  routine_name,
  routine_type,
  CASE 
    WHEN routine_name = 'soft_delete_assessment' THEN '✅ Soft delete function exists'
    WHEN routine_name = 'restore_assessment' THEN '✅ Restore function exists'
    WHEN routine_name = 'can_restore_assessment' THEN '✅ Check function exists'
    ELSE 'ℹ️  Additional function'
  END as status
FROM information_schema.routines 
WHERE routine_name IN ('soft_delete_assessment', 'restore_assessment', 'can_restore_assessment')
  AND routine_schema = 'public'
ORDER BY routine_name;

-- Check if deleted_at columns exist
SELECT 
  table_name,
  column_name,
  data_type,
  CASE 
    WHEN column_name = 'deleted_at' THEN '✅ Soft delete column exists'
    ELSE 'ℹ️  Other column'
  END as status
FROM information_schema.columns 
WHERE table_name IN ('assessment_results', 'overall_assessments')
  AND column_name = 'deleted_at'
ORDER BY table_name;
