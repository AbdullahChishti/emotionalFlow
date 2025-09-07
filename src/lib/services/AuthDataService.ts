/**
 * Auth Data Service
 * Handles authentication and profile operations with store updates
 */

import { DataService } from './DataService'
import { useAuthStore } from '@/stores/authStore'
import { useProfileStore } from '@/stores/profileStore'
import { supabase } from '../supabase'
import { Profile } from '@/types'

export class AuthDataService extends DataService {

  /**
   * Refresh user profile from database and update stores
   */
  static async refreshUserProfile(userId: string): Promise<Profile | null> {
    try {
      console.log('🔄 AuthDataService: Refreshing user profile', { userId })

      const authStore = useAuthStore.getState()
      const profileStore = useProfileStore.getState()

      // Set loading states
      this.setLoadingState(true, ['auth', 'profile'])

      // Fetch fresh profile data with timeout
      const profileQuery = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Profile refresh timeout')), 10000)
      )

      const { data: profile, error } = await Promise.race([profileQuery, timeoutPromise])

      if (error) {
        // Profile doesn't exist yet (expected for new users)
        if (error.code === 'PGRST116') {
          console.log('📝 AuthDataService: Profile not found, user needs to create one')
          this.setLoadingState(false, ['auth', 'profile'])
          return null
        }
        throw error
      }

      // Update both auth and profile stores
      this.updateStore(
        (profile) => {
          authStore.setProfile(profile)
          profileStore.setProfile(profile)
        },
        profile
      )

      // Clear loading states
      this.setLoadingState(false, ['auth', 'profile'])
      this.clearErrors(['auth', 'profile'])

      // Notify subscribers
      this.notifySubscribers('profile_refreshed', {
        userId,
        profile
      })

      console.log('✅ AuthDataService: Profile refreshed successfully')
      return profile

    } catch (error) {
      console.error('❌ AuthDataService: Failed to refresh profile', error)
      this.setLoadingState(false, ['auth', 'profile'])
      this.handleError(error, 'refreshUserProfile', (msg) => {
        useAuthStore.getState().setError(msg)
        useProfileStore.getState().setError(msg)
      })
      return null
    }
  }

  /**
   * Update user profile and sync with stores
   */
  static async updateUserProfile(
    userId: string,
    updates: Partial<Profile>
  ): Promise<Profile | null> {
    try {
      console.log('💾 AuthDataService: Updating user profile', {
        userId,
        updates: Object.keys(updates)
      })

      const profileStore = useProfileStore.getState()
      const currentProfile = profileStore.profile

      if (!currentProfile) {
        throw new Error('No current profile found')
      }

      // Set updating state
      this.setLoadingState(true, ['profile'])

      // Optimistic update - update store immediately
      const optimisticProfile = { ...currentProfile, ...updates }
      this.updateStore(
        (profile) => profileStore.setProfile(profile),
        optimisticProfile
      )

      // Update database with timeout
      const updateQuery = supabase
        .from('profiles')
        .update({
          ...updates,
          last_active: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      const updateTimeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Profile update timeout')), 10000)
      )

      const { data: updatedProfile, error } = await Promise.race([updateQuery, updateTimeoutPromise])

      if (error) {
        // Revert optimistic update on failure
        this.updateStore(
          (profile) => profileStore.setProfile(profile),
          currentProfile
        )
        throw error
      }

      // Update stores with confirmed data
      this.updateStore(
        (profile) => {
          useAuthStore.getState().setProfile(profile)
          profileStore.setProfile(profile)
        },
        updatedProfile
      )

      // Clear states
      this.setLoadingState(false, ['profile'])
      this.clearErrors(['auth', 'profile'])

      // Notify subscribers
      this.notifySubscribers('profile_updated', {
        userId,
        updates,
        profile: updatedProfile
      })

      console.log('✅ AuthDataService: Profile updated successfully')
      return updatedProfile

    } catch (error) {
      console.error('❌ AuthDataService: Failed to update profile', error)
      this.setLoadingState(false, ['profile'])
      this.handleError(error, 'updateUserProfile', (msg) => {
        useProfileStore.getState().setError(msg)
      })
      return null
    }
  }

  /**
   * Create new user profile
   */
  static async createUserProfile(
    userId: string,
    profileData: Omit<Profile, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Profile | null> {
    try {
      console.log('📝 AuthDataService: Creating user profile', { userId })

      const profileStore = useProfileStore.getState()

      // Set loading
      this.setLoadingState(true, ['profile'])

      // Create profile in database
      const newProfile = {
        id: userId,
        ...profileData,
        last_active: new Date().toISOString()
      }

      const createQuery = supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single()

      const createTimeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Profile creation timeout')), 10000)
      )

      const { data: createdProfile, error } = await Promise.race([createQuery, createTimeoutPromise])

      if (error) {
        throw error
      }

      // Update stores
      this.updateStore(
        (profile) => {
          useAuthStore.getState().setProfile(profile)
          profileStore.setProfile(profile)
        },
        createdProfile
      )

      // Clear states
      this.setLoadingState(false, ['profile'])
      this.clearErrors(['auth', 'profile'])

      // Notify subscribers
      this.notifySubscribers('profile_created', {
        userId,
        profile: createdProfile
      })

      console.log('✅ AuthDataService: Profile created successfully')
      return createdProfile

    } catch (error) {
      console.error('❌ AuthDataService: Failed to create profile', error)
      this.setLoadingState(false, ['profile'])
      this.handleError(error, 'createUserProfile', (msg) => {
        useProfileStore.getState().setError(msg)
      })
      return null
    }
  }

  /**
   * Handle user login with profile setup
   */
  static async handleLogin(userId: string): Promise<void> {
    try {
      console.log('🚀 AuthDataService: Handling login', { userId })

      const authStore = useAuthStore.getState()
      const profileStore = useProfileStore.getState()

      // Set loading
      this.setLoadingState(true, ['auth'])

      // Try to get existing profile
      const profile = await this.refreshUserProfile(userId)

      if (!profile) {
        console.log('📝 AuthDataService: No profile found, will be created by AuthProvider')
      }

      // Update auth state
      this.updateStore(
        () => {
          authStore.setAuthenticated(true)
          authStore.setLoading(false)
        },
        undefined
      )

      // Notify subscribers
      this.notifySubscribers('user_logged_in', {
        userId,
        hasProfile: !!profile
      })

      console.log('✅ AuthDataService: Login handled successfully')

    } catch (error) {
      console.error('❌ AuthDataService: Failed to handle login', error)
      this.setLoadingState(false, ['auth'])
      this.handleError(error, 'handleLogin', (msg) => {
        useAuthStore.getState().setError(msg)
      })
      throw error
    }
  }

  /**
   * Handle user logout
   */
  static async handleLogout(): Promise<void> {
    try {
      console.log('🚪 AuthDataService: Handling logout')

      const authStore = useAuthStore.getState()
      const profileStore = useProfileStore.getState()

      // Update stores
      this.updateStore(
        () => {
          authStore.logout()
          profileStore.clearProfile()
        },
        undefined
      )

      // Clear any cached data
      if (typeof window !== 'undefined') {
        // Clear assessment-related cache
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('assessment-') || key.startsWith('chat-')) {
            localStorage.removeItem(key)
          }
        })
      }

      // Notify subscribers
      this.notifySubscribers('user_logged_out', {})

      console.log('✅ AuthDataService: Logout handled successfully')

    } catch (error) {
      console.error('❌ AuthDataService: Failed to handle logout', error)
      this.handleError(error, 'handleLogout')
    }
  }

  /**
   * Check if profile exists
   */
  static async profileExists(userId: string): Promise<boolean> {
    try {
      const profileCheckQuery = supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single()

      const checkTimeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Profile check timeout')), 5000)
      )

      const { data, error } = await Promise.race([profileCheckQuery, checkTimeoutPromise])

      if (error && error.code === 'PGRST116') {
        return false
      }

      return !!data
    } catch (error) {
      console.error('❌ AuthDataService: Failed to check profile existence', error)
      return false
    }
  }

  /**
   * Add credits to user profile
   */
  static async addCredits(userId: string, amount: number): Promise<boolean> {
    try {
      console.log('💰 AuthDataService: Adding credits', { userId, amount })

      const profileStore = useProfileStore.getState()
      const currentProfile = profileStore.profile

      if (!currentProfile) {
        throw new Error('No profile found')
      }

      // Calculate new values
      const newCredits = currentProfile.empathy_credits + amount
      const newTotalEarned = currentProfile.total_credits_earned + amount

      // Update profile
      const success = await this.updateUserProfile(userId, {
        empathy_credits: newCredits,
        total_credits_earned: newTotalEarned
      })

      if (success) {
        // Also update profile store credit tracking
        this.updateStore(
          (amount) => profileStore.addCredits(amount),
          amount
        )

        // Notify subscribers
        this.notifySubscribers('credits_added', {
          userId,
          amount,
          newTotal: newCredits
        })

        console.log('✅ AuthDataService: Credits added successfully')
        return true
      }

      return false

    } catch (error) {
      console.error('❌ AuthDataService: Failed to add credits', error)
      this.handleError(error, 'addCredits')
      return false
    }
  }

  /**
   * Spend credits from user profile
   */
  static async spendCredits(userId: string, amount: number): Promise<boolean> {
    try {
      console.log('💸 AuthDataService: Spending credits', { userId, amount })

      const profileStore = useProfileStore.getState()

      // Try to spend credits (store has validation)
      const success = profileStore.spendCredits(amount)

      if (success) {
        const currentProfile = profileStore.profile
        if (currentProfile) {
          // Update database
          const newCredits = currentProfile.empathy_credits - amount
          const newTotalSpent = currentProfile.total_credits_spent + amount

          await this.updateUserProfile(userId, {
            empathy_credits: newCredits,
            total_credits_spent: newTotalSpent
          })

          // Notify subscribers
          this.notifySubscribers('credits_spent', {
            userId,
            amount,
            remaining: newCredits
          })

          console.log('✅ AuthDataService: Credits spent successfully')
          return true
        }
      }

      return false

    } catch (error) {
      console.error('❌ AuthDataService: Failed to spend credits', error)
      this.handleError(error, 'spendCredits')
      return false
    }
  }

  /**
   * Delete user account and all associated data
   */
  static async deleteAccount(userId: string): Promise<boolean> {
    try {
      console.log('🗑️ AuthDataService: Deleting user account', { userId })

      // Set loading state
      this.setLoadingState(true, ['auth'])

      // Delete user profile first
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (profileError) {
        console.error('❌ AuthDataService: Failed to delete profile', profileError)
        throw profileError
      }

      // Delete the user account
      const { error: authError } = await supabase.auth.admin.deleteUser(userId)

      if (authError) {
        console.error('❌ AuthDataService: Failed to delete auth account', authError)
        throw authError
      }

      // Clear all stores
      const authStore = useAuthStore.getState()
      const profileStore = useProfileStore.getState()
      
      authStore.signOut()
      profileStore.clearProfile()

      // Clear loading state
      this.setLoadingState(false, ['auth'])

      console.log('✅ AuthDataService: Account deleted successfully')
      return true

    } catch (error) {
      console.error('❌ AuthDataService: Failed to delete account', error)
      this.setLoadingState(false, ['auth'])
      this.handleError(error, 'deleteAccount')
      return false
    }
  }
}
