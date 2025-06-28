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
          router.push('/?error=auth_failed')
          return
        }

        if (data.session) {
          // Check if user has a profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single()

          if (!profile) {
            // Create profile for OAuth users
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: data.session.user.id,
                display_name: data.session.user.user_metadata?.full_name || 
                             data.session.user.user_metadata?.name || 
                             'User',
                empathy_credits: 10,
                total_credits_earned: 10,
                total_credits_spent: 0,
                emotional_capacity: 'medium',
                preferred_mode: 'both',
                is_anonymous: false,
                last_active: new Date().toISOString(),
              })

            if (profileError) {
              console.error('Profile creation error:', profileError)
            }
          }

          router.push('/')
        } else {
          router.push('/?error=no_session')
        }
      } catch (error) {
        console.error('Unexpected error:', error)
        router.push('/?error=unexpected')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-white to-green-50 dark:from-gray-900 dark:via-gray-900 dark:to-green-900/20">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">
          Completing sign in...
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Please wait while we set up your account
        </p>
      </div>
    </div>
  )
}
