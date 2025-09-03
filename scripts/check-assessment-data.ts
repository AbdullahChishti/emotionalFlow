/**
 * Check Assessment Data Script
 * Checks if there's any assessment data in the database
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

async function checkAssessmentData() {
  console.log('🔍 Checking assessment data in database...')

  try {
    // Check assessment results
    const { data: results, error: resultsError } = await supabase
      .from('assessment_results')
      .select('*')

    if (resultsError) {
      console.error('Error fetching assessment results:', resultsError)
    } else {
      console.log(`📊 Found ${results?.length || 0} assessment results`)
      if (results && results.length > 0) {
        console.log('Sample results:')
        results.slice(0, 3).forEach((result, index) => {
          console.log(`  ${index + 1}. User: ${result.user_id}, Assessment: ${result.assessment_id}, Score: ${result.score}`)
        })
      }
    }

    // Check user assessment profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('user_assessment_profiles')
      .select('*')

    if (profilesError) {
      console.error('Error fetching user profiles:', profilesError)
    } else {
      console.log(`👤 Found ${profiles?.length || 0} user assessment profiles`)
      if (profiles && profiles.length > 0) {
        console.log('Sample profiles:')
        profiles.slice(0, 3).forEach((profile, index) => {
          console.log(`  ${index + 1}. User: ${profile.user_id}, Last assessed: ${profile.last_assessed}`)
        })
      }
    }

    // Check profiles table
    const { data: userProfiles, error: userProfilesError } = await supabase
      .from('profiles')
      .select('id, username, display_name')

    if (userProfilesError) {
      console.error('Error fetching user profiles:', userProfilesError)
    } else {
      console.log(`👥 Found ${userProfiles?.length || 0} user profiles`)
      if (userProfiles && userProfiles.length > 0) {
        console.log('User profiles:')
        userProfiles.forEach((profile, index) => {
          console.log(`  ${index + 1}. ID: ${profile.id}, Username: ${profile.username || 'N/A'}, Display: ${profile.display_name || 'N/A'}`)
        })
      }
    }

    console.log('\n📋 Summary:')
    console.log(`- Assessment Results: ${results?.length || 0}`)
    console.log(`- User Assessment Profiles: ${profiles?.length || 0}`)
    console.log(`- User Profiles: ${userProfiles?.length || 0}`)
    
    if ((results?.length || 0) === 0) {
      console.log('\n⚠️  No assessment data found! This explains why the AI says it doesn\'t have access to assessments.')
      console.log('💡 To test with assessment data, run: npm run test:setup')
    }

  } catch (error) {
    console.error('❌ Error checking assessment data:', error)
    process.exit(1)
  }
}

// Main execution
checkAssessmentData()
