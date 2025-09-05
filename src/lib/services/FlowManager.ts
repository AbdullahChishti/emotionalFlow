/**
 * Flow Manager
 * Orchestrates the 5 critical user flows for optimal user experience
 */

import { logError, logAuthError, logAssessmentError, logChatError, logDatabaseError } from '../error-logger'
import { AssessmentManager } from './AssessmentManager'
import { useAuthStore } from '@/stores/authStore'
import { useAssessmentStore } from '@/stores/assessmentStore'
import { useChatStore } from '@/stores/chatStore'
import { useProfileStore } from '@/stores/profileStore'
import { User } from '@supabase/supabase-js'

export class FlowManager {
  // ==================== FLOW 1: LOGIN FLOW ====================

  /**
   * Complete login flow with profile creation and state management
   */
  static async handleLogin(user: User, profile: any = null): Promise<void> {
    console.log('🚀 FlowManager: Starting login flow', { userId: user.id, hasProfile: !!profile })

    try {
      const authStore = useAuthStore.getState()
      const profileStore = useProfileStore.getState()

      // Step 1: Update auth state
      authStore.setUser(user)
      authStore.setLoading(true)

      // Step 2: Set profile data
      if (profile) {
        profileStore.setProfile(profile)
        authStore.setProfile(profile)
      } else {
        // Profile will be created by AuthProvider if needed
      }

      // Step 3: Initialize assessment context
      if (profile) {
        await this.initializeUserContext(user.id)
      }

      // Step 4: Complete login
      authStore.setLoading(false)
      authStore.setAuthenticated(true)

      console.log('✅ FlowManager: Login flow completed successfully')

    } catch (error) {
      console.error('❌ FlowManager: Login flow failed', error)
      logAuthError(error as Error, 'login_flow', user.id)
      const authStore = useAuthStore.getState()
      authStore.setLoading(false)
      // Note: Error handling is managed by the calling component
      throw error
    }
  }

  // ==================== FLOW 2: LOGOUT FLOW ====================

  /**
   * Complete logout flow with state cleanup
   */
  static handleLogout(): void {
    console.log('🚪 FlowManager: Starting logout flow')

    try {
      const authStore = useAuthStore.getState()
      const assessmentStore = useAssessmentStore.getState()
      const chatStore = useChatStore.getState()
      const profileStore = useProfileStore.getState()

      // Step 1: End any active chat session
      if (chatStore.currentSessionId) {
        chatStore.endCurrentSession()
      }

      // Step 2: Clear all stores
      authStore.logout()
      assessmentStore.resetAssessmentState()
      chatStore.resetChatState()
      profileStore.clearProfile()

      // Step 3: Clear localStorage (handled by Zustand persist)

      console.log('✅ FlowManager: Logout flow completed successfully')

    } catch (error) {
      console.error('❌ FlowManager: Logout flow failed', error)
      // Even if cleanup fails, continue with logout
    }
  }

  // ==================== FLOW 3: ASSESSMENT FLOW ====================

  /**
   * Complete assessment taking and saving flow
   */
  static async handleAssessmentFlow(
    assessmentIds: string[],
    userId: string,
    onProgress?: (completed: number, total: number) => void,
    onComplete?: (results: any) => void
  ): Promise<void> {
    console.log('📋 FlowManager: Starting assessment flow', { assessmentIds, userId })

    try {
      const assessmentStore = useAssessmentStore.getState()

      // Step 1: Initialize assessment state
      assessmentStore.startAssessmentFlow('custom', assessmentIds)
      assessmentStore.setLoading(true)

      // Step 2: Process assessments (this would be handled by UI components)
      // The actual assessment taking happens in the UI components

      // Step 3: When assessments are complete, this will be called:
      console.log('⏳ FlowManager: Assessment flow initialized - waiting for completion')

    } catch (error) {
      console.error('❌ FlowManager: Assessment flow failed', error)
      const assessmentStore = useAssessmentStore.getState()
      assessmentStore.setLoading(false)
      assessmentStore.setError('Failed to start assessment. Please try again.')
      throw error
    }
  }

  /**
   * Complete assessment processing after user finishes taking assessments
   */
  static async completeAssessmentFlow(
    results: Record<string, any>,
    userId: string
  ): Promise<void> {

    try {
      // Step 1: Process results with AssessmentManager (handles database saves)
      const { profile: processedProfile, databaseResult } = await AssessmentManager.processAssessmentResults(results, userId)

      // Step 2: Update stores with processed data (try-catch for client-side only)
      try {
        const assessmentStore = useAssessmentStore.getState()
        assessmentStore.setProcessingResults(true)
        assessmentStore.completeAssessmentFlow(results, processedProfile)
        assessmentStore.setProcessingResults(false)
        
        const profileStore = useProfileStore.getState()
        profileStore.setAssessmentProfile(processedProfile)

        // Step 3: Update chat context with new assessment data
        const context = await AssessmentManager.getAssessmentContext(userId)
        const chatStore = useChatStore.getState()
        chatStore.setAssessmentContext(context)
        
        console.log('✅ FlowManager: Stores updated successfully')
      } catch (storeError) {
        console.warn('⚠️ FlowManager: Store updates failed (possibly server-side context):', storeError)
        // Continue execution - database operations succeeded
      }


    } catch (error) {
      console.error('❌ FlowManager: Assessment completion failed', error)
      logAssessmentError(error as Error, 'assessment_completion', userId)
      
      // Try to update store error state if possible
      try {
        const assessmentStore = useAssessmentStore.getState()
        assessmentStore.setProcessingResults(false)
        assessmentStore.setError('Failed to process assessment results. Please try again.')
      } catch (storeError) {
        console.warn('⚠️ Could not update store error state:', storeError)
      }
      
      throw error
    }
  }

  // ==================== FLOW 4: CHAT FLOW ====================

  /**
   * Initialize chat session with user context
   */
  static async initializeChatSession(userId: string): Promise<void> {
    console.log('💬 FlowManager: Initializing chat session', { userId })

    try {
      const chatStore = useChatStore.getState()

      // Step 1: Get assessment context
      const assessmentContext = await AssessmentManager.getAssessmentContext(userId)

      // Step 2: Start new chat session
      chatStore.startNewSession(userId, assessmentContext)

      // Step 3: Set initial context
      chatStore.setAssessmentContext(assessmentContext)

      console.log('✅ FlowManager: Chat session initialized successfully')

    } catch (error) {
      console.error('❌ FlowManager: Chat initialization failed', error)
      const chatStore = useChatStore.getState()
      chatStore.setError('Failed to initialize chat. Please refresh and try again.')
      throw error
    }
  }


  // ==================== FLOW 5: ASSESSMENT-ENHANCED CHAT ====================

  /**
   * Refresh assessment context during chat session
   */
  static async refreshChatContext(userId: string): Promise<void> {
    console.log('🔄 FlowManager: Refreshing chat context', { userId })

    try {
      const chatStore = useChatStore.getState()

      // Step 1: Get fresh assessment context
      const freshContext = await AssessmentManager.getAssessmentContext(userId)

      // Step 2: Update chat context
      chatStore.setAssessmentContext(freshContext)
      chatStore.updateContextTimestamp()

      console.log('✅ FlowManager: Chat context refreshed successfully')

    } catch (error) {
      console.error('❌ FlowManager: Context refresh failed', error)
      const chatStore = useChatStore.getState()
      chatStore.setError('Failed to refresh context. Some features may be limited.')
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Initialize user context after login
   */
  private static async initializeUserContext(userId: string): Promise<void> {
    console.log('🎯 FlowManager: Initializing user context', { userId })

    try {
      // Step 1: Load assessment history
      const history = await AssessmentManager.getAssessmentHistory(userId)
      const assessmentStore = useAssessmentStore.getState()

      // Step 2: Update completed assessments
      history.forEach(entry => {
        assessmentStore.updateProgress(entry.assessmentId, true)
      })

      // Step 3: Load latest profile
      const profile = await AssessmentManager.getLatestUserProfile(userId)
      if (profile?.profile_data) {
        const profileStore = useProfileStore.getState()
        profileStore.setAssessmentProfile(profile.profile_data)
      }

      console.log('✅ FlowManager: User context initialized', {
        historyCount: history.length,
        hasProfile: !!profile
      })

    } catch (error) {
      console.error('❌ FlowManager: User context initialization failed', error)
      // Don't throw - this is not critical for login
    }
  }

  /**
   * Get user flow status
   */
  static getFlowStatus(): {
    loginComplete: boolean
    assessmentComplete: boolean
    chatReady: boolean
    profileComplete: boolean
  } {
    const authStore = useAuthStore.getState()
    const assessmentStore = useAssessmentStore.getState()
    const chatStore = useChatStore.getState()
    const profileStore = useProfileStore.getState()

    return {
      loginComplete: authStore.isAuthenticated,
      assessmentComplete: assessmentStore.progressPercentage > 0,
      chatReady: !!chatStore.assessmentContext,
      profileComplete: profileStore.hasValidProfile()
    }
  }
}

export default FlowManager
