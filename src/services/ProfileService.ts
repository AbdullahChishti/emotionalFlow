/**
 * Profile Service
 * Handles all profile-related operations
 */

import { BaseService } from './BaseService'
import { Profile } from '@/types'
import { NotFoundError, ValidationError, BusinessError } from '@/lib/api/errors'

export interface ProfileUpdateData {
}

export interface MoodEntryData {
}

export class ProfileService extends BaseService {
  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<Profile> {
    this.logOperation('getProfile', { userId })
    this.validateRequired({ userId }, ['userId'])

    const profile = await this.executeApiCall(
      () => this.apiManager.supabaseQuery<Profile>('profiles', {
        select: '*',
        match: { user_id: userId },
        limit: 1
      }),
      'get profile'
    )

    if (!profile) {
      throw new NotFoundError('Profile', 'Profile not found. Please complete your profile setup.')
    }

    this.logOperation('getProfile.success', { userId })
    return this.transformFromApi(profile)
  }

  /**
   * Create new user profile
   */
  async createProfile(
    userId: string,
    profileData: any
  ): Promise<any> {
    this.logOperation('createProfile', { userId })
    this.validateRequired({ userId }, ['userId'])

    // Validate business rules
    this.validateBusinessRules(profileData, 'createProfile')

    // Transform data
    const apiData = this.transformForApi({
      ...profileData,
    })

    const profile = await this.executeApiCall(
      () => this.apiManager.supabaseInsert<Profile>('profiles', apiData),
      'create profile'
    )

    this.logOperation('createProfile.success', { userId })
    return this.transformFromApi(profile)
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    this.logOperation('updateProfile', { userId, updates: Object.keys(updates) })
    this.validateRequired({ userId }, ['userId'])

    // Validate business rules
    this.validateBusinessRules(updates, 'updateProfile')

    // Transform data
    const apiData = this.transformForApi({
      ...updates,
    })

    const profile = await this.executeApiCall(
      () => this.apiManager.supabaseUpdate<Profile>('profiles', apiData, { user_id: userId }),
      'update profile'
    )

    this.logOperation('updateProfile.success', { userId })
    return this.transformFromApi(profile)
  }

  /**
   * Delete user profile
   */
  async deleteProfile(userId: string): Promise<void> {
    this.logOperation('deleteProfile', { userId })
    this.validateRequired({ userId }, ['userId'])

    await this.executeApiCall(
      () => this.apiManager.supabaseDelete('profiles', { user_id: userId }),
      'delete profile'
    )

    this.logOperation('deleteProfile.success', { userId })
  }

  /**
   * Add credits to user profile
   */
  async addCredits(userId: string, amount: number): Promise<Profile> {
    this.logOperation('addCredits', { userId, amount })
    this.validateRequired({ userId, amount }, ['userId', 'amount'])

    if (amount <= 0) {
      throw new ValidationError('amount', 'Credit amount must be positive')
    }

    // Get current profile
    const currentProfile = await this.getProfile(userId)
    const newCredits = currentProfile.empathy_credits + amount
    const newTotalEarned = currentProfile.total_credits_earned + amount

    return this.updateProfile(userId, {
    })
  }

  /**
   * Spend credits from user profile
   */
  async spendCredits(userId: string, amount: number): Promise<Profile> {
    this.logOperation('spendCredits', { userId, amount })
    this.validateRequired({ userId, amount }, ['userId', 'amount'])

    if (amount <= 0) {
      throw new ValidationError('amount', 'Credit amount must be positive')
    }

    // Get current profile
    const currentProfile = await this.getProfile(userId)

    if (currentProfile.empathy_credits < amount) {
      throw new BusinessError('Insufficient credits', 'You do not have enough credits for this action')
    }

    const newCredits = currentProfile.empathy_credits - amount
    const newTotalSpent = currentProfile.total_credits_spent + amount

    return this.updateProfile(userId, {
    })
  }

  /**
   * Save mood entry and update profile
   */
  async saveMoodEntry(userId: string, moodData: MoodEntryData): Promise<{ profile: Profile; moodEntry: any }> {
    this.logOperation('saveMoodEntry', { userId, moodScore: moodData.mood_score })
    this.validateRequired({ userId }, ['userId'])

    // Validate mood data
    this.validateBusinessRules(moodData, 'saveMoodEntry')

    // Save mood entry
    const moodEntry = await this.executeApiCall(
      () => this.apiManager.supabaseInsert('mood_entries', {
        ...moodData,
      }),
      'save mood entry'
    )

    // Update profile with emotional capacity
    const profile = await this.updateProfile(userId, {
    })

    this.logOperation('saveMoodEntry.success', { userId })
    return { profile, moodEntry }
  }

  /**
   * Save mood entry
   */
  async saveMoodEntry(userId: string, moodData: MoodEntryData): Promise<{ profile: Profile; moodEntry: any }> {
    this.logOperation('saveMoodEntry', { userId, moodScore: moodData.mood_score })
    this.validateRequired({ userId }, ['userId'])

    // Validate mood data
    this.validateBusinessRules(moodData, 'saveMoodEntry')

    // Save mood entry
    const moodEntry = await this.executeApiCall(
      () => this.apiManager.supabaseInsert('mood_entries', {
      }),
      'save mood entry'
    )

    // Update profile with emotional capacity and last active
    const profile = await this.updateProfile(userId, {
    })

    this.logOperation('saveMoodEntry.success', { userId })
    return { profile, moodEntry }
  }

  /**
   * Get mood history
   */
  async getMoodHistory(userId: string, limit: number = 30): Promise<any[]> {
    this.logOperation('getMoodHistory', { userId, limit })
    this.validateRequired({ userId }, ['userId'])

    const moodEntries = await this.executeApiCall(
      () => this.apiManager.supabaseQuery('mood_entries', {
        limit
      }),
      'get mood history'
    )

    this.logOperation('getMoodHistory.success', { userId, count: moodEntries?.length || 0 })
    return moodEntries || []
  }

  /**
   * Check if profile exists
   */
  async profileExists(userId: string): Promise<boolean> {
    try {
      await this.getProfile(userId)
      return true
    } catch (error) {
      if (error instanceof NotFoundError) {
        return false
      }
      throw error
    }
  }

  /**
   * Transform data for API
   */
  protected transformForApi(data: any): any {
    // Convert camelCase to snake_case for database
    const transformed: any = {}

    for (const [key, value] of Object.entries(data)) {
      switch (key) {
        case 'displayName':
          transformed.display_name = value
          break
        case 'isAnonymous':
          transformed.is_anonymous = value
          break
        case 'emotionalCapacity':
          transformed.emotional_capacity = value
          break
        case 'preferredMode':
          transformed.preferred_mode = value
          break
        case 'avatarUrl':
          transformed.avatar_url = value
          break
        case 'empathyCredits':
          transformed.empathy_credits = value
          break
        case 'totalCreditsEarned':
          transformed.total_credits_earned = value
          break
        case 'totalCreditsSpent':
          transformed.total_credits_spent = value
          break
        case 'lastActive':
          transformed.last_active = value
          break
          transformed[key] = value
      }
    }

    return transformed
  }

  /**
   * Transform data from API
   */
  protected transformFromApi(data: any): Profile {
    // Convert snake_case to camelCase for frontend
    return {
    }
  }

  /**
   * Business rules validation
   */
  protected validateBusinessRules(data: any, context: string): void {
    switch (context) {
      case 'createProfile':
      case 'updateProfile':
        if (data.display_name && data.display_name.length < 2) {
          throw new ValidationError('display_name', 'Display name must be at least 2 characters long')
        }
        if (data.display_name && data.display_name.length > 50) {
          throw new ValidationError('display_name', 'Display name cannot exceed 50 characters')
        }
        if (data.bio && data.bio.length > 500) {
          throw new ValidationError('bio', 'Bio cannot exceed 500 characters')
        }
        if (data.emotional_capacity && !['low', 'medium', 'high'].includes(data.emotional_capacity)) {
          throw new ValidationError('emotional_capacity', 'Emotional capacity must be low, medium, or high')
        }
        if (data.preferred_mode && !['text', 'voice', 'both'].includes(data.preferred_mode)) {
          throw new ValidationError('preferred_mode', 'Preferred mode must be text, voice, or both')
        }
        break

      case 'saveMoodEntry':
        if (data.mood_score < 1 || data.mood_score > 10) {
          throw new ValidationError('mood_score', 'Mood score must be between 1 and 10')
        }
        if (data.notes && data.notes.length > 1000) {
          throw new ValidationError('notes', 'Notes cannot exceed 1000 characters')
        }
        break
    }
  }
}

// Export singleton instance
export const profileService = new ProfileService()
