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

// Test the column fixes
async function testColumnFixes() {
  console.log('🧪 Testing column fixes...')

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

    // Test 1: Query assessment_results with taken_at (should work now)
    console.log('\n📋 Test 1: Querying assessment_results with taken_at...')
    try {
      const { data, error } = await supabase
        .from('assessment_results')
        .select('*')
        .order('taken_at', { ascending: false })
        .limit(5)

      if (error) {
        console.log('❌ Error with taken_at:', error.message)
      } else {
        console.log('✅ taken_at ordering works! Found', data?.length || 0, 'records')
      }
    } catch (err) {
      console.log('❌ Exception with taken_at:', err.message)
    }

    // Test 2: Query listening_sessions with updated_at (should work now)
    console.log('\n📋 Test 2: Querying listening_sessions with updated_at...')
    try {
      const { data, error } = await supabase
        .from('listening_sessions')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(5)

      if (error) {
        console.log('❌ Error with updated_at:', error.message)
      } else {
        console.log('✅ updated_at ordering works! Found', data?.length || 0, 'records')
      }
    } catch (err) {
      console.log('❌ Exception with updated_at:', err.message)
    }

    // Test 3: Insert into listening_sessions with ended_at (should work now)
    console.log('\n📋 Test 3: Inserting into listening_sessions with ended_at...')
    try {
      // First check if user is authenticated
      const { data: sessionData } = await supabase.auth.getSession()

      if (!sessionData.session) {
        console.log('⚠️  No authenticated session - skipping insert test')
        console.log('💡 To test insert, first authenticate through the app')
      } else {
        const userId = sessionData.session.user.id

        const { data, error } = await supabase
          .from('listening_sessions')
          .insert({
            listener_id: userId,
            speaker_id: userId, // Using same user for testing
            session_type: 'therapist',
            duration_minutes: 30,
            credits_transferred: 5,
            status: 'completed',
            ended_at: new Date().toISOString()
          })
          .select()

        if (error) {
          console.log('❌ Error with ended_at insert:', error.message)
        } else {
          console.log('✅ ended_at insert works! Created session with ID:', data[0]?.id)
        }
      }
    } catch (err) {
      console.log('❌ Exception with ended_at insert:', err.message)
    }

    // Test 4: Insert into assessment_results with taken_at (should work now)
    console.log('\n📋 Test 4: Inserting into assessment_results with taken_at...')
    try {
      const { data: sessionData } = await supabase.auth.getSession()

      if (!sessionData.session) {
        console.log('⚠️  No authenticated session - skipping assessment insert test')
        console.log('💡 To test assessment insert, first authenticate through the app')
      } else {
        const userId = sessionData.session.user.id

        const { data, error } = await supabase
          .from('assessment_results')
          .insert({
            user_id: userId,
            assessment_id: 'test-phq9',
            assessment_title: 'Test PHQ-9 Assessment',
            score: 12,
            level: 'moderate',
            severity: 'moderate',
            responses: { q1: 1, q2: 2, q3: 3 },
            result_data: { score: 12, level: 'moderate' },
            taken_at: new Date().toISOString()
          })
          .select()

        if (error) {
          console.log('❌ Error with taken_at insert:', error.message)
        } else {
          console.log('✅ taken_at insert works! Created assessment result with ID:', data[0]?.id)
        }
      }
    } catch (err) {
      console.log('❌ Exception with taken_at insert:', err.message)
    }

  } catch (error) {
    console.error('❌ Test failed with exception:', error.message)
  }
}

testColumnFixes()
