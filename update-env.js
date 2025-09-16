#!/usr/bin/env node

/**
 * Update Environment Variables Script
 * Helps update .env.local with real Supabase credentials
 */

const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Update Supabase Environment Variables');
console.log('=========================================\n');

rl.question('Enter your Supabase Project URL (e.g., https://xyz.supabase.co): ', (url) => {
  rl.question('Enter your Supabase Anon Key: ', (anonKey) => {
    rl.question('Enter your Supabase Service Role Key: ', (serviceKey) => {

      // Read current .env.local
      let envContent = fs.readFileSync('.env.local', 'utf8');

      // Update the values
      envContent = envContent.replace(
        /NEXT_PUBLIC_SUPABASE_URL=.*/,
        `NEXT_PUBLIC_SUPABASE_URL=${url}`
      );
      envContent = envContent.replace(
        /NEXT_PUBLIC_SUPABASE_ANON_KEY=.*/,
        `NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}`
      );
      envContent = envContent.replace(
        /SUPABASE_SERVICE_ROLE_KEY=.*/,
        `SUPABASE_SERVICE_ROLE_KEY=${serviceKey}`
      );

      // Write back to file
      fs.writeFileSync('.env.local', envContent);

      console.log('\n✅ Environment variables updated successfully!');
      console.log('🔄 Please restart your development server:');
      console.log('   npm run dev');
      console.log('\n🧪 Then test the connection:');
      console.log('   node test-db-connection.js');

      rl.close();
    });
  });
});
