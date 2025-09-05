'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'
import { FlowManager } from '@/lib/services/FlowManager'

// Expose supabase for debugging only in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  ;(window as any).supabase = supabase
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Refs to prevent race conditions and duplicate operations
  const initializingRef = useRef(false)
  const profileCreationRef = useRef<Set<string>>(new Set())

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
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

  const createProfile = async (user: User): Promise<Profile | null> => {
    // Prevent duplicate profile creation with atomic check
    if (profileCreationRef.current.has(user.id)) {
      console.log('Profile creation already in progress for user:', user.id)
      return null
    }

    profileCreationRef.current.add(user.id)

    try {
      // First check if profile already exists (double-check)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (existingProfile) {
        console.log('Profile already exists for user:', user.id)
        return existingProfile
      }

      // Create new profile with comprehensive data
      const newProfileData = {
        id: user.id,
        display_name: user.user_metadata?.display_name ||
                     user.user_metadata?.full_name ||
                     user.user_metadata?.name ||
                     user.email?.split('@')[0] ||
                     'User',
        username: null,
        avatar_url: user.user_metadata?.avatar_url || null,
        bio: null,
        empathy_credits: 10,
        total_credits_earned: 10,
        total_credits_spent: 0,
        emotional_capacity: 'medium' as const,
        preferred_mode: 'both' as const,
        is_anonymous: false,
        last_active: new Date().toISOString()
      }

      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .insert(newProfileData)
        .select()
        .single()

      if (createError) {
        // Handle unique constraint violation (profile already exists)
        if (createError.code === '23505') {
          console.log('Profile already exists (constraint violation), fetching existing:', user.id)
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          return existingProfile || null
        }

        console.error('Profile creation failed:', createError)
        return null
      }

      console.log('Profile created successfully for user:', user.id)
      return createdProfile
    } catch (error) {
      console.error('Profile creation exception:', error)
      return null
    } finally {
      profileCreationRef.current.delete(user.id)
    }
  }

  const setupUserProfile = async (user: User): Promise<Profile | null> => {
    try {
      let profileData = await fetchProfile(user.id)

      if (!profileData) {
        profileData = await createProfile(user)
      }

      return profileData
    } catch (error) {
      console.error('User profile setup error:', error)
      return null
    }
  }

  const refreshProfile = async () => {
    if (!user) return

    try {
      const profileData = await setupUserProfile(user)
      setProfile(profileData)
    } catch (error) {
      console.error('Profile refresh error:', error)
    }
  }

  useEffect(() => {
    let isMounted = true
    let timeoutId: NodeJS.Timeout
    let safetyTimeout: NodeJS.Timeout

    const initializeAuth = async () => {
      // Prevent multiple initializations
      if (initializingRef.current) {
        console.log('Auth initialization already in progress')
        return
      }

      initializingRef.current = true
      
      // Add a safety timeout to prevent infinite loading
      safetyTimeout = setTimeout(() => {
        if (isMounted && loading) {
          console.warn('Auth initialization taking too long, forcing completion')
          setLoading(false)
          initializingRef.current = false
        }
      }, 5000) // Reduced to 5 second safety timeout

      try {
        console.log('Initializing auth...')
        
        // Check if we should skip auth entirely in development
        const skipAuth = (typeof window !== 'undefined' && window.location.search.includes('skip_auth=true'))
        
        if (skipAuth) {
          console.log('Skipping authentication due to skip_auth parameter')
          setUser(null)
          setProfile(null)
          setNeedsOnboarding(false)
          setLoading(false)
          initializingRef.current = false
          if (safetyTimeout) clearTimeout(safetyTimeout)
          return
        }

        // Check if Supabase credentials are missing
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          console.warn('Supabase credentials missing - running in demo mode')
          setUser(null)
          setProfile(null)
          setNeedsOnboarding(false)
          setLoading(false)
          initializingRef.current = false
          if (safetyTimeout) clearTimeout(safetyTimeout)
          return
        }
        
        // Set a maximum timeout for the entire initialization
        const timeoutDuration = process.env.NODE_ENV === 'development' ? 10000 : 35000
        timeoutId = setTimeout(() => {
          if (isMounted) {
            console.warn(`Auth initialization timeout (${timeoutDuration}ms) - setting loading to false`)
            setUser(null)
            setProfile(null)
            setNeedsOnboarding(false)
            setLoading(false)
            initializingRef.current = false
          }
        }, timeoutDuration)

        // Get initial session - in development, don't use timeout to avoid blocking
        let session, error
        try {
          console.log('Fetching initial session...')
          const result = await supabase.auth.getSession()
          session = result.data.session
          error = result.error
          console.log('Session fetch result:', { hasSession: !!session, error })
        } catch (err) {
          console.warn('Session retrieval failed, continuing without auth:', err)
          session = null
          error = err
        }

        if (!isMounted) return

        if (error) {
          console.warn('Session error (continuing without auth):', error.message)
          // In development, continue without auth rather than failing completely
          setUser(null)
          setProfile(null)
          setNeedsOnboarding(false)
          setLoading(false)
          initializingRef.current = false
          
          // Clear any pending timeout
          if (timeoutId) {
            clearTimeout(timeoutId)
          }
          return
        }

        console.log('Session retrieved:', !!session, 'User ID:', session?.user?.id)
        setUser(session?.user ?? null)

        if (session?.user) {
          console.log('Setting up user profile for:', session.user.id)
          const profileData = await setupUserProfile(session.user)

          if (!isMounted) return

          setProfile(profileData)
          console.log('User profile setup complete. Profile:', !!profileData)
        } else {
          console.log('No session user found, clearing profile')
          setProfile(null)
        }

        if (isMounted) {
          setLoading(false)
          console.log('Auth initialization complete')
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (isMounted) {
          setUser(null)
          setProfile(null)
          setNeedsOnboarding(false)
          setLoading(false)
        }
      } finally {
        initializingRef.current = false
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
      }
    }

    // Listen for auth changes (simplified to prevent conflicts)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted || initializingRef.current) {
        console.log('Skipping auth state change - component unmounted or initializing')
        return
      }

      console.log('Auth state change:', event, !!session)

      // Only handle sign out events here to avoid conflicts with initialization
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }

      // For other events, handle sign in
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in, starting login flow:', session.user.id)
        setUser(session.user)

        try {
          const profileData = await setupUserProfile(session.user)

          if (isMounted) {
            // Use FlowManager for complete login flow
            await FlowManager.handleLogin(session.user, profileData)
            console.log('Login flow completed successfully')
          }
        } catch (error) {
          console.error('Login flow failed:', error)
          if (isMounted) {
            setProfile(null)
          }
        }
      }

      // For other events, only update if we're not currently loading
      else if (!loading && session?.user && session.user.id !== user?.id) {
        console.log('Handling auth state change for new user')
        setUser(session.user)

        try {
          const profileData = await setupUserProfile(session.user)

          if (isMounted) {
            setProfile(profileData)
          }
        } catch (error) {
          console.error('Auth state change error:', error)
        }
      }
    })

    // Initialize auth
    initializeAuth()

    return () => {
      console.log('Cleaning up AuthProvider')
      isMounted = false
      initializingRef.current = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      if (safetyTimeout) {
        clearTimeout(safetyTimeout)
      }
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      console.log('Starting logout flow...')
      setLoading(true)

      // Use FlowManager for complete logout flow
      await FlowManager.handleLogout()

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('Supabase sign out error:', error)
        // Continue with logout even if Supabase fails
      } else {
        console.log('Supabase signed out successfully')
      }

      // Clear local state
      setUser(null)
      setProfile(null)
      setNeedsOnboarding(false)
      setLoading(false)

      // Small delay to ensure state is cleared before redirect
      setTimeout(() => {
        // Force reload to clear any cached data and reset app state
        window.location.href = '/'
      }, 100)
    } catch (error) {
      console.error('Logout flow exception:', error)
      // Even if there's an exception, force logout
      setUser(null)
      setProfile(null)
      setNeedsOnboarding(false)
      setLoading(false)

      setTimeout(() => {
        window.location.href = '/'
      }, 100)
    }
  }

  const value = {
    user,
    profile,
    loading,
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
