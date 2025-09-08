const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://fpahhfzmkjsienzzeyks.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwYWhoZnpta2pzaWVuenpleWtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NDAxOTgsImV4cCI6MjA2NjMxNjE5OH0.x0RUC13qBZy5VchKCJYni8gGTCKjT8lQt6HpDoLgGpo'

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web',
      'X-Requested-With': 'XMLHttpRequest'
    }
  },
  fetch: (url, init) => {
    return fetch(url, {
      ...init,
      mode: 'cors',
      credentials: 'same-origin',
      headers: {
        ...init?.headers,
        'X-Requested-With': 'XMLHttpRequest',
      }
    })
  }
})

async function testConnection() {
  try {
    console.log('Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'test123'
    })
    
    if (error) {
      console.log('Expected error (invalid credentials):', error.message)
      console.log('✅ Supabase connection is working!')
    } else {
      console.log('Unexpected success:', data)
    }
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
  }
}

testConnection()
