import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AUTH_MESSAGES, AUTH_REDIRECTS } from '@/lib/constants/auth'

export default async function LogoutPage() {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  // Sign out the user
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('❌ [SERVER_LOGOUT_ERROR] Logout error:', error.message)
  } else {
    console.log('✅ [SERVER_LOGOUT_SUCCESS] User successfully logged out')
  }

  // Redirect to login page with consistent message format
  const redirectUrl = `${AUTH_REDIRECTS.LOGIN}?${AUTH_REDIRECTS.MESSAGE_PARAM}=${AUTH_MESSAGES.SIGNED_OUT}`
  redirect(redirectUrl)
}

