const { createClient } = require('@supabase/supabase-js');

async function checkAndFixDatabase() {
  try {
    // Initialize Supabase client with admin privileges
    const supabase = createClient(
      'http://127.0.0.1:54321',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
    );

    console.log('Checking database schema...');

    // Check if user_id column exists
    const { data: columnCheck, error: checkError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'profiles')
      .eq('column_name', 'user_id');

    if (checkError) {
      console.error('Error checking columns:', checkError);
      return;
    }

    if (columnCheck.length === 0) {
      console.log('Adding user_id column to profiles table...');
      
      // Add user_id column and update existing rows
      const { error: alterError } = await supabase.rpc('exec', {
        sql: `
          ALTER TABLE profiles ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
          UPDATE profiles SET user_id = id;
          ALTER TABLE profiles ALTER COLUMN user_id SET NOT NULL;
          CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
        `
      });

      if (alterError) {
        console.error('Error adding user_id column:', alterError);
        return;
      }
      
      console.log('Successfully added user_id column and updated existing rows');
    } else {
      console.log('user_id column already exists in profiles table');
    }

    // Verify the data
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, user_id, display_name')
      .limit(5);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return;
    }

    console.log('Sample profiles data:');
    console.log(profiles);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAndFixDatabase();
