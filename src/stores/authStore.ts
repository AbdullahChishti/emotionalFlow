/**
 * Authentication Store
 * Manages user authentication state and profile data
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

  // Actions
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  setAuthenticated: (authenticated: boolean) => void

  // Composite actions
  login: (user: User, profile: Profile | null) => void
  logout: () => void
  updateProfile: (profile: Profile) => void

  // Utilities
  initialize: () => void
  refreshProfile: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: true,

      // Basic setters
      setUser: (user) => set({
        user,
        isAuthenticated: !!user
      }),

      setProfile: (profile) => set({ profile }),

      setLoading: (isLoading) => set({ isLoading }),

      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

      // Composite actions
      login: (user, profile) => {
        console.log('🔐 Auth store: User logged in', { userId: user.id, hasProfile: !!profile })
        set({
          user,
          profile,
          isAuthenticated: true,
          isLoading: false
        })
      },

      logout: () => {
        console.log('🚪 Auth store: User logged out')
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          isLoading: false
        })
      },

      updateProfile: (profile) => {
        console.log('👤 Auth store: Profile updated', { userId: profile.id })
        set({ profile })
      },

      // Initialization
      initialize: () => {
        console.log('🚀 Auth store: Initializing')
        const { user } = get()

        set({
          isAuthenticated: !!user,
          isLoading: false
        })
      },

      // Profile refresh
      refreshProfile: async () => {
        const { user } = get()
        if (!user) return

        try {
          console.log('🔄 Auth store: Refreshing profile')
          set({ isLoading: true })

          // This would typically call your API to refresh profile data
          // For now, we'll just simulate the loading state
          await new Promise(resolve => setTimeout(resolve, 1000))

          // In a real implementation, you'd fetch fresh profile data here
          console.log('✅ Auth store: Profile refresh complete')
        } catch (error) {
          console.error('❌ Auth store: Profile refresh failed', error)
        } finally {
          set({ isLoading: false })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
        needsOnboarding: state.needsOnboarding
      })
    }
  )
)
