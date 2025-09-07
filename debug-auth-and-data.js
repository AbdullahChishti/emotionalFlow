import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 CRITICAL AUTH DEBUG - Testing authentication and data access...')

// Create both clients
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)
const supabaseService = createClient(supabaseUrl, supabaseServiceKey)

async function testAuthAndData() {
  try {
    // Test 1: Check current auth state with anon client
    console.log('\n🔐 Test 1: Checking auth state with anon client...')
    const { data: { session }, error: sessionError } = await supabaseAnon.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError)
    } else {
      console.log('📊 Session state:', {
        hasSession: !!session,
        userId: session?.user?.id || 'NO_USER',
        userEmail: session?.user?.email || 'NO_EMAIL'
      })
    }

    // Test 2: Try to fetch data with anon client (should fail due to RLS)
    console.log('\n📊 Test 2: Fetching assessment results with anon client (should fail)...')
    const { data: anonData, error: anonError } = await supabaseAnon
      .from('assessment_results')
      .select('*')
      .limit(5)
    
    console.log('Anon client results:', {
      hasData: !!anonData,
      dataCount: anonData?.length || 0,
      hasError: !!anonError,
      errorMessage: anonError?.message,
      errorCode: anonError?.code
    })

    // Test 3: Get data with service key (should work)
    console.log('\n📊 Test 3: Fetching assessment results with service key (should work)...')
    const { data: serviceData, error: serviceError } = await supabaseService
      .from('assessment_results')
      .select('user_id, assessment_id, score, level, taken_at')
      .limit(5)
    
    console.log('Service client results:', {
      hasData: !!serviceData,
      dataCount: serviceData?.length || 0,
      hasError: !!serviceError,
      errorMessage: serviceError?.message
    })

    if (serviceData && serviceData.length > 0) {
      console.log('📊 Available users in database:')
      const uniqueUsers = [...new Set(serviceData.map(item => item.user_id))]
      uniqueUsers.forEach((userId, index) => {
        const userAssessments = serviceData.filter(item => item.user_id === userId)
        console.log(`  ${index + 1}. ${userId} (${userAssessments.length} assessments)`)
      })
    }

    // Test 4: Try to sign in with a test user (if we have one)
    console.log('\n🔐 Test 4: Attempting to authenticate...')
    
    // Check if there are any users we can test with
    const { data: profiles, error: profilesError } = await supabaseService
      .from('profiles')
      .select('id, email')
      .limit(5)
    
    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError)
    } else {
      console.log('📊 Available profiles:', {
        profileCount: profiles?.length || 0,
        profiles: profiles?.map(p => ({ id: p.id, email: p.email })) || []
      })
    }

  } catch (error) {
    console.error('💥 Test error:', error)
  }
}

testAuthAndData()
