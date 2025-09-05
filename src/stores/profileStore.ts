/**
 * Profile Store
 * Manages user profile data and updates
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Profile } from '@/types'
import { UserProfile } from '@/data/assessment-integration'

interface ProfileState {
  // Profile data
  profile: Profile | null
  assessmentProfile: UserProfile | null

  // Profile status
  isLoading: boolean
  isUpdating: boolean
  lastUpdated: Date | null
  error: string | null

  // Actions
  setProfile: (profile: Profile | null) => void
  setAssessmentProfile: (assessmentProfile: UserProfile | null) => void

  setLoading: (loading: boolean) => void
  setUpdating: (updating: boolean) => void
  setError: (error: string | null) => void

  // Profile operations
  updateProfile: (updates: Partial<Profile>) => void
  updateAssessmentProfile: (updates: Partial<UserProfile>) => void

  refreshProfile: () => Promise<void>
  updateProfileAsync: (updates: Partial<Profile>) => Promise<void>

  // Credit operations
  addCredits: (amount: number) => void
  spendCredits: (amount: number) => void

  // Utility
  clearProfile: () => void
  hasValidProfile: () => boolean
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      // Initial state
      profile: null,
      assessmentProfile: null,

      isLoading: false,
      isUpdating: false,
      lastUpdated: null,
      error: null,

      // Basic setters
      setProfile: (profile) => {
        console.log('👤 Profile store: Setting profile', { userId: profile?.id, hasProfile: !!profile })
        set({
          profile,
          lastUpdated: new Date(),
          error: null
        })
      },

      setAssessmentProfile: (assessmentProfile) => {
        console.log('📊 Profile store: Setting assessment profile', {
          hasProfile: !!assessmentProfile,
          lastAssessed: assessmentProfile?.lastAssessed
        })
        set({
          assessmentProfile,
          lastUpdated: new Date()
        })
      },

      // Loading states
      setLoading: (loading) => set({ isLoading: loading }),

      setUpdating: (updating) => set({ isUpdating: updating }),

      setError: (error) => set({ error }),

      // Profile updates
      updateProfile: (updates) => {
        const { profile } = get()
        if (profile) {
          const updatedProfile = { ...profile, ...updates }
          console.log('🔄 Profile store: Updating profile', { updates: Object.keys(updates) })
          set({
            profile: updatedProfile,
            lastUpdated: new Date(),
            error: null
          })
        }
      },

      updateAssessmentProfile: (updates) => {
        const { assessmentProfile } = get()
        if (assessmentProfile) {
          const updatedProfile = { ...assessmentProfile, ...updates }
          console.log('🔄 Profile store: Updating assessment profile', { updates: Object.keys(updates) })
          set({
            assessmentProfile: updatedProfile,
            lastUpdated: new Date()
          })
        }
      },

      // Async operations
      refreshProfile: async () => {
        console.log('🔄 Profile store: Refreshing profile')
        set({ isLoading: true, error: null })

        try {
          // This would typically call your API to refresh profile data
          // For now, we'll simulate the loading
          await new Promise(resolve => setTimeout(resolve, 1000))

          set({
            lastUpdated: new Date(),
            isLoading: false
          })

          console.log('✅ Profile store: Profile refreshed')
        } catch (error) {
          console.error('❌ Profile store: Profile refresh failed', error)
          set({
            error: 'Failed to refresh profile',
            isLoading: false
          })
        }
      },

      updateProfileAsync: async (updates) => {
        console.log('💾 Profile store: Updating profile asynchronously', { updates: Object.keys(updates) })
        set({ isUpdating: true, error: null })

        try {
          // This would typically call your API to update the profile
          // For now, we'll simulate the update
          await new Promise(resolve => setTimeout(resolve, 500))

          get().updateProfile(updates)

          set({ isUpdating: false })
          console.log('✅ Profile store: Profile updated successfully')
        } catch (error) {
          console.error('❌ Profile store: Profile update failed', error)
          set({
            error: 'Failed to update profile',
            isUpdating: false
          })
        }
      },

      // Credit operations
      addCredits: (amount) => {
        const { profile } = get()
        if (profile) {
          const newCredits = profile.empathy_credits + amount
          const newTotalEarned = profile.total_credits_earned + amount

          console.log('💰 Profile store: Adding credits', { amount, newTotal: newCredits })

          get().updateProfile({
            empathy_credits: newCredits,
            total_credits_earned: newTotalEarned
          })
        }
      },

      spendCredits: (amount) => {
        const { profile } = get()
        if (profile && profile.empathy_credits >= amount) {
          const newCredits = profile.empathy_credits - amount
          const newTotalSpent = profile.total_credits_spent + amount

          console.log('💸 Profile store: Spending credits', { amount, remaining: newCredits })

          get().updateProfile({
            empathy_credits: newCredits,
            total_credits_spent: newTotalSpent
          })
        } else {
          console.warn('❌ Profile store: Insufficient credits', { available: profile?.empathy_credits, requested: amount })
          set({ error: 'Insufficient credits' })
        }
      },

      // Utility methods
      clearProfile: () => {
        console.log('🗑️ Profile store: Clearing profile')
        set({
          profile: null,
          assessmentProfile: null,
          lastUpdated: null,
          error: null
        })
      },

      hasValidProfile: () => {
        const { profile } = get()
        return !!(profile && profile.id && profile.display_name)
      }
    }),
    {
      name: 'profile-storage',
      partialize: (state) => ({
        profile: state.profile,
        assessmentProfile: state.assessmentProfile,
        lastUpdated: state.lastUpdated
      })
    }
  )
)
