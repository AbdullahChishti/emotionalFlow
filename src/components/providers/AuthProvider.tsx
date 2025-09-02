'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'

// Expose supabase for debugging only in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  ;(window as any).supabase = supabase
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  needsOnboarding: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // Check if this is the "no rows" error (expected for new users)
        if (error?.code === 'PGRST116' || error?.message?.includes('Cannot coerce the result to a single JSON object')) {
          return null
        }
        console.error('Profile fetch error:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Profile fetch exception:', error)
      return null
    }
  }

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)

      // Check if user needs onboarding
      if (profileData) {
        // Check for test flag first
        const testOnboarding = typeof window !== 'undefined' && localStorage.getItem('testOnboarding') === 'true'
        if (testOnboarding) {
          localStorage.removeItem('testOnboarding')
          setNeedsOnboarding(true)
          return
        }

        // Check if they have any mood entries (indicating they've completed onboarding)
        const { data: moodEntries } = await supabase
          .from('mood_entries')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)

        // User needs onboarding if they have no mood entries (haven't completed onboarding)
        setNeedsOnboarding(!moodEntries || moodEntries.length === 0)
      } else {
        // No profile means new user - needs onboarding
        setNeedsOnboarding(true)
      }
    }
  }

  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      try {
        // Get initial session with timeout
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 10000)
        )
        
        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any

        if (!isMounted) return

        if (error) {
          console.error('Session error:', error)
          setLoading(false)
          return
        }

        setUser(session?.user ?? null)

        if (session?.user) {
          // Fetch profile with timeout
          try {
            const profileData = await fetchProfile(session.user.id)
            if (!isMounted) return

            if (!profileData) {
              // Create profile if it doesn't exist
              const newProfileData = {
                id: session.user.id,
                display_name: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'User',
                username: null,
                avatar_url: null,
                bio: null,
                empathy_credits: 10,
                total_credits_earned: 10,
                total_credits_spent: 0,
                emotional_capacity: 'medium',
                preferred_mode: 'both',
                is_anonymous: false,
                last_active: new Date().toISOString()
              }

              const { data: createdProfile, error: createError } = await supabase
                .from('profiles')
                .insert(newProfileData)
                .select()

              if (!isMounted) return

              if (createError) {
                console.error('Profile creation failed:', createError)
              } else {
                setProfile(createdProfile?.[0] || createdProfile)
              }
            } else {
              setProfile(profileData)
            }

            // Check onboarding status
            await checkOnboardingStatus(session.user.id)
          } catch (profileError) {
            console.error('Profile fetch error:', profileError)
          }
        }

        if (isMounted) {
          setLoading(false)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    const checkOnboardingStatus = async (userId: string) => {
      try {
        // Check for test flag first
        const testOnboarding = typeof window !== 'undefined' && localStorage.getItem('testOnboarding') === 'true'
        if (testOnboarding) {
          localStorage.removeItem('testOnboarding')
          setNeedsOnboarding(true)
          return
        }

        // Check if they have any mood entries
        const { data: moodEntries } = await supabase
          .from('mood_entries')
          .select('id')
          .eq('user_id', userId)
          .limit(1)

        setNeedsOnboarding(!moodEntries || moodEntries.length === 0)
      } catch (error) {
        console.error('Onboarding check error:', error)
        setNeedsOnboarding(false)
      }
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return

      setUser(session?.user ?? null)

      if (session?.user) {
        try {
          const profileData = await fetchProfile(session.user.id)
          if (!isMounted) return

          if (!profileData) {
            // Create profile if it doesn't exist
            const newProfileData = {
              id: session.user.id,
              display_name: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'User',
              username: null,
              avatar_url: null,
              bio: null,
              empathy_credits: 10,
              total_credits_earned: 10,
              total_credits_spent: 0,
              emotional_capacity: 'medium',
              preferred_mode: 'both',
              is_anonymous: false,
              last_active: new Date().toISOString()
            }

            const { data: createdProfile, error: createError } = await supabase
              .from('profiles')
              .insert(newProfileData)
              .select()

            if (!isMounted) return

            if (createError) {
              console.error('Profile creation failed:', createError)
            } else {
              setProfile(createdProfile?.[0] || createdProfile)
            }
          } else {
            setProfile(profileData)
          }

          // Check onboarding status
          await checkOnboardingStatus(session.user.id)
        } catch (error) {
          console.error('Auth state change error:', error)
        }
      } else {
        setProfile(null)
        setNeedsOnboarding(false)
      }

      if (isMounted) {
        setLoading(false)
      }
    })

    // Initialize auth
    initializeAuth()

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    console.log('Signing out...')
    await supabase.auth.signOut()
    console.log('Signed out successfully')
    setUser(null)
    setProfile(null)
    // Force reload to clear any cached data
    window.location.reload()
  }

  const value = {
    user,
    profile,
    loading,
    needsOnboarding,
    signOut,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
