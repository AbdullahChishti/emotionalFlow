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

// Check database tables
async function checkDatabaseTables() {
  console.log('🔍 Checking database tables and assessment data...')

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

    // Check if tables exist
    const tablesToCheck = [
      'assessment_results',
      'user_assessment_profiles',
      'overall_assessments',
      'profiles',
      'users'
    ]

    console.log('\n📋 Checking table existence:')
    for (const tableName of tablesToCheck) {
      try {
        const { error } = await supabase.from(tableName).select('count', { count: 'exact', head: true })
        if (error) {
          console.log(`❌ ${tableName}: Table error - ${error.message}`)
        } else {
          console.log(`✅ ${tableName}: Table exists`)
        }
      } catch (err) {
        console.log(`❌ ${tableName}: Table does not exist or error - ${err.message}`)
      }
    }

    // Check data in assessment_results
    console.log('\n📊 Checking assessment_results data:')
    try {
      const { data, error, count } = await supabase
        .from('assessment_results')
        .select('*', { count: 'exact' })

      if (error) {
        console.log(`❌ Error fetching assessment_results: ${error.message}`)
      } else {
        console.log(`✅ Found ${count} records in assessment_results`)
        if (data && data.length > 0) {
          console.log('📋 Sample records:')
          data.slice(0, 3).forEach((record, index) => {
            console.log(`  ${index + 1}. ${record.assessment_id}: score ${record.score} (${record.taken_at})`)
          })
        }
      }
    } catch (err) {
      console.log(`❌ Error checking assessment_results: ${err.message}`)
    }

    // Check data in overall_assessments
    console.log('\n📊 Checking overall_assessments data:')
    try {
      const { data, error, count } = await supabase
        .from('overall_assessments')
        .select('*', { count: 'exact' })

      if (error) {
        console.log(`❌ Error fetching overall_assessments: ${error.message}`)
      } else {
        console.log(`✅ Found ${count} records in overall_assessments`)
      }
    } catch (err) {
      console.log(`❌ Error checking overall_assessments: ${err.message}`)
    }

    // Check profiles table
    console.log('\n📊 Checking profiles data:')
    try {
      const { data, error, count } = await supabase
        .from('profiles')
        .select('id, display_name', { count: 'exact' })

      if (error) {
        console.log(`❌ Error fetching profiles: ${error.message}`)
      } else {
        console.log(`✅ Found ${count} records in profiles`)
        if (data && data.length > 0) {
          console.log('📋 Sample profiles:')
          data.slice(0, 3).forEach((profile, index) => {
            console.log(`  ${index + 1}. ${profile.id}: ${profile.display_name || 'No name'}`)
          })
        }
      }
    } catch (err) {
      console.log(`❌ Error checking profiles: ${err.message}`)
    }

  } catch (error) {
    console.error('❌ Database check failed:', error.message)
  }
}

checkDatabaseTables()
