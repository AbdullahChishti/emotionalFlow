import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
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

/**
 * Create a Supabase client for server-side usage (API routes, server components)
 * This should only be used in server components and API routes
 */
export function createServerComponentClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Health check for Supabase connection (server-side)
 */
export async function checkSupabaseHealth(): Promise<{
  healthy: boolean
  error?: string
  latency?: number
}> {
  const startTime = Date.now()

  try {
    const client = createServerComponentClient()
    const { error } = await client.from('profiles').select('count', { count: 'exact', head: true })

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

