/**
 * Centralized Data Service
 * Single service for all data operations using the ApiManager
 */

'use client'

import { api } from './ApiManager'
import { AssessmentResult, ASSESSMENTS } from '@/data/assessments'
import { Profile } from '@/types'
import { OverallAssessmentResult } from '@/lib/services/OverallAssessmentService'

// Types
export interface AssessmentHistoryEntry {
  id: string
  assessmentId: string
  userId: string
  responses: Record<string, any>
  score: number
  completedAt: string
  createdAt: string
}

export interface ChatSession {
  id: string
  userId: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  sessionId: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface MoodEntry {
  id: string
  userId: string
  mood: string
  intensity: number
  notes?: string
  createdAt: string
}

export interface ListeningSession {
  id: string
  userId: string
  duration: number
  type: string
  completedAt: string
}

export interface LifeImpactsResult {
  manifestations: string[]
  recommendations: string[]
  severity: 'low' | 'moderate' | 'high' | 'critical'
  confidence: number
}

export class DataService {
  /**
   * Assessment Operations
   */
  static async getAssessments(userId: string, forceRefresh: boolean = false): Promise<AssessmentResult[]> {
    console.log(`📊 DataService: Fetching assessments for user ${userId}`)
    
    const response = await api.query<AssessmentHistoryEntry[]>(
      'assessment_results',
      {
        select: '*',
        match: { user_id: userId },
        order: 'taken_at',
        limit: 1000
      },
      {
        cache: !forceRefresh,
        cacheTTL: 300000, // 5 minutes
        validateAuth: true
      }
    )

    if (!response.success || !response.data) {
      console.error('❌ DataService: Failed to fetch assessments:', response.error)
      return []
    }

    // Transform to AssessmentResult format
    const assessments: AssessmentResult[] = []
    const groupedByType = new Map<string, AssessmentHistoryEntry>()

    // Get latest of each assessment type
    response.data.forEach(entry => {
      const existing = groupedByType.get(entry.assessmentId)
      if (!existing || new Date(entry.completedAt) > new Date(existing.completedAt)) {
        groupedByType.set(entry.assessmentId, entry)
      }
    })

    // Convert to AssessmentResult format
    groupedByType.forEach((entry, assessmentId) => {
      const assessment = ASSESSMENTS.find(a => a.id === assessmentId)
      if (assessment) {
        assessments.push({
          id: entry.id,
          assessmentId: entry.assessmentId,
          title: assessment.title,
          score: entry.score,
          maxScore: assessment.maxScore,
          responses: entry.responses,
          completedAt: entry.completedAt,
          interpretation: this.interpretScore(entry.score, assessment.maxScore, assessment.interpretation)
        })
      }
    })

    console.log(`✅ DataService: Fetched ${assessments.length} assessments`)
    return assessments
  }

  static async saveAssessment(userId: string, assessment: any): Promise<boolean> {
    console.log(`🔍 DATASERVICE TRACE: Starting saveAssessment`)
    console.log(`🔍 DATASERVICE TRACE: Input params:`, {
      userId,
      assessmentId: assessment.assessmentId || assessment.id,
      assessmentKeys: Object.keys(assessment),
      hasResult: !!assessment.result,
      hasResponses: !!assessment.responses
    })

    // Handle different AssessmentResult object structures
    let assessmentData: any = {}

    // Handle structure from useAssessmentData hook: { id, result, responses, friendlyExplanation }
    if (assessment.result && assessment.responses) {
      console.log(`🔍 DATASERVICE TRACE: Using structure 1 (useAssessmentData hook)`)
      const result = assessment.result
      assessmentData = {
        user_id: userId,
        assessment_id: assessment.id,
        assessment_title: result.description || 'Assessment',
        score: result.score || 0,
        level: result.level || 'unknown',
        severity: result.severity || 'normal',
        responses: assessment.responses || {},
        result_data: {
          score: result.score || 0,
          level: result.level || 'unknown',
          severity: result.severity || 'normal',
          recommendations: result.recommendations || [],
          insights: result.insights || [],
          nextSteps: result.nextSteps || [],
          manifestations: result.manifestations || [],
          interpretation: 'Assessment completed'
        },
        friendly_explanation: assessment.friendlyExplanation || result.description || 'Assessment completed',
        taken_at: new Date().toISOString()
      }
    }
    // Handle structure from AssessmentFlowMigrated: { assessmentId, title, score, responses, completedAt, ... }
    else {
      console.log(`🔍 DATASERVICE TRACE: Using structure 2 (AssessmentFlowMigrated)`)
      assessmentData = {
        user_id: userId,
        assessment_id: assessment.assessmentId || assessment.id?.split('-')[1] || 'unknown',
        assessment_title: assessment.title || assessment.description || 'Assessment',
        score: assessment.score || 0,
        level: assessment.level || 'unknown',
        severity: assessment.severity || 'normal',
        responses: assessment.responses || {},
        result_data: {
          score: assessment.score || 0,
          level: assessment.level || 'unknown',
          severity: assessment.severity || 'normal',
          recommendations: assessment.recommendations || [],
          insights: assessment.insights || [],
          nextSteps: assessment.nextSteps || [],
          manifestations: assessment.manifestations || [],
          interpretation: assessment.interpretation || 'No interpretation available'
        },
        friendly_explanation: assessment.interpretation || 'Assessment completed',
        taken_at: assessment.completedAt || new Date().toISOString()
      }
    }

    console.log(`🔍 DATASERVICE TRACE: Transformed assessment data:`, {
      user_id: assessmentData.user_id,
      assessment_id: assessmentData.assessment_id,
      assessment_title: assessmentData.assessment_title,
      score: assessmentData.score,
      level: assessmentData.level,
      severity: assessmentData.severity,
      responsesKeys: Object.keys(assessmentData.responses || {}),
      responsesCount: Object.keys(assessmentData.responses || {}).length,
      hasResultData: !!assessmentData.result_data,
      hasFriendlyExplanation: !!assessmentData.friendly_explanation
    })

    console.log(`🔍 DATASERVICE TRACE: Calling api.insert with validateAuth: true`)

    const response = await api.insert<AssessmentHistoryEntry>(
      'assessment_results',
      assessmentData,
      {
        validateAuth: true
      }
    )

    console.log(`🔍 DATASERVICE TRACE: api.insert response:`, {
      success: response.success,
      hasData: !!response.data,
      hasError: !!response.error,
      errorMessage: response.error?.message,
      errorCode: response.error?.code
    })

    if (!response.success) {
      console.error('❌ DATASERVICE TRACE: Failed to save assessment:', {
        error: response.error,
        fullResponse: response
      })
      return false
    }

    console.log('✅ DATASERVICE TRACE: Assessment saved successfully:', response.data)
    return true
  }

  static async deleteAssessment(userId: string, assessmentId: string): Promise<boolean> {
    console.log(`🗑️ DataService: Deleting assessment ${assessmentId} for user ${userId}`)
    
    const response = await api.deleteRecord<AssessmentHistoryEntry>(
      'assessment_results',
      {
        user_id: userId,
        assessment_id: assessmentId
      },
      {
        validateAuth: true
      }
    )

    if (!response.success) {
      console.error('❌ DataService: Failed to delete assessment:', response.error)
      return false
    }

    console.log('✅ DataService: Assessment deleted successfully')
    return true
  }

  /**
   * Profile Operations
   */
  static async getProfile(userId: string, forceRefresh: boolean = false): Promise<Profile | null> {
    console.log(`👤 DataService: Fetching profile for user ${userId}`)
    
    const response = await api.query<Profile[]>(
      'user_assessment_profiles',
      {
        select: '*',
        match: { user_id: userId },
        limit: 1
      },
      {
        cache: !forceRefresh,
        cacheTTL: 600000, // 10 minutes
        validateAuth: true
      }
    )

    if (!response.success || !response.data || response.data.length === 0) {
      console.warn('⚠️ DataService: No profile found for user')
      return null
    }

    console.log('✅ DataService: Profile fetched successfully')
    return response.data[0]
  }

  static async updateProfile(userId: string, profileData: Partial<Profile>): Promise<boolean> {
    console.log(`✏️ DataService: Updating profile for user ${userId}`)
    
    const response = await api.update<Profile>(
      'user_assessment_profiles',
      profileData,
      { user_id: userId },
      {
        validateAuth: true
      }
    )

    if (!response.success) {
      console.error('❌ DataService: Failed to update profile:', response.error)
      return false
    }

    console.log('✅ DataService: Profile updated successfully')
    return true
  }

  static async createProfile(userId: string, profileData: Omit<Profile, 'user_id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    console.log(`🆕 DataService: Creating profile for user ${userId}`)
    
    const response = await api.insert<Profile>(
      'user_assessment_profiles',
      {
        user_id: userId,
        ...profileData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        validateAuth: true
      }
    )

    if (!response.success) {
      console.error('❌ DataService: Failed to create profile:', response.error)
      return false
    }

    console.log('✅ DataService: Profile created successfully')
    return true
  }

  /**
   * Chat Operations
   */
  static async getChatSessions(userId: string, forceRefresh: boolean = false): Promise<ChatSession[]> {
    console.log(`💬 DataService: Fetching chat sessions for user ${userId}`)
    
    const response = await api.query<ChatSession[]>(
      'chat_sessions',
      {
        select: '*',
        match: { user_id: userId },
        order: 'updated_at',
        limit: 50
      },
      {
        cache: !forceRefresh,
        cacheTTL: 300000, // 5 minutes
        validateAuth: true
      }
    )

    if (!response.success || !response.data) {
      console.error('❌ DataService: Failed to fetch chat sessions:', response.error)
      return []
    }

    console.log(`✅ DataService: Fetched ${response.data.length} chat sessions`)
    return response.data
  }

  static async saveChatMessage(sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<boolean> {
    console.log(`💬 DataService: Saving chat message to session ${sessionId}`)
    
    const response = await api.insert<ChatMessage>(
      'chat_messages',
      {
        ...message,
        timestamp: new Date().toISOString()
      },
      {
        validateAuth: true
      }
    )

    if (!response.success) {
      console.error('❌ DataService: Failed to save chat message:', response.error)
      return false
    }

    console.log('✅ DataService: Chat message saved successfully')
    return true
  }

  /**
   * Mood Operations
   */
  static async getMoodEntries(userId: string, limit: number = 30): Promise<MoodEntry[]> {
    console.log(`😊 DataService: Fetching mood entries for user ${userId}`)
    
    const response = await api.query<MoodEntry[]>(
      'mood_entries',
      {
        select: '*',
        match: { user_id: userId },
        order: 'created_at',
        limit
      },
      {
        cache: true,
        cacheTTL: 300000, // 5 minutes
        validateAuth: true
      }
    )

    if (!response.success || !response.data) {
      console.error('❌ DataService: Failed to fetch mood entries:', response.error)
      return []
    }

    console.log(`✅ DataService: Fetched ${response.data.length} mood entries`)
    return response.data
  }

  static async saveMoodEntry(userId: string, mood: string, intensity: number, notes?: string): Promise<boolean> {
    console.log(`😊 DataService: Saving mood entry for user ${userId}`)
    
    const response = await api.insert<MoodEntry>(
      'mood_entries',
      {
        user_id: userId,
        mood,
        intensity,
        notes,
        created_at: new Date().toISOString()
      },
      {
        validateAuth: true
      }
    )

    if (!response.success) {
      console.error('❌ DataService: Failed to save mood entry:', response.error)
      return false
    }

    console.log('✅ DataService: Mood entry saved successfully')
    return true
  }

  /**
   * Listening Session Operations
   */
  static async getListeningSessions(userId: string, limit: number = 20): Promise<ListeningSession[]> {
    console.log(`🎧 DataService: Fetching listening sessions for user ${userId}`)
    
    const response = await api.query<ListeningSession[]>(
      'listening_sessions',
      {
        select: '*',
        match: { user_id: userId },
        order: 'updated_at',
        limit
      },
      {
        cache: true,
        cacheTTL: 300000, // 5 minutes
        validateAuth: true
      }
    )

    if (!response.success || !response.data) {
      console.error('❌ DataService: Failed to fetch listening sessions:', response.error)
      return []
    }

    console.log(`✅ DataService: Fetched ${response.data.length} listening sessions`)
    return response.data
  }

  static async saveListeningSession(userId: string, duration: number, type: string): Promise<boolean> {
    console.log(`🎧 DataService: Saving listening session for user ${userId}`)
    
    const response = await api.insert<ListeningSession>(
      'listening_sessions',
      {
        user_id: userId,
        duration,
        type,
        ended_at: new Date().toISOString()
      },
      {
        validateAuth: true
      }
    )

    if (!response.success) {
      console.error('❌ DataService: Failed to save listening session:', response.error)
      return false
    }

    console.log('✅ DataService: Listening session saved successfully')
    return true
  }

  /**
   * Overall Assessment Operations
   */
  static async getOverallAssessment(userId: string, forceRefresh: boolean = false): Promise<OverallAssessmentResult | null> {
    console.log(`🔍 DataService: Fetching overall assessment for user ${userId}`)
    
    const response = await api.query<OverallAssessmentResult[]>(
      'overall_assessments',
      {
        select: '*',
        match: { user_id: userId },
        order: 'created_at',
        limit: 1
      },
      {
        cache: !forceRefresh,
        cacheTTL: 600000, // 10 minutes
        validateAuth: true
      }
    )

    if (!response.success || !response.data || response.data.length === 0) {
      console.warn('⚠️ DataService: No overall assessment found for user')
      return null
    }

    console.log('✅ DataService: Overall assessment fetched successfully')
    return response.data[0]
  }

  static async generateLifeImpacts(userId: string): Promise<LifeImpactsResult | null> {
    console.log(`🧠 DataService: Generating life impacts for user ${userId}`)
    
    // First get assessment data
    const assessments = await this.getAssessments(userId, true)
    if (assessments.length === 0) {
      console.warn('⚠️ DataService: No assessments found for life impacts generation')
      return null
    }

    // Transform data for Edge Function
    const assessmentData = {
      userId,
      allAssessments: assessments.reduce((acc, assessment) => {
        acc[assessment.assessmentId] = {
          score: assessment.score,
          maxScore: assessment.maxScore,
          responses: assessment.responses,
          completedAt: assessment.completedAt
        }
        return acc
      }, {} as Record<string, any>),
      assessmentCount: assessments.length,
      dateRange: {
        earliest: Math.min(...assessments.map(a => new Date(a.completedAt).getTime())).toString(),
        latest: Math.max(...assessments.map(a => new Date(a.completedAt).getTime())).toString()
      },
      summary: {
        totalScore: assessments.reduce((sum, a) => sum + a.score, 0),
        averageScore: assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length,
        highestRiskArea: assessments.reduce((highest, a) => a.score > highest.score ? a : highest, assessments[0]).assessmentId,
        overallRiskLevel: this.calculateOverallRiskLevel(assessments)
      }
    }

    const response = await api.function<LifeImpactsResult>(
      'daily-life-impacts',
      { assessmentData },
      {
        validateAuth: true,
        timeout: 60000 // 1 minute for AI processing
      }
    )

    if (!response.success || !response.data) {
      console.error('❌ DataService: Failed to generate life impacts:', response.error)
      return null
    }

    console.log('✅ DataService: Life impacts generated successfully')
    return response.data
  }

  /**
   * Utility Methods
   */
  private static interpretScore(score: number, maxScore: number, interpretation: any): string {
    const percentage = (score / maxScore) * 100
    
    if (percentage >= 80) return interpretation.high
    if (percentage >= 60) return interpretation.moderate
    if (percentage >= 40) return interpretation.low
    return interpretation.veryLow
  }

  private static calculateOverallRiskLevel(assessments: AssessmentResult[]): 'low' | 'moderate' | 'high' | 'critical' {
    const averageScore = assessments.reduce((sum, a) => sum + (a.score / a.maxScore), 0) / assessments.length
    const percentage = averageScore * 100
    
    if (percentage >= 80) return 'critical'
    if (percentage >= 60) return 'high'
    if (percentage >= 40) return 'moderate'
    return 'low'
  }

  /**
   * Bulk Operations
   */
  static async refreshAllData(userId: string): Promise<{
    assessments: AssessmentResult[]
    profile: Profile | null
    moodEntries: MoodEntry[]
    listeningSessions: ListeningSession[]
    overallAssessment: OverallAssessmentResult | null
  }> {
    console.log(`🔄 DataService: Refreshing all data for user ${userId}`)
    
    const [assessments, profile, moodEntries, listeningSessions, overallAssessment] = await Promise.all([
      this.getAssessments(userId, true),
      this.getProfile(userId, true),
      this.getMoodEntries(userId),
      this.getListeningSessions(userId),
      this.getOverallAssessment(userId, true)
    ])

    console.log('✅ DataService: All data refreshed successfully')
    return {
      assessments,
      profile,
      moodEntries,
      listeningSessions,
      overallAssessment
    }
  }

  /**
   * Health Check
   */
  static async healthCheck(): Promise<{ healthy: boolean; latency: number; error?: string }> {
    return api.healthCheck()
  }
}
