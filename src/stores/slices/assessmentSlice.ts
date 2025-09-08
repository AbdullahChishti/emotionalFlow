/**
 * Assessment Slice - Centralized Assessment State Management
 * Handles assessment data, flow state, and operations
 */

import { StateCreator } from 'zustand'
import { AssessmentResult } from '@/data/assessments'
import { assessmentService } from '@/services/AssessmentService'

// Assessment slice state interface
export interface AssessmentSlice {
  // Assessment data
  assessments: Record<string, AssessmentResult>
  isAssessmentsLoading: boolean
  assessmentError: string | null
  assessmentLastFetch: number | null

  // UI state
  currentAssessmentFlow: string | null
  showAssessmentResults: boolean
  isGeneratingReport: boolean

  // Actions
  // Data operations
  loadAssessments: (userId: string, forceRefresh?: boolean) => Promise<void>
  saveAssessment: (userId: string, assessmentData: any) => Promise<boolean>
  deleteAssessment: (userId: string, assessmentId: string) => Promise<boolean>
  generateLifeImpacts: (userId: string) => Promise<any>

  // UI operations
  startAssessmentFlow: (flowId: string) => void
  completeAssessmentFlow: () => void
  setShowAssessmentResults: (show: boolean) => void
  setGeneratingReport: (generating: boolean) => void

  // State setters
  setAssessments: (assessments: Record<string, AssessmentResult>) => void
  setAssessmentsLoading: (loading: boolean) => void
  setAssessmentError: (error: string | null) => void
  clearAssessments: () => void

  // Computed getters
  assessmentList: () => AssessmentResult[]
  completedCount: () => number
  hasAssessments: () => boolean
  getAssessment: (assessmentId: string) => AssessmentResult | null
  getAssessmentStats: () => {
    totalAssessments: number
    uniqueTypes: number
    types: string[]
    averageScore: number
    highestScore: number
    lowestScore: number
  }
}

// Assessment slice implementation
export const createAssessmentSlice: StateCreator<
  AssessmentSlice & any, // Will be combined with other slices
  [],
  [],
  AssessmentSlice
> = (set, get) => ({
  // Initial state
  assessments: {},
  isAssessmentsLoading: false,
  assessmentError: null,
  assessmentLastFetch: null,

  currentAssessmentFlow: null,
  showAssessmentResults: false,
  isGeneratingReport: false,

  // Data operations
  loadAssessments: async (userId, forceRefresh = false) => {
    const { isAssessmentsLoading, assessmentLastFetch, setAssessmentsLoading, setAssessmentError, setAssessments } = get()

    // Prevent concurrent loads
    if (isAssessmentsLoading) return

    // Check if data is fresh (unless force refresh)
    if (!forceRefresh && assessmentLastFetch && Date.now() - assessmentLastFetch < 300000) { // 5 minutes
      return
    }

    setAssessmentsLoading(true)
    setAssessmentError(null)

    try {

      const assessments = await assessmentService.getAssessments(userId)

      // Convert array to object keyed by assessmentId
      const assessmentsMap = assessments.reduce((acc, assessment) => {
        acc[assessment.assessmentId] = assessment
        return acc
      }, {} as Record<string, AssessmentResult>)

      setAssessments(assessmentsMap)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load assessments'
      setAssessmentError(errorMessage)
    } finally {
      setAssessmentsLoading(false)
    }
  },

  saveAssessment: async (userId, assessmentData) => {
    console.log(`🔍 ASSESSMENT SLICE TRACE: saveAssessment called`)
    console.log(`🔍 ASSESSMENT SLICE TRACE: Input params:`, {
      userId,
      assessmentDataKeys: Object.keys(assessmentData),
      assessmentId: assessmentData.assessmentId || assessmentData.id,
      hasScore: !!assessmentData.score,
      hasResponses: !!assessmentData.responses
    })

    const { setAssessmentsLoading, setAssessmentError, assessments, setAssessments } = get()

    setAssessmentsLoading(true)
    setAssessmentError(null)

    try {
      console.log(`🔍 ASSESSMENT SLICE TRACE: Calling assessmentService.saveAssessment`)
      const savedAssessment = await assessmentService.saveAssessment(userId, assessmentData)
      console.log(`🔍 ASSESSMENT SLICE TRACE: assessmentService.saveAssessment result:`, savedAssessment)

      // Update local state
      setAssessments({
        ...assessments,
      })
      console.log(`🔍 ASSESSMENT SLICE TRACE: Successfully updated local state`)
      return true
    } catch (error) {
      console.error(`🔍 ASSESSMENT SLICE TRACE: Error in saveAssessment:`, {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack?.split('\n').slice(0, 3) : undefined
      })
      const errorMessage = error instanceof Error ? error.message : 'Failed to save assessment'
      setAssessmentError(errorMessage)
      return false
    } finally {
      console.log(`🔍 ASSESSMENT SLICE TRACE: saveAssessment completed, setting loading to false`)
      setAssessmentsLoading(false)
    }
  },

  deleteAssessment: async (userId, assessmentId) => {
    const { setAssessmentsLoading, setAssessmentError, assessments, setAssessments } = get()

    setAssessmentsLoading(true)
    setAssessmentError(null)

    try {

      await assessmentService.deleteAssessment(userId, assessmentId)

      // Update local state
      const updatedAssessments = { ...assessments }
      delete updatedAssessments[assessmentId]
      setAssessments(updatedAssessments)

      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete assessment'
      setAssessmentError(errorMessage)
      return false
    } finally {
      setAssessmentsLoading(false)
    }
  },

  generateLifeImpacts: async (userId) => {
    const { setGeneratingReport, setAssessmentError } = get()

    setGeneratingReport(true)
    setAssessmentError(null)

    try {

      const lifeImpacts = await assessmentService.generateLifeImpacts(userId)

      return lifeImpacts
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate life impacts'
      setAssessmentError(errorMessage)
      throw error
    } finally {
      setGeneratingReport(false)
    }
  },

  // UI operations
  startAssessmentFlow: (flowId) => {
    set({
      currentAssessmentFlow: flowId,
      showAssessmentResults: false
    })
  },

  completeAssessmentFlow: () => {
    set({
      currentAssessmentFlow: null,
      showAssessmentResults: true
    })
  },

  setShowAssessmentResults: (show) => {
    set({ showAssessmentResults: show })
  },

  setGeneratingReport: (generating) => {
    set({ isGeneratingReport: generating })
  },

  // State setters
  setAssessments: (assessments) => {
    set({ assessments, assessmentLastFetch: Date.now() })
  },

  setAssessmentsLoading: (isAssessmentsLoading) => {
    set({ isAssessmentsLoading })
  },

  setAssessmentError: (assessmentError) => {
    set({ assessmentError })
  },

  clearAssessments: () => {
    set({
      assessments: {},
      assessmentError: null,
      assessmentLastFetch: null,
      currentAssessmentFlow: null,
      showAssessmentResults: false,
      isGeneratingReport: false
    })
  },

  // Computed getters
  assessmentList: () => {
    const { assessments } = get()
    return Object.values(assessments)
  },

  completedCount: () => {
    const { assessments } = get()
    return Object.keys(assessments).length
  },

  hasAssessments: () => {
    const { assessments } = get()
    return Object.keys(assessments).length > 0
  },

  getAssessment: (assessmentId) => {
    const { assessments } = get()
    return assessments[assessmentId] || null
  },

  getAssessmentStats: () => {
    const { assessments } = get()
    const assessmentList = Object.values(assessments)

    if (assessmentList.length === 0) {
      return {
        totalAssessments: 0,
        uniqueTypes: 0,
        types: [],
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0
      }
    }

    const types = [...new Set(assessmentList.map(a => a.assessmentId))]
    const scores = assessmentList.map(a => a.score)

    return {
      totalAssessments: assessmentList.length,
      uniqueTypes: types.length,
      types,
      averageScore: scores.reduce((sum, score) => sum + score, 0) / scores.length,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores)
    }
  }
})
