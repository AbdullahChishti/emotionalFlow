/**
 * Setup Test Data Script (Simplified)
 * Creates test assessment data for testing the assessment-enhanced chat system
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
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Test user data
const TEST_USERS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'test1@example.com',
    assessmentData: {
      phq9: { score: 3, level: 'Minimal depression', severity: 'normal' },
      gad7: { score: 2, level: 'Minimal anxiety', severity: 'normal' },
      ace: { score: 1, level: 'Low ACEs', severity: 'mild' },
      cdRisc: { score: 32, level: 'High resilience', severity: 'mild' }
    },
    expectedRiskLevel: 'low'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'test2@example.com',
    assessmentData: {
      phq9: { score: 12, level: 'Moderate depression', severity: 'moderate' },
      gad7: { score: 8, level: 'Mild anxiety', severity: 'mild' },
      ace: { score: 3, level: 'Low ACEs', severity: 'mild' },
      cdRisc: { score: 25, level: 'Moderate resilience', severity: 'moderate' }
    },
    expectedRiskLevel: 'moderate'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'test3@example.com',
    assessmentData: {
      phq9: { score: 18, level: 'Severe depression', severity: 'critical' },
      gad7: { score: 15, level: 'Severe anxiety', severity: 'severe' },
      ace: { score: 7, level: 'High ACEs', severity: 'severe' },
      cdRisc: { score: 18, level: 'Low resilience', severity: 'severe' }
    },
    expectedRiskLevel: 'crisis'
  }
]

async function createTestAssessmentData(userId: string, assessmentData: any): Promise<void> {
  const assessments = [
    { id: 'phq9', title: 'PHQ-9 Depression Assessment' },
    { id: 'gad7', title: 'GAD-7 Anxiety Assessment' },
    { id: 'ace', title: 'ACE Questionnaire' },
    { id: 'cd-risc', title: 'CD-RISC Resilience Scale' }
  ]

  for (const assessment of assessments) {
    const data = assessmentData[assessment.id as keyof typeof assessmentData]
    if (data) {
      const { error } = await supabase
        .from('assessment_results')
        .insert({
          user_id: userId,
          assessment_id: assessment.id,
          assessment_title: assessment.title,
          score: data.score,
          level: data.level,
          severity: data.severity,
          responses: {},
          result_data: { score: data.score, level: data.level, severity: data.severity }
        })

      if (error) {
        console.error(`Error creating ${assessment.id} assessment:`, error)
      }
    }
  }

  // Create user assessment profile
  const userProfile = {
    id: userId,
    traumaHistory: {
      aceScore: assessmentData.ace?.score || 0,
      traumaCategories: assessmentData.ace?.score >= 4 ? ['childhood_trauma'] : [],
      needsTraumaInformedCare: (assessmentData.ace?.score || 0) >= 4
    },
    currentSymptoms: {
      depression: {
        level: assessmentData.phq9?.severity || 'normal',
        score: assessmentData.phq9?.score || 0,
        needsIntervention: (assessmentData.phq9?.score || 0) >= 10
      },
      anxiety: {
        level: assessmentData.gad7?.severity || 'normal',
        score: assessmentData.gad7?.score || 0,
        needsIntervention: (assessmentData.gad7?.score || 0) >= 10
      },
      stress: Math.max(assessmentData.phq9?.score || 0, assessmentData.gad7?.score || 0)
    },
    resilience: {
      level: assessmentData.cdRisc?.score < 20 ? 'low' :
             assessmentData.cdRisc?.score < 30 ? 'moderate' :
             assessmentData.cdRisc?.score < 35 ? 'high' : 'very_high',
      score: assessmentData.cdRisc?.score || 25,
      strengths: []
    },
    riskFactors: {
      suicideRisk: (assessmentData.phq9?.score || 0) >= 15,
      crisisIndicators: [],
      immediateActionNeeded: (assessmentData.phq9?.score || 0) >= 15 || (assessmentData.gad7?.score || 0) >= 15
    },
    preferences: {
      therapyApproach: [],
      copingStrategies: [],
      contentTypes: []
    },
    lastAssessed: new Date()
  }

  const { error } = await supabase
    .from('user_assessment_profiles')
    .insert({
      user_id: userId,
      profile_data: userProfile,
      personalization_data: {
        therapy: [],
        content: [],
        community: [],
        wellness: [],
        crisis: []
      }
    })

  if (error) {
    console.error('Error creating user profile:', error)
  }
}

async function cleanupTestData(userId: string): Promise<void> {
  await supabase.from('assessment_results').delete().eq('user_id', userId)
  await supabase.from('user_assessment_profiles').delete().eq('user_id', userId)
  await supabase.from('conversation_progress').delete().eq('user_id', userId)
  await supabase.from('recommendation_tracking').delete().eq('user_id', userId)
  await supabase.from('progress_insights').delete().eq('user_id', userId)
}

async function setupTestData() {
  console.log('🚀 Setting up test data for assessment-enhanced chat...')

  try {
    // Create test assessment data (skip profile creation due to auth constraints)
    for (const testUser of TEST_USERS) {
      console.log(`\n📝 Setting up test assessment data for: ${testUser.email}`)
      
      // Clean up existing test data
      await cleanupTestData(testUser.id)

      // Create assessment data
      await createTestAssessmentData(testUser.id, testUser.assessmentData)

      console.log(`✅ Created test assessment data for ${testUser.email}`)
      console.log(`   User ID: ${testUser.id}`)
      console.log(`   Risk Level: ${testUser.expectedRiskLevel}`)
      console.log(`   PHQ-9: ${testUser.assessmentData.phq9?.score || 'N/A'}`)
      console.log(`   GAD-7: ${testUser.assessmentData.gad7?.score || 'N/A'}`)
      console.log(`   ACE: ${testUser.assessmentData.ace?.score || 'N/A'}`)
      console.log(`   CD-RISC: ${testUser.assessmentData.cdRisc?.score || 'N/A'}`)
    }

    console.log('\n🎉 Test data setup complete!')
    console.log('\n📋 Test Users Created:')
    TEST_USERS.forEach(user => {
      console.log(`   ${user.email} (${user.id}) - ${user.expectedRiskLevel} risk`)
    })

    console.log('\n🧪 Next Steps:')
    console.log('1. Navigate to /test-chat in your application')
    console.log('2. Sign in with one of the test user emails')
    console.log('3. Run the automated test suite')
    console.log('4. Try manual test messages')
    console.log('5. Verify assessment data integration')

  } catch (error) {
    console.error('❌ Error setting up test data:', error)
    process.exit(1)
  }
}

async function cleanupAllTestData() {
  console.log('🧹 Cleaning up test data...')

  try {
    for (const testUser of TEST_USERS) {
      await cleanupTestData(testUser.id)
      console.log(`✅ Cleaned up assessment data for ${testUser.email}`)
    }

    console.log('🎉 Test data cleanup complete!')
  } catch (error) {
    console.error('❌ Error cleaning up test data:', error)
    process.exit(1)
  }
}

// Main execution
const command = process.argv[2]

if (command === 'cleanup') {
  cleanupAllTestData()
} else {
  setupTestData()
}
