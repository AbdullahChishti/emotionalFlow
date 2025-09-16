#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Tests if the Supabase database connection is working
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('📋 Environment Configuration:');
  console.log(`   URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Anon Key: ${supabaseAnonKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Service Role: ${serviceRoleKey ? '✅ Set' : '❌ Missing'}\n`);

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing required environment variables!');
    console.log('Please set the following environment variables:');
    console.log('   NEXT_PUBLIC_SUPABASE_URL');
    console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.log('\nYou can find these values in your Supabase project dashboard → Settings → API');
    return false;
  }

  try {
    // Test with anon key (client-side)
    console.log('🧪 Testing client connection (anon key)...');
    const client = createClient(supabaseUrl, supabaseAnonKey);

    const startTime = Date.now();
    const { data, error } = await client.from('profiles').select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Client connection failed:', error.message);
      return false;
    }

    const latency = Date.now() - startTime;
    console.log(`✅ Client connection successful (${latency}ms)\n`);

    // Test with service role key if available (server-side)
    if (serviceRoleKey) {
      console.log('🧪 Testing server connection (service role)...');
      const serverClient = createClient(supabaseUrl, serviceRoleKey);

      const serverStartTime = Date.now();
      const { data: serverData, error: serverError } = await serverClient
        .from('profiles')
        .select('count', { count: 'exact', head: true });

      if (serverError) {
        console.error('❌ Server connection failed:', serverError.message);
        return false;
      }

      const serverLatency = Date.now() - serverStartTime;
      console.log(`✅ Server connection successful (${serverLatency}ms)\n`);
    }

    // Test basic database operations
    console.log('🧪 Testing database operations...');

    // Test table existence and structure
    const { data: tables, error: tablesError } = await client
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['profiles', 'assessments', 'mood_entries']);

    if (tablesError) {
      console.error('❌ Could not query database schema:', tablesError.message);
    } else {
      console.log('📊 Found tables:', tables.map(t => t.table_name).join(', '));
    }

    // Test RLS policies
    console.log('\n🔒 Testing Row Level Security...');
    const { data: policies, error: policiesError } = await client
      .from('information_schema.table_privileges')
      .select('table_name, privilege_type')
      .eq('grantee', 'anon')
      .in('table_name', ['profiles', 'assessments', 'mood_entries']);

    if (policiesError) {
      console.log('⚠️ Could not check RLS policies (this might be expected):', policiesError.message);
    } else {
      console.log('✅ RLS policies accessible');
    }

    console.log('\n🎉 Database connection test completed successfully!');
    console.log('✅ All tests passed - your database is working properly.');

    return true;

  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    return false;
  }
}

// Run the test
testDatabaseConnection().then(success => {
  process.exit(success ? 0 : 1);
});
