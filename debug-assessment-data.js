import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugAssessmentData() {
  try {
    console.log('🔍 CRITICAL DEBUG - Fetching all assessment results...')
    
    const { data, error } = await supabase
      .from('assessment_results')
      .select('*')
      .order('taken_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('❌ Database error:', error)
      return
    }

    console.log(`📊 Found ${data?.length || 0} assessment results in database`)
    
    if (data && data.length > 0) {
      data.forEach((item, index) => {
        console.log(`\n🔍 CRITICAL DEBUG - Assessment ${index + 1}:`)
        console.log('  Assessment ID:', item.assessment_id)
        console.log('  Assessment Title:', item.assessment_title)
        console.log('  User ID:', item.user_id)
        console.log('  Score:', item.score)
        console.log('  Level:', item.level)
        console.log('  Severity:', item.severity)
        console.log('  Taken At:', item.taken_at)
        console.log('  Has Friendly Explanation:', !!item.friendly_explanation)
        console.log('  Friendly Explanation Length:', item.friendly_explanation?.length || 0)
        console.log('  Has Result Data:', !!item.result_data)
        console.log('  Result Data Type:', typeof item.result_data)
        
        if (item.result_data) {
          console.log('  Result Data Keys:', Object.keys(item.result_data))
          console.log('  Result Data Structure:')
          console.log('    - description:', !!item.result_data.description)
          console.log('    - recommendations:', Array.isArray(item.result_data.recommendations) ? `${item.result_data.recommendations.length} items` : 'NOT_ARRAY')
          console.log('    - insights:', Array.isArray(item.result_data.insights) ? `${item.result_data.insights.length} items` : 'NOT_ARRAY')
          console.log('    - nextSteps:', Array.isArray(item.result_data.nextSteps) ? `${item.result_data.nextSteps.length} items` : 'NOT_ARRAY')
          console.log('    - manifestations:', Array.isArray(item.result_data.manifestations) ? `${item.result_data.manifestations.length} items` : 'NOT_ARRAY')
          
          if (item.result_data.description) {
            console.log('  Description Preview:', item.result_data.description.substring(0, 100) + '...')
          }
          if (Array.isArray(item.result_data.recommendations) && item.result_data.recommendations.length > 0) {
            console.log('  First Recommendation:', item.result_data.recommendations[0].substring(0, 100) + '...')
          }
        }
        
        console.log('  Raw Responses Keys:', item.responses ? Object.keys(item.responses) : 'NO_RESPONSES')
      })
    } else {
      console.log('❌ No assessment results found in database')
    }

    // Also check for a specific user if we can find one
    if (data && data.length > 0) {
      const firstUserId = data[0].user_id
      console.log(`\n🎯 CRITICAL DEBUG - Fetching results specifically for user: ${firstUserId}`)
      
      const { data: userResults, error: userError } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('user_id', firstUserId)
        .order('taken_at', { ascending: false })

      if (userError) {
        console.error('❌ User-specific query error:', userError)
      } else {
        console.log(`📊 Found ${userResults?.length || 0} results for user ${firstUserId}`)
        userResults?.forEach(result => {
          console.log(`  - ${result.assessment_id}: ${result.score} (${result.level}) - ${result.taken_at}`)
        })
      }
    }

  } catch (error) {
    console.error('💥 Script error:', error)
  }
}

debugAssessmentData()
