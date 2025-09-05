/**
 * Test Assessment Completion Flow
 * Tests the complete assessment saving and retrieval flow
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { AssessmentManager } from '../src/lib/services/AssessmentManager'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testAssessmentCompletion() {
  console.log('🧪 Testing Assessment Completion Flow...')

  try {
    // Use the test user ID from the error
    const testUserId = 'c0c62cc6-88ee-423f-b3c1-a26ddc569857'

    // Check if user exists in profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', testUserId)
      .single()

    if (profileError || !profile) {
      console.error('❌ Test user not found in profiles')
      return
    }

    console.log('✅ Test user found:', profile.email)

    // Create mock assessment results
    const mockResults = {
      'phq9': {
        score: 12,
        level: 'Moderate depression',
        severity: 'moderate' as const,
        description: 'Moderate depressive symptoms detected',
        insights: ['Regular exercise may help', 'Consider talking to a professional'],
        recommendations: ['Increase physical activity', 'Practice mindfulness'],
        nextSteps: ['Schedule follow-up assessment', 'Consider therapy options'],
        manifestations: ['Persistent sadness', 'Loss of interest'],
        responses: { q1: 2, q2: 1, q3: 2, q4: 1, q5: 2, q6: 1, q7: 1, q8: 1, q9: 1 }
      },
      'gad7': {
        score: 10,
        level: 'Moderate anxiety',
        severity: 'moderate' as const,
        description: 'Moderate anxiety symptoms detected',
        insights: ['Anxiety management techniques may help'],
        recommendations: ['Practice deep breathing', 'Consider professional support'],
        nextSteps: ['Monitor symptoms', 'Learn relaxation techniques'],
        manifestations: ['Restlessness', 'Difficulty concentrating'],
        responses: { q1: 2, q2: 1, q3: 2, q4: 1, q5: 1, q6: 1, q7: 1 }
      }
    }

    console.log('📝 Testing assessment result saving...')

    // Test the AssessmentManager processAssessmentResults method
    const result = await AssessmentManager.processAssessmentResults(mockResults, testUserId)

    console.log('✅ Assessment processing completed')
    console.log('📊 Profile saved:', !!result.databaseResult)

    // Wait a moment for database operations to complete
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Check if assessment results were saved
    const history = await AssessmentManager.getAssessmentHistory(testUserId)
    console.log(`📋 Found ${history.length} assessment results in database`)

    if (history.length > 0) {
      console.log('✅ Assessment results successfully saved!')
      history.forEach(entry => {
        console.log(`   - ${entry.assessmentTitle}: ${entry.score} (${entry.level})`)
      })
    } else {
      console.log('❌ Assessment results not found in database')
    }

    // Test profile retrieval
    const latestProfile = await AssessmentManager.getLatestUserProfile(testUserId)
    if (latestProfile?.profile_data) {
      console.log('✅ User profile found')
      const profileData = latestProfile.profile_data as any
      console.log(`   - Depression score: ${profileData.currentSymptoms?.depression?.score || 'N/A'}`)
      console.log(`   - Anxiety score: ${profileData.currentSymptoms?.anxiety?.score || 'N/A'}`)
    } else {
      console.log('❌ User profile not found')
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testAssessmentCompletion()
