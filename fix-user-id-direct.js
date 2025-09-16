const { createClient } = require('@supabase/supabase-js');

async function fixUserId() {
  try {
    // Initialize Supabase client with admin privileges
    const supabase = createClient(
      'http://127.0.0.1:54321',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
      {
        db: {
          schema: 'public',
        },
      }
    );

    console.log('Checking if user_id column exists in profiles table...');
    
    // Check if user_id column exists
    const { data: columnCheck, error: checkError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'profiles')
      .eq('column_name', 'user_id');

    if (checkError) {
      console.error('Error checking columns:', checkError);
      return;
    }

    if (columnCheck && columnCheck.length === 0) {
      console.log('Adding user_id column to profiles table...');
      
      // Add user_id column
      const { error: alterError } = await supabase.rpc('pg_temp.add_user_id_column');
      
      if (alterError) {
        console.error('Error adding user_id column:', alterError);
        return;
      }
      
      console.log('Successfully added user_id column');
    } else {
      console.log('user_id column already exists in profiles table');
    }
    
    // Update existing rows to set user_id = id
    console.log('Updating existing profiles to set user_id = id...');
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ user_id: supabase.rpc('id') })
      .is('user_id', null);
      
    if (updateError) {
      console.error('Error updating user_id values:', updateError);
      return;
    }
    
    console.log('Successfully updated user_id values');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fixUserId();
