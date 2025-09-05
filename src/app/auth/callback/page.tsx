'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    let handled = false

    const handleAuthCallback = async () => {
      if (handled) return
      handled = true

      try {
        console.log('🔄 Processing auth callback...')
        
        // Listen for auth state changes to catch email confirmation
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('🔐 Auth state change:', event, 'Session:', !!session)

          if (event === 'SIGNED_IN' && session) {
            console.log('✅ Email confirmation successful - redirecting to login')
            // Always redirect to login after email confirmation (regardless of auto-signin setting)
            // Use immediate redirect to bypass AuthProvider interference
            subscription.unsubscribe()
            window.location.href = '/login?message=email_confirmed'
            return
          }
        })

        // Also check current session as fallback
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('❌ Auth callback error:', error)
          window.location.href = '/login?error=auth_failed'
          return
        }

        if (data.session) {
          console.log('📧 Found session - email confirmation completed, redirecting to login')
          // Always redirect to login after email confirmation (regardless of auto-signin setting)
          window.location.href = '/login?message=email_confirmed'
        } else {
          console.log('❌ No session found')
          window.location.href = '/login?error=no_session'
        }
      } catch (error) {
        console.error('💥 Unexpected error:', error)
        window.location.href = '/login?error=unexpected'
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-green-50 via-white to-brand-green-100">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <h2 className="text-xl font-semibold text-zinc-900 mt-4">
          Completing sign in...
        </h2>
        <p className="text-zinc-600 mt-2">
          Please wait while we verify your account
        </p>
      </div>
    </div>
  )
}
