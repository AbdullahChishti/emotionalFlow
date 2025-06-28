import { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ListeningSession = Database['public']['Tables']['listening_sessions']['Row']
export type MoodEntry = Database['public']['Tables']['mood_entries']['Row']
export type EmotionalLaborLog = Database['public']['Tables']['emotional_labor_logs']['Row']

export interface User extends Profile {
  email?: string
}

export interface SessionRequest {
  id: string
  requester: Profile
  sessionType: 'therapist' | 'friend'
  estimatedDuration: number
  urgencyLevel: 'low' | 'medium' | 'high'
  topic?: string
  createdAt: Date
}

export interface MatchingCriteria {
  emotionalCapacity: 'low' | 'medium' | 'high'
  preferredMode: 'therapist' | 'friend' | 'both'
  availableCredits: number
  currentMood: number
  willingToListen: boolean
  seekingSupport: boolean
}

export interface EmotionalMetrics {
  givingReceivingRatio: number
  weeklyGiving: number
  weeklyReceiving: number
  burnoutRiskScore: number
  emotionalCapacityTrend: number[]
  moodTrend: number[]
  totalSessionsCompleted: number
  averageSessionRating: number
}

export interface CreditTransaction {
  id: string
  fromUserId: string
  toUserId: string
  amount: number
  sessionId: string
  type: 'session_payment' | 'bonus' | 'penalty'
  createdAt: Date
}

export interface NotificationSettings {
  sessionRequests: boolean
  creditUpdates: boolean
  moodReminders: boolean
  burnoutWarnings: boolean
  weeklyReports: boolean
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  notifications: NotificationSettings
  privacy: {
    showOnlineStatus: boolean
    allowAnonymousMatching: boolean
    shareEmotionalMetrics: boolean
  }
  accessibility: {
    highContrast: boolean
    reducedMotion: boolean
    fontSize: 'small' | 'medium' | 'large'
  }
}
