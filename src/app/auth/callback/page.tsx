'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          router.push('/login?error=auth_failed')
          return
        }

        if (data.session) {
          // Profile creation is now handled by AuthProvider
          // Just redirect to dashboard - AuthProvider will handle the rest
          router.push('/dashboard')
        } else {
          router.push('/login?error=no_session')
        }
      } catch (error) {
        console.error('Unexpected error:', error)
        router.push('/login?error=unexpected')
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
