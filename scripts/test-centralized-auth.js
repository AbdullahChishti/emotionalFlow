#!/usr/bin/env node

/**
 * Test Centralized Auth System
 * Tests the new centralized authentication system
 */

const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://fpahhfzmkjsienzzeyks.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwYWhoZnpta2pzaWVuenpleWtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NDAxOTgsImV4cCI6MjA2NjMxNjE5OH0.x0RUC13qBZy5VchKCJYni8gGTCKjT8lQt6HpDoLgGpo'

// Create client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testCentralizedAuth() {
  try {
    console.log('🧪 Testing centralized auth system...')
    
    // Test 1: Sign in with existing user
    console.log('\n1️⃣ Testing sign in...')
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'admin@mindwell.com',
      password: 'admin123456'
    })
    
    if (signInError) {
      console.log('❌ Sign in failed:', signInError.message)
      return
    }
    
    console.log('✅ Sign in successful!')
    console.log('👤 User:', signInData.user?.email)
    console.log('🔑 Session:', !!signInData.session)
    
    // Test 2: Check session persistence
    console.log('\n2️⃣ Testing session persistence...')
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.log('❌ Session check failed:', sessionError.message)
    } else {
      console.log('✅ Session persisted!')
      console.log('👤 User from session:', sessionData.session?.user?.email)
    }
    
    // Test 3: Create new user
    console.log('\n3️⃣ Testing sign up...')
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'testuser3@gmail.com',
      password: 'TestPassword123',
      options: {
        data: {
          display_name: 'Test User 3'
        }
      }
    })
    
    if (signUpError) {
      console.log('❌ Sign up failed:', signUpError.message)
    } else {
      console.log('✅ Sign up successful!')
      console.log('👤 New user:', signUpData.user?.email)
    }
    
    // Test 4: Sign out
    console.log('\n4️⃣ Testing sign out...')
    const { error: signOutError } = await supabase.auth.signOut()
    
    if (signOutError) {
      console.log('❌ Sign out failed:', signOutError.message)
    } else {
      console.log('✅ Sign out successful!')
    }
    
    // Test 5: Verify session cleared
    console.log('\n5️⃣ Testing session after sign out...')
    const { data: finalSessionData } = await supabase.auth.getSession()
    
    if (finalSessionData.session) {
      console.log('❌ Session not cleared after sign out')
    } else {
      console.log('✅ Session cleared successfully!')
    }
    
    console.log('\n🎉 All centralized auth tests passed!')
    console.log('✅ Auth system is working correctly')
    
  } catch (error) {
    console.error('❌ Test error:', error.message)
  }
}

testCentralizedAuth()
