/**
 * Unified Application Data Store
 * Centralized state management for all application data using DataService
 */

'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DataService } from '@/lib/api/DataService'
import { AssessmentResult } from '@/data/assessments'
import { Profile } from '@/types'
import { OverallAssessmentResult } from '@/lib/services/OverallAssessmentService'
import { ChatSession, MoodEntry, ListeningSession, LifeImpactsResult } from '@/lib/api/DataService'

// State interfaces
interface LoadingState {
  assessments: boolean
  profile: boolean
  chat: boolean
  mood: boolean
  listening: boolean
  overall: boolean
  lifeImpacts: boolean
}

interface ErrorState {
  assessments: string | null
  profile: string | null
  chat: string | null
  mood: string | null
  listening: string | null
  overall: string | null
  lifeImpacts: string | null
}

interface AppDataState {
  // Data
  assessments: Record<string, AssessmentResult>
  profile: Profile | null
  chatSessions: ChatSession[]
  moodEntries: MoodEntry[]
  listeningSessions: ListeningSession[]
  overallAssessment: OverallAssessmentResult | null
  lifeImpacts: LifeImpactsResult | null

  // Loading states
  loading: LoadingState

  // Error states
  errors: ErrorState

  // Last fetch timestamps
  lastFetch: {
    assessments: number | null
    profile: number | null
    chat: number | null
    mood: number | null
    listening: number | null
    overall: number | null
    lifeImpacts: number | null
  }

  // Actions
  fetchAssessments: (userId: string, forceRefresh?: boolean) => Promise<void>
  fetchProfile: (userId: string, forceRefresh?: boolean) => Promise<void>
  fetchChatSessions: (userId: string, forceRefresh?: boolean) => Promise<void>
  fetchMoodEntries: (userId: string, limit?: number) => Promise<void>
  fetchListeningSessions: (userId: string, limit?: number) => Promise<void>
  fetchOverallAssessment: (userId: string, forceRefresh?: boolean) => Promise<void>
  generateLifeImpacts: (userId: string) => Promise<void>
  refreshAllData: (userId: string) => Promise<void>

  // Data operations
  saveAssessment: (userId: string, assessment: any) => Promise<boolean>
  deleteAssessment: (userId: string, assessmentId: string) => Promise<boolean>
  updateProfile: (userId: string, profileData: Partial<Profile>) => Promise<boolean>
  saveMoodEntry: (userId: string, mood: string, intensity: number, notes?: string) => Promise<boolean>
  saveListeningSession: (userId: string, duration: number, type: string) => Promise<boolean>

  // Utility actions
  clearErrors: () => void
  clearData: () => void
  setLoading: (key: keyof LoadingState, loading: boolean) => void
  setError: (key: keyof ErrorState, error: string | null) => void

  // Computed getters
  getAssessmentsArray: () => AssessmentResult[]
  getLatestAssessment: (assessmentId: string) => AssessmentResult | null
  getAssessmentCount: () => number
  getMoodTrend: (days?: number) => MoodEntry[]
  getListeningStats: () => { totalDuration: number; sessionCount: number }
  isDataStale: (key: keyof LoadingState, maxAge?: number) => boolean
}

// Initial state
const initialLoadingState: LoadingState = {
  assessments: false,
  profile: false,
  chat: false,
  mood: false,
  listening: false,
  overall: false,
  lifeImpacts: false
}

const initialErrorState: ErrorState = {
  assessments: null,
  profile: null,
  chat: null,
  mood: null,
  listening: null,
  overall: null,
  lifeImpacts: null
}

const initialLastFetch = {
  assessments: null,
  profile: null,
  chat: null,
  mood: null,
  listening: null,
  overall: null,
  lifeImpacts: null
}

export const useAppDataStore = create<AppDataState>()(
  persist(
    (set, get) => ({
      // Initial state
      assessments: {},
      profile: null,
      chatSessions: [],
      moodEntries: [],
      listeningSessions: [],
      overallAssessment: null,
      lifeImpacts: null,
      loading: initialLoadingState,
      errors: initialErrorState,
      lastFetch: initialLastFetch,

      // Assessment operations
      fetchAssessments: async (userId: string, forceRefresh: boolean = false) => {
        const { loading, lastFetch } = get()
        
        // Skip if already loading
        if (loading.assessments) return

        // Skip if data is fresh and not forcing refresh
        if (!forceRefresh && lastFetch.assessments && Date.now() - lastFetch.assessments < 300000) {
          console.log('📊 AppDataStore: Using cached assessments')
          return
        }

        set(state => ({
          loading: { ...state.loading, assessments: true },
          errors: { ...state.errors, assessments: null }
        }))

        try {
          console.log('📊 AppDataStore: Fetching assessments...')
          const assessments = await DataService.getAssessments(userId, forceRefresh)
          
          // Convert array to object keyed by assessmentId
          const assessmentsMap = assessments.reduce((acc, assessment) => {
            acc[assessment.assessmentId] = assessment
            return acc
          }, {} as Record<string, AssessmentResult>)

          set(state => ({
            assessments: assessmentsMap,
            loading: { ...state.loading, assessments: false },
            lastFetch: { ...state.lastFetch, assessments: Date.now() }
          }))

          console.log(`✅ AppDataStore: Fetched ${assessments.length} assessments`)
        } catch (error) {
          console.error('❌ AppDataStore: Failed to fetch assessments:', error)
          set(state => ({
            loading: { ...state.loading, assessments: false },
            errors: { ...state.errors, assessments: error instanceof Error ? error.message : 'Failed to fetch assessments' }
          }))
        }
      },

      fetchProfile: async (userId: string, forceRefresh: boolean = false) => {
        const { loading, lastFetch } = get()
        
        if (loading.profile) return

        if (!forceRefresh && lastFetch.profile && Date.now() - lastFetch.profile < 600000) {
          console.log('👤 AppDataStore: Using cached profile')
          return
        }

        set(state => ({
          loading: { ...state.loading, profile: true },
          errors: { ...state.errors, profile: null }
        }))

        try {
          console.log('👤 AppDataStore: Fetching profile...')
          const profile = await DataService.getProfile(userId, forceRefresh)
          
          set(state => ({
            profile,
            loading: { ...state.loading, profile: false },
            lastFetch: { ...state.lastFetch, profile: Date.now() }
          }))

          console.log('✅ AppDataStore: Profile fetched successfully')
        } catch (error) {
          console.error('❌ AppDataStore: Failed to fetch profile:', error)
          set(state => ({
            loading: { ...state.loading, profile: false },
            errors: { ...state.errors, profile: error instanceof Error ? error.message : 'Failed to fetch profile' }
          }))
        }
      },

      fetchChatSessions: async (userId: string, forceRefresh: boolean = false) => {
        const { loading, lastFetch } = get()
        
        if (loading.chat) return

        if (!forceRefresh && lastFetch.chat && Date.now() - lastFetch.chat < 300000) {
          console.log('💬 AppDataStore: Using cached chat sessions')
          return
        }

        set(state => ({
          loading: { ...state.loading, chat: true },
          errors: { ...state.errors, chat: null }
        }))

        try {
          console.log('💬 AppDataStore: Fetching chat sessions...')
          const chatSessions = await DataService.getChatSessions(userId, forceRefresh)
          
          set(state => ({
            chatSessions,
            loading: { ...state.loading, chat: false },
            lastFetch: { ...state.lastFetch, chat: Date.now() }
          }))

          console.log(`✅ AppDataStore: Fetched ${chatSessions.length} chat sessions`)
        } catch (error) {
          console.error('❌ AppDataStore: Failed to fetch chat sessions:', error)
          set(state => ({
            loading: { ...state.loading, chat: false },
            errors: { ...state.errors, chat: error instanceof Error ? error.message : 'Failed to fetch chat sessions' }
          }))
        }
      },

      fetchMoodEntries: async (userId: string, limit: number = 30) => {
        const { loading } = get()
        
        if (loading.mood) return

        set(state => ({
          loading: { ...state.loading, mood: true },
          errors: { ...state.errors, mood: null }
        }))

        try {
          console.log('😊 AppDataStore: Fetching mood entries...')
          const moodEntries = await DataService.getMoodEntries(userId, limit)
          
          set(state => ({
            moodEntries,
            loading: { ...state.loading, mood: false },
            lastFetch: { ...state.lastFetch, mood: Date.now() }
          }))

          console.log(`✅ AppDataStore: Fetched ${moodEntries.length} mood entries`)
        } catch (error) {
          console.error('❌ AppDataStore: Failed to fetch mood entries:', error)
          set(state => ({
            loading: { ...state.loading, mood: false },
            errors: { ...state.errors, mood: error instanceof Error ? error.message : 'Failed to fetch mood entries' }
          }))
        }
      },

      fetchListeningSessions: async (userId: string, limit: number = 20) => {
        const { loading } = get()
        
        if (loading.listening) return

        set(state => ({
          loading: { ...state.loading, listening: true },
          errors: { ...state.errors, listening: null }
        }))

        try {
          console.log('🎧 AppDataStore: Fetching listening sessions...')
          const listeningSessions = await DataService.getListeningSessions(userId, limit)
          
          set(state => ({
            listeningSessions,
            loading: { ...state.loading, listening: false },
            lastFetch: { ...state.lastFetch, listening: Date.now() }
          }))

          console.log(`✅ AppDataStore: Fetched ${listeningSessions.length} listening sessions`)
        } catch (error) {
          console.error('❌ AppDataStore: Failed to fetch listening sessions:', error)
          set(state => ({
            loading: { ...state.loading, listening: false },
            errors: { ...state.errors, listening: error instanceof Error ? error.message : 'Failed to fetch listening sessions' }
          }))
        }
      },

      fetchOverallAssessment: async (userId: string, forceRefresh: boolean = false) => {
        const { loading, lastFetch } = get()
        
        if (loading.overall) return

        if (!forceRefresh && lastFetch.overall && Date.now() - lastFetch.overall < 600000) {
          console.log('🔍 AppDataStore: Using cached overall assessment')
          return
        }

        set(state => ({
          loading: { ...state.loading, overall: true },
          errors: { ...state.errors, overall: null }
        }))

        try {
          console.log('🔍 AppDataStore: Fetching overall assessment...')
          const overallAssessment = await DataService.getOverallAssessment(userId, forceRefresh)
          
          set(state => ({
            overallAssessment,
            loading: { ...state.loading, overall: false },
            lastFetch: { ...state.lastFetch, overall: Date.now() }
          }))

          console.log('✅ AppDataStore: Overall assessment fetched successfully')
        } catch (error) {
          console.error('❌ AppDataStore: Failed to fetch overall assessment:', error)
          set(state => ({
            loading: { ...state.loading, overall: false },
            errors: { ...state.errors, overall: error instanceof Error ? error.message : 'Failed to fetch overall assessment' }
          }))
        }
      },

      generateLifeImpacts: async (userId: string) => {
        const { loading } = get()
        
        if (loading.lifeImpacts) return

        set(state => ({
          loading: { ...state.loading, lifeImpacts: true },
          errors: { ...state.errors, lifeImpacts: null }
        }))

        try {
          console.log('🧠 AppDataStore: Generating life impacts...')
          const lifeImpacts = await DataService.generateLifeImpacts(userId)
          
          set(state => ({
            lifeImpacts,
            loading: { ...state.loading, lifeImpacts: false },
            lastFetch: { ...state.lastFetch, lifeImpacts: Date.now() }
          }))

          console.log('✅ AppDataStore: Life impacts generated successfully')
        } catch (error) {
          console.error('❌ AppDataStore: Failed to generate life impacts:', error)
          set(state => ({
            loading: { ...state.loading, lifeImpacts: false },
            errors: { ...state.errors, lifeImpacts: error instanceof Error ? error.message : 'Failed to generate life impacts' }
          }))
        }
      },

      refreshAllData: async (userId: string) => {
        console.log('🔄 AppDataStore: Refreshing all data...')
        
        const { refreshAllData } = get()
        
        try {
          const data = await DataService.refreshAllData(userId)
          
          // Convert assessments array to object
          const assessmentsMap = data.assessments.reduce((acc, assessment) => {
            acc[assessment.assessmentId] = assessment
            return acc
          }, {} as Record<string, AssessmentResult>)

          set({
            assessments: assessmentsMap,
            profile: data.profile,
            moodEntries: data.moodEntries,
            listeningSessions: data.listeningSessions,
            overallAssessment: data.overallAssessment,
            lastFetch: {
              assessments: Date.now(),
              profile: Date.now(),
              chat: Date.now(),
              mood: Date.now(),
              listening: Date.now(),
              overall: Date.now(),
              lifeImpacts: Date.now()
            }
          })

          console.log('✅ AppDataStore: All data refreshed successfully')
        } catch (error) {
          console.error('❌ AppDataStore: Failed to refresh all data:', error)
        }
      },

      // Data operations
      saveAssessment: async (userId: string, assessment: any) => {
        try {
          const success = await DataService.saveAssessment(userId, assessment)
          if (success) {
            // Update local state - handle different object structures
            const assessmentKey = assessment.assessmentId || assessment.id || 'unknown'
            set(state => ({
              assessments: { ...state.assessments, [assessmentKey]: assessment }
            }))
          }
          return success
        } catch (error) {
          console.error('❌ AppDataStore: Failed to save assessment:', error)
          return false
        }
      },

      deleteAssessment: async (userId: string, assessmentId: string) => {
        try {
          const success = await DataService.deleteAssessment(userId, assessmentId)
          if (success) {
            // Remove from local state
            set(state => {
              const newAssessments = { ...state.assessments }
              delete newAssessments[assessmentId]
              return { assessments: newAssessments }
            })
          }
          return success
        } catch (error) {
          console.error('❌ AppDataStore: Failed to delete assessment:', error)
          return false
        }
      },

      updateProfile: async (userId: string, profileData: Partial<Profile>) => {
        try {
          const success = await DataService.updateProfile(userId, profileData)
          if (success) {
            // Update local state
            set(state => ({
              profile: state.profile ? { ...state.profile, ...profileData } : null
            }))
          }
          return success
        } catch (error) {
          console.error('❌ AppDataStore: Failed to update profile:', error)
          return false
        }
      },

      saveMoodEntry: async (userId: string, mood: string, intensity: number, notes?: string) => {
        try {
          const success = await DataService.saveMoodEntry(userId, mood, intensity, notes)
          if (success) {
            // Refresh mood entries
            get().fetchMoodEntries(userId)
          }
          return success
        } catch (error) {
          console.error('❌ AppDataStore: Failed to save mood entry:', error)
          return false
        }
      },

      saveListeningSession: async (userId: string, duration: number, type: string) => {
        try {
          const success = await DataService.saveListeningSession(userId, duration, type)
          if (success) {
            // Refresh listening sessions
            get().fetchListeningSessions(userId)
          }
          return success
        } catch (error) {
          console.error('❌ AppDataStore: Failed to save listening session:', error)
          return false
        }
      },

      // Utility actions
      clearErrors: () => {
        set({ errors: initialErrorState })
      },

      clearData: () => {
        set({
          assessments: {},
          profile: null,
          chatSessions: [],
          moodEntries: [],
          listeningSessions: [],
          overallAssessment: null,
          lifeImpacts: null,
          lastFetch: initialLastFetch
        })
      },

      setLoading: (key: keyof LoadingState, loading: boolean) => {
        set(state => ({
          loading: { ...state.loading, [key]: loading }
        }))
      },

      setError: (key: keyof ErrorState, error: string | null) => {
        set(state => ({
          errors: { ...state.errors, [key]: error }
        }))
      },

      // Computed getters
      getAssessmentsArray: () => {
        const { assessments } = get()
        return Object.values(assessments)
      },

      getLatestAssessment: (assessmentId: string) => {
        const { assessments } = get()
        return assessments[assessmentId] || null
      },

      getAssessmentCount: () => {
        const { assessments } = get()
        return Object.keys(assessments).length
      },

      getMoodTrend: (days: number = 7) => {
        const { moodEntries } = get()
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - days)
        
        return moodEntries.filter(entry => 
          new Date(entry.createdAt) >= cutoffDate
        )
      },

      getListeningStats: () => {
        const { listeningSessions } = get()
        return {
          totalDuration: listeningSessions.reduce((sum, session) => sum + session.duration, 0),
          sessionCount: listeningSessions.length
        }
      },

      isDataStale: (key: keyof LoadingState, maxAge: number = 300000) => {
        const { lastFetch } = get()
        const lastFetchTime = lastFetch[key]
        if (!lastFetchTime) return true
        return Date.now() - lastFetchTime > maxAge
      }
    }),
    {
      name: 'app-data-storage',
      partialize: (state) => ({
        assessments: state.assessments,
        profile: state.profile,
        lastFetch: state.lastFetch
      })
    }
  )
)
