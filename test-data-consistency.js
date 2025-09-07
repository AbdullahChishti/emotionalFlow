// Test data consistency across components
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

async function testDataConsistency() {
  console.log('🧪 Testing data consistency across the app...')

  const testUserId = '94e1fd19-4eaa-4527-9a15-7b503867ff96'

  try {
    // Check current assessment results
    const { data: results, error: resultsError } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('user_id', testUserId)
      .order('taken_at', { ascending: false })

    if (resultsError) {
      console.error('❌ Error fetching results:', resultsError)
      return
    }

    console.log(`\n📊 Current Assessment Results (${results.length}):`)
    results.forEach((result, i) => {
      console.log(`${i + 1}. ${result.assessment_id}: ${result.score} (${result.taken_at})`)
    })

    // Check user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('user_assessment_profiles')
      .select('*')
      .eq('user_id', testUserId)
      .order('last_assessed', { ascending: false })

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError)
      return
    }

    console.log(`\n👤 Current User Profiles (${profiles.length}):`)
    if (profiles.length > 0) {
      const latest = profiles[0]
      console.log(`Latest profile: ${latest.last_assessed}`)
      console.log(`Current symptoms count: ${Object.keys(latest.profile_data?.currentSymptoms || {}).length}`)
    }

    // Verify no duplicates
    const assessmentIds = results.map(r => r.assessment_id)
    const uniqueAssessments = new Set(assessmentIds)

    if (assessmentIds.length === uniqueAssessments.size) {
      console.log('\n✅ No duplicate assessments found')
    } else {
      console.log(`\n❌ Found duplicates! Total: ${assessmentIds.length}, Unique: ${uniqueAssessments.size}`)
    }

    if (profiles.length === 1) {
      console.log('✅ No duplicate profiles found')
    } else {
      console.log(`❌ Found ${profiles.length} profiles, should be 1`)
    }

    console.log('\n🎯 Data consistency test completed!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testDataConsistency()
