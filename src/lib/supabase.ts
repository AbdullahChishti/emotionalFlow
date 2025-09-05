import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  const error = new Error(
    'Missing Supabase configuration. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
  )
  console.error('❌ Supabase Configuration Error:', error.message)
  throw error
}

// Singleton instance
let supabaseInstance: SupabaseClient<Database> | null = null

/**
 * Get the singleton Supabase client instance
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (!supabaseInstance) {
    console.log('🚀 Initializing Supabase client...')
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      global: {
        headers: {
          'X-Client-Info': 'supabase-js-web'
        }
      }
    })
    console.log('✅ Supabase client initialized successfully')
  }

  return supabaseInstance
}

// Export the singleton instance for backward compatibility
export const supabase = getSupabaseClient()

/**
 * Client-side supabase client (deprecated - use getSupabaseClient instead)
 * @deprecated Use getSupabaseClient() for singleton pattern
 */
export const createClientComponentClient = () => {
  console.warn('⚠️ createClientComponentClient is deprecated. Use getSupabaseClient() instead.')
  return getSupabaseClient()
}

/**
 * Server-side supabase client for API routes
 */
export const createServerComponentClient = (): SupabaseClient<Database> => {
  // Prevent accidental usage on the client — service role must never ship to browsers
  if (typeof window !== 'undefined') {
    throw new Error('createServerComponentClient must not be called on the client')
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required on the server')
  }

  console.log('🔧 Creating server-side Supabase client...')
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

/**
 * Health check for Supabase connection
 */
export async function checkSupabaseHealth(): Promise<{
  healthy: boolean
  error?: string
  latency?: number
}> {
  const startTime = Date.now()

  try {
    const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })

    if (error) {
      console.error('❌ Supabase health check failed:', error)
      return {
        healthy: false,
        error: error.message
      }
    }

    const latency = Date.now() - startTime
    console.log(`✅ Supabase health check passed (${latency}ms)`)

    return {
      healthy: true,
      latency
    }
  } catch (error) {
    const latency = Date.now() - startTime
    console.error(`❌ Supabase health check exception (${latency}ms):`, error)

    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      latency
    }
  }
}
