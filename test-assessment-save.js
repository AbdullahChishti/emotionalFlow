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

// Test saving assessment result
async function testAssessmentSave() {
  console.log('🧪 Testing assessment result save...')

  // Load environment variables
  loadEnv()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing required environment variables')
    return
  }

  try {
    console.log('🚀 Creating Supabase client...')
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // First, let's try to get current session
    console.log('🔐 Checking current session...')
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.log('❌ No active session:', sessionError.message)
      console.log('⚠️  User needs to be authenticated to save assessment results')
      console.log('💡 Try logging in first, then run this test')
      return
    }

    if (!sessionData.session) {
      console.log('❌ No active session found')
      console.log('⚠️  User needs to be authenticated to save assessment results')
      console.log('💡 Try logging in first, then run this test')
      return
    }

    const userId = sessionData.session.user.id
    console.log('✅ User authenticated:', userId)

    // Check if user profile exists
    console.log('👤 Checking user profile...')
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, display_name')
      .eq('id', userId)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.log('❌ Error checking profile:', profileError.message)
    } else if (!profileData) {
      console.log('⚠️  No profile found, creating one...')

      // Create profile
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

      console.log('✅ Profile created:', newProfile.id)
    } else {
      console.log('✅ Profile exists:', profileData.display_name)
    }

    // Now try to save an assessment result
    console.log('💾 Saving test assessment result...')
    const testResult = {
      user_id: userId,
      assessment_id: 'phq9',
      assessment_title: 'PHQ-9 Depression Assessment',
      score: 15,
      level: 'moderate',
      severity: 'moderate',
      responses: { q1: 2, q2: 1, q3: 3 },
      result_data: {
        score: 15,
        level: 'moderate',
        severity: 'moderate',
        recommendations: ['Consider speaking with a mental health professional']
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
      console.log('Error details:', saveError)
    } else {
      console.log('✅ Assessment result saved successfully!')
      console.log('📋 Saved result:', {
        id: savedResult.id,
        assessment: savedResult.assessment_id,
        score: savedResult.score,
        level: savedResult.level
      })
    }

    // Check if the data was actually saved
    console.log('🔍 Verifying saved data...')
    const { data: verifyData, error: verifyError, count } = await supabase
      .from('assessment_results')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    if (verifyError) {
      console.log('❌ Error verifying saved data:', verifyError.message)
    } else {
      console.log(`✅ Verification: Found ${count} assessment results for user`)
      if (verifyData && verifyData.length > 0) {
        console.log('📋 Latest result:', verifyData[verifyData.length - 1])
      }
    }

  } catch (error) {
    console.error('❌ Test failed with exception:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

testAssessmentSave()
