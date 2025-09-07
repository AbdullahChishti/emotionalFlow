#!/usr/bin/env node

/**
 * Test Login Script
 * Tests login functionality after user confirmation
 */

const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://fpahhfzmkjsienzzeyks.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwYWhoZnpta2pzaWVuenpleWtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NDAxOTgsImV4cCI6MjA2NjMxNjE5OH0.x0RUC13qBZy5VchKCJYni8gGTCKjT8lQt6HpDoLgGpo'

// Create client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testLogin() {
  try {
    console.log('🧪 Testing login...')
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@mindwell.com',
      password: 'admin123456'
    })
    
    if (error) {
      console.log('❌ Login failed:', error.message)
      return
    }
    
    console.log('🎉 LOGIN SUCCESS!')
    console.log('👤 User:', data.user?.email)
    console.log('🔑 Session:', !!data.session)
    console.log('✅ Authentication is working!')
    
  } catch (error) {
    console.error('❌ Test error:', error.message)
  }
}

testLogin()
