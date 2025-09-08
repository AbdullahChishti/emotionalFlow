/**
 * Simplified Authentication Store
 * State container for auth data - operations handled by AuthManager
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Profile } from '@/types'

interface AuthState {
  // User data
  user: User | null
  profile: Profile | null

  // Auth status
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  error: string | null

  // Actions
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  setAuthenticated: (authenticated: boolean) => void
  setInitialized: (initialized: boolean) => void
  setError: (error: string | null) => void

  // Profile operations (keep for backward compatibility)
  updateProfile: (profile: Profile) => void

  // Cleanup
  reset: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: false, // Start as false - AuthManager will handle loading
      isInitialized: false,
      error: null,

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

      setError: (error) => {
        console.log('❌ Auth Store: Setting error', error)
        set({ error })
      },

      // Profile operations (keep for backward compatibility)
      updateProfile: (profile) => {
        console.log('👤 Auth Store: Updating profile', profile.id)
        set({ profile })
      },

      // Reset all state
      reset: () => {
        console.log('🔄 Auth Store: Resetting state')
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: false,
          error: null
        })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
        // Don't persist error, loading, or initialized states
      }),
      onRehydrateStorage: () => (state) => {
        console.log('🔄 [AUTH_STORE] Rehydrating auth state from localStorage:', {
          hasState: !!state,
          hasUser: !!state?.user,
          hasProfile: !!state?.profile,
          isAuthenticated: state?.isAuthenticated,
          userId: state?.user?.id,
          userEmail: state?.user?.email,
          profileDisplayName: state?.profile?.display_name,
          timestamp: new Date().toISOString()
        })
        
        if (state) {
          console.log('✅ [AUTH_STORE] Auth state rehydration completed successfully')
        } else {
          console.log('ℹ️ [AUTH_STORE] No auth state to rehydrate (fresh start)')
        }
      }
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
    error: store.error,
    updateProfile: store.updateProfile,
    setError: store.setError,
    reset: store.reset
  }
}

// Note: Auth operations are now handled by AuthManager
// Use authManager.signIn(), authManager.signUp(), authManager.signOut() instead