#!/usr/bin/env node

/**
 * Local Supabase Setup Script
 * Sets up local Supabase development environment
 */

const { execSync } = require('child_process');

async function setupLocalSupabase() {
  console.log('🐳 Setting up Local Supabase Development Environment');
  console.log('==================================================\n');

  try {
    // Check if Docker is running
    console.log('1. Checking Docker...');
    try {
      execSync('docker info', { stdio: 'pipe' });
      console.log('✅ Docker is running');
    } catch (error) {
      console.log('❌ Docker is not running. Please:');
      console.log('   - Open Docker Desktop');
      console.log('   - Wait for Docker to start');
      console.log('   - Run this script again');
      return;
    }

    // Start Supabase
    console.log('\n2. Starting Supabase services...');
    console.log('   This may take a few minutes...');

    execSync('supabase start', { stdio: 'inherit' });

    console.log('\n✅ Local Supabase started successfully!');
    console.log('\n📋 Local Development URLs:');
    console.log('   🌐 API: http://127.0.0.1:54321');
    console.log('   🗄️  Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres');
    console.log('   📊 Studio: http://127.0.0.1:54323');

    // Update .env.local for local development
    console.log('\n3. Updating environment variables...');
    const fs = require('fs');

    let envContent = fs.readFileSync('.env.local', 'utf8');
    envContent = envContent.replace(
      /NEXT_PUBLIC_SUPABASE_URL=.*/,
      'NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321'
    );
    envContent = envContent.replace(
      /NEXT_PUBLIC_SUPABASE_ANON_KEY=.*/,
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
    );
    envContent = envContent.replace(
      /SUPABASE_SERVICE_ROLE_KEY=.*/,
      'SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
    );

    fs.writeFileSync('.env.local', envContent);
    console.log('✅ Environment variables updated for local development');

    // Test connection
    console.log('\n4. Testing database connection...');
    execSync('node test-local-db.js', { stdio: 'inherit' });

    console.log('\n🎉 Setup complete! You can now:');
    console.log('   - Restart your dev server: npm run dev');
    console.log('   - Test login with any email/password');
    console.log('   - Access Supabase Studio at: http://127.0.0.1:54323');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   - Make sure no other services use ports 54321-54329');
    console.log('   - Try: supabase stop && supabase start');
    console.log('   - Check Docker Desktop is running');
  }
}

setupLocalSupabase();
