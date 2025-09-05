/**
 * Store Hooks
 * Convenient hooks for accessing Zustand stores
 */

import { useAuthStore } from '@/stores/authStore'
import { useAssessmentStore } from '@/stores/assessmentStore'
import { useChatStore } from '@/stores/chatStore'
import { useProfileStore } from '@/stores/profileStore'

// Re-export individual stores
export { useAuthStore, useAssessmentStore, useChatStore, useProfileStore }

// Composite hooks for common use cases

/**
 * Hook for authentication state
 */
export function useAuth() {
  const {
    user,
    profile,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateProfile,
    refreshProfile
  } = useAuthStore()

  return {
    user,
    profile,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateProfile,
    refreshProfile
  }
}

/**
 * Hook for assessment state
 */
export function useAssessment() {
  const {
    currentFlow,
    currentAssessmentId,
    selectedAssessments,
    results,
    userProfile,
    completedAssessments,
    progressPercentage,
    isLoading,
    isProcessingResults,
    showResults,
    startAssessmentFlow,
    completeAssessment,
    completeAssessmentFlow,
    setResults,
    setUserProfile,
    setLoading,
    setProcessingResults,
    setShowResults,
    updateProgress,
    resetAssessmentState,
    clearResults
  } = useAssessmentStore()

  return {
    currentFlow,
    currentAssessmentId,
    selectedAssessments,
    results,
    userProfile,
    completedAssessments,
    progressPercentage,
    isLoading,
    isProcessingResults,
    showResults,
    startAssessmentFlow,
    completeAssessment,
    completeAssessmentFlow,
    setResults,
    setUserProfile,
    setLoading,
    setProcessingResults,
    setShowResults,
    updateProgress,
    resetAssessmentState,
    clearResults
  }
}

/**
 * Hook for chat state
 */
export function useChat() {
  const {
    currentSessionId,
    currentSession,
    messages,
    messageCount,
    assessmentContext,
    contextLastUpdated,
    conversationAnalysis,
    isTyping,
    isLoadingContext,
    error,
    startNewSession,
    endCurrentSession,
    addMessage,
    sendMessage,
    receiveMessage,
    setAssessmentContext,
    setTyping,
    setLoadingContext,
    setError,
    refreshAssessmentContext,
    resetChatState
  } = useChatStore()

  return {
    currentSessionId,
    currentSession,
    messages,
    messageCount,
    assessmentContext,
    contextLastUpdated,
    conversationAnalysis,
    isTyping,
    isLoadingContext,
    error,
    startNewSession,
    endCurrentSession,
    addMessage,
    sendMessage,
    receiveMessage,
    setAssessmentContext,
    setTyping,
    setLoadingContext,
    setError,
    refreshAssessmentContext,
    resetChatState
  }
}

/**
 * Hook for profile state
 */
export function useProfile() {
  const {
    profile,
    assessmentProfile,
    isLoading,
    isUpdating,
    lastUpdated,
    error,
    updateProfile,
    updateAssessmentProfile,
    refreshProfile,
    updateProfileAsync,
    addCredits,
    spendCredits,
    clearProfile,
    hasValidProfile
  } = useProfileStore()

  return {
    profile,
    assessmentProfile,
    isLoading,
    isUpdating,
    lastUpdated,
    error,
    updateProfile,
    updateAssessmentProfile,
    refreshProfile,
    updateProfileAsync,
    addCredits,
    spendCredits,
    clearProfile,
    hasValidProfile
  }
}

/**
 * Hook for app-wide state
 */
export function useAppState() {
  const auth = useAuthStore()
  const assessment = useAssessmentStore()
  const chat = useChatStore()
  const profile = useProfileStore()

  const isAppReady = !auth.isLoading && !assessment.isLoading && !chat.isLoadingContext && !profile.isLoading
  const hasErrors = !!(auth.user && (assessment.error || chat.error || profile.error))

  return {
    isAppReady,
    hasErrors,
    auth,
    assessment,
    chat,
    profile
  }
}
