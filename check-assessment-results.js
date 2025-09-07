// Check assessment results specifically
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: join(__dirname, '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkResults() {
  console.log('🔍 Checking assessment results...')

  const { data, error } = await supabase
    .from('assessment_results')
    .select('*')
    .limit(10)

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log(`Found ${data?.length || 0} results`)
  if (data && data.length > 0) {
    data.forEach((result, i) => {
      console.log(`${i + 1}. ${result.assessment_id}: ${result.score} (${result.taken_at})`)
    })
  }
}

checkResults()
