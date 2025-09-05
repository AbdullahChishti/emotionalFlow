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



// Test function to check database connection
export const testDatabaseConnection = async () => {
  console.log('🔍 Testing database connection...')

  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('assessment_results')
      .select('count', { count: 'exact', head: true })

    if (error) {
      console.error('❌ Database connection test failed:', error)
      return false
    }

    console.log('✅ Database connection successful')
    console.log('📊 Found', data, 'assessment results in database')

    return true
  } catch (error) {
    console.error('💥 Database connection test exception:', error)
    return false
  }
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
    friendlyExplanation?: string,
    maxRetries: number = 3
  ): Promise<AssessmentResultRow | null> {
    console.log(`🔄 Attempting to save assessment result for ${assessmentId}...`)
    console.log('Save parameters:', {
      userId,
      assessmentId,
      assessmentTitle,
      score: result.score,
      responsesCount: Object.keys(responses).length
    })

    let lastError: any = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📡 Database save attempt ${attempt}/${maxRetries} for ${assessmentId}`)

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
          console.error(`❌ Database error saving ${assessmentId} (attempt ${attempt}):`, error)
          console.error('Error details:', {
            code: error.code,
            details: error.details,
            hint: error.hint,
            message: error.message
          })

          lastError = error

          // Don't retry on certain errors
          if (error.code === '23505' || error.code === '23503') { // Unique violation or foreign key violation
            console.log('❌ Non-retryable error, giving up')
            break
          }

          if (attempt < maxRetries) {
            console.log(`⏳ Retrying in ${attempt * 1000}ms...`)
            await new Promise(resolve => setTimeout(resolve, attempt * 1000))
            continue
          }
        } else {
          console.log(`✅ Successfully saved ${assessmentId} to database on attempt ${attempt}`)
          return data
        }
      } catch (error) {
        console.error(`💥 Exception saving ${assessmentId} (attempt ${attempt}):`, error)
        console.error('Exception details:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        })

        lastError = error

        if (attempt < maxRetries) {
          console.log(`⏳ Retrying in ${attempt * 1000}ms...`)
          await new Promise(resolve => setTimeout(resolve, attempt * 1000))
          continue
        }
      }
    }

    console.error(`💥 Failed to save ${assessmentId} after ${maxRetries} attempts:`, lastError)
    return null
  }

  /**
   * Save user assessment profile
   */
  static async saveUserProfile(
    userId: string,
    userProfile: UserProfile,
    personalizationData?: any,
    maxRetries: number = 3
  ): Promise<UserAssessmentProfileRow | null> {
    console.log(`👤 Saving user profile for ${userId}...`)
    let lastError: any = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📡 Profile save attempt ${attempt}/${maxRetries} for ${userId}`)

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
          console.error(`❌ Database error saving user profile (attempt ${attempt}):`, error)
          lastError = error

          // Don't retry on certain errors
          if (error.code === '23505' || error.code === '23503') {
            console.log('❌ Non-retryable profile error, giving up')
            break
          }

          if (attempt < maxRetries) {
            console.log(`⏳ Retrying profile save in ${attempt * 1000}ms...`)
            await new Promise(resolve => setTimeout(resolve, attempt * 1000))
            continue
          }
        } else {
          console.log(`✅ Successfully saved user profile on attempt ${attempt}`)
          return data
        }
      } catch (error) {
        console.error(`💥 Exception saving user profile (attempt ${attempt}):`, error)
        console.error('Exception details:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        })

        lastError = error

        if (attempt < maxRetries) {
          console.log(`⏳ Retrying profile save in ${attempt * 1000}ms...`)
          await new Promise(resolve => setTimeout(resolve, attempt * 1000))
          continue
        }
      }
    }

    console.error(`💥 Failed to save user profile after ${maxRetries} attempts:`, lastError)
    return null
  }

  /**
   * Get user's assessment history
   */
  static async getAssessmentHistory(userId: string): Promise<AssessmentHistoryEntry[]> {
    console.log(`📚 Fetching assessment history for user ${userId}...`)

    try {
      const { data, error } = await supabase
        .from('assessment_results')
        .select('id, assessment_id, assessment_title, score, level, severity, taken_at, friendly_explanation')
        .eq('user_id', userId)
        .order('taken_at', { ascending: false })

      if (error) {
        console.error('❌ Database error fetching assessment history:', error)
        console.error('Error details:', {
          code: error.code,
          details: error.details,
          hint: error.hint,
          message: error.message
        })
        return []
      }

      console.log(`📋 Found ${data?.length || 0} assessment results in history`)
      if (data && data.length > 0) {
        console.log('Assessment history items:', data.map(item => ({
          id: item.id,
          assessmentId: item.assessment_id,
          assessmentTitle: item.assessment_title,
          takenAt: item.taken_at
        })))
      }

      const result = data?.map(item => ({
        id: item.id,
        assessmentId: item.assessment_id,
        assessmentTitle: item.assessment_title,
        score: item.score,
        level: item.level,
        severity: item.severity,
        takenAt: item.taken_at,
        friendlyExplanation: item.friendly_explanation
      })) || []

      console.log(`✅ Returning ${result.length} assessment history entries`)
      return result
    } catch (error) {
      console.error('💥 Exception fetching assessment history:', error)
      console.error('Exception details:', {
        message: error.message,
        stack: error.stack
      })
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
