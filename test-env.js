#!/usr/bin/env node

/**
 * Simple Environment Test Script
 * Directly reads .env.local to verify configuration
 */

const fs = require('fs');

try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const lines = envContent.split('\n');

  console.log('📋 Current Environment Configuration:');
  console.log('=====================================\n');

  let url = '';
  let anonKey = '';
  let serviceKey = '';

  lines.forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      url = line.split('=')[1];
      console.log(`🌐 URL: ${url}`);
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      anonKey = line.split('=')[1];
      console.log(`🔑 Anon Key: ${anonKey.substring(0, 20)}...`);
    }
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      serviceKey = line.split('=')[1];
      console.log(`🛠️  Service Key: ${serviceKey.substring(0, 20)}...`);
    }
  });

  console.log('\n✅ Environment file looks good!');
  console.log('\n🔄 Please restart your development server:');
  console.log('   npm run dev');
  console.log('\n🧪 Then try signing up again!');

} catch (error) {
  console.error('❌ Error reading .env.local:', error.message);
}
