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

// Test Supabase connection and auth
async function testAuthInit() {
  console.log('🔍 Testing Supabase connection and auth initialization...')

  // Load environment variables
  loadEnv()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('📋 Environment variables:')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing')

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing required environment variables')
    return
  }

  try {
    console.log('🚀 Creating Supabase client...')
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    })

    console.log('📡 Testing connection with health check...')
    const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })

    if (error) {
      console.error('❌ Connection test failed:', error.message)
      return
    }

    console.log('✅ Connection test passed')

    console.log('🔐 Testing auth session...')
    const { data, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('❌ Session check failed:', sessionError.message)
      return
    }

    console.log('✅ Session check completed')
    console.log('Session exists:', !!data.session)
    console.log('User:', data.session?.user?.email || 'No user')

  } catch (error) {
    console.error('❌ Test failed with exception:', error.message)
  }
}

testAuthInit()
