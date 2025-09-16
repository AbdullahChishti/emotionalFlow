#!/usr/bin/env node

/**
 * Local Database Connection Test Script
 * Tests connection to local Supabase instance
 */

const { createClient } = require('@supabase/supabase-js');

async function testLocalConnection() {
  console.log('🔍 Testing connection to local Supabase...\n');

  // Local Supabase credentials (from supabase/config.toml)
  const supabaseUrl = 'http://127.0.0.1:54321';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

  try {
    console.log('🧪 Testing connection to local Supabase...');
    const client = createClient(supabaseUrl, supabaseAnonKey);

    const startTime = Date.now();
    const { data, error } = await client.from('profiles').select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Local connection failed:', error.message);

      if (error.message.includes('fetch')) {
        console.log('\n💡 This usually means:');
        console.log('1. Docker is not running');
        console.log('2. Local Supabase is not started');
        console.log('3. Wrong local URL/port');
        console.log('\n🔧 Try:');
        console.log('   - Start Docker Desktop');
        console.log('   - Run: supabase start');
        return false;
      }

      return false;
    }

    const latency = Date.now() - startTime;
    console.log(`✅ Local connection successful (${latency}ms)`);

    // Test basic queries
    console.log('\n🧪 Testing database queries...');

    // Check what tables exist
    const { data: tables, error: tablesError } = await client
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['profiles', 'assessments', 'mood_entries']);

    if (tablesError) {
      console.log('⚠️ Could not check tables:', tablesError.message);
    } else {
      console.log('📊 Available tables:', tables.map(t => t.table_name).join(', '));
    }

    console.log('\n🎉 Local database connection test completed successfully!');
    console.log('✅ Your local Supabase is running and accessible.');

    return true;

  } catch (error) {
    console.error('❌ Local connection test failed:', error.message);

    if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch')) {
      console.log('\n💡 This usually means Supabase local development is not running.');
      console.log('\n🔧 To fix this:');
      console.log('1. Start Docker Desktop');
      console.log('2. Run: supabase start');
      console.log('3. Wait for all services to be healthy');
      console.log('4. Run this test again');
    }

    return false;
  }
}

// Run the test
testLocalConnection().then(success => {
  process.exit(success ? 0 : 1);
});
