/**
 * Unified Assessment Manager
 * Single point of entry for all assessment-related operations
 */

import { supabase } from '../supabase'
import { AssessmentResult } from '@/data/assessments'
import { UserProfile, AssessmentIntegrator } from '@/data/assessment-integration'
import { Database } from '@/types/database'
import { getAIAssessmentExplanation } from '../assessment-ai'

type AssessmentResultRow = Database['public']['Tables']['assessment_results']['Row']
type AssessmentResultInsert = Database['public']['Tables']['assessment_results']['Insert']
type UserAssessmentProfileRow = Database['public']['Tables']['user_assessment_profiles']['Row']

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

export interface AssessmentContext {
  userProfile: UserProfile | null
  latestAssessments: Record<string, AssessmentResult>
  riskLevel: string
  personalizedApproach: {
    therapyStyle: string[]
    focusAreas: string[]
    safetyProtocols: string[]
    recommendations: string[]
  }
  lastAssessed: Date | null
}

export class AssessmentManager {
  // ==================== DATABASE OPERATIONS ====================

  /**
   * Save individual assessment result to database
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
    console.log(`🔄 Saving assessment result for ${assessmentId}...`)

    let lastError: any = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
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
          console.error(`❌ Database error saving ${assessmentId} (attempt ${attempt}):`, error)
          lastError = error

          if (error.code === '23505' || error.code === '23503') {
            console.log('❌ Non-retryable error, giving up')
            break
          }

          if (attempt < maxRetries) {
            console.log(`⏳ Retrying in ${attempt * 1000}ms...`)
            await new Promise(resolve => setTimeout(resolve, attempt * 1000))
            continue
          }
        } else {
          console.log(`✅ Successfully saved ${assessmentId} to database`)
          return data
        }
      } catch (error) {
        console.error(`💥 Exception saving ${assessmentId} (attempt ${attempt}):`, error)
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
   * Save user assessment profile to database
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
          console.log(`✅ Successfully saved user profile`)
          return data
        }
      } catch (error) {
        console.error(`💥 Exception saving user profile (attempt ${attempt}):`, error)
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
        return []
      }

      console.log(`📋 Found ${data?.length || 0} assessment results in history`)

      return (data || []).map(item => ({
        id: item.id,
        assessmentId: item.assessment_id,
        assessmentTitle: item.assessment_title,
        score: item.score,
        level: item.level,
        severity: item.severity,
        takenAt: item.taken_at,
        friendlyExplanation: item.friendly_explanation
      }))
    } catch (error) {
      console.error('💥 Exception fetching assessment history:', error)
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

  // ==================== ASSESSMENT PROCESSING ====================

  /**
   * Process assessment results and generate comprehensive user profile
   */
  static async processAssessmentResults(
    results: Record<string, AssessmentResult>,
    userId: string
  ): Promise<{ profile: UserProfile; databaseResult: UserAssessmentProfileRow | null }> {
    console.log('🔄 Processing assessment results...')

    // Process results immediately with local scoring
    const userProfile = AssessmentIntegrator.processResultsImmediate(results)
    userProfile.id = userId

    console.log('✅ Local processing completed')

    try {
      // Generate AI explanations in parallel (non-blocking)
      const aiExplanations = await Promise.allSettled([
        results['phq9'] ? getAIAssessmentExplanation('phq9', 'PHQ-9 Depression Assessment', results['phq9']) : Promise.resolve(''),
        results['gad7'] ? getAIAssessmentExplanation('gad7', 'GAD-7 Anxiety Assessment', results['gad7']) : Promise.resolve(''),
        results['pss10'] ? getAIAssessmentExplanation('pss10', 'PSS-10 Perceived Stress Scale', results['pss10']) : Promise.resolve(''),
        results['who5'] ? getAIAssessmentExplanation('who5', 'WHO-5 Well-Being Index', results['who5']) : Promise.resolve(''),
        results['pcl5'] ? getAIAssessmentExplanation('pcl5', 'PCL-5 PTSD Checklist', results['pcl5']) : Promise.resolve(''),
        results['cd-risc'] ? getAIAssessmentExplanation('cd-risc', 'CD-RISC Resilience Scale', results['cd-risc']) : Promise.resolve('')
      ])

      // Extract successful AI explanations
      const [
        depressionExplanation,
        anxietyExplanation,
        stressExplanation,
        wellbeingExplanation,
        traumaExplanation,
        resilienceExplanation
      ] = aiExplanations.map(result =>
        result.status === 'fulfilled' ? result.value : ''
      )

      // Enhance profile with AI explanations
      const enhancedProfile: UserProfile = {
        ...userProfile,
        currentSymptoms: {
          depression: {
            ...userProfile.currentSymptoms.depression,
            friendlyExplanation: depressionExplanation
          },
          anxiety: {
            ...userProfile.currentSymptoms.anxiety,
            friendlyExplanation: anxietyExplanation
          },
          stress: {
            ...userProfile.currentSymptoms.stress,
            friendlyExplanation: stressExplanation
          },
          wellbeing: {
            ...userProfile.currentSymptoms.wellbeing,
            friendlyExplanation: wellbeingExplanation
          }
        },
        currentTrauma: userProfile.currentTrauma ? {
          ...userProfile.currentTrauma,
          friendlyExplanation: traumaExplanation
        } : undefined,
        resilience: {
          ...userProfile.resilience,
          friendlyExplanation: resilienceExplanation
        }
      }

      console.log('✅ AI enhancement completed')

      // Save to database
      const databaseResult = await this.saveUserProfile(userId, enhancedProfile)

      return {
        profile: enhancedProfile,
        databaseResult
      }
    } catch (error) {
      console.error('❌ Error during AI enhancement:', error)

      // Return basic profile without AI enhancements
      const databaseResult = await this.saveUserProfile(userId, userProfile)

      return {
        profile: userProfile,
        databaseResult
      }
    }
  }

  // ==================== ASSESSMENT CONTEXT FOR CHAT ====================

  /**
   * Get user's assessment context for chat personalization
   */
  static async getAssessmentContext(userId: string): Promise<AssessmentContext> {
    try {
      console.log(`🔍 Getting assessment context for user ${userId}`)

      // Get latest user assessment profile
      const profileData = await this.getLatestUserProfile(userId)

      // Get latest individual assessment results
      const { data: assessmentResults, error: resultsError } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('user_id', userId)
        .order('taken_at', { ascending: false })

      if (resultsError) {
        console.error('Error fetching assessment results:', resultsError)
      }

      // Process assessment data
      const latestAssessments = this.processLatestAssessments(assessmentResults || [])
      const userProfile = profileData?.profile_data || null
      const riskLevel = this.assessRiskLevel(latestAssessments, userProfile)
      const personalizedApproach = this.generatePersonalizedApproach(latestAssessments, userProfile)

      return {
        userProfile,
        latestAssessments,
        riskLevel,
        personalizedApproach,
        lastAssessed: profileData?.last_assessed ? new Date(profileData.last_assessed) : null
      }
    } catch (error) {
      console.error('Error in getAssessmentContext:', error)
      return {
        userProfile: null,
        latestAssessments: {},
        riskLevel: 'low',
        personalizedApproach: {
          therapyStyle: ['general_support'],
          focusAreas: ['general_wellness'],
          safetyProtocols: ['standard_safety_check'],
          recommendations: ['general_self_care']
        },
        lastAssessed: null
      }
    }
  }

  // ==================== HELPER METHODS ====================

  private static processLatestAssessments(results: any[]): Record<string, AssessmentResult> {
    const latestAssessments: Record<string, AssessmentResult> = {}

    // Group by assessment ID and take the most recent
    const groupedResults = results.reduce((acc, result) => {
      if (!acc[result.assessment_id] || new Date(result.taken_at) > new Date(acc[result.assessment_id].taken_at)) {
        acc[result.assessment_id] = result
      }
      return acc
    }, {} as Record<string, any>)

    // Convert to AssessmentResult format
    Object.entries(groupedResults).forEach(([assessmentId, result]) => {
      latestAssessments[assessmentId] = result.result_data
    })

    return latestAssessments
  }

  private static assessRiskLevel(assessments: Record<string, AssessmentResult>, userProfile: any): string {
    // Assess risk based on assessment results and profile
    const highRiskScores = ['severe', 'critical']
    const hasHighRisk = Object.values(assessments).some(result =>
      highRiskScores.includes(result.severity)
    )

    if (hasHighRisk) return 'high'
    if (userProfile?.riskFactors?.crisisIndicators?.length > 0) return 'medium'
    return 'low'
  }

  private static generatePersonalizedApproach(assessments: Record<string, AssessmentResult>, userProfile: any) {
    const approach = {
      therapyStyle: [] as string[],
      focusAreas: [] as string[],
      safetyProtocols: [] as string[],
      recommendations: [] as string[]
    }

    // Analyze each assessment type
    if (assessments['phq9']) {
      approach.therapyStyle.push('cbt', 'medication_management')
      approach.focusAreas.push('mood regulation', 'behavioral activation')
    }

    if (assessments['gad7']) {
      approach.therapyStyle.push('exposure_therapy', 'mindfulness')
      approach.focusAreas.push('worry management', 'relaxation skills')
    }

    if (assessments['pcl5']) {
      approach.therapyStyle.push('trauma_focused', 'emdr')
      approach.focusAreas.push('safety building', 'grounding techniques')
    }

    // Set safety protocols based on risk level
    const riskLevel = this.assessRiskLevel(assessments, userProfile)
    if (riskLevel === 'high') {
      approach.safetyProtocols.push('crisis_prevention', 'immediate_support', 'professional_referral')
    } else if (riskLevel === 'medium') {
      approach.safetyProtocols.push('regular_checkins', 'support_network')
    } else {
      approach.safetyProtocols.push('standard_safety_check')
    }

    return approach
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Check if user has completed a specific assessment type
   */
  static async hasCompletedAssessment(userId: string, assessmentId: string): Promise<boolean> {
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
   * Get assessment progress across all types
   */
  static async getAssessmentProgress(userId: string): Promise<Record<string, boolean>> {
    try {
      const assessmentTypes = ['phq9', 'gad7', 'ace', 'cd-risc', 'pss10', 'who5', 'pcl5']
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

export default AssessmentManager
