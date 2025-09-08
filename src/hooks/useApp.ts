/**
 * Centralized App Hook
 * Single interface for all app state and operations
 * Components should only use this hook for data and operations
 */

import { useEffect } from 'react'
import { useAppStore } from '@/stores'
import { AssessmentResult } from '@/data/assessments'
import { Profile } from '@/types'
import { profileService } from '@/services/ProfileService'

// Main app hook interface
export interface UseAppReturn {
  // Auth state and operations
  auth: {
    user: any
    profile: any
    isAuthenticated: boolean
    isLoading: boolean
    isInitialized: boolean
    isOnline: boolean
    currentError: any
    signIn: (email: string, password: string) => Promise<any>
    signUp: (email: string, password: string, displayName: string) => Promise<any>
    signOut: () => Promise<void>
    signInWithOAuth: (provider: string) => Promise<any>
    requestPasswordReset: (email: string) => Promise<any>
    updatePassword: (password: string) => Promise<any>
    refreshProfile: () => Promise<void>
    updateProfile: (profile: any) => void
    clearError: () => void
  }

  // Profile state and operations
  profile: {
    profile: any
    isProfileLoading: boolean
    profileError: any
    loadProfile: (userId: string) => Promise<void>
    updateProfile: (profile: any) => Promise<void>
    createProfile: (userId: string, profile: any) => Promise<void>
  }

  // Assessment state and operations
  assessment: {
    assessments: any[]
    assessmentsLoading: boolean
    assessmentError: any
    saveAssessment: (userId: string, data: any) => Promise<any>
    loadAssessments: (userId: string) => Promise<void>
    getAssessment: (assessmentId: string) => any
  }

  // Chat state and operations
  chat: {
    messages: any[]
    currentSession: any
    isTyping: boolean
    chatError: any
    initializeChatSession: (userId: string) => Promise<any>
    sendMessage: (userId: string, message: string) => Promise<any>
    loadChatHistory: (sessionId: string) => Promise<void>
  }

  // UI state and operations
  ui: {
    notifications: any[]
    notificationId: number
    theme: string
    addNotification: (notification: any) => void
    removeNotification: (id: number) => void
    setTheme: (theme: string) => void
  }

  // Utility methods
}

// Main app hook implementation
export function useApp(): UseAppReturn {
  const store = useAppStore()

  // Auto-initialize on mount
  // AuthProvider now handles session initialization; avoid duplicate refresh here.
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Set theme from stored preference
        if (store.theme !== 'auto' && typeof window !== 'undefined') {
          document.documentElement.setAttribute('data-theme', store.theme)
        }
      } catch (error) {
      }
    }

    initializeApp()
  }, [])

  return {
    // Auth
    auth: {
      user: store.user,
      profile: store.profile,
      isAuthenticated: store.isAuthenticated,
      isLoading: store.isLoading,
      isInitialized: store.isInitialized,
      isOnline: true,
      currentError: store.error,
      signIn: store.signIn,
      signUp: store.signUp,
      signOut: store.signOut,
      signInWithOAuth: async () => ({ success: false, error: { message: 'OAuth not implemented' } }),
      requestPasswordReset: async () => ({ success: false, error: { message: 'Password reset not implemented' } }),
      updatePassword: async () => ({ success: false, error: { message: 'Password update not implemented' } }),
      refreshProfile: store.loadProfile,
      updateProfile: store.updateProfile,
      clearError: () => store.setError(null)
    },

    // Profile
    profile: {
      profile: store.profile,
      isProfileLoading: store.isProfileLoading,
      profileError: store.profileError,
      loadProfile: store.loadProfile,
      updateProfile: store.updateProfile,
      createProfile: async (userId: string, profileData: any) => {
        // Create profile using profileService and then load it
        await profileService.createProfile(userId, profileData)
        await store.loadProfile(userId)
      }
    },

    // Assessments
    assessment: {
      assessments: store.assessments,
      assessmentsLoading: store.isAssessmentsLoading,
      assessmentError: store.assessmentError,
      saveAssessment: store.saveAssessment,
      loadAssessments: store.loadAssessments,
      getAssessment: store.getAssessment
    },

    // Chat
    chat: {
      messages: store.messages || [],
      currentSession: store.currentSession || null,
      isTyping: store.isTyping || false,
      chatError: store.chatError || null,
      initializeChatSession: store.initializeChatSession || (async () => null),
      sendMessage: store.sendMessage || (async () => null),
      loadChatHistory: store.loadChatHistory || (async () => {})
    },

    // UI
    ui: {
      notifications: store.notifications || [],
      notificationId: store.notificationId || 0,
      theme: store.theme || 'light',
      addNotification: store.showNotification || (() => {}),
      removeNotification: store.hideNotification || (() => {}),
      setTheme: store.setTheme || (() => {})
    },

    // Utility methods
    refreshSession: async () => {
      await store.refreshSession()
    }
  }
}

// Export convenience hooks for specific domains
// Removed deprecated useAuth hook - use useAuthContext from AuthProvider instead

export const useProfile = () => {
  const app = useApp()
  return app.profile
}

export const useAssessments = () => {
  const app = useApp()
  return app.assessments
}

export const useChat = () => {
  const app = useApp()
  return app.chat
}

export const useUI = () => {
  const app = useApp()
  return app.ui
}

// Export types
export type { UseAppReturn }
