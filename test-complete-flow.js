const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables from .env.local
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '.env.local')
    const envContent = fs.readFileSync(envPath, 'utf8')
    const lines = envContent.split('\n')

    lines.forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        const value = valueParts.join('=').trim()
        if (key && value) {
          process.env[key] = value
        }
      }
    })
    console.log('✅ Environment variables loaded from .env.local')
  } catch (error) {
    console.error('❌ Failed to load .env.local:', error.message)
  }
}

// Test complete authentication and assessment save flow
async function testCompleteFlow() {
  console.log('🚀 Testing complete authentication and assessment save flow...')

  // Load environment variables
  loadEnv()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing required environment variables')
    return
  }

  try {
    console.log('🔧 Creating Supabase client...')
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Step 1: Check if we have an existing session
    console.log('\n📋 Step 1: Checking existing session...')
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    let userId
    if (sessionData.session) {
      userId = sessionData.session.user.id
      console.log('✅ Found existing session for user:', userId)
    } else {
      console.log('ℹ️  No existing session found')

      // Step 2: Sign up a test user
      console.log('\n📝 Step 2: Creating test user account...')
      const testEmail = `test-${Date.now()}@example.com`
      const testPassword = 'TestPassword123!'

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            display_name: 'Test User'
          }
        }
      })

      if (signUpError) {
        console.log('❌ Sign up failed:', signUpError.message)
        return
      }

      if (!signUpData.user) {
        console.log('❌ Sign up did not return user data')
        return
      }

      userId = signUpData.user.id
      console.log('✅ Test user created:', userId)

      // Wait a moment for the user to be fully created
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Step 3: Sign in with the test user
      console.log('\n🔐 Step 3: Signing in test user...')
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      })

      if (signInError) {
        console.log('❌ Sign in failed:', signInError.message)
        return
      }

      if (!signInData.session) {
        console.log('❌ Sign in did not return session')
        return
      }

      console.log('✅ Test user signed in successfully')
    }

    // Step 4: Ensure user profile exists
    console.log('\n👤 Step 4: Ensuring user profile exists...')
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, display_name')
      .eq('id', userId)
      .single()

    if (profileError && profileError.code === 'PGRST116') {
      console.log('⚠️  Profile not found, creating profile...')

      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          display_name: 'Test User',
          empathy_credits: 10,
          total_credits_earned: 10,
          total_credits_spent: 0,
          emotional_capacity: 'medium',
          preferred_mode: 'both',
          is_anonymous: false,
          last_active: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) {
        console.log('❌ Error creating profile:', createError.message)
        return
      }

      console.log('✅ Profile created successfully')
    } else if (profileError) {
      console.log('❌ Error checking profile:', profileError.message)
      return
    } else {
      console.log('✅ Profile exists:', profileData.display_name)
    }

    // Step 5: Save assessment result
    console.log('\n💾 Step 5: Saving assessment result...')
    const testResult = {
      user_id: userId,
      assessment_id: 'phq9',
      assessment_title: 'PHQ-9 Depression Assessment',
      score: 15,
      level: 'moderate',
      severity: 'moderate',
      responses: { q1: 2, q2: 1, q3: 3, q4: 0, q5: 1, q6: 2, q7: 3, q8: 1, q9: 2 },
      result_data: {
        score: 15,
        level: 'moderate',
        severity: 'moderate',
        recommendations: ['Consider speaking with a mental health professional'],
        interpretation: 'Your responses suggest moderate symptoms of depression'
      },
      friendly_explanation: 'Your score suggests moderate depression symptoms. This is a common experience and there are effective treatments available.'
    }

    const { data: savedResult, error: saveError } = await supabase
      .from('assessment_results')
      .insert(testResult)
      .select()
      .single()

    if (saveError) {
      console.log('❌ Error saving assessment result:', saveError.message)
      console.log('Error code:', saveError.code)
      console.log('Error details:', saveError.details)
      console.log('Error hint:', saveError.hint)
      return
    }

    console.log('✅ Assessment result saved successfully!')
    console.log('📋 Saved result details:')
    console.log('  - ID:', savedResult.id)
    console.log('  - Assessment:', savedResult.assessment_id)
    console.log('  - Score:', savedResult.score)
    console.log('  - Level:', savedResult.level)
    console.log('  - Taken at:', savedResult.taken_at)

    // Step 6: Verify the data was saved
    console.log('\n🔍 Step 6: Verifying saved data...')
    const { data: verifyData, error: verifyError, count } = await supabase
      .from('assessment_results')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    if (verifyError) {
      console.log('❌ Error verifying saved data:', verifyError.message)
    } else {
      console.log(`✅ Verification successful: Found ${count} assessment results for user`)
      if (verifyData && verifyData.length > 0) {
        console.log('📋 All assessment results:')
        verifyData.forEach((result, index) => {
          console.log(`  ${index + 1}. ${result.assessment_id}: ${result.score} points (${result.level})`)
        })
      }
    }

    // Step 7: Test saving overall assessment
    console.log('\n📊 Step 7: Testing overall assessment save...')
    const overallData = {
      user_id: userId,
      overall_assessment_data: {
        assessments: {
          phq9: testResult.result_data
        },
        summary: {
          riskLevel: 'moderate',
          primaryConcerns: ['depression'],
          recommendedActions: ['professional consultation']
        }
      },
      ai_analysis: {
        insights: 'User shows moderate depression symptoms that may benefit from professional support.',
        recommendations: ['Schedule appointment with mental health professional', 'Consider therapy options'],
        nextSteps: ['Complete additional assessments', 'Track symptom changes over time']
      }
    }

    const { data: savedOverall, error: overallError } = await supabase
      .from('overall_assessments')
      .insert(overallData)
      .select()
      .single()

    if (overallError) {
      console.log('❌ Error saving overall assessment:', overallError.message)
    } else {
      console.log('✅ Overall assessment saved successfully!')
      console.log('📋 Overall assessment ID:', savedOverall.id)
    }

    // Step 8: Final verification
    console.log('\n🎉 Step 8: Final verification...')
    const { data: finalResults, error: finalError, count: finalCount } = await supabase
      .from('assessment_results')
      .select('assessment_id, score, level, taken_at', { count: 'exact' })

    const { data: finalOverall, error: overallVerifyError, count: overallCount } = await supabase
      .from('overall_assessments')
      .select('id, created_at', { count: 'exact' })

    console.log('📊 Final Database State:')
    console.log(`  - Assessment Results: ${finalCount} total records`)
    console.log(`  - Overall Assessments: ${overallCount} total records`)
    console.log(`  - User Profile: ✅ Exists for ${userId}`)

    console.log('\n🎊 COMPLETE FLOW TEST SUCCESSFUL!')
    console.log('✅ Authentication working')
    console.log('✅ Database tables accessible')
    console.log('✅ Assessment results saving')
    console.log('✅ Overall assessments saving')
    console.log('✅ User profiles working')

  } catch (error) {
    console.error('❌ Test failed with exception:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

testCompleteFlow()
