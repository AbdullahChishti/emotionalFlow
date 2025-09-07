/**
 * Profile Data Hook
 * Provides user profile data and operations with automatic store updates
 */

import { useCallback, useEffect } from 'react'
import { useProfileStore } from '@/stores/profileStore'
import { useAuthStore } from '@/stores/authStore'
import { AuthDataService } from '@/lib/services/AuthDataService'
import { Profile } from '@/types'

export function useProfileData() {
  const {
    profile,
    assessmentProfile,
    isLoading,
    isUpdating,
    error,
    lastUpdated
  } = useProfileStore()

  const { user } = useAuthStore()

  // Refresh profile from database
  const refreshProfile = useCallback(async () => {
    if (!user?.id) return null

    try {
      const refreshedProfile = await AuthDataService.refreshUserProfile(user.id)
      return refreshedProfile
    } catch (error) {
      console.error('Failed to refresh profile:', error)
      return null
    }
  }, [user?.id])

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!user?.id) throw new Error('No user found')

    try {
      const updatedProfile = await AuthDataService.updateUserProfile(user.id, updates)
      return updatedProfile
    } catch (error) {
      console.error('Failed to update profile:', error)
      throw error
    }
  }, [user?.id])

  // Create new profile
  const createProfile = useCallback(async (
    profileData: Omit<Profile, 'id' | 'created_at' | 'updated_at'>
  ) => {
    if (!user?.id) throw new Error('No user found')

    try {
      const newProfile = await AuthDataService.createUserProfile(user.id, profileData)
      return newProfile
    } catch (error) {
      console.error('Failed to create profile:', error)
      throw error
    }
  }, [user?.id])

  // Add credits
  const addCredits = useCallback(async (amount: number) => {
    if (!user?.id) throw new Error('No user found')

    try {
      const success = await AuthDataService.addCredits(user.id, amount)
      return success
    } catch (error) {
      console.error('Failed to add credits:', error)
      return false
    }
  }, [user?.id])

  // Spend credits
  const spendCredits = useCallback(async (amount: number) => {
    if (!user?.id) throw new Error('No user found')

    try {
      const success = await AuthDataService.spendCredits(user.id, amount)
      return success
    } catch (error) {
      console.error('Failed to spend credits:', error)
      return false
    }
  }, [user?.id])

  // Check if profile exists
  const profileExists = useCallback(async () => {
    if (!user?.id) return false

    try {
      const exists = await AuthDataService.profileExists(user.id)
      return exists
    } catch (error) {
      console.error('Failed to check profile existence:', error)
      return false
    }
  }, [user?.id])

  // Auto-refresh profile periodically
  useEffect(() => {
    if (user?.id && !isLoading) {
      const lastUpdate = lastUpdated ? new Date(lastUpdated) : null
      const now = new Date()
      const hoursSinceUpdate = lastUpdate
        ? (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60)
        : 999

      // Refresh if no data or data is older than 1 hour
      if (!profile || hoursSinceUpdate > 1) {
        refreshProfile()
      }
    }
  }, [user?.id, profile, lastUpdated, refreshProfile, isLoading])

  return {
    // Data
    profile,
    assessmentProfile,

    // States
    isLoading,
    isUpdating,
    error,
    lastUpdated,
    hasProfile: !!profile,

    // Actions
    refreshProfile,
    updateProfile,
    createProfile,
    addCredits,
    spendCredits,
    profileExists,

    // Computed values
    credits: profile?.empathy_credits || 0,
    totalEarned: profile?.total_credits_earned || 0,
    totalSpent: profile?.total_credits_spent || 0,
    displayName: profile?.display_name || 'User',
    hasValidProfile: !!(profile && profile.id && profile.display_name)
  }
}
