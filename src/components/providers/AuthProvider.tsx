'use client'

import React, { createContext, useContext, useEffect } from 'react'
import { useAuthStore, useAuth } from '@/stores/authStore'

interface AuthContextType {
  user: any
  profile: any
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (profile: any) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth()
  const { initialize } = useAuthStore()

  // Initialize auth on mount
  useEffect(() => {
    console.log('🚀 AuthProvider: Initializing')
    initialize()
  }, [initialize])

  const value: AuthContextType = {
    user: auth.user,
    profile: auth.profile,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    isInitialized: auth.isInitialized,
    signIn: auth.signIn,
    signUp: auth.signUp,
    signOut: auth.signOut,
    refreshProfile: auth.refreshProfile,
    updateProfile: auth.updateProfile
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