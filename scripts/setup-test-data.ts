/**
 * Setup Test Data Script
 * Creates test assessment data for testing the assessment-enhanced chat system
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: join(__dirname, '..', '.env.local') })

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupTestData() {
  console.log('🚀 Setting up test data for assessment-enhanced chat...')

  try {
    // Create test users
    for (const testUser of TEST_USERS) {
      console.log(`\n📝 Setting up test user: ${testUser.email}`)
      
      // Create user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: testUser.id,
          email: testUser.email,
          full_name: `Test User ${testUser.id}`,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (profileError && !profileError.message.includes('duplicate key')) {
        console.error(`Error creating profile for ${testUser.email}:`, profileError)
        continue
      }

      // Clean up existing test data
      await TestUtils.cleanupTestData(testUser.id)

      // Create assessment data
      await TestUtils.createTestAssessmentData(testUser.id, testUser.assessmentData)

      console.log(`✅ Created test data for ${testUser.email}`)
      console.log(`   Risk Level: ${testUser.expectedRiskLevel}`)
      console.log(`   PHQ-9: ${testUser.assessmentData.phq9?.score || 'N/A'}`)
      console.log(`   GAD-7: ${testUser.assessmentData.gad7?.score || 'N/A'}`)
      console.log(`   ACE: ${testUser.assessmentData.ace?.score || 'N/A'}`)
      console.log(`   CD-RISC: ${testUser.assessmentData.cdRisc?.score || 'N/A'}`)
    }

    console.log('\n🎉 Test data setup complete!')
    console.log('\n📋 Test Users Created:')
    TEST_USERS.forEach(user => {
      console.log(`   ${user.email} (${user.id}) - ${user.expectedRiskLevel} risk`)
    })

    console.log('\n🧪 Next Steps:')
    console.log('1. Navigate to /test-chat in your application')
    console.log('2. Sign in with one of the test user emails')
    console.log('3. Run the automated test suite')
    console.log('4. Try manual test messages')
    console.log('5. Verify assessment data integration')

  } catch (error) {
    console.error('❌ Error setting up test data:', error)
    process.exit(1)
  }
}

async function cleanupTestData() {
  console.log('🧹 Cleaning up test data...')

  try {
    for (const testUser of TEST_USERS) {
      await TestUtils.cleanupTestData(testUser.id)
      
      // Remove profile
      await supabase
        .from('profiles')
        .delete()
        .eq('id', testUser.id)

      console.log(`✅ Cleaned up data for ${testUser.email}`)
    }

    console.log('🎉 Test data cleanup complete!')
  } catch (error) {
    console.error('❌ Error cleaning up test data:', error)
    process.exit(1)
  }
}

// Main execution
const command = process.argv[2]

if (command === 'cleanup') {
  cleanupTestData()
} else {
  setupTestData()
}
