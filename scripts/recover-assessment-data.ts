/**
 * Assessment Data Recovery Script
 *
 * This script recovers missing detailed data (insights, recommendations, etc.)
 * for existing assessment results that were saved without AI processing.
 */

// Load environment variables FIRST
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

// Now import modules that depend on environment variables
import { createClient } from '@supabase/supabase-js'
import { ASSESSMENTS } from '../src/data/assessments'

// Create our own supabase client for the script using service role key
// This bypasses RLS policies and allows admin access to all data
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function recoverAssessmentData() {
  console.log('🔄 Starting assessment data recovery process...')

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase configuration:')
    console.error(`- NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✓' : '✗'}`)
    console.error(`- SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✓' : '✗'}`)
    return
  }

  console.log('✅ Supabase configuration loaded successfully')

  try {
    // First, let's check if we can access the table at all
    console.log('🔍 Testing database connection...')
    const { data: testData, error: testError } = await supabase
      .from('assessment_results')
      .select('count')
      .limit(1)

    if (testError) {
      console.error('❌ Database connection test failed:', testError)
      return
    }
    console.log('✅ Database connection successful')

    // Get all assessment results that might be missing detailed data
    const { data: assessments, error } = await supabase
      .from('assessment_results')
      .select('*')
      .order('taken_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching assessments:', error)
      return
    }

    // Also try a simple count query
    const { count, error: countError } = await supabase
      .from('assessment_results')
      .select('*', { count: 'exact', head: true })

    console.log(`📊 Total records in table: ${count}, fetched: ${assessments?.length || 0}`)

    if (!assessments || assessments.length === 0) {
      console.log('ℹ️ No assessments found to recover')
      console.log('🔍 Raw query result:', { data: assessments, error, count })
      return
    }

    console.log(`📊 Found ${assessments.length} assessments to process`)
    console.log('📋 Sample assessment data:', assessments.slice(0, 2).map(a => ({
      id: a.id,
      assessment_id: a.assessment_id,
      score: a.score,
      result_data_keys: a.result_data ? Object.keys(a.result_data) : 'no result_data',
      result_data_sample: a.result_data ? {
        level: a.result_data.level,
        insights_length: a.result_data.insights?.length || 0,
        recommendations_length: a.result_data.recommendations?.length || 0,
        description: a.result_data.description?.substring(0, 50) + '...'
      } : 'no result_data'
    })))

    let processed = 0
    let enriched = 0
    let skipped = 0
    let errors = 0

    for (const assessment of assessments) {
      try {
        console.log(`\n🔍 Processing assessment: ${assessment.assessment_id} (${assessment.id})`)

        // Check if assessment already has detailed data
        const resultData = assessment.result_data || {}

        // Check for meaningful detailed data (non-empty arrays with actual content)
        const hasDetailedData = (
          (resultData.insights && Array.isArray(resultData.insights) && resultData.insights.length > 0 && resultData.insights.some(item => item && item.trim().length > 10)) ||
          (resultData.recommendations && Array.isArray(resultData.recommendations) && resultData.recommendations.length > 0 && resultData.recommendations.some(item => item && item.trim().length > 10)) ||
          (resultData.manifestations && Array.isArray(resultData.manifestations) && resultData.manifestations.length > 0 && resultData.manifestations.some(item => item && item.trim().length > 10)) ||
          (resultData.nextSteps && Array.isArray(resultData.nextSteps) && resultData.nextSteps.length > 0 && resultData.nextSteps.some(item => item && item.trim().length > 10))
        )

        // Also check if level is still "unknown" which indicates incomplete processing
        const hasIncompleteProcessing = (
          !resultData.level ||
          resultData.level === 'unknown' ||
          resultData.level === '' ||
          !resultData.description ||
          resultData.description === 'No interpretation available' ||
          resultData.description === ''
        )

        if (hasDetailedData && !hasIncompleteProcessing) {
          console.log(`⏭️ Skipping - already has detailed data and proper level`)
          skipped++
          continue
        }

        console.log(`🔄 Processing - ${hasDetailedData ? 'has basic structure' : 'missing structure'}, ${hasIncompleteProcessing ? 'incomplete processing' : 'complete processing'}`)
        console.log(`   Debug info: level="${resultData.level}", description="${(resultData.description || '').substring(0, 30)}..."`)

        // Reconstruct the AssessmentResult from stored data
        const assessmentResult = {
          score: assessment.score || 0,
          level: assessment.level || 'normal',
          severity: (assessment.severity as 'normal' | 'mild' | 'moderate' | 'severe' | 'critical') || 'normal',
          description: assessment.friendly_explanation || 'Assessment completed',
          insights: [],
          recommendations: [],
          nextSteps: [],
          manifestations: [],
          responses: assessment.responses || {}
        }

        const assessmentConfig = ASSESSMENTS[assessment.assessment_id]
        if (!assessmentConfig) {
          console.log(`⚠️ Assessment config not found for ${assessment.assessment_id}, skipping`)
          skipped++
          continue
        }

        console.log(`📝 Enriching data structure for ${assessment.assessment_id}...`)

        try {
          // Create enriched result data with proper structure
          const enrichedResultData = {
            score: assessment.score,
            level: assessment.level || 'normal',
            severity: assessment.severity || 'normal',
            description: assessment.friendly_explanation || `You scored ${assessment.score} on the ${assessment.assessment_title}`,
            insights: assessment.friendly_explanation ? [assessment.friendly_explanation] : [`Your ${assessment.assessment_title} assessment has been completed.`],
            recommendations: [`Consider discussing these results with a healthcare professional for personalized guidance.`],
            nextSteps: [`Review your assessment results and consider next steps for your mental wellness journey.`],
            manifestations: [`Assessment results indicate areas for attention and growth.`]
          }

          // Update the assessment result with enriched data structure
          const { error: updateError } = await supabase
            .from('assessment_results')
            .update({
              result_data: enrichedResultData,
              friendly_explanation: assessment.friendly_explanation || `Assessment completed with score: ${assessment.score}`,
              updated_at: new Date().toISOString()
            })
            .eq('id', assessment.id)

          if (updateError) {
            console.error(`❌ Database update error for ${assessment.assessment_id}:`, updateError)
            errors++
          } else {
            console.log(`✅ Successfully enriched data structure for assessment ${assessment.assessment_id}`)
            enriched++
          }

        } catch (processError) {
          console.error(`❌ Data processing error for ${assessment.assessment_id}:`, processError)
          errors++
        }

        processed++

        // Add small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        console.error(`❌ Error processing assessment ${assessment.id}:`, error)
        errors++
      }
    }

    console.log(`\n📊 Recovery Summary:`)
    console.log(`- Total assessments: ${assessments.length}`)
    console.log(`- Processed: ${processed}`)
    console.log(`- Successfully enriched: ${enriched}`)
    console.log(`- Skipped (already had data): ${skipped}`)
    console.log(`- Errors: ${errors}`)

  } catch (error) {
    console.error('❌ Fatal error during recovery process:', error)
  }
}

// Run the recovery if this script is executed directly
if (require.main === module) {
  recoverAssessmentData()
    .then(() => {
      console.log('🎉 Assessment data recovery completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Assessment data recovery failed:', error)
      process.exit(1)
    })
}

export { recoverAssessmentData }
