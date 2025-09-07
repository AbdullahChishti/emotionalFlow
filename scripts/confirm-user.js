#!/usr/bin/env node

/**
 * Manual User Confirmation Script
 * This script manually confirms users in Supabase for development
 */

const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://fpahhfzmkjsienzzeyks.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwYWhoZnpta2pzaWVuenpleWtzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc0MDE5OCwiZXhwIjoyMDY2MzE2MTk4fQ.ALkmVSIjkFGAzavQHADkXwUuQk9XNT172pSYE8HGEDc'

// Create admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function confirmUser(email) {
  try {
    console.log(`🔍 Looking for user with email: ${email}`)
    
    // Get user by email
    const { data: users, error: fetchError } = await supabase.auth.admin.listUsers()
    
    if (fetchError) {
      console.error('❌ Error fetching users:', fetchError.message)
      return
    }
    
    const user = users.users.find(u => u.email === email)
    
    if (!user) {
      console.error(`❌ User with email ${email} not found`)
      return
    }
    
    console.log(`👤 Found user: ${user.id}`)
    console.log(`📧 Email confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`)
    
    if (user.email_confirmed_at) {
      console.log('✅ User is already confirmed')
      return
    }
    
    // Confirm the user
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      email_confirm: true
    })
    
    if (error) {
      console.error('❌ Error confirming user:', error.message)
      return
    }
    
    console.log('✅ User confirmed successfully!')
    console.log('🎉 You can now log in with this account')
    
  } catch (error) {
    console.error('❌ Script error:', error.message)
  }
}

// Get email from command line argument
const email = process.argv[2]

if (!email) {
  console.log('Usage: node confirm-user.js <email>')
  console.log('Example: node confirm-user.js admin@mindwell.com')
  process.exit(1)
}

confirmUser(email)
