'use client'

import React, { createContext, useContext, useEffect, useCallback, useState } from 'react'
import { useAuthStore, useAuth } from '@/stores/authStore'
import { authManager } from '@/lib/services/AuthManager'
import { handleSignOutSuccess, handleSignOutError } from '@/lib/utils/authRedirects'
import { NetworkResilience } from '@/lib/utils/network-resilience'
import { type AuthError } from '@/lib/constants/auth-errors'

interface AuthContextType {
  user: any
  profile: any
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  isOnline: boolean
  currentError: AuthError | null
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: AuthError }>
  signUp: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: AuthError }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (profile: any) => void
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Global flag to prevent multiple initializations
let isAuthInitialized = false

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth()
  const { initialize, isInitialized } = useAuthStore()
  const [isOnline, setIsOnline] = useState(() => NetworkResilience.getIsOnline())
  const [currentError, setCurrentError] = useState<AuthError | null>(null)

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetworkResilience.onConnectionChange((online) => {
      console.log('🌐 AUTH DEBUG: Network status changed:', online ? 'online' : 'offline')
      setIsOnline(online)
    })

    return unsubscribe
  }, [])

  // Initialize AuthManager on mount - only once globally with enhanced error recovery
  useEffect(() => {
    if (!isAuthInitialized && !isInitialized) {
      console.log('🚀 AUTH DEBUG: Initializing AuthManager')
      isAuthInitialized = true
      
      // CRITICAL: Enhanced initialization with retry mechanism
      const initializeWithRetry = async (attempt = 1, maxAttempts = 3) => {
        try {
          await authManager.initialize()
          console.log('✅ AUTH DEBUG: AuthManager initialized successfully')
        } catch (error) {
          console.error('❌ AUTH DEBUG: AuthManager initialization failed:', error, `(attempt ${attempt}/${maxAttempts})`)
          
          if (attempt < maxAttempts) {
            console.log(`🔄 AUTH DEBUG: Retrying AuthManager initialization in ${attempt * 1000}ms`)
            setTimeout(() => {
              initializeWithRetry(attempt + 1, maxAttempts)
            }, attempt * 1000) // Exponential backoff
          } else {
            console.error('❌ AUTH DEBUG: AuthManager initialization failed after all retries')
            // Set a fallback initialized state to prevent infinite loading
            initialize()
          }
        }
      }
      
      initializeWithRetry()
    }
  }, [isInitialized, initialize]) // Added initialize dependency

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Only cleanup if this is the last AuthProvider instance
      // In practice, this would need more sophisticated tracking
    }
  }, [])

  // Wrap AuthManager methods with enhanced error handling and recovery
  const signIn = useCallback(async (email: string, password: string) => {
    setCurrentError(null) // Clear any previous errors

    try {
      const result = await authManager.signIn(email, password)

      if (!result.success && result.error) {
        console.error('❌ AUTH DEBUG: Sign in failed:', result.error.message)
        setCurrentError(result.error)
      }

      return result
    } catch (error) {
      // CRITICAL: Fallback error handling for unexpected errors
      console.error('❌ AUTH DEBUG: Unexpected error in signIn wrapper:', error)
      const fallbackError = {
        code: 'UNKNOWN_ERROR',
        title: 'Sign In Failed',
        message: 'An unexpected error occurred during sign in',
        userMessage: 'Something went wrong. Please try again.',
        canRetry: true,
        severity: 'medium' as const
      }
      setCurrentError(fallbackError)
      return { success: false, error: fallbackError }
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    setCurrentError(null) // Clear any previous errors

    console.log('🚀 [AUTH_PROVIDER_SIGNUP] Starting signup process', {
      email: email.replace(/(.{2}).*@/, '$1***@'),
      displayName: displayName.substring(0, 2) + '***',
      hasPassword: !!password
    })

    try {
      const result = await authManager.signUp(email, password, displayName)

      console.log('📋 [AUTH_PROVIDER_SIGNUP] Signup result:', {
        success: result.success,
        hasError: !!result.error,
        errorType: result.error ? typeof result.error : 'none',
        hasUser: !!result.user
      })

      if (!result.success && result.error) {
        console.error('❌ AUTH_PROVIDER_SIGNUP: Sign up failed:', {
          error: result.error,
          errorType: typeof result.error,
          message: typeof result.error === 'string' ? result.error : result.error.message
        })
        setCurrentError(result.error)
      } else {
        console.log('✅ AUTH_PROVIDER_SIGNUP: Sign up successful')
      }

      return result
    } catch (unexpectedError) {
      console.error('💥 AUTH_PROVIDER_SIGNUP: Unexpected error:', unexpectedError)
      const errorMessage = unexpectedError instanceof Error ? unexpectedError.message : 'Unknown error'
      setCurrentError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  const signOut = useCallback(async () => {
    setCurrentError(null) // Clear any previous errors

    const result = await authManager.signOut()
    if (!result.success && result.error) {
      console.error('❌ AUTH DEBUG: Sign out failed:', result.error.message)
      setCurrentError(result.error)
      handleSignOutError(result.error.message)
    } else {
      handleSignOutSuccess()
    }
  }, [])

  const clearError = useCallback(() => {
    setCurrentError(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    const result = await authManager.refreshSession()
    if (!result.success) {
      console.error('❌ AUTH DEBUG: Session refresh failed:', result.error)
      throw new Error(result.error || 'Session refresh failed')
    }
  }, [])

  const updateProfile = useCallback((profile: any) => {
    // Keep this in the store for now - could be moved to AuthManager later
    auth.updateProfile(profile)
  }, [auth])

  const value: AuthContextType = {
    user: auth.user,
    profile: auth.profile,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    isInitialized: auth.isInitialized,
    isOnline,
    currentError,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    updateProfile,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}