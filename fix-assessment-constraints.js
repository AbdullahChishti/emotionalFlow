require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixAssessmentConstraints() {
  console.log('🔍 Checking current database constraints...');
  
  try {
    // Check if the unique constraint exists by trying to insert a duplicate
    const testUserId = '94e1fd19-4eaa-4527-9a15-7b503867ff96'; // From the logs
    const testData = {
      user_id: testUserId,
      assessment_id: 'constraint_test',
      assessment_title: 'Constraint Test',
      score: 10,
      level: 'test',
      severity: 'normal',
      responses: { test: 1 },
      result_data: { test: true },
      friendly_explanation: 'Test explanation'
    };
    
    // First, clean up any existing test records
    await supabase
      .from('assessment_results')
      .delete()
      .eq('assessment_id', 'constraint_test');
    
    // Insert first test record
    const { data: first, error: firstError } = await supabase
      .from('assessment_results')
      .insert(testData)
      .select();
    
    if (firstError) {
      console.error('❌ Error inserting first test record:', firstError);
      return;
    }
    
    console.log('✅ First test record inserted:', first[0]?.id);
    
    // Try to insert a duplicate - this will fail if constraint exists
    const { data: duplicate, error: duplicateError } = await supabase
      .from('assessment_results')
      .insert({
        ...testData,
        score: 20 // Different score but same user_id + assessment_id
      })
      .select();
    
    let constraintExists = false;
    if (duplicateError && duplicateError.code === '23505') {
      constraintExists = true;
      console.log('⚠️ Found unique constraint that prevents multiple assessment results');
    } else if (duplicate) {
      console.log('✅ No constraint found - multiple results are already allowed');
      console.log('✅ Second test record inserted:', duplicate[0]?.id);
    }
    
    
    if (constraintExists) {
      console.log('⚠️ Found unique constraint that prevents multiple assessment results');
      console.log('🔧 Dropping the constraint to allow multiple results per assessment...');
      
      // Drop the unique constraint
      const { error: dropError } = await supabase.rpc('exec', {
        sql: `
          DO $$
          BEGIN
              IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assessment_results_user_assessment_unique') THEN
                  ALTER TABLE assessment_results
                  DROP CONSTRAINT assessment_results_user_assessment_unique;
                  
                  RAISE NOTICE 'Dropped unique constraint assessment_results_user_assessment_unique';
              ELSE
                  RAISE NOTICE 'Unique constraint assessment_results_user_assessment_unique does not exist';
              END IF;
          END $$;
        `
      });
      
      if (dropError) {
        console.error('❌ Error dropping constraint:', dropError);
        return;
      }
      
      console.log('✅ Successfully dropped unique constraint');
      
      // Create optimized index for latest results
      const { error: indexError } = await supabase.rpc('exec', {
        sql: `
          CREATE INDEX IF NOT EXISTS idx_assessment_results_user_assessment_taken_at 
          ON assessment_results(user_id, assessment_id, taken_at DESC);
        `
      });
      
      if (indexError) {
        console.error('⚠️ Warning: Could not create optimization index:', indexError);
      } else {
        console.log('✅ Created optimization index for latest results');
      }
      
    } else {
      console.log('🎉 SUCCESS: Multiple assessment results are already allowed!');
    }
    
    // Clean up test records
    const { error: cleanupError } = await supabase
      .from('assessment_results')
      .delete()
      .eq('assessment_id', 'constraint_test');
    
    if (cleanupError) {
      console.warn('⚠️ Warning: Could not clean up test records:', cleanupError);
    } else {
      console.log('🧹 Cleaned up test records');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixAssessmentConstraints().catch(console.error);
