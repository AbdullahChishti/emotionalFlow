const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function fixUserId() {
  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
    );

    console.log('Adding user_id column to profiles table if it does not exist...');
    
    // Add user_id column if it doesn't exist
    const { data: alterResult, error: alterError } = await supabase.rpc('exec', {
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'profiles' AND column_name = 'user_id') THEN
            ALTER TABLE profiles ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
            UPDATE profiles SET user_id = id;
            ALTER TABLE profiles ALTER COLUMN user_id SET NOT NULL;
            CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
            
            -- Update RLS policies to use user_id
            DROP POLICY IF EXISTS profiles_select_own ON profiles;
            CREATE POLICY profiles_select_own ON profiles
              FOR SELECT USING (auth.uid() = user_id);
              
            DROP POLICY IF EXISTS profiles_insert_own ON profiles;
            CREATE POLICY profiles_insert_own ON profiles
              FOR INSERT WITH CHECK (auth.uid() = user_id);
              
            DROP POLICY IF EXISTS profiles_update_own ON profiles;
            CREATE POLICY profiles_update_own ON profiles
              FOR UPDATE USING (auth.uid() = user_id);
              
            RAISE NOTICE 'Successfully added user_id column and updated policies';
          ELSE
            RAISE NOTICE 'user_id column already exists in profiles table';
          END IF;
        END $$;
      `
    });

    if (alterError) {
      console.error('Error executing SQL:', alterError);
      return;
    }

    console.log('Successfully updated database schema');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fixUserId();
