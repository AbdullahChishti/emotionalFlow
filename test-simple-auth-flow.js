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

// Test if authentication and database work
async function testSimpleAuthFlow() {
  console.log('🔍 Testing authentication and database functionality...')

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

    // Test 1: Basic connection
    console.log('\n📋 Test 1: Basic database connection...')
    const { error: connectionError } = await supabase.from('profiles').select('count', { count: 'exact', head: true })

    if (connectionError) {
      console.log('❌ Connection failed:', connectionError.message)
      return
    }
    console.log('✅ Database connection successful')

    // Test 2: Check current session
    console.log('\n📋 Test 2: Current session status...')
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.log('❌ Session check failed:', sessionError.message)
      return
    }

    if (sessionData.session) {
      const userId = sessionData.session.user.id
      console.log('✅ User is authenticated:', userId)

      // Test 3: Check user profile
      console.log('\n📋 Test 3: User profile check...')
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .eq('id', userId)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        console.log('❌ Profile check failed:', profileError.message)
      } else if (!profileData) {
        console.log('⚠️  No profile found for authenticated user')
      } else {
        console.log('✅ Profile exists:', profileData.display_name)
      }

      // Test 4: Check existing assessment results
      console.log('\n📋 Test 4: Existing assessment results...')
      const { data: resultsData, error: resultsError, count } = await supabase
        .from('assessment_results')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)

      if (resultsError) {
        console.log('❌ Assessment results check failed:', resultsError.message)
      } else {
        console.log(`✅ Found ${count} assessment results for user`)
        if (resultsData && resultsData.length > 0) {
          console.log('📋 Recent results:')
          resultsData.slice(0, 3).forEach((result, index) => {
            console.log(`  ${index + 1}. ${result.assessment_id}: ${result.score} (${result.level})`)
          })
        }
      }

      // Test 5: Try to save a test assessment result
      console.log('\n📋 Test 5: Saving test assessment result...')
      const testResult = {
        user_id: userId,
        assessment_id: 'test-phq9',
        assessment_title: 'Test PHQ-9 Assessment',
        score: 8,
        level: 'mild',
        severity: 'mild',
        responses: { q1: 1, q2: 0, q3: 1, q4: 0, q5: 1, q6: 0, q7: 2, q8: 1, q9: 2 },
        result_data: {
          score: 8,
          level: 'mild',
          severity: 'mild',
          recommendations: ['Monitor symptoms', 'Consider self-care activities']
        },
        friendly_explanation: 'Your responses suggest mild depression symptoms. Continue monitoring and consider self-care activities.'
      }

      const { data: savedResult, error: saveError } = await supabase
        .from('assessment_results')
        .insert(testResult)
        .select()
        .single()

      if (saveError) {
        console.log('❌ Assessment save failed:', saveError.message)
        console.log('Error code:', saveError.code)
        console.log('💡 This might be due to RLS policies or database constraints')
      } else {
        console.log('✅ Assessment result saved successfully!')
        console.log('📋 Saved result ID:', savedResult.id)
      }

    } else {
      console.log('ℹ️  No active session - user is not authenticated')
      console.log('💡 Assessment results can only be saved when authenticated')
      console.log('💡 Try logging in through the application UI first')
    }

    // Test 6: Overall status
    console.log('\n📋 Test 6: Overall database status...')
    const tables = ['assessment_results', 'overall_assessments', 'profiles', 'user_assessment_profiles']

    for (const table of tables) {
      try {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true })
        if (error) {
          console.log(`❌ ${table}: Error - ${error.message}`)
        } else {
          console.log(`✅ ${table}: ${count} records`)
        }
      } catch (err) {
        console.log(`❌ ${table}: Exception - ${err.message}`)
      }
    }

  } catch (error) {
    console.error('❌ Test failed with exception:', error.message)
  }
}

testSimpleAuthFlow()
