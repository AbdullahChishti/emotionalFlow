/**
 * Centralized Authentication Store
 * Single source of truth for all authentication state and operations
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Profile } from '@/types'
import { supabase } from '@/lib/supabase'

interface AuthState {
  // User data
  user: User | null
  profile: Profile | null

  // Auth status
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean

  // Actions
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  setAuthenticated: (authenticated: boolean) => void
  setInitialized: (initialized: boolean) => void

  // Auth operations
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
  refreshProfile: () => Promise<void>

  // Profile operations
  updateProfile: (profile: Profile) => void
  createProfile: (user: User) => Promise<Profile | null>

  // Initialization
  initialize: () => Promise<void>
  reset: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: true,
      isInitialized: false,

      // Basic setters
      setUser: (user) => {
        console.log('🔐 Auth Store: Setting user', user?.id || 'null')
        set({
          user,
          isAuthenticated: !!user
        })
      },

      setProfile: (profile) => {
        console.log('👤 Auth Store: Setting profile', profile?.id || 'null')
        set({ profile })
      },

      setLoading: (isLoading) => {
        console.log('⏳ Auth Store: Setting loading', isLoading)
        set({ isLoading })
      },

      setAuthenticated: (isAuthenticated) => {
        console.log('🔒 Auth Store: Setting authenticated', isAuthenticated)
        set({ isAuthenticated })
      },

      setInitialized: (isInitialized) => {
        console.log('🚀 Auth Store: Setting initialized', isInitialized)
        set({ isInitialized })
      },

      // Auth operations
      signIn: async (email: string, password: string) => {
        try {
          console.log('🔑 Auth Store: Signing in', email)
          set({ isLoading: true })

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          })

          if (error) {
            console.error('❌ Auth Store: Sign in failed', error.message)
            set({ isLoading: false })
            return { success: false, error: error.message }
          }

          if (data.user) {
            // Set user immediately
            set({
              user: data.user,
              isAuthenticated: true,
              isLoading: false
            })

            // Fetch and set profile
            const profile = await get().createProfile(data.user)
            if (profile) {
              set({ profile })
            }

            console.log('✅ Auth Store: Sign in successful')
            return { success: true }
          }

          set({ isLoading: false })
          return { success: false, error: 'No user data received' }
        } catch (error) {
          console.error('❌ Auth Store: Sign in exception', error)
          set({ isLoading: false })
          return { success: false, error: 'An unexpected error occurred' }
        }
      },

      signUp: async (email: string, password: string, displayName: string) => {
        try {
          console.log('📝 Auth Store: Signing up', email)
          set({ isLoading: true })

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                display_name: displayName
              }
            }
          })

          if (error) {
            console.error('❌ Auth Store: Sign up failed', error.message)
            set({ isLoading: false })
            return { success: false, error: error.message }
          }

          if (data.user) {
            // Set user immediately (even if not confirmed)
            set({
              user: data.user,
              isAuthenticated: false, // Not authenticated until email confirmed
              isLoading: false
            })

            console.log('✅ Auth Store: Sign up successful (email confirmation required)')
            return { success: true }
          }

          set({ isLoading: false })
          return { success: false, error: 'No user data received' }
        } catch (error) {
          console.error('❌ Auth Store: Sign up exception', error)
          set({ isLoading: false })
          return { success: false, error: 'An unexpected error occurred' }
        }
      },

      signOut: async () => {
        try {
          console.log('🚪 Auth Store: Signing out')
          set({ isLoading: true })

          const { error } = await supabase.auth.signOut()
          if (error) {
            console.error('❌ Auth Store: Sign out error', error.message)
          }

          // Clear all state
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            isLoading: false
          })

          console.log('✅ Auth Store: Sign out successful')
        } catch (error) {
          console.error('❌ Auth Store: Sign out exception', error)
          // Clear state even if sign out fails
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            isLoading: false
          })
        }
      },

      refreshSession: async () => {
        try {
          console.log('🔄 Auth Store: Refreshing session')
          const { data, error } = await supabase.auth.getSession()

          if (error) {
            console.error('❌ Auth Store: Session refresh failed', error.message)
            return
          }

          if (data.session?.user) {
            set({
              user: data.session.user,
              isAuthenticated: true
            })

            // Refresh profile if user exists
            const profile = await get().createProfile(data.session.user)
            if (profile) {
              set({ profile })
            }

            console.log('✅ Auth Store: Session refreshed successfully')
          } else {
            // No session, clear state
            set({
              user: null,
              profile: null,
              isAuthenticated: false
            })
            console.log('ℹ️ Auth Store: No active session')
          }
        } catch (error) {
          console.error('❌ Auth Store: Session refresh exception', error)
        }
      },

      refreshProfile: async () => {
        const { user } = get()
        if (!user) return

        try {
          console.log('🔄 Auth Store: Refreshing profile')
          const profile = await get().createProfile(user)
          if (profile) {
            set({ profile })
            console.log('✅ Auth Store: Profile refreshed successfully')
          }
        } catch (error) {
          console.error('❌ Auth Store: Profile refresh failed', error)
        }
      },

      // Profile operations
      updateProfile: (profile) => {
        console.log('👤 Auth Store: Updating profile', profile.id)
        set({ profile })
      },

      createProfile: async (user: User): Promise<Profile | null> => {
        try {
          console.log('👤 Auth Store: Creating/fetching profile for user', user.id)

          // First try to fetch existing profile
          const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (existingProfile && !fetchError) {
            console.log('✅ Auth Store: Found existing profile')
            return existingProfile
          }

          // If no profile exists, create one
          if (fetchError?.code === 'PGRST116') {
            console.log('📝 Auth Store: Creating new profile')
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
              console.error('❌ Auth Store: Profile creation failed', createError.message)
              return null
            }

            console.log('✅ Auth Store: Profile created successfully')
            return createdProfile
          }

          console.error('❌ Auth Store: Profile fetch error', fetchError?.message)
          return null
        } catch (error) {
          console.error('❌ Auth Store: Profile creation exception', error)
          return null
        }
      },

      // Initialization
      initialize: async () => {
        try {
          console.log('🚀 Auth Store: Initializing')
          console.log('🔧 Environment check:')
          console.log('NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
          console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

          set({ isLoading: true, isInitialized: false })

          // Check if we should skip auth in development
          const skipAuth = typeof window !== 'undefined' &&
                          window.location.search.includes('skip_auth=true')

          if (skipAuth) {
            console.log('⏭️ Auth Store: Skipping auth (development mode)')
            set({
              user: null,
              profile: null,
              isAuthenticated: false,
              isLoading: false,
              isInitialized: true
            })
            return
          }

          // Check Supabase credentials
          if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.warn('⚠️ Auth Store: Supabase credentials missing')
            set({
              user: null,
              profile: null,
              isAuthenticated: false,
              isLoading: false,
              isInitialized: true
            })
            return
          }

          // Get current session with timeout
          console.log('🔐 Auth Store: Checking current session...')
          let sessionData = null
          let sessionError = null

          try {
            // Add timeout to prevent hanging
            const sessionPromise = supabase.auth.getSession()
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Session check timeout')), 10000)
            )

            const sessionResult = await Promise.race([sessionPromise, timeoutPromise])
            sessionData = sessionResult.data
            sessionError = sessionResult.error
            console.log('🔐 Auth Store: Session check response received', {
              hasSession: !!sessionData?.session,
              hasError: !!sessionError
            })
          } catch (exception) {
            console.error('❌ Auth Store: Session check exception:', exception)
            sessionError = { message: exception.message || 'Session check failed with exception' }
          }

          if (sessionError) {
            console.error('❌ Auth Store: Session check failed', sessionError.message)
            set({
              user: null,
              profile: null,
              isAuthenticated: false,
              isLoading: false,
              isInitialized: true
            })
            return
          }

          if (sessionData.session?.user) {
            console.log('✅ Auth Store: Found active session')
            set({
              user: sessionData.session.user,
              isAuthenticated: true,
              isLoading: false,
              isInitialized: true
            })

            // Fetch profile
            const profile = await get().createProfile(sessionData.session.user)
            if (profile) {
              set({ profile })
            }
          } else {
            console.log('ℹ️ Auth Store: No active session')
            set({
              user: null,
              profile: null,
              isAuthenticated: false,
              isLoading: false,
              isInitialized: true
            })
          }

          // Set up auth state change listener
          supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('🔄 Auth Store: Auth state change', event)
            
            if (event === 'SIGNED_OUT') {
              set({
                user: null,
                profile: null,
                isAuthenticated: false,
                isLoading: false
              })
            } else if (event === 'SIGNED_IN' && session?.user) {
              set({
                user: session.user,
                isAuthenticated: true,
                isLoading: false
              })

              // Fetch profile
              const profile = await get().createProfile(session.user)
              if (profile) {
                set({ profile })
              }
            } else if (event === 'TOKEN_REFRESHED' && session?.user) {
              set({
                user: session.user,
                isAuthenticated: true
              })
            }
          })

          console.log('✅ Auth Store: Initialization complete')
          console.log('📊 Final state:', { user: !!sessionData.session?.user, isAuthenticated: !!sessionData.session?.user, isLoading: false, isInitialized: true })
        } catch (error) {
          console.error('❌ Auth Store: Initialization failed', error)
          console.log('📊 Error state:', { isLoading: false, isInitialized: true })
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true
          })
        }
      },

      // Reset all state
      reset: () => {
        console.log('🔄 Auth Store: Resetting state')
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: false
        })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

// Export convenience hooks
export const useAuth = () => {
  const store = useAuthStore()
  return {
    user: store.user,
    profile: store.profile,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    isInitialized: store.isInitialized,
    signIn: store.signIn,
    signUp: store.signUp,
    signOut: store.signOut,
    refreshProfile: store.refreshProfile,
    updateProfile: store.updateProfile
  }
}

export const useAuthActions = () => {
  const store = useAuthStore()
  return {
    signIn: store.signIn,
    signUp: store.signUp,
    signOut: store.signOut,
    refreshSession: store.refreshSession,
    refreshProfile: store.refreshProfile,
    updateProfile: store.updateProfile,
    initialize: store.initialize,
    reset: store.reset
  }
}