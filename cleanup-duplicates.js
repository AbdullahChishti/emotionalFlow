// Clean up duplicate assessment data
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: join(__dirname, '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function cleanupDuplicates() {
  console.log('🧹 Starting duplicate data cleanup...')

  try {
    // Clean up duplicate assessment results
    console.log('\n📊 Cleaning up duplicate assessment results...')

    // Get all assessment results grouped by user_id and assessment_id
    const { data: results, error: resultsError } = await supabase
      .from('assessment_results')
      .select('id, user_id, assessment_id, taken_at')
      .order('taken_at', { ascending: false })

    if (resultsError) {
      console.error('Error fetching results:', resultsError)
      return
    }

    const grouped = {}
    results.forEach(result => {
      const key = `${result.user_id}-${result.assessment_id}`
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(result)
    })

    // Keep only the latest result for each user-assessment pair
    for (const [key, items] of Object.entries(grouped)) {
      if (items.length > 1) {
        const toDelete = items.slice(1).map(item => item.id)
        console.log(`🗑️ Deleting ${toDelete.length} duplicate(s) for ${key}`)

        const { error: deleteError } = await supabase
          .from('assessment_results')
          .delete()
          .in('id', toDelete)

        if (deleteError) {
          console.error(`Error deleting duplicates for ${key}:`, deleteError)
        }
      }
    }

    // Clean up duplicate user profiles
    console.log('\n👤 Cleaning up duplicate user profiles...')

    const { data: profiles, error: profilesError } = await supabase
      .from('user_assessment_profiles')
      .select('id, user_id, last_assessed')
      .order('last_assessed', { ascending: false })

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      return
    }

    const profileGroups = {}
    profiles.forEach(profile => {
      const key = profile.user_id
      if (!profileGroups[key]) profileGroups[key] = []
      profileGroups[key].push(profile)
    })

    // Keep only the latest profile for each user
    for (const [userId, items] of Object.entries(profileGroups)) {
      if (items.length > 1) {
        const toDelete = items.slice(1).map(item => item.id)
        console.log(`🗑️ Deleting ${toDelete.length} duplicate profile(s) for user ${userId}`)

        const { error: deleteError } = await supabase
          .from('user_assessment_profiles')
          .delete()
          .in('id', toDelete)

        if (deleteError) {
          console.error(`Error deleting duplicate profiles for ${userId}:`, deleteError)
        }
      }
    }

    console.log('\n✅ Cleanup completed!')

  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  }
}

cleanupDuplicates()
