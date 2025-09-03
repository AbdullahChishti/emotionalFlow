/**
 * Create Realistic Test Data Script
 * Creates test assessment data with realistic scores for testing
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
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createRealisticTestData() {
  console.log('🧪 Creating realistic test assessment data...')

  try {
    // Get the first user from profiles
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (usersError || !users || users.length === 0) {
      console.error('No users found in profiles table')
      return
    }

    const userId = users[0].id
    console.log(`Creating assessment data for user: ${userId}`)

    // Create realistic PHQ-9 assessment (moderate depression)
    const phq9Result = {
      user_id: userId,
      assessment_id: 'phq9',
      assessment_title: 'PHQ-9 Depression Assessment',
      score: 12, // Moderate depression (realistic score)
      result_data: {
        level: 'Moderate depression',
        severity: 'moderate',
        suicidal_ideation: false
      },
      taken_at: new Date().toISOString()
    }

    const { error: phq9Error } = await supabase
      .from('assessment_results')
      .insert(phq9Result)

    if (phq9Error) {
      console.error('Error creating PHQ-9 assessment:', phq9Error)
    } else {
      console.log('✅ Created PHQ-9 assessment (score: 12 - moderate depression)')
    }

    // Create realistic GAD-7 assessment (mild anxiety)
    const gad7Result = {
      user_id: userId,
      assessment_id: 'gad7',
      assessment_title: 'GAD-7 Anxiety Assessment',
      score: 8, // Mild anxiety (realistic score)
      result_data: {
        level: 'Mild anxiety',
        severity: 'mild'
      },
      taken_at: new Date().toISOString()
    }

    const { error: gad7Error } = await supabase
      .from('assessment_results')
      .insert(gad7Result)

    if (gad7Error) {
      console.error('Error creating GAD-7 assessment:', gad7Error)
    } else {
      console.log('✅ Created GAD-7 assessment (score: 8 - mild anxiety)')
    }

    // Create realistic ACE assessment (low trauma)
    const aceResult = {
      user_id: userId,
      assessment_id: 'ace',
      assessment_title: 'ACE Trauma Assessment',
      score: 2, // Low ACEs (realistic score)
      result_data: {
        level: 'Low ACEs',
        severity: 'mild'
      },
      taken_at: new Date().toISOString()
    }

    const { error: aceError } = await supabase
      .from('assessment_results')
      .insert(aceResult)

    if (aceError) {
      console.error('Error creating ACE assessment:', aceError)
    } else {
      console.log('✅ Created ACE assessment (score: 2 - low trauma)')
    }

    // Create user assessment profile
    const profileData = {
      user_id: userId,
      profile_data: {
        overall_risk_level: 'moderate',
        primary_concerns: ['depression', 'anxiety'],
        therapeutic_approach: 'cbt_approach',
        last_assessed: new Date().toISOString()
      },
      last_assessed: new Date().toISOString()
    }

    const { error: profileError } = await supabase
      .from('user_assessment_profiles')
      .insert(profileData)

    if (profileError) {
      console.error('Error creating user profile:', profileError)
    } else {
      console.log('✅ Created user assessment profile')
    }

    console.log('\n🎉 Realistic test data created successfully!')
    console.log('\n📊 Assessment Summary:')
    console.log('- PHQ-9: 12 (moderate depression)')
    console.log('- GAD-7: 8 (mild anxiety)')
    console.log('- ACE: 2 (low trauma)')
    console.log('- Expected Risk Level: moderate')
    console.log('\n🧪 Now you can test the chat system with realistic assessment data!')

  } catch (error) {
    console.error('❌ Error creating realistic test data:', error)
    process.exit(1)
  }
}

// Main execution
createRealisticTestData()
