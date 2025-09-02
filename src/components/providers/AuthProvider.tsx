'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'

// Expose supabase globally for debugging
if (typeof window !== 'undefined') {
  (window as any).supabase = supabase
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
      console.log('🔍 FETCHING PROFILE for user:', userId)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('❌ PROFILE FETCH ERROR:', error)
        console.error('Profile error type:', typeof error)
        console.error('Profile error keys:', Object.keys(error || {}))
        console.error('Profile error details:', {
          message: error?.message,
          details: error?.details,
          hint: error?.hint,
          code: error?.code
        })

        // Check if this is the "no rows" error
        if (error?.code === 'PGRST116' || error?.message?.includes('Cannot coerce the result to a single JSON object')) {
          console.log('⚠️ Profile not found (expected for new users)')
          return null
        }

        return null
      }

      console.log('✅ PROFILE FETCHED SUCCESSFULLY:', data)
      return data
    } catch (error) {
      console.error('💥 PROFILE FETCH EXCEPTION:', error)
      return null
    }
  }

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)

      // Check if user needs onboarding (new user with default values)
      if (profileData && profileData.preferred_mode === 'both' && profileData.emotional_capacity === 'medium') {
        // Check if they have any mood entries (indicating they've completed onboarding)
        const { data: moodEntries } = await supabase
          .from('mood_entries')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)

        setNeedsOnboarding(!moodEntries || moodEntries.length === 0)
      } else {
        setNeedsOnboarding(false)
      }
    }
  }

  useEffect(() => {
    console.log('🚀 AUTH PROVIDER INITIALIZING...')

    // Get initial session
    console.log('🔍 Getting initial session...')
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('📊 Initial session result:')
      console.log('Has Session:', !!session)
      if (session) {
        console.log('Session User ID:', session.user.id)
        console.log('Session User Email:', session.user.email)
      }
      if (error) {
        console.error('Session error:', error)
      }

      setUser(session?.user ?? null)
      if (session?.user) {
        console.log('🎯 Fetching profile for initial session user...')
        fetchProfile(session.user.id).then(async (profileData) => {
          if (!profileData) {
            console.log('⚠️ Profile not found for initial session, creating new profile...')
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

            console.log('📝 Creating profile for initial session:', newProfileData)
            try {
                          console.log('🚀 About to insert profile...')
            const { data: createdProfile, error: createError } = await supabase
              .from('profiles')
              .insert(newProfileData)
              .select()

            console.log('📊 Profile creation response:')
            console.log('Created profile data:', createdProfile)
            console.log('Creation error:', createError)

            if (createError) {
              console.error('❌ Initial profile creation failed:', createError)
              console.error('Creation error details:', {
                message: createError?.message,
                details: createError?.details,
                hint: createError?.hint,
                code: createError?.code
              })
            } else {
              console.log('✅ Initial profile created successfully:', createdProfile)
              setProfile(createdProfile?.[0] || createdProfile)
            }
            } catch (createError) {
              console.error('💥 Initial profile creation exception:', createError)
            }
          } else {
            setProfile(profileData)
          }
        })
      } else {
        console.log('⚠️ No user in initial session')
      }
      setLoading(false)
    })

    // Listen for auth changes
    console.log('👂 Setting up auth state change listener...')
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 AUTH STATE CHANGE DETECTED')
      console.log('Event:', event)
      console.log('Has Session:', !!session)
      if (session) {
        console.log('New Session User ID:', session.user.id)
        console.log('New Session User Email:', session.user.email)
      }

      setUser(session?.user ?? null)

      if (session?.user) {
        console.log('🎯 Fetching profile for new session user...')
        const profileData = await fetchProfile(session.user.id)

        if (!profileData) {
          console.log('⚠️ Profile not found, creating new profile...')
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

          console.log('📝 Creating profile:', newProfileData)
          try {
            console.log('🚀 About to insert profile for auth change...')
            const { data: createdProfile, error: createError } = await supabase
              .from('profiles')
              .insert(newProfileData)
              .select()

            console.log('📊 Auth change profile creation response:')
            console.log('Created profile data:', createdProfile)
            console.log('Creation error:', createError)

            if (createError) {
              console.error('❌ Profile creation failed:', createError)
              console.error('Auth change creation error details:', {
                message: createError?.message,
                details: createError?.details,
                hint: createError?.hint,
                code: createError?.code
              })
            } else {
              console.log('✅ Profile created successfully:', createdProfile)
              setProfile(createdProfile?.[0] || createdProfile)
            }
          } catch (createError) {
            console.error('💥 Profile creation exception:', createError)
          }
        } else {
          setProfile(profileData)
        }
      } else {
        console.log('⚠️ Clearing profile (no user)')
        setProfile(null)
      }

      setLoading(false)
    })

    return () => {
      console.log('🧹 Cleaning up auth subscription')
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
