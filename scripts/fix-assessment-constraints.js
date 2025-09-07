// Script to fix assessment database constraints for upsert operations
// Run with: node scripts/fix-assessment-constraints.js

const { createClient } = require('@supabase/supabase-js');

// You'll need to set these environment variables or replace with your values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixConstraints() {
  try {
    console.log('🔧 Starting constraint fixes...');

    // Check if constraints already exist
    const { data: existingConstraints, error: checkError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT conname
          FROM pg_constraint
          WHERE conname IN (
            'assessment_results_user_assessment_unique',
            'user_assessment_profiles_user_unique'
          )
        `
      });

    if (checkError) {
      console.log('⚠️ Could not check existing constraints, proceeding with creation...');
    } else {
      console.log('📋 Existing constraints:', existingConstraints);
    }

    // Add unique constraint for assessment_results (user_id, assessment_id)
    console.log('📝 Adding unique constraint for assessment_results...');
    const { error: constraint1Error } = await supabase
      .rpc('exec_sql', {
        sql: `
          DO $$
          BEGIN
              IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assessment_results_user_assessment_unique') THEN
                  ALTER TABLE assessment_results
                  ADD CONSTRAINT assessment_results_user_assessment_unique
                  UNIQUE (user_id, assessment_id);
                  RAISE NOTICE 'Added unique constraint assessment_results_user_assessment_unique';
              ELSE
                  RAISE NOTICE 'Constraint assessment_results_user_assessment_unique already exists';
              END IF;
          END $$;
        `
      });

    if (constraint1Error) {
      console.error('❌ Failed to add assessment_results constraint:', constraint1Error);
    } else {
      console.log('✅ Assessment results constraint added successfully');
    }

    // Add unique constraint for user_assessment_profiles (user_id)
    console.log('📝 Adding unique constraint for user_assessment_profiles...');
    const { error: constraint2Error } = await supabase
      .rpc('exec_sql', {
        sql: `
          DO $$
          BEGIN
              IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_assessment_profiles_user_unique') THEN
                  ALTER TABLE user_assessment_profiles
                  ADD CONSTRAINT user_assessment_profiles_user_unique
                  UNIQUE (user_id);
                  RAISE NOTICE 'Added unique constraint user_assessment_profiles_user_unique';
              ELSE
                  RAISE NOTICE 'Constraint user_assessment_profiles_user_unique already exists';
              END IF;
          END $$;
        `
      });

    if (constraint2Error) {
      console.error('❌ Failed to add user_assessment_profiles constraint:', constraint2Error);
    } else {
      console.log('✅ User assessment profiles constraint added successfully');
    }

    console.log('🎉 Constraint fixes completed!');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Alternative approach using direct SQL execution
async function fixConstraintsAlternative() {
  try {
    console.log('🔧 Starting constraint fixes (alternative method)...');

    // Try direct SQL execution through Supabase
    const { data, error } = await supabase
      .from('_supabase_migration_temp')
      .select('*')
      .limit(1);

    if (error) {
      console.log('📝 Using alternative SQL execution method...');

      // This won't work but let's try the RPC approach
      const { error: rpcError } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT 'test' as result;
        `
      });

      if (rpcError) {
        console.error('❌ RPC method not available. Please run this SQL manually in Supabase dashboard:');
        console.log(`
-- Add unique constraints for upsert operations
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assessment_results_user_assessment_unique') THEN
        ALTER TABLE assessment_results
        ADD CONSTRAINT assessment_results_user_assessment_unique
        UNIQUE (user_id, assessment_id);
        RAISE NOTICE 'Added unique constraint assessment_results_user_assessment_unique';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_assessment_profiles_user_unique') THEN
        ALTER TABLE user_assessment_profiles
        ADD CONSTRAINT user_assessment_profiles_user_unique
        UNIQUE (user_id);
        RAISE NOTICE 'Added unique constraint user_assessment_profiles_user_unique';
    END IF;
END $$;
        `);
      }
    }

  } catch (error) {
    console.error('💥 Alternative method failed:', error);
  }
}

fixConstraints().then(() => {
  console.log('✅ Script completed');
}).catch((error) => {
  console.error('❌ Script failed:', error);
  fixConstraintsAlternative();
});
