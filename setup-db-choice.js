#!/usr/bin/env node

/**
 * Database Setup Choice Script
 * Helps user choose between local and remote Supabase setup
 */

const { execSync } = require('child_process');

console.log('🚀 MindWell Database Setup');
console.log('==========================\n');

console.log('Choose your setup option:');
console.log('1. 🐳 Local Supabase (requires Docker)');
console.log('2. ☁️  Remote Supabase (easier for testing)');
console.log('3. 🔍 Test current connection\n');

process.stdout.write('Enter your choice (1, 2, or 3): ');

process.stdin.on('data', async (data) => {
  const choice = data.toString().trim();

  switch (choice) {
    case '1':
      console.log('\n🐳 Setting up Local Supabase...\n');
      setupLocalSupabase();
      break;

    case '2':
      console.log('\n☁️ Setting up Remote Supabase...\n');
      showRemoteSetup();
      break;

    case '3':
      console.log('\n🔍 Testing database connection...\n');
      testConnection();
      break;

    default:
      console.log('❌ Invalid choice. Please run the script again and choose 1, 2, or 3.');
      process.exit(1);
  }

  process.exit(0);
});

function setupLocalSupabase() {
  try {
    console.log('1. Make sure Docker Desktop is running...');
    console.log('2. Starting local Supabase...\n');

    // Check if Docker is running
    try {
      execSync('docker info', { stdio: 'pipe' });
      console.log('✅ Docker is running');
    } catch (error) {
      console.log('❌ Docker is not running. Please start Docker Desktop first.');
      console.log('   Then run: supabase start');
      return;
    }

    // Start Supabase
    console.log('🚀 Starting Supabase services...');
    execSync('supabase start', { stdio: 'inherit' });

    console.log('\n✅ Local Supabase started successfully!');
    console.log('🔗 Local URL: http://127.0.0.1:54321');
    console.log('🎯 Test with: node test-local-db.js');

  } catch (error) {
    console.error('❌ Failed to start local Supabase:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   - Docker Desktop is running');
    console.log('   - No other services are using ports 54321-54329');
  }
}

function showRemoteSetup() {
  console.log('📋 To set up remote Supabase:');
  console.log('');
  console.log('1. Go to https://supabase.com');
  console.log('2. Create a new project (or use existing)');
  console.log('3. Go to Settings → API');
  console.log('4. Copy these values:');
  console.log('   - Project URL');
  console.log('   - Anon public key');
  console.log('   - Service role key');
  console.log('');
  console.log('5. Update your .env.local file with the real values');
  console.log('6. Run: node test-db-connection.js');
  console.log('');
  console.log('Your .env.local file is ready at the project root.');
  console.log('Just replace the placeholder values with your actual Supabase credentials.');
}

async function testConnection() {
  try {
    execSync('node test-db-connection.js', { stdio: 'inherit' });
  } catch (error) {
    try {
      execSync('node test-local-db.js', { stdio: 'inherit' });
    } catch (localError) {
      console.log('\n❌ No database connection found.');
      console.log('💡 Try options 1 or 2 above to set up your database.');
    }
  }
}
