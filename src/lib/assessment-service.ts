/**
 * Assessment Service
 * Handles saving and retrieving assessment data from the database
 */

import { supabase } from './supabase'
import { AssessmentResult } from '@/data/assessments'
import { UserProfile } from '@/data/assessment-integration'
import { Database } from '@/types/database'

type AssessmentResultRow = Database['public']['Tables']['assessment_results']['Row']
type AssessmentResultInsert = Database['public']['Tables']['assessment_results']['Insert']
type AssessmentSessionRow = Database['public']['Tables']['assessment_sessions']['Row']
type AssessmentSessionInsert = Database['public']['Tables']['assessment_sessions']['Insert']
type UserAssessmentProfileRow = Database['public']['Tables']['user_assessment_profiles']['Row']
type UserAssessmentProfileInsert = Database['public']['Tables']['user_assessment_profiles']['Insert']

export interface AssessmentSessionData {
  sessionType: 'onboarding' | 'screening' | 'comprehensive' | 'single'
  sessionName?: string
  assessmentIds: string[]
}

export interface AssessmentHistoryEntry {
  id: string
  assessmentId: string
  assessmentTitle: string
  score: number
  level: string
  severity: string
  takenAt: string
  friendlyExplanation?: string
}

export interface AssessmentSessionHistory {
  id: string
  sessionType: string
  sessionName?: string
  status: string
  startedAt: string
  completedAt?: string
  assessmentCount: number
}

export class AssessmentService {
  /**
   * Create a new assessment session
   */
  static async createSession(
    userId: string, 
    sessionData: AssessmentSessionData
  ): Promise<AssessmentSessionRow | null> {
    try {
      const { data, error } = await supabase
        .from('assessment_sessions')
        .insert({
          user_id: userId,
          session_type: sessionData.sessionType,
          session_name: sessionData.sessionName,
          assessment_ids: sessionData.assessmentIds,
          status: 'in_progress'
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating assessment session:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error creating assessment session:', error)
      return null
    }
  }

  /**
   * Update assessment session status
   */
  static async updateSessionStatus(
    sessionId: string, 
    status: 'in_progress' | 'completed' | 'abandoned'
  ): Promise<boolean> {
    try {
      const updateData: any = { status }
      
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('assessment_sessions')
        .update(updateData)
        .eq('id', sessionId)

      if (error) {
        console.error('Error updating session status:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating session status:', error)
      return false
    }
  }

  /**
   * Save individual assessment result
   */
  static async saveAssessmentResult(
    userId: string,
    sessionId: string | null,
    assessmentId: string,
    assessmentTitle: string,
    result: AssessmentResult,
    responses: Record<string, number | string>,
    friendlyExplanation?: string
  ): Promise<AssessmentResultRow | null> {
    try {
      const { data, error } = await supabase
        .from('assessment_results')
        .insert({
          user_id: userId,
          assessment_id: assessmentId,
          assessment_title: assessmentTitle,
          score: result.score,
          level: result.level,
          severity: result.severity,
          responses: responses as any,
          result_data: result as any,
          friendly_explanation: friendlyExplanation
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving assessment result:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error saving assessment result:', error)
      return null
    }
  }

  /**
   * Save user assessment profile
   */
  static async saveUserProfile(
    userId: string,
    sessionId: string | null,
    userProfile: UserProfile,
    personalizationData?: any
  ): Promise<UserAssessmentProfileRow | null> {
    try {
      const { data, error } = await supabase
        .from('user_assessment_profiles')
        .insert({
          user_id: userId,
          session_id: sessionId,
          profile_data: userProfile as any,
          trauma_history: userProfile.traumaHistory as any,
          current_symptoms: userProfile.currentSymptoms as any,
          resilience_data: userProfile.resilience as any,
          risk_factors: userProfile.riskFactors as any,
          preferences: userProfile.preferences as any,
          personalization_data: personalizationData as any
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error saving user profile:', error)
      return null
    }
  }

  /**
   * Get user's assessment history
   */
  static async getAssessmentHistory(userId: string): Promise<AssessmentHistoryEntry[]> {
    try {
      const { data, error } = await supabase
        .from('assessment_results')
        .select('id, assessment_id, assessment_title, score, level, severity, taken_at, friendly_explanation')
        .eq('user_id', userId)
        .order('taken_at', { ascending: false })

      if (error) {
        console.error('Error fetching assessment history:', error)
        return []
      }

      return data?.map(item => ({
        id: item.id,
        assessmentId: item.assessment_id,
        assessmentTitle: item.assessment_title,
        score: item.score,
        level: item.level,
        severity: item.severity,
        takenAt: item.taken_at,
        friendlyExplanation: item.friendly_explanation
      })) || []
    } catch (error) {
      console.error('Error fetching assessment history:', error)
      return []
    }
  }

  /**
   * Get user's assessment session history
   */
  static async getSessionHistory(userId: string): Promise<AssessmentSessionHistory[]> {
    try {
      const { data, error } = await supabase
        .from('assessment_sessions')
        .select('id, session_type, session_name, status, started_at, completed_at, assessment_ids')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })

      if (error) {
        console.error('Error fetching session history:', error)
        return []
      }

      return (data || []).map(session => ({
        id: session.id,
        sessionType: session.session_type,
        sessionName: session.session_name,
        status: session.status,
        startedAt: session.started_at,
        completedAt: session.completed_at,
        assessmentCount: session.assessment_ids.length
      }))
    } catch (error) {
      console.error('Error fetching session history:', error)
      return []
    }
  }

  /**
   * Get user's latest assessment profile
   */
  static async getLatestUserProfile(userId: string): Promise<UserAssessmentProfileRow | null> {
    try {
      const { data, error } = await supabase
        .from('user_assessment_profiles')
        .select('*')
        .eq('user_id', userId)
        .order('last_assessed', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        console.error('Error fetching latest user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching latest user profile:', error)
      return null
    }
  }

  /**
   * Get assessment results for a specific session
   */
  static async getSessionResults(sessionId: string): Promise<AssessmentResultRow[]> {
    try {
      const { data, error } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .order('taken_at', { ascending: true })

      if (error) {
        console.error('Error fetching session results:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching session results:', error)
      return []
    }
  }

  /**
   * Get assessment results by assessment ID for a user
   */
  static async getAssessmentResultsByType(
    userId: string, 
    assessmentId: string
  ): Promise<AssessmentResultRow[]> {
    try {
      const { data, error } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('user_id', userId)
        .eq('assessment_id', assessmentId)
        .order('taken_at', { ascending: false })

      if (error) {
        console.error('Error fetching assessment results by type:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching assessment results by type:', error)
      return []
    }
  }

  /**
   * Check if user has completed a specific assessment type
   */
  static async hasCompletedAssessment(
    userId: string, 
    assessmentId: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('assessment_results')
        .select('id')
        .eq('user_id', userId)
        .eq('assessment_id', assessmentId)
        .limit(1)

      if (error) {
        console.error('Error checking assessment completion:', error)
        return false
      }

      return (data && data.length > 0) || false
    } catch (error) {
      console.error('Error checking assessment completion:', error)
      return false
    }
  }

  /**
   * Get user's progress across different assessment types
   */
  static async getAssessmentProgress(userId: string): Promise<Record<string, boolean>> {
    try {
      const assessmentTypes = ['phq9', 'gad7', 'ace', 'cd-risc']
      const progress: Record<string, boolean> = {}

      for (const assessmentId of assessmentTypes) {
        progress[assessmentId] = await this.hasCompletedAssessment(userId, assessmentId)
      }

      return progress
    } catch (error) {
      console.error('Error getting assessment progress:', error)
      return {}
    }
  }
}

export default AssessmentService
