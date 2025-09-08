/**
 * Unified App Store
 * Single source of truth for all application state
 */

import { create } from 'zustand'
import { subscribeWithSelector, devtools, persist } from 'zustand/middleware'
import { createAuthSlice, AuthSlice } from './slices/authSlice'
import { createAssessmentSlice, AssessmentSlice } from './slices/assessmentSlice'
import { createChatSlice, ChatSlice } from './slices/chatSlice'
import { createUiSlice, UiSlice } from './slices/uiSlice'

// Combined store type
export interface AppStore extends
  AuthSlice,
  AssessmentSlice,
  ChatSlice,
  UiSlice {}

// Create the unified store
export const useAppStore = create<AppStore>()(
  devtools(
    subscribeWithSelector(
      persist(
        (...args) => ({
          ...createAuthSlice(...args),
          ...createAssessmentSlice(...args),
          ...createChatSlice(...args),
          ...createUiSlice(...args),
        }),
        {
          name: 'app-store',
          partialize: (state) => ({
            // Auth state - persist user and profile
            user: state.user || null,
            profile: state.profile || null,
            isAuthenticated: state.isAuthenticated || false,

            // Assessment state - persist completed assessments
            assessments: state.assessments || {},
            assessmentLastFetch: state.assessmentLastFetch || null,

            // UI state - persist theme and sidebar state
            theme: state.theme || 'light',
            sidebarOpen: state.sidebarOpen || false

            // Don't persist volatile state: isLoading, errors, modal states, etc.
          }),
          // Enable hydration for session persistence
          onRehydrateStorage: () => (state) => {
            console.log('🔄 [APP_STORE] Rehydrating state from localStorage:', {
              hasState: !!state,
              hasUser: !!state?.user,
              hasProfile: !!state?.profile,
              isAuthenticated: state?.isAuthenticated,
              userId: state?.user?.id,
              userEmail: state?.user?.email,
              timestamp: new Date().toISOString()
            })
            
            if (state) {
              console.log('✅ [APP_STORE] State rehydration completed successfully')
            } else {
              console.log('ℹ️ [APP_STORE] No state to rehydrate (fresh start)')
            }
          }
        }
      )
    ),
    {
      name: 'AppStore',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
)

// Export individual hooks for specific slices (if needed)
// Removed deprecated useAuth hook - use useAuthContext from AuthProvider instead

export const useAssessments = () => {
  const store = useAppStore()
  return {
  }
}

export const useChat = () => {
  const store = useAppStore()
  return {
  }
}

export const useUI = () => {
  const store = useAppStore()
  return {
  }
}

// Export the main store for advanced usage
export { useAppStore as default }

// Export types
export type { AuthSlice } from './slices/authSlice'
export type { AuthSlice as AuthSliceType } from './slices/authSlice'
export type { AssessmentSlice as AssessmentSliceType } from './slices/assessmentSlice'
export type { ChatSlice as ChatSliceType } from './slices/chatSlice'
export type { UiSlice as UiSliceType } from './slices/uiSlice'
