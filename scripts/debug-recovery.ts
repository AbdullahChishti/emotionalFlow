/**
 * Debug script to check if recovery actually worked
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function debugRecovery() {
  console.log('🔍 DEBUG: Checking current database state...')

  const { data, error } = await supabase
    .from('assessment_results')
    .select('id, assessment_id, assessment_title, result_data')
    .order('taken_at', { ascending: false })

  if (error) {
    console.error('❌ Database error:', error)
    return
  }

  console.log(`📊 Found ${data?.length || 0} records:`)

  data?.forEach((record, index) => {
    console.log(`\n${index + 1}. ${record.assessment_id} (${record.id})`)
    console.log(`   Result data keys:`, Object.keys(record.result_data || {}))

    if (record.result_data) {
      console.log(`   Has insights: ${!!(record.result_data.insights && record.result_data.insights.length > 0)} (${record.result_data.insights?.length || 0})`)
      console.log(`   Has manifestations: ${!!(record.result_data.manifestations && record.result_data.manifestations.length > 0)} (${record.result_data.manifestations?.length || 0})`)
      console.log(`   Has nextSteps: ${!!(record.result_data.nextSteps && record.result_data.nextSteps.length > 0)} (${record.result_data.nextSteps?.length || 0})`)
      console.log(`   Has recommendations: ${!!(record.result_data.recommendations && record.result_data.recommendations.length > 0)} (${record.result_data.recommendations?.length || 0})`)
    }
  })
}

debugRecovery()
