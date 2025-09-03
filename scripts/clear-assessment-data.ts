/**
 * Clear Assessment Data Script
 * Clears assessment data for testing purposes
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

async function clearAssessmentData() {
  console.log('🧹 Clearing assessment data...')

  try {
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, username, display_name')

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return
    }

    console.log(`Found ${users?.length || 0} users`)

    // Clear assessment data for all users
    for (const user of users || []) {
      console.log(`Clearing data for user: ${user.username || user.display_name || user.id} (${user.id})`)
      
      // Delete assessment results
      const { error: resultsError } = await supabase
        .from('assessment_results')
        .delete()
        .eq('user_id', user.id)

      if (resultsError) {
        console.error(`Error clearing assessment results for ${user.username || user.id}:`, resultsError)
      }

      // Delete user assessment profiles
      const { error: profileError } = await supabase
        .from('user_assessment_profiles')
        .delete()
        .eq('user_id', user.id)

      if (profileError) {
        console.error(`Error clearing user profile for ${user.username || user.id}:`, profileError)
      }

      // Delete progress tracking data
      const { error: progressError } = await supabase
        .from('user_progress_metrics')
        .delete()
        .eq('user_id', user.id)

      if (progressError) {
        console.error(`Error clearing progress data for ${user.username || user.id}:`, progressError)
      }

      console.log(`✅ Cleared data for ${user.username || user.id}`)
    }

    console.log('🎉 Assessment data cleared for all users!')
    console.log('\n📋 Next Steps:')
    console.log('1. Try the chat system again')
    console.log('2. The system should now respond normally without crisis detection')
    console.log('3. You can complete assessments to test personalized responses')

  } catch (error) {
    console.error('❌ Error clearing assessment data:', error)
    process.exit(1)
  }
}

// Main execution
clearAssessmentData()
