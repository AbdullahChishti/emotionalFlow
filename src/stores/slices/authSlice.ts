import { StateCreator } from 'zustand'
import { User, Profile } from '@/types'
import { authService, SignInResult, SignUpResult } from '@/services/AuthService'
import { profileService } from '@/services/ProfileService'

// Auth slice state interface
export interface AuthSlice {
  // Core auth state
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean // New state to track session restoration
  error: string | null

  // Profile state
  profile: Profile | null
  isProfileLoading: boolean
  profileError: string | null
  profileLastUpdated: Date | null

  // Actions
  // Auth operations
  signIn: (email: string, password: string) => Promise<SignInResult>
  signUp: (email: string, password: string, displayName: string) => Promise<SignUpResult>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>

  // Profile operations
  loadProfile: (userId?: string) => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<boolean>
  saveMoodEntry: (moodData: any) => Promise<boolean>
  clearProfile: () => void

  // State setters
  setUser: (user: User | null) => void
  setAuthenticated: (authenticated: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setProfileLoading: (loading: boolean) => void
  setProfileError: (error: string | null) => void
  setProfile: (profile: Profile | null) => void
  setInitialized: (isInitialized: boolean) => void

  // Computed getters
  isSignedIn: () => boolean
  hasValidProfile: () => boolean
  displayName: () => string
  credits: () => number
}

// Auth slice implementation
export const createAuthSlice: StateCreator<
  AuthSlice & any, // Will be combined with other slices
  [],
  [],
  AuthSlice
> = (set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start in loading state
  isInitialized: false, // Not initialized yet
  error: null,
  profile: null,
  isProfileLoading: false,
  profileError: null,
  profileLastUpdated: null,

  // Auth operations
  signIn: async (email, password) => {
    const { setLoading, setError, setUser, setAuthenticated, loadProfile } = get()

    setLoading(true)
    setError(null)

    const result = await authService.signIn(email, password)
    
    if (!result.success) {
      const errorMessage = result.error?.userMessage || result.error?.message || 'Sign in failed'
      setError(errorMessage)
      setLoading(false)
      return result
    }

    if (!result.user) {
      setError('Authentication failed - no user data')
      setLoading(false)
      return { success: false, error: { message: 'Authentication failed - no user data', userMessage: 'Authentication failed. Please try again.' } } as SignInResult
    }

    setUser(result.user)
    setAuthenticated(true)

    // Load profile after successful sign in
    try {
      await loadProfile(result.user.id)
    } catch (profileError) {
      // Non-critical error, user is still logged in
    }

    setLoading(false)
    return result
  },

  signUp: async (email, password, displayName) => {
    const { setLoading, setError, setUser, setAuthenticated, loadProfile } = get()

    setLoading(true)
    setError(null)

    const result = await authService.signUp(email, password, displayName)
    
    if (!result.success) {
      const errorMessage = result.error?.userMessage || result.error?.message || 'Sign up failed'
      setError(errorMessage)
      setLoading(false)
      return result
    }

    if (!result.user) {
      setError('Sign up failed - no user data')
      setLoading(false)
      return { success: false, error: { message: 'Sign up failed - no user data', userMessage: 'Sign up failed. Please try again.' } } as SignUpResult
    }

    // CRITICAL: When email confirmation is disabled, user is immediately logged in
    // We need to ensure the session is properly established
    console.log('✅ [AUTH_SLICE] Signup successful, user immediately logged in:', {
      userId: result.user.id,
      userEmail: result.user.email,
      timestamp: new Date().toISOString()
    })

    setUser(result.user)
    setAuthenticated(true)

    // Create initial profile
    try {
      await profileService.createProfile(result.user.id, {
        display_name: displayName,
        email: email,
        avatar_url: (result.user as any).user_metadata?.avatar_url,
        username: displayName.toLowerCase().replace(/\s+/g, '_'),
      })
      
      // Load profile after successful creation
      await loadProfile(result.user.id)
      
      console.log('✅ [AUTH_SLICE] Profile created and loaded successfully')
    } catch (profileError) {
      console.error('⚠️ [AUTH_SLICE] Profile creation failed (non-critical):', profileError)
      // Non-critical error, user is still signed up
    }

    setLoading(false)
    return result
  },

  signOut: async () => {
    const { setLoading, setUser, setAuthenticated, clearProfile } = get()

    setLoading(true)

    try {

      await authService.signOut()
      setUser(null)
      setAuthenticated(false)
      clearProfile()

    } catch (error) {
      // Clear local state anyway
      setUser(null)
      setAuthenticated(false)
      clearProfile()
    } finally {
      setLoading(false)
    }
  },

  refreshSession: async () => {
    const { setLoading, setUser, setAuthenticated, loadProfile, setInitialized } = get()

    console.log('🔄 [AUTH_SLICE] refreshSession started:', {
      timestamp: new Date().toISOString(),
      currentState: {
        isLoading: get().isLoading,
        isAuthenticated: get().isAuthenticated,
        isInitialized: get().isInitialized,
        hasUser: !!get().user
      }
    })

    try {
      setLoading(true)
      console.log('🔐 [AUTH_SLICE] Calling authService.getCurrentUser()...')
      
      const user = await authService.getCurrentUser()
      
      console.log('🔐 [AUTH_SLICE] getCurrentUser result:', {
        hasUser: !!user,
        userId: user?.id,
        userEmail: user?.email,
        timestamp: new Date().toISOString()
      })
      
      if (user) {
        console.log('✅ [AUTH_SLICE] Setting authenticated state...')
        setUser(user)
        setAuthenticated(true)
        
        console.log('👤 [AUTH_SLICE] Loading profile...')
        await loadProfile(user.id)
        console.log('✅ [AUTH_SLICE] Profile loaded successfully')
      } else {
        console.log('❌ [AUTH_SLICE] No user found, clearing state...')
        setUser(null)
        setAuthenticated(false)
      }
    } catch (error) {
      console.error('❌ [AUTH_SLICE] refreshSession error:', error)
      setUser(null)
      setAuthenticated(false)
    } finally {
      setLoading(false)
      setInitialized(true)
      
      console.log('🏁 [AUTH_SLICE] refreshSession completed:', {
        finalState: {
          isLoading: false,
          isAuthenticated: get().isAuthenticated,
          isInitialized: true,
          hasUser: !!get().user
        },
        timestamp: new Date().toISOString()
      })
    }
  },

  // Profile operations
  loadProfile: async (userId) => {
    const { setProfileLoading, setProfileError, setProfile, user } = get()
    const targetUserId = userId || user?.id

    if (!targetUserId) {
      return
    }

    setProfileLoading(true)
    setProfileError(null)

    try {

      const profile = await profileService.getProfile(targetUserId)
      setProfile(profile)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load profile'
      setProfileError(errorMessage)
    } finally {
      setProfileLoading(false)
    }
  },

  updateProfile: async (updates) => {
    const { profile, setProfile, setProfileLoading, setProfileError } = get()

    if (!profile) {
      setProfileError('No profile to update')
      return false
    }

    setProfileLoading(true)
    setProfileError(null)

    // Optimistic update
    const optimisticProfile = { ...profile, ...updates }
    setProfile(optimisticProfile)

    try {

      const updatedProfile = await profileService.updateProfile(profile.id, updates)
      setProfile(updatedProfile)

      return true
    } catch (error) {
      // Revert optimistic update
      setProfile(profile)

      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile'
      setProfileError(errorMessage)
      return false
    } finally {
      setProfileLoading(false)
    }
  },

  saveMoodEntry: async (moodData) => {
    const { user, setProfileLoading, setProfileError } = get()

    if (!user?.id) {
      setProfileError('No user found')
      return false
    }

    setProfileLoading(true)
    setProfileError(null)

    try {

      const result = await profileService.saveMoodEntry(user.id, moodData)

      // Update profile with the returned profile data
      get().setProfile(result.profile)

      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save mood entry'
      setProfileError(errorMessage)
      return false
    } finally {
      setProfileLoading(false)
    }
  },

  clearProfile: () => {
    set({ profile: null, profileError: null, profileLastUpdated: null });
  },

  // State setters
  setUser: (user) => {
    set({ user })
  },

  setAuthenticated: (authenticated) => {
    set({ isAuthenticated: authenticated })
  },

  setLoading: (isLoading) => {
    set({ isLoading })
  },

  setError: (error) => {
    set({ error })
  },

  setProfileLoading: (isProfileLoading) => {
    set({ isProfileLoading })
  },

  setProfileError: (profileError) => {
    set({ profileError })
  },

  setProfile: (profile) => {
    set({ profile, profileLastUpdated: profile ? new Date() : null })
  },
  
  setInitialized: (isInitialized) => {
    set({ isInitialized })
  },

  // Computed getters
  isSignedIn: () => {
    const state = get()
    return state.isAuthenticated && !!state.user
  },

  hasValidProfile: () => {
    const state = get()
    return !!(state.profile?.id && state.profile?.display_name)
  },

  displayName: () => {
    const state = get()
    return state.profile?.display_name || state.user?.email?.split('@')[0] || 'User'
  },

  credits: () => {
    const state = get()
    return state.profile?.empathy_credits || 0
  }
})
