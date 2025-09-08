'use client'

import React, { createContext, useContext, useEffect, useCallback, useState } from 'react'
import { useAppStore } from '@/stores'
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
  signIn: (email: string, password: string) => Promise<{ success: boolean; user?: any; error?: AuthError }>
  signUp: (email: string, password: string, displayName: string) => Promise<{ success: boolean; user?: any; error?: AuthError }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (profile: any) => void
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const store = useAppStore()
  const [isOnline, setIsOnline] = useState(true)

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetworkResilience.onConnectionChange(setIsOnline)
    return unsubscribe
  }, [])

  // Initialize auth state
  useEffect(() => {
    console.log('🚀 [AUTH_PROVIDER] useEffect triggered:', {
      isInitialized: store.isInitialized,
      isLoading: store.isLoading,
      isAuthenticated: store.isAuthenticated,
      hasUser: !!store.user,
      timestamp: new Date().toISOString()
    })
    
    // This effect runs once on mount to check the session
    if (!store.isInitialized) {
      console.log('🔄 [AUTH_PROVIDER] Starting session refresh...')
      store.refreshSession()
    } else {
      console.log('ℹ️ [AUTH_PROVIDER] Already initialized, skipping refresh')
    }
  }, [store.isInitialized, store.refreshSession])

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await store.signIn(email, password)
    if (result.success && result.user) {
      await store.loadProfile(result.user.id)
    }
    return result
  }, [store])

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    const result = await store.signUp(email, password, displayName)
    if (result.success && result.user) {
      await store.loadProfile(result.user.id)
    }
    return result
  }, [store])

  const signOut = useCallback(async () => {
    try {
      await store.signOut()
      handleSignOutSuccess()
    } catch (error: any) {
      handleSignOutError(error.message)
    }
  }, [store])

  const refreshProfile = useCallback(async () => {
    if (store.user?.id) {
      await store.loadProfile(store.user.id)
    }
  }, [store])

  const value: AuthContextType = {
    user: store.user,
    profile: store.profile,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading || !store.isInitialized, // Loading until initialized
    isInitialized: store.isInitialized,
    isOnline,
    currentError: store.error as AuthError | null,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    updateProfile: store.updateProfile,
    clearError: () => store.setError(null)
  }

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
