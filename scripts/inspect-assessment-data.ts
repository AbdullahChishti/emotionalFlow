/**
 * Inspect Assessment Data Script
 * Inspects the actual assessment data structure in the database
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

async function inspectAssessmentData() {
  console.log('🔍 Inspecting assessment data structure...')

  try {
    // Get assessment results
    const { data: results, error: resultsError } = await supabase
      .from('assessment_results')
      .select('*')

    if (resultsError) {
      console.error('Error fetching assessment results:', resultsError)
      return
    }

    console.log(`📊 Found ${results?.length || 0} assessment results`)
    
    if (results && results.length > 0) {
      console.log('\n📋 Assessment Results:')
      results.forEach((result, index) => {
        console.log(`\n${index + 1}. Assessment Result:`)
        console.log(`   ID: ${result.id}`)
        console.log(`   User ID: ${result.user_id}`)
        console.log(`   Assessment ID: ${result.assessment_id}`)
        console.log(`   Assessment Title: ${result.assessment_title}`)
        console.log(`   Score: ${result.score}`)
        console.log(`   Level: ${result.level}`)
        console.log(`   Severity: ${result.severity}`)
        console.log(`   Result Data:`, JSON.stringify(result.result_data, null, 2))
        console.log(`   Taken At: ${result.taken_at}`)
      })
    }

    // Get user assessment profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('user_assessment_profiles')
      .select('*')

    if (profilesError) {
      console.error('Error fetching user profiles:', profilesError)
      return
    }

    console.log(`\n👤 Found ${profiles?.length || 0} user assessment profiles`)
    
    if (profiles && profiles.length > 0) {
      console.log('\n📋 User Assessment Profiles:')
      profiles.forEach((profile, index) => {
        console.log(`\n${index + 1}. User Profile:`)
        console.log(`   ID: ${profile.id}`)
        console.log(`   User ID: ${profile.user_id}`)
        console.log(`   Profile Data:`, JSON.stringify(profile.profile_data, null, 2))
        console.log(`   Last Assessed: ${profile.last_assessed}`)
      })
    }

  } catch (error) {
    console.error('❌ Error inspecting assessment data:', error)
    process.exit(1)
  }
}

// Main execution
inspectAssessmentData()
