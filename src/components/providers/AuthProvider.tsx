'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }

  const loadProfile = async (userId: string) => {
    const profileData = await fetchProfile(userId)
    setProfile(profileData)

    // Check if user needs onboarding (new user with default values)
    if (profileData && profileData.preferred_mode === 'both' && profileData.emotional_capacity === 'medium') {
      // Check if they have any mood entries (indicating they've completed onboarding)
      const { data: moodEntries } = await supabase
        .from('mood_entries')
        .select('id')
        .eq('user_id', userId)
        .limit(1)

      setNeedsOnboarding(!moodEntries || moodEntries.length === 0)
    } else {
      setNeedsOnboarding(false)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id)
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) throw sessionError

        setUser(session?.user ?? null)

        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setProfile(null)
        }
      } catch (err) {
        console.error('Error initializing auth:', err)
        setError('Failed to initialize authentication')
        setUser(null)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setLoading(true)
      try {
        setUser(session?.user ?? null)

        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setProfile(null)
        }
      } catch (err) {
        console.error('Error handling auth change:', err)
        setError('Failed to handle authentication change')
        setUser(null)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    })

      return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const value = {
    user,
    profile,
    loading,
    needsOnboarding,
    signOut,
    refreshProfile,
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
