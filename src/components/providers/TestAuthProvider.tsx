'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Profile } from '@/types'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  needsOnboarding: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function TestAuthProvider({ children }: { children: React.ReactNode }) {
  // Simulate a logged-in user for testing
  const [user, setUser] = useState<User | null>({
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: { display_name: 'Test User' },
    app_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    email_confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    role: 'authenticated',
    factors: null,
    identities: [],
    phone: null,
    phone_confirmed_at: null,
    confirmation_sent_at: null,
    recovery_sent_at: null,
    email_change_sent_at: null,
    new_email: null,
    new_phone: null,
    invited_at: null,
    action_link: null,
    email_change: null,
    phone_change: null,
    reauthentication_sent_at: null,
    reauthentication_token: null,
    is_sso_user: false,
    deleted_at: null,
    is_anonymous: false
  } as User)
  
  const [profile, setProfile] = useState<Profile | null>({
    id: 'test-user-id',
    display_name: 'Test User',
    username: 'testuser',
    avatar_url: null,
    bio: 'Test user for debugging',
    empathy_credits: 50,
    total_credits_earned: 100,
    total_credits_spent: 50,
    emotional_capacity: 'medium',
    preferred_mode: 'both',
    is_anonymous: false,
    last_active: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })
  
  const [loading, setLoading] = useState(false) // Start with false to bypass loading
  const [needsOnboarding, setNeedsOnboarding] = useState(false) // User has completed onboarding

  const signOut = async () => {
    console.log('Test sign out')
    setUser(null)
    setProfile(null)
  }

  const refreshProfile = async () => {
    console.log('Test refresh profile')
  }

  const value = {
    user,
    profile,
    loading,
    needsOnboarding,
    signOut,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
