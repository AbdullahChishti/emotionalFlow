/**
 * Assessment Data Service
 * Handles all assessment operations and automatically updates stores
 */

import { DataService } from './DataService'
import { AssessmentManager, AssessmentHistoryEntry } from './AssessmentManager'
import { useAssessmentStore } from '@/stores/assessmentStore'
import { useProfileStore } from '@/stores/profileStore'
import { AssessmentResult, ASSESSMENTS } from '@/data/assessments'
import { UserProfile } from '@/data/assessment-integration'
import { supabase } from '../supabase'
import { CacheManager } from '../cache-manager'
import { ResilientApi } from '../resilient-api'

export class AssessmentDataService extends DataService {

  /**
   * Fetch user's assessment results and update store
   */
  static async fetchUserAssessments(userId: string, force = false): Promise<Record<string, AssessmentResult>> {
    try {
      console.log('📊 AssessmentDataService: Fetching user assessments', { userId, force })

      const assessmentStore = useAssessmentStore.getState()
      const profileStore = useProfileStore.getState()

      // Check cache first (unless forcing refresh)
      const cacheKey = `assessments_${userId}`
      if (!force) {
        const cachedResults = CacheManager.get<Record<string, AssessmentResult>>(cacheKey)
        if (cachedResults && Object.keys(cachedResults).length > 0) {
          console.log('📊 AssessmentDataService: Using cached data')
          return cachedResults
        }
      }

      // Clear assessment cache if forcing refresh or no valid cache
      if (force || !CacheManager.get<Record<string, AssessmentResult>>(cacheKey)) {
        console.log('🧹 AssessmentDataService: Clearing stale cache')
        CacheManager.clearAssessmentCache()
      }

      // Check if we already have data and don't need to force refresh
      const currentResults = assessmentStore.results
      const hasData = Object.keys(currentResults).length > 0

      if (hasData && !force) {
        console.log('📊 AssessmentDataService: Using store data')
        // Cache the store data
        CacheManager.set(cacheKey, currentResults, { category: 'assessment' })
        return currentResults
      }

      // Set loading states
      this.setLoadingState(true, ['assessment'])

      // Fetch assessment history from database with resilience
      const { data: history, error: historyError } = await ResilientApi.supabase(
        () => AssessmentManager.getAssessmentHistory(userId),
        { maxRetries: 3, validateAuth: true }
      )

      if (historyError) {
        throw new Error(historyError.message || 'Failed to fetch assessment history')
      }

      // Convert history to store format
      console.log('📊 AssessmentDataService: Processing history entries:', {
        totalEntries: history.length,
        uniqueAssessments: [...new Set(history.map(h => h.assessmentId))],
        entriesWithResultData: history.filter(h => h.resultData).length
      })
      
      const results = this.processAssessmentHistory(history)

      // Cache the results
      CacheManager.set(cacheKey, results, {
        category: 'assessment',
        metadata: { userId, timestamp: Date.now() }
      })

      // Update assessment store
      this.updateStore(
        (data) => {
          assessmentStore.setResults(data)
          assessmentStore.setLoading(false)
          assessmentStore.setError(null)
        },
        results
      )

      // Fetch and update user profile if available
      const latestProfile = await AssessmentManager.getLatestUserProfile(userId)
      if (latestProfile?.profile_data) {
        this.updateStore(
          (data) => profileStore.setAssessmentProfile(data),
          latestProfile.profile_data as UserProfile
        )
      }

      // Update progress
      assessmentStore.calculateProgress()

      // Notify subscribers
      this.notifySubscribers('assessments_fetched', {
        userId,
        results,
        count: Object.keys(results).length
      })

      console.log('✅ AssessmentDataService: Assessments fetched successfully', {
        count: Object.keys(results).length
      })

      return results

    } catch (error) {
      console.error('❌ AssessmentDataService: Failed to fetch assessments', error)
      this.handleError(error, 'fetchUserAssessments', (msg) => {
        useAssessmentStore.getState().setError(msg)
        useAssessmentStore.getState().setLoading(false)
      })
      return {}
    }
  }

  /**
   * Save assessment result and update stores immediately
   */
  static async saveAssessmentResult(
    userId: string,
    assessmentId: string,
    result: AssessmentResult,
    responses: Record<string, number | string>,
    friendlyExplanation?: string
  ): Promise<boolean> {
    try {
      console.log('💾 ASSESSMENT SAVE LOG - AssessmentDataService.saveAssessmentResult called:', {
        userId,
        assessmentId,
        score: result.score,
        level: result.level,
        severity: result.severity,
        hasResponses: !!responses,
        responsesCount: Object.keys(responses).length,
        hasExplanation: !!friendlyExplanation
      })

      const assessmentStore = useAssessmentStore.getState()
      const assessmentTitle = ASSESSMENTS[assessmentId]?.title || assessmentId

      // Optimistic update - update store immediately
      const currentResults = assessmentStore.results
      const optimisticResults = {
        ...currentResults,
        [assessmentId]: result
      }

      this.updateStore(
        (data) => assessmentStore.setResults(data),
        optimisticResults
      )

      // Mark as completed
      this.updateStore(
        (completed) => assessmentStore.updateProgress(assessmentId, completed),
        true
      )

      // Save to database with resilience
      const { data: savedResult, error: saveError } = await ResilientApi.supabase(
        () => AssessmentManager.saveAssessmentResult(
          userId,
          assessmentId,
          assessmentTitle,
          result,
          responses,
          friendlyExplanation
        ),
        { maxRetries: 3, validateAuth: true }
      )

      if (saveError || !savedResult) {
        // Revert optimistic update on failure
        this.updateStore(
          (data) => assessmentStore.setResults(data),
          currentResults
        )
        throw new Error(saveError?.message || 'Failed to save assessment to database')
      }

      // Clear cache to force fresh data on next fetch
      const cacheKey = `assessments_${userId}`
      CacheManager.delete(cacheKey)
      console.log('🗑️ ASSESSMENT SAVE LOG - Cache cleared for fresh data reload')

      // Notify subscribers
      this.notifySubscribers('assessment_saved', {
        userId,
        assessmentId,
        result,
        databaseId: savedResult.id
      })

      console.log('✅ ASSESSMENT SAVE LOG - AssessmentDataService assessment saved successfully:', {
        assessmentId,
        databaseId: savedResult.id,
        userId
      })

      return true

    } catch (error) {
      console.error('❌ ASSESSMENT SAVE LOG - AssessmentDataService failed to save assessment:', {
        error,
        errorMessage: error?.message,
        userId,
        assessmentId,
        score: result.score
      })
      this.handleError(error, 'saveAssessmentResult', (msg) => {
        useAssessmentStore.getState().setError(msg)
      })
      return false
    }
  }

  /**
   * Complete assessment flow and update all related stores
   */
  static async completeAssessmentFlow(
    userId: string,
    results: Record<string, AssessmentResult>
  ): Promise<UserProfile | null> {
    try {
      console.log('🎯 AssessmentDataService: Completing assessment flow', {
        userId,
        assessmentCount: Object.keys(results).length
      })

      const assessmentStore = useAssessmentStore.getState()
      const profileStore = useProfileStore.getState()

      // Set processing state
      this.setLoadingState(true, ['assessment', 'profile'])

      // Process assessment results into user profile
      const { profile: userProfile, databaseResult } = await AssessmentManager.processAssessmentResults(
        results,
        userId
      )

      if (userProfile) {
        // Update stores with new profile
        this.updateStore(
          (profile) => {
            assessmentStore.setUserProfile(profile)
            profileStore.setAssessmentProfile(profile)
          },
          userProfile
        )

        // Complete the flow in assessment store
        this.updateStore(
          (data) => assessmentStore.completeAssessmentFlow(data, userProfile),
          results
        )

        // Notify subscribers
        this.notifySubscribers('assessment_flow_completed', {
          userId,
          results,
          userProfile,
          databaseId: databaseResult?.id
        })

        console.log('✅ AssessmentDataService: Assessment flow completed successfully')
      }

      // Clear loading states
      this.setLoadingState(false, ['assessment', 'profile'])

      return userProfile || null

    } catch (error) {
      console.error('❌ AssessmentDataService: Failed to complete assessment flow', error)
      this.setLoadingState(false, ['assessment', 'profile'])
      this.handleError(error, 'completeAssessmentFlow', (msg) => {
        useAssessmentStore.getState().setError(msg)
      })
      return null
    }
  }

  /**
   * Get assessment history with caching
   */
  static async getAssessmentHistory(userId: string): Promise<AssessmentHistoryEntry[]> {
    try {
      console.log('📚 AssessmentDataService: Getting assessment history', { userId })

      // Use existing AssessmentManager method
      const history = await AssessmentManager.getAssessmentHistory(userId)

      // Cache in localStorage for offline access
      if (typeof window !== 'undefined') {
        const cacheKey = `assessment-history-${userId}`
        localStorage.setItem(cacheKey, JSON.stringify({
          data: history,
          timestamp: Date.now()
        }))
      }

      // Notify subscribers
      this.notifySubscribers('history_fetched', {
        userId,
        count: history.length
      })

      return history

    } catch (error) {
      console.error('❌ AssessmentDataService: Failed to get assessment history', error)

      // Try to return cached data
      if (typeof window !== 'undefined') {
        const cacheKey = `assessment-history-${userId}`
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
          try {
            const { data } = JSON.parse(cached)
            console.log('📚 AssessmentDataService: Using cached history')
            return data
          } catch (e) {
            console.error('Failed to parse cached history:', e)
          }
        }
      }

      this.handleError(error, 'getAssessmentHistory')
      return []
    }
  }

  /**
   * Get assessment context for chat personalization
   */
  static async getAssessmentContext(userId: string) {
    try {
      console.log('🎯 AssessmentDataService: Getting assessment context', { userId })

      const context = await AssessmentManager.getAssessmentContext(userId)

      // Update chat store with context
      const { useChatStore } = await import('@/stores/chatStore')
      this.updateStore(
        (context) => useChatStore.getState().setAssessmentContext(context),
        context
      )

      // Notify subscribers
      this.notifySubscribers('context_fetched', {
        userId,
        context
      })

      return context

    } catch (error) {
      console.error('❌ AssessmentDataService: Failed to get assessment context', error)
      this.handleError(error, 'getAssessmentContext')
      return null
    }
  }

  /**
   * Clear all assessment data (for testing/reset)
   */
  static clearAssessmentData(userId?: string): void {
    console.log('🗑️ AssessmentDataService: Clearing assessment data', { userId })

    const assessmentStore = useAssessmentStore.getState()

    this.updateStore(
      () => assessmentStore.clearResults(),
      undefined
    )

    // Clear localStorage cache
    if (typeof window !== 'undefined') {
      const cacheKey = userId ? `assessment-history-${userId}` : 'assessment-history'
      if (userId) {
        localStorage.removeItem(cacheKey)
      } else {
        // Clear all assessment-related cache
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('assessment-')) {
            localStorage.removeItem(key)
          }
        })
      }
    }

    this.notifySubscribers('data_cleared', { userId })
  }

  /**
   * Process assessment history into store format
   * @param history - Array of assessment history entries
   * @param latestOnly - If true, only return the latest result per assessment type (default: true)
   */
  private static processAssessmentHistory(history: AssessmentHistoryEntry[], latestOnly: boolean = true): Record<string, AssessmentResult> {
    const results: Record<string, AssessmentResult> = {}

    let entriesToProcess: AssessmentHistoryEntry[] = history

    if (latestOnly) {
      // Group by assessment ID and take the latest
      const latestById: Record<string, AssessmentHistoryEntry> = {}
      history.forEach(entry => {
        if (!latestById[entry.assessmentId] ||
            new Date(entry.takenAt) > new Date(latestById[entry.assessmentId].takenAt)) {
          latestById[entry.assessmentId] = entry
        }
      })
      entriesToProcess = Object.values(latestById)
    } else {
      // Use all entries - create unique keys for multiple results of same assessment
      entriesToProcess = history
    }

    // Convert to AssessmentResult format with complete data
    entriesToProcess.forEach((entry, index) => {
      console.log(`🔍 CRITICAL LOG - Processing entry for ${entry.assessmentId}:`, {
        hasResultData: !!entry.resultData,
        resultDataType: typeof entry.resultData,
        hasFriendlyExplanation: !!entry.friendlyExplanation,
        friendlyExplanationLength: entry.friendlyExplanation ? entry.friendlyExplanation.length : 0
      })
      
      // Extract complete result data if available, otherwise use basic fields
      const resultData = entry.resultData || {}
      
      console.log(`📊 CRITICAL LOG - ResultData for ${entry.assessmentId}:`, {
        resultDataKeys: Object.keys(resultData),
        hasDescription: !!resultData.description,
        hasRecommendations: Array.isArray(resultData.recommendations),
        hasInsights: Array.isArray(resultData.insights),
        hasNextSteps: Array.isArray(resultData.nextSteps),
        hasManifestations: Array.isArray(resultData.manifestations)
      })
      
      const processedResult = {
        score: entry.score,
        level: entry.level,
        severity: entry.severity as 'normal' | 'mild' | 'moderate' | 'severe' | 'critical',
        description: resultData.description || entry.friendlyExplanation || `Assessment completed with score ${entry.score}`,
        recommendations: resultData.recommendations || [],
        insights: resultData.insights || (entry.friendlyExplanation ? [entry.friendlyExplanation] : []),
        nextSteps: resultData.nextSteps || [],
        manifestations: resultData.manifestations || [],
        takenAt: new Date(entry.takenAt)
      }
      
      // Create unique key for each result
      const resultKey = latestOnly ? entry.assessmentId : `${entry.assessmentId}_${entry.id || index}`
      results[resultKey] = processedResult

      console.log(`✅ CRITICAL LOG - Final processed result for ${entry.assessmentId}:`, {
        hasDescription: !!processedResult.description,
        descriptionLength: processedResult.description ? processedResult.description.length : 0,
        recommendationsCount: processedResult.recommendations.length,
        insightsCount: processedResult.insights.length,
        nextStepsCount: processedResult.nextSteps.length,
        manifestationsCount: processedResult.manifestations.length,
        takenAt: processedResult.takenAt
      })
    })

    return results
  }

  /**
   * Get full assessment history (all results, not just latest per assessment)
   */
  static async getFullAssessmentHistory(userId: string): Promise<Record<string, AssessmentResult>> {
    try {
      console.log('📊 AssessmentDataService: Getting full assessment history', { userId })

      // Fetch assessment history from database
      const history = await AssessmentManager.getAssessmentHistory(userId)

      // Process all entries (not just latest)
      const results = this.processAssessmentHistory(history, false)

      console.log('📊 AssessmentDataService: Full history processed:', {
        totalEntries: history.length,
        totalResults: Object.keys(results).length,
        resultKeys: Object.keys(results)
      })

      return results
    } catch (error) {
      console.error('❌ AssessmentDataService: Error getting full history:', error)
      return {}
    }
  }

  /**
   * Delete a single assessment
   */
  static async deleteAssessment(userId: string, assessmentId: string, permanent = false): Promise<boolean> {
    try {
      console.log('🗑️ AssessmentDataService: Deleting assessment', { userId, assessmentId, permanent })

      const response = await fetch(`/api/assessments/${assessmentId}?permanent=${permanent}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to delete assessment: ${response.statusText}`)
      }

      console.log('✅ AssessmentDataService: Assessment deleted successfully')
      return true
    } catch (error) {
      console.error('❌ AssessmentDataService: Failed to delete assessment:', error)
      return false
    }
  }

  /**
   * Delete multiple assessments
   */
  static async bulkDeleteAssessments(userId: string, assessmentIds: string[], permanent = false): Promise<boolean> {
    try {
      console.log('🗑️ AssessmentDataService: Bulk deleting assessments', { userId, assessmentIds, permanent })

      const response = await fetch('/api/assessments/bulk-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ assessmentIds, permanent })
      })

      if (!response.ok) {
        throw new Error(`Failed to bulk delete assessments: ${response.statusText}`)
      }

      console.log('✅ AssessmentDataService: Assessments deleted successfully')
      return true
    } catch (error) {
      console.error('❌ AssessmentDataService: Failed to bulk delete assessments:', error)
      return false
    }
  }

  /**
   * Restore a deleted assessment
   */
  static async restoreAssessment(userId: string, assessmentId: string): Promise<boolean> {
    try {
      console.log('🔄 AssessmentDataService: Restoring assessment', { userId, assessmentId })

      const response = await fetch(`/api/assessments/${assessmentId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to restore assessment: ${response.statusText}`)
      }

      console.log('✅ AssessmentDataService: Assessment restored successfully')
      return true
    } catch (error) {
      console.error('❌ AssessmentDataService: Failed to restore assessment:', error)
      return false
    }
  }
}
