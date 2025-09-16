const { Client } = require('pg');

async function fixDatabase() {
  const client = new Client({
    host: '127.0.0.1',
    port: 54322,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres',
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Check if user_id column exists
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'profiles' 
      AND column_name = 'user_id';
    `;

    const result = await client.query(checkQuery);
    
    if (result.rows.length === 0) {
      console.log('Adding user_id column to profiles table...');
      
      // Add user_id column
      await client.query(`
        ALTER TABLE profiles 
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      `);
      
      // Update existing rows
      await client.query(`
        UPDATE profiles 
        SET user_id = id 
        WHERE user_id IS NULL;
      `);
      
      // Add NOT NULL constraint
      await client.query(`
        ALTER TABLE profiles 
        ALTER COLUMN user_id SET NOT NULL;
      `);
      
      // Create index
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_profiles_user_id 
        ON profiles(user_id);
      `);
      
      console.log('Successfully added user_id column and updated existing rows');
    } else {
      console.log('user_id column already exists in profiles table');
    }

    // Verify the changes
    const verifyQuery = `
      SELECT id, user_id, display_name 
      FROM profiles 
      LIMIT 5;
    `;
    
    const verifyResult = await client.query(verifyQuery);
    console.log('Sample profiles data:');
    console.log(verifyResult.rows);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

fixDatabase();
