/**
 * Assessment Data Hook
 * Provides assessment data and operations with automatic store updates
 */

import { useCallback, useEffect } from 'react'
import { useAssessmentStore } from '@/stores/assessmentStore'
import { useAuthStore } from '@/stores/authStore'
import { AssessmentDataService } from '@/lib/services/AssessmentDataService'
import { AssessmentResult } from '@/data/assessments'
import { AssessmentHistoryEntry } from '@/lib/services/AssessmentManager'

export function useAssessmentData() {
  const {
    results,
    userProfile,
    completedAssessments,
    progressPercentage,
    isLoading,
    error
  } = useAssessmentStore()

  const { user } = useAuthStore()

  // Fetch user assessments and update store
  const fetchAssessments = useCallback(async (force = false) => {
    if (!user?.id) return null

    try {
      const data = await AssessmentDataService.fetchUserAssessments(user.id, force)
      return data
    } catch (error) {
      console.error('Failed to fetch assessments:', error)
      return null
    }
  }, [user?.id])

  // Save assessment and update store
  const saveAssessment = useCallback(async (
    assessmentId: string,
    result: AssessmentResult,
    responses: Record<string, number | string>,
    friendlyExplanation?: string
  ) => {
    if (!user?.id) throw new Error('No user found')

    try {
      const success = await AssessmentDataService.saveAssessmentResult(
        user.id,
        assessmentId,
        result,
        responses,
        friendlyExplanation
      )

      if (!success) {
        throw new Error('Failed to save assessment')
      }

      return success
    } catch (error) {
      console.error('Failed to save assessment:', error)
      throw error
    }
  }, [user?.id])

  // Complete assessment flow
  const completeAssessmentFlow = useCallback(async (
    results: Record<string, AssessmentResult>
  ) => {
    if (!user?.id) throw new Error('No user found')

    try {
      const profile = await AssessmentDataService.completeAssessmentFlow(user.id, results)
      return profile
    } catch (error) {
      console.error('Failed to complete assessment flow:', error)
      throw error
    }
  }, [user?.id])

  // Get assessment history (latest results only)
  const getAssessmentHistory = useCallback(async (): Promise<AssessmentHistoryEntry[]> => {
    if (!user?.id) return []

    try {
      const history = await AssessmentDataService.getAssessmentHistory(user.id)
      return history
    } catch (error) {
      console.error('Failed to get assessment history:', error)
      return []
    }
  }, [user?.id])

  // Get full assessment history (all results, including multiple per assessment)
  const getFullAssessmentHistory = useCallback(async (): Promise<Record<string, AssessmentResult>> => {
    if (!user?.id) return {}

    try {
      const fullHistory = await AssessmentDataService.getFullAssessmentHistory(user.id)
      return fullHistory
    } catch (error) {
      console.error('Failed to get full assessment history:', error)
      return {}
    }
  }, [user?.id])

  // Get assessment context for chat
  const getAssessmentContext = useCallback(async () => {
    if (!user?.id) return null

    try {
      const context = await AssessmentDataService.getAssessmentContext(user.id)
      return context
    } catch (error) {
      console.error('Failed to get assessment context:', error)
      return null
    }
  }, [user?.id])

  // Delete assessment
  const deleteAssessment = useCallback(async (assessmentId: string, permanent = false) => {
    if (!user?.id) throw new Error('No user found')

    try {
      const success = await AssessmentDataService.deleteAssessment(user.id, assessmentId, permanent)
      if (success) {
        // Refresh data after deletion
        await fetchAssessments(true)
      }
      return success
    } catch (error) {
      console.error('Failed to delete assessment:', error)
      throw error
    }
  }, [user?.id, fetchAssessments])

  // Bulk delete assessments
  const bulkDeleteAssessments = useCallback(async (assessmentIds: string[], permanent = false) => {
    if (!user?.id) throw new Error('No user found')

    try {
      const success = await AssessmentDataService.bulkDeleteAssessments(user.id, assessmentIds, permanent)
      if (success) {
        // Refresh data after deletion
        await fetchAssessments(true)
      }
      return success
    } catch (error) {
      console.error('Failed to bulk delete assessments:', error)
      throw error
    }
  }, [user?.id, fetchAssessments])

  // Restore assessment
  const restoreAssessment = useCallback(async (assessmentId: string) => {
    if (!user?.id) throw new Error('No user found')

    try {
      const success = await AssessmentDataService.restoreAssessment(user.id, assessmentId)
      if (success) {
        // Refresh data after restoration
        await fetchAssessments(true)
      }
      return success
    } catch (error) {
      console.error('Failed to restore assessment:', error)
      throw error
    }
  }, [user?.id, fetchAssessments])

  // Clear assessment data (for testing/reset)
  const clearAssessmentData = useCallback(() => {
    AssessmentDataService.clearAssessmentData(user?.id)
  }, [user?.id])

  // Auto-fetch on mount and user change
  useEffect(() => {
    console.log('🔍 CRITICAL LOG - useAssessmentData useEffect triggered:', {
      hasUserId: !!user?.id,
      userId: user?.id,
      isLoading,
      currentResultsCount: Object.keys(results).length
    })
    
    if (user?.id && !isLoading) {
      console.log('🚀 CRITICAL LOG - Calling fetchAssessments for user:', user.id)
      fetchAssessments()
    }
  }, [user?.id, fetchAssessments, isLoading])

  return {
    // Data
    results,
    userProfile,
    completedAssessments,
    progressPercentage,

    // States
    isLoading,
    error,
    hasData: Object.keys(results).length > 0,

    // Actions
    fetchAssessments,
    saveAssessment,
    completeAssessmentFlow,
    getAssessmentHistory,
    getFullAssessmentHistory,
    getAssessmentContext,
    deleteAssessment,
    bulkDeleteAssessments,
    restoreAssessment,
    clearAssessmentData,

    // Computed values
    completedCount: Object.keys(completedAssessments).filter(id => completedAssessments[id]).length,
    totalAssessments: 7, // phq9, gad7, ace, cd-risc, pss10, who5, pcl5
    isComplete: Object.keys(completedAssessments).filter(id => completedAssessments[id]).length === 7
  }
}
