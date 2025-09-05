/**
 * Assessment Store
 * Manages assessment state, progress, and results
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AssessmentResult } from '@/data/assessments'
import { UserProfile } from '@/data/assessment-integration'

interface AssessmentState {
  // Current assessment flow
  currentFlow: string | null
  currentAssessmentId: string | null
  selectedAssessments: string[]

  // Assessment results
  results: Record<string, AssessmentResult>
  userProfile: UserProfile | null

  // Progress tracking
  completedAssessments: Record<string, boolean>
  progressPercentage: number

  // UI state
  isLoading: boolean
  isProcessingResults: boolean
  showResults: boolean

  // Actions
  setCurrentFlow: (flow: string | null) => void
  setCurrentAssessmentId: (assessmentId: string | null) => void
  setSelectedAssessments: (assessments: string[]) => void

  startAssessmentFlow: (flowId: string, assessmentIds?: string[]) => void
  completeAssessment: (assessmentId: string, result: AssessmentResult) => void
  completeAssessmentFlow: (results: Record<string, AssessmentResult>, userProfile: UserProfile) => void

  setResults: (results: Record<string, AssessmentResult>) => void
  setUserProfile: (profile: UserProfile | null) => void

  setLoading: (loading: boolean) => void
  setProcessingResults: (processing: boolean) => void
  setShowResults: (show: boolean) => void

  // Progress actions
  updateProgress: (assessmentId: string, completed: boolean) => void
  calculateProgress: () => void

  // Reset actions
  resetAssessmentState: () => void
  clearResults: () => void
}

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentFlow: null,
      currentAssessmentId: null,
      selectedAssessments: [],

      results: {},
      userProfile: null,

      completedAssessments: {},
      progressPercentage: 0,

      isLoading: false,
      isProcessingResults: false,
      showResults: false,

      // Basic setters
      setCurrentFlow: (flow) => set({ currentFlow: flow }),

      setCurrentAssessmentId: (assessmentId) => set({ currentAssessmentId: assessmentId }),

      setSelectedAssessments: (assessments) => set({ selectedAssessments: assessments }),

      // Flow management
      startAssessmentFlow: (flowId, assessmentIds = []) => {
        console.log('📋 Assessment store: Starting flow', { flowId, assessmentIds })
        set({
          currentFlow: flowId,
          selectedAssessments: assessmentIds,
          currentAssessmentId: assessmentIds[0] || null,
          showResults: false,
          isLoading: false
        })
      },

      completeAssessment: (assessmentId, result) => {
        console.log('✅ Assessment store: Assessment completed', { assessmentId, score: result.score })
        const { results, completedAssessments } = get()

        const updatedResults = { ...results, [assessmentId]: result }
        const updatedCompleted = { ...completedAssessments, [assessmentId]: true }

        set({
          results: updatedResults,
          completedAssessments: updatedCompleted,
          currentAssessmentId: null
        })

        get().calculateProgress()
      },

      completeAssessmentFlow: (results, userProfile) => {
        console.log('🎯 Assessment store: Flow completed', {
          assessmentCount: Object.keys(results).length,
          hasProfile: !!userProfile
        })

        set({
          results,
          userProfile,
          currentFlow: null,
          selectedAssessments: [],
          currentAssessmentId: null,
          showResults: true,
          isProcessingResults: false
        })

        get().calculateProgress()
      },

      // Data setters
      setResults: (results) => set({ results }),

      setUserProfile: (profile) => set({ userProfile: profile }),

      // UI state setters
      setLoading: (loading) => set({ isLoading: loading }),

      setProcessingResults: (processing) => set({ isProcessingResults: processing }),

      setShowResults: (show) => set({ showResults }),

      // Progress management
      updateProgress: (assessmentId, completed) => {
        console.log('📊 Assessment store: Updating progress', { assessmentId, completed })
        const { completedAssessments } = get()
        const updatedCompleted = { ...completedAssessments, [assessmentId]: completed }

        set({ completedAssessments: updatedCompleted })
        get().calculateProgress()
      },

      calculateProgress: () => {
        const { completedAssessments } = get()
        const totalAssessments = ['phq9', 'gad7', 'ace', 'cd-risc', 'pss10', 'who5', 'pcl5']
        const completedCount = totalAssessments.filter(id => completedAssessments[id]).length
        const percentage = Math.round((completedCount / totalAssessments.length) * 100)

        console.log('📈 Assessment store: Progress calculated', { completedCount, total: totalAssessments.length, percentage })

        set({ progressPercentage: percentage })
      },

      // Reset actions
      resetAssessmentState: () => {
        console.log('🔄 Assessment store: Resetting state')
        set({
          currentFlow: null,
          currentAssessmentId: null,
          selectedAssessments: [],
          showResults: false,
          isLoading: false,
          isProcessingResults: false
        })
      },

      clearResults: () => {
        console.log('🗑️ Assessment store: Clearing results')
        set({
          results: {},
          userProfile: null,
          completedAssessments: {},
          progressPercentage: 0,
          showResults: false
        })
      }
    }),
    {
      name: 'assessment-storage',
      partialize: (state) => ({
        results: state.results,
        userProfile: state.userProfile,
        completedAssessments: state.completedAssessments,
        progressPercentage: state.progressPercentage
      })
    }
  )
)
