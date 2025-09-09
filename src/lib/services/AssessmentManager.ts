/**
 * Unified Assessment Manager
 * Single point of entry for all assessment-related operations
 */

import { supabase } from '../supabase'
import { AssessmentResult, ASSESSMENTS } from '@/data/assessments'
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
  resultData?: any
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
  // Request deduplication cache
  private static activeRequests = new Map<string, Promise<AssessmentHistoryEntry[]>>()

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
    
    console.log(`🔍 ASSESSMENT MANAGER TRACE: saveAssessmentResult called`, {
      userId,
      assessmentId,
      assessmentTitle,
      resultScore: result.score,
      resultLevel: result.level,
      resultSeverity: result.severity,
      responsesCount: Object.keys(responses).length,
      hasFriendlyExplanation: !!friendlyExplanation,
      maxRetries
    })

    // First, ensure the user has a profile
    try {
      console.log(`🔍 ASSESSMENT MANAGER TRACE: Checking if profile exists for user ${userId}`)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single()

      console.log(`🔍 ASSESSMENT MANAGER TRACE: Profile check result:`, {
        hasProfile: !!profile,
        profileError: profileError?.message,
        profileErrorCode: profileError?.code
      })

      if (profileError || !profile) {
        console.log(`🔍 ASSESSMENT MANAGER TRACE: Creating missing profile for user ${userId}`)
        // Create a basic profile
        const profileData = {
          id: userId,
          user_id: userId,  // Also set user_id field (required by schema)
          display_name: 'User',
          empathy_credits: 10,
          total_credits_earned: 10,
          total_credits_spent: 0,
          emotional_capacity: 'medium',
          preferred_mode: 'both',
          is_anonymous: false,
          last_active: new Date().toISOString()
        }
        
        console.log(`🔍 ASSESSMENT MANAGER TRACE: Profile data to upsert:`, profileData)
        
        const { error: createError } = await supabase
          .from('profiles')
          .upsert(profileData, {
            onConflict: 'id',
            ignoreDuplicates: false
          })

        if (createError) {
          console.error(`🔍 ASSESSMENT MANAGER TRACE: Failed to create profile for user ${userId}:`, {
            error: createError,
            errorMessage: createError.message,
            errorCode: createError.code,
            errorDetails: createError.details,
            errorHint: createError.hint
          })
          throw new Error(`Profile creation failed: ${createError.message}`)
        }
        console.log(`🔍 ASSESSMENT MANAGER TRACE: Profile created successfully for user ${userId}`)
      } else {
        console.log(`🔍 ASSESSMENT MANAGER TRACE: Profile already exists for user ${userId}`)
      }
    } catch (error) {
      console.error(`🔍 ASSESSMENT MANAGER TRACE: Error ensuring profile exists for user ${userId}:`, {
        error,
        errorMessage: error?.message,
        errorStack: error?.stack?.split('\n').slice(0, 5)
      })
      throw error
    }

    let lastError: any = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`🔍 ASSESSMENT MANAGER TRACE: Attempt ${attempt}/${maxRetries} to save assessment ${assessmentId}`)
      
      try {
        const insertData = {
          user_id: userId,
          assessment_id: assessmentId,
          assessment_title: assessmentTitle,
          score: result.score,
          level: result.level,
          severity: result.severity,
          responses: responses as any,
          result_data: result as any,
          friendly_explanation: friendlyExplanation
        }
        
        console.log(`🔍 ASSESSMENT MANAGER TRACE: Insert data for attempt ${attempt}:`, {
          user_id: insertData.user_id,
          assessment_id: insertData.assessment_id,
          assessment_title: insertData.assessment_title,
          score: insertData.score,
          level: insertData.level,
          severity: insertData.severity,
          responsesCount: Object.keys(insertData.responses || {}).length,
          hasResultData: !!insertData.result_data,
          hasFriendlyExplanation: !!insertData.friendly_explanation
        })
        
        const { data, error } = await supabase
          .from('assessment_results')
          .insert(insertData)
          .select()
          .single()

        console.log(`🔍 ASSESSMENT MANAGER TRACE: Supabase insert result for attempt ${attempt}:`, {
          hasData: !!data,
          hasError: !!error,
          errorMessage: error?.message,
          errorCode: error?.code,
          errorDetails: error?.details,
          errorHint: error?.hint,
          dataKeys: data ? Object.keys(data) : 'no data'
        })

        if (error) {
          console.error(`🔍 ASSESSMENT MANAGER TRACE: Database error saving ${assessmentId} (attempt ${attempt}):`, {
            error,
            errorMessage: error.message,
            errorCode: error.code,
            errorDetails: error.details,
            errorHint: error.hint,
            errorStatus: error.status,
            errorStatusText: error.statusText
          })
          lastError = error

          if (error.code === '23505' || error.code === '23503') {
            console.log(`🔍 ASSESSMENT MANAGER TRACE: Non-retryable error for ${assessmentId}, giving up`)
            break
          }

          if (attempt < maxRetries) {
            console.log(`🔍 ASSESSMENT MANAGER TRACE: Retrying ${assessmentId} save in ${attempt * 1000}ms...`)
            await new Promise(resolve => setTimeout(resolve, attempt * 1000))
            continue
          }
        } else {
          console.log(`🔍 ASSESSMENT MANAGER TRACE: Successfully saved ${assessmentId} to database on attempt ${attempt}`)
          console.log(`🔍 ASSESSMENT MANAGER TRACE: Saved data:`, data)
          return data
        }
      } catch (error) {
        console.error(`🔍 ASSESSMENT MANAGER TRACE: Exception saving ${assessmentId} (attempt ${attempt}):`, {
          error,
          errorMessage: error?.message,
          errorStack: error?.stack?.split('\n').slice(0, 5),
          errorType: typeof error,
          errorConstructor: error?.constructor?.name
        })
        lastError = error

        if (attempt < maxRetries) {
          console.log(`🔍 ASSESSMENT MANAGER TRACE: Retrying in ${attempt * 1000}ms...`)
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
        // Use upsert to handle unique constraint on user_id
        const { data, error } = await supabase
          .from('user_assessment_profiles')
          .upsert({
            user_id: userId,
            profile_data: userProfile as any,
            trauma_history: userProfile.traumaHistory as any,
            current_symptoms: userProfile.currentSymptoms as any,
            resilience_data: userProfile.resilience as any,
            risk_factors: userProfile.riskFactors as any,
            preferences: userProfile.preferences as any,
            personalization_data: personalizationData as any,
            last_assessed: new Date().toISOString()
          }, {
            onConflict: 'user_id',
            ignoreDuplicates: false
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
   * Get user's assessment history with request deduplication
   */
  static async getAssessmentHistory(userId: string): Promise<AssessmentHistoryEntry[]> {
    // Check if there's already an active request for this user
    const cacheKey = `history_${userId}`
    const existingRequest = this.activeRequests.get(cacheKey)

    if (existingRequest) {
      console.log(`📚 [DUPLICATE_REQUEST] Reusing existing assessment history fetch for user ${userId}`)
      return existingRequest
    }

    // Create new request
    const requestPromise = this.performAssessmentHistoryFetch(userId)
    this.activeRequests.set(cacheKey, requestPromise)

    // Clean up cache when request completes
    requestPromise.finally(() => {
      this.activeRequests.delete(cacheKey)
    })

    return requestPromise
  }

  /**
   * Internal method to perform the actual fetch
   */
  private static async performAssessmentHistoryFetch(userId: string): Promise<AssessmentHistoryEntry[]> {
    console.log(`📚 Fetching assessment history for user ${userId}...`)

    try {
      // Debug: Check if there are ANY assessment results in the database
      const { data: allData, error: allError } = await supabase
        .from('assessment_results')
        .select('user_id, assessment_id, taken_at')
        .limit(5)

      if (!allError && allData) {
        console.log(`🔍 DEBUG: Total assessment results in DB (first 5):`, allData)
      }

      const { data, error } = await supabase
        .from('assessment_results')
        .select('id, assessment_id, assessment_title, score, level, severity, taken_at, friendly_explanation, result_data')
        .eq('user_id', userId)
        .order('taken_at', { ascending: false })

      if (error) {
        console.error('❌ Database error fetching assessment history:', error)
        return []
      }

      console.log(`📋 Found ${data?.length || 0} assessment results in history for user: ${userId}`)

      return (data || []).map(item => ({
        id: item.id,
        assessmentId: item.assessment_id,
        assessmentTitle: item.assessment_title,
        score: item.score,
        level: item.level,
        severity: item.severity,
        takenAt: item.taken_at,
        friendlyExplanation: item.friendly_explanation,
        resultData: item.result_data
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
      console.log(`🔍 Fetching latest user profile for user: ${userId}`)
      
      const { data, error } = await supabase
        .from('user_assessment_profiles')
        .select('*')
        .eq('user_id', userId)
        .order('last_assessed', { ascending: false })
        .limit(1)

      if (error) {
        console.error('❌ Error fetching latest user profile:', {
          error,
          errorCode: error.code,
          errorMessage: error.message,
          errorDetails: error.details,
          userId
        })
        return null
      }

      // Handle case where no profile exists
      if (!data || data.length === 0) {
        console.log(`ℹ️ No user profile found for user: ${userId}`)
        return null
      }

      const profile = data[0] // Get the first (and only) result
      console.log(`✅ Successfully fetched user profile:`, {
        hasData: !!profile,
        profileId: profile?.id,
        lastAssessed: profile?.last_assessed
      })

      return profile
    } catch (error) {
      console.error('💥 Exception fetching latest user profile:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        userId
      })
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

    // Process results immediately with local scoring
    const userProfile = AssessmentIntegrator.processResultsImmediate(results)
    userProfile.id = userId


    try {
      // Log what we're preparing for AI
      console.log('[AssessmentManager] 🔄 PREPARING DATA FOR AI EXPLANATIONS:')
      Object.entries(results).forEach(([assessmentId, result]) => {
        console.log(`[AssessmentManager] ${assessmentId}:`, {
          score: result.score,
          maxScore: ASSESSMENTS[assessmentId]?.maxScore,
          category: ASSESSMENTS[assessmentId]?.category
        })
      })

      // Generate AI explanations in parallel (non-blocking)
      const aiExplanations = await Promise.allSettled([
        results['phq9'] ? getAIAssessmentExplanation({
          assessmentName: 'PHQ-9 Depression Assessment',
          score: results['phq9'].score,
          maxScore: ASSESSMENTS['phq9']?.maxScore || 27,
          responses: {}, // We'll need to get actual responses from somewhere
          category: 'depression'
        }) : Promise.resolve(''),
        results['gad7'] ? getAIAssessmentExplanation({
          assessmentName: 'GAD-7 Anxiety Assessment',
          score: results['gad7'].score,
          maxScore: ASSESSMENTS['gad7']?.maxScore || 21,
          responses: {},
          category: 'anxiety'
        }) : Promise.resolve(''),
        results['pss10'] ? getAIAssessmentExplanation({
          assessmentName: 'PSS-10 Perceived Stress Scale',
          score: results['pss10'].score,
          maxScore: ASSESSMENTS['pss10']?.maxScore || 40,
          responses: {},
          category: 'stress'
        }) : Promise.resolve(''),
        results['who5'] ? getAIAssessmentExplanation({
          assessmentName: 'WHO-5 Well-Being Index',
          score: results['who5'].score,
          maxScore: ASSESSMENTS['who5']?.maxScore || 25,
          responses: {},
          category: 'wellbeing'
        }) : Promise.resolve(''),
        results['pcl5'] ? getAIAssessmentExplanation({
          assessmentName: 'PCL-5 PTSD Checklist',
          score: results['pcl5'].score,
          maxScore: ASSESSMENTS['pcl5']?.maxScore || 80,
          responses: {},
          category: 'trauma'
        }) : Promise.resolve(''),
        results['cd-risc'] ? getAIAssessmentExplanation({
          assessmentName: 'CD-RISC Resilience Scale',
          score: results['cd-risc'].score,
          maxScore: ASSESSMENTS['cd-risc']?.maxScore || 80,
          responses: {},
          category: 'resilience'
        }) : Promise.resolve('')
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

      // Save individual assessment results to database
      const saveResults = await Promise.allSettled(
        Object.entries(results).map(async ([assessmentId, result]) => {
          const assessment = ASSESSMENTS[assessmentId]
          if (assessment) {
            const explanationMap: Record<string, string> = {
              'phq9': depressionExplanation,
              'gad7': anxietyExplanation,
              'pss10': stressExplanation,
              'who5': wellbeingExplanation,
              'pcl5': traumaExplanation,
              'cd-risc': resilienceExplanation
            }

            return this.saveAssessmentResult(
              userId,
              assessmentId,
              assessment.title,
              result,
              result.responses || {},
              explanationMap[assessmentId]
            )
          } else {
            console.warn(`⚠️ Assessment ${assessmentId} not found in ASSESSMENTS`)
          }
        })
      )
      
      // Log any failed saves
      saveResults.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Failed to save assessment ${Object.keys(results)[index]}:`, result.reason)
        }
      })

      // Save to database
      const databaseResult = await this.saveUserProfile(userId, enhancedProfile)

      return {
        profile: enhancedProfile,
        databaseResult
      }
    } catch (error) {
      console.error('❌ Error during AI enhancement:', error)

      // Save individual assessment results to database (without AI explanations)
      console.log('💾 Saving individual assessment results (fallback)...')
      const fallbackSaveResults = await Promise.allSettled(
        Object.entries(results).map(async ([assessmentId, result]) => {
          const assessment = ASSESSMENTS[assessmentId]
          if (assessment) {
            console.log(`💾 Saving ${assessmentId} result (fallback) for user ${userId}:`, {
              score: result.score,
              level: result.level,
              severity: result.severity
            })

            return this.saveAssessmentResult(
              userId,
              assessmentId,
              assessment.title,
              result,
              result.responses || {}
            )
          } else {
            console.warn(`⚠️ Assessment ${assessmentId} not found in ASSESSMENTS (fallback)`)
          }
        })
      )
      
      // Log any failed saves
      fallbackSaveResults.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`❌ Failed to save assessment ${Object.keys(results)[index]} (fallback):`, result.reason)
        }
      })

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
