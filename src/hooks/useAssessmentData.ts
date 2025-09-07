/**
 * Assessment Data Hook
 * Provides assessment data and operations with automatic store updates
 */

import { useCallback, useEffect } from 'react'
import { useAppDataStore } from '@/stores/appDataStore'
import { useAuth } from '@/stores/authStore'
import { AssessmentResult } from '@/data/assessments'
import { AssessmentHistoryEntry } from '@/lib/services/AssessmentManager'

export function useAssessmentData() {
  const {
    assessments,
    profile,
    loading,
    errors
  } = useAppDataStore()

  const { user } = useAuth()

  // Fetch user assessments and update store
  const fetchAssessments = useCallback(async (force = false) => {
    if (!user?.id) return null

    try {
      const data = await useAppDataStore.getState().fetchAssessments(user.id, force)
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
      const success = await useAppDataStore.getState().saveAssessment(
        user.id,
        {
          id: assessmentId,
          result,
          responses,
          friendlyExplanation
        }
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
      const profile = await useAppDataStore.getState().updateProfile(user.id, { last_assessment: new Date().toISOString() })
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
      // For now, return empty array as this would need to be implemented in DataService
      return []
    } catch (error) {
      console.error('Failed to get assessment history:', error)
      return []
    }
  }, [user?.id])

  // Get full assessment history (all results, including multiple per assessment)
  const getFullAssessmentHistory = useCallback(async (): Promise<Record<string, AssessmentResult>> => {
    if (!user?.id) return {}

    try {
      // Return current assessments from store
      return assessments
    } catch (error) {
      console.error('Failed to get full assessment history:', error)
      return {}
    }
  }, [user?.id])

  // Get assessment context for chat
  const getAssessmentContext = useCallback(async () => {
    if (!user?.id) return null

    try {
      // Return assessment data for context
      return { assessments, profile }
    } catch (error) {
      console.error('Failed to get assessment context:', error)
      return null
    }
  }, [user?.id])

  // Delete assessment
  const deleteAssessment = useCallback(async (assessmentId: string, permanent = false) => {
    if (!user?.id) throw new Error('No user found')

    try {
      const success = await useAppDataStore.getState().deleteAssessment(user.id, assessmentId)
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
      // Bulk delete not implemented in centralized API yet
      const success = false
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
      // Restore not implemented in centralized API yet
      const success = false
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
    // Clear assessment data from centralized store
    useAppDataStore.getState().clearData()
  }, [])

  // Auto-fetch on mount and user change
  useEffect(() => {
    console.log('🔍 CRITICAL LOG - useAssessmentData useEffect triggered:', {
      hasUserId: !!user?.id,
      userId: user?.id,
      isLoading: loading.assessments,
      currentResultsCount: Object.keys(assessments).length
    })
    
    if (user?.id && !loading.assessments) {
      console.log('🚀 CRITICAL LOG - Calling fetchAssessments for user:', user.id)
      fetchAssessments()
    }
  }, [user?.id, fetchAssessments])

  return {
    // Data
    results: assessments,
    userProfile: profile,
    completedAssessments: Object.keys(assessments),
    progressPercentage: 0, // TODO: calculate progress

    // States
    isLoading: loading.assessments,
    error: errors.assessments,
    hasData: Object.keys(assessments).length > 0,

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
    completedCount: Object.keys(assessments).length,
    totalAssessments: 7, // phq9, gad7, ace, cd-risc, pss10, who5, pcl5
    isComplete: Object.keys(assessments).length >= 7
  }
}
