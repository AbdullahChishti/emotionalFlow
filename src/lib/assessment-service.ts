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

type UserAssessmentProfileRow = Database['public']['Tables']['user_assessment_profiles']['Row']
type UserAssessmentProfileInsert = Database['public']['Tables']['user_assessment_profiles']['Insert']



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



export class AssessmentService {

  /**
   * Save individual assessment result
   */
  static async saveAssessmentResult(
    userId: string,
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
    userProfile: UserProfile,
    personalizationData?: any
  ): Promise<UserAssessmentProfileRow | null> {
    try {
      const { data, error } = await supabase
        .from('user_assessment_profiles')
        .insert({
          user_id: userId,
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
