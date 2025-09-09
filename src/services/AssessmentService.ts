/**
 * Assessment Service
 * Handles all assessment-related operations
 */

import { BaseService } from './BaseService'
import { AssessmentResult } from '@/data/assessments'
import { NotFoundError, ValidationError, BusinessError } from '@/lib/api/errors'
import { profileService } from './ProfileService'

export interface AssessmentHistoryEntry {
}

export interface SaveAssessmentData {
}

export class AssessmentService extends BaseService {
  /**
   * Get all assessments for a user
   */
  async getAssessments(userId: string): Promise<AssessmentResult[]> {
    this.logOperation('getAssessments', { userId })
    this.validateRequired({ userId }, ['userId'])

    try {

      const entries = await this.executeApiCall(
        () => this.apiManager.supabaseQuery<AssessmentHistoryEntry[]>('assessment_results', {
          select: '*',
          match: { user_id: userId },
          order: 'taken_at',
          limit: 1000
        }),
        'get assessments'
      )


      const assessments = this.transformAssessmentEntries(entries || [])

      this.logOperation('getAssessments.success', { userId, count: assessments.length })
      return assessments
    } catch (error) {
      // Return empty array instead of throwing error to prevent crashes
      return []
    }
  }

  /**
   * Save assessment result
   */
  async saveAssessment(userId: string, assessmentData: SaveAssessmentData): Promise<AssessmentResult> {
    console.log(`🔍 ASSESSMENT SERVICE TRACE: saveAssessment called`)
    console.log(`🔍 ASSESSMENT SERVICE TRACE: Input params:`, {
      userId,
      assessmentDataKeys: Object.keys(assessmentData),
      assessmentId: assessmentData.assessmentId,
      hasScore: !!assessmentData.score,
      hasResponses: !!assessmentData.responses
    })

    this.logOperation('saveAssessment', { userId, assessmentId: assessmentData.assessmentId })
    this.validateRequired({ userId, assessmentData }, ['userId', 'assessmentData'])

    // Validate business rules
    console.log(`🔍 ASSESSMENT SERVICE TRACE: Validating business rules...`)
    this.validateBusinessRules(assessmentData, 'saveAssessment')

    // Transform data for API
    console.log(`🔍 ASSESSMENT SERVICE TRACE: Transforming data for API...`)
    const apiData = this.transformForApi(assessmentData, userId)
    console.log(`🔍 ASSESSMENT SERVICE TRACE: Transformed API data:`, {
      apiDataKeys: Object.keys(apiData),
      sampleApiData: apiData,
      user_id: apiData.user_id,
      assessment_id: apiData.assessment_id,
      hasScore: apiData.score !== undefined,
      hasLevel: apiData.level !== undefined,
      hasSeverity: apiData.severity !== undefined,
      hasResponses: !!apiData.responses,
      responsesType: typeof apiData.responses,
      responsesKeys: apiData.responses ? Object.keys(apiData.responses) : 'no responses',
      hasResultData: !!apiData.result_data,
      resultDataType: typeof apiData.result_data
    })

    console.log(`🔍 ASSESSMENT SERVICE TRACE: Calling executeApiCall...`)
    let savedEntry: AssessmentHistoryEntry
    
    try {
      savedEntry = await this.executeApiCall(
        () => this.apiManager.supabaseInsert<AssessmentHistoryEntry>('assessment_results', apiData),
        'save assessment'
      )
      console.log(`🔍 ASSESSMENT SERVICE TRACE: executeApiCall result:`, savedEntry)
    } catch (error: any) {
      console.log(`🔍 ASSESSMENT SERVICE TRACE: Error caught in saveAssessment:`, {
        error,
        errorMessage: error?.message,
        errorCode: error?.code,
        errorDetails: error?.details,
        errorHint: error?.hint,
        hasAssessmentResultsUserId: error?.message?.includes('assessment_results_user_id'),
        hasForeignKeyConstraint: error?.message?.includes('foreign key constraint'),
        hasViolates: error?.message?.includes('violates'),
        errorType: typeof error,
        errorConstructor: error?.constructor?.name,
        fullErrorString: String(error)
      })

      // Check if this is a foreign key constraint error (profile doesn't exist)
      // Look for various patterns that indicate a foreign key violation
      const isForeignKeyError = (
        (error?.message?.includes('assessment_results_user_id') && error?.message?.includes('foreign key constraint')) ||
        (error?.message?.includes('assessment_results') && error?.message?.includes('foreign key')) ||
        (error?.message?.includes('violates foreign key constraint')) ||
        (error?.message?.includes('Key is not present in table') && error?.message?.includes('profiles')) ||
        (error?.code === '23503' && error?.message?.includes('foreign key')) ||
        (error?.details?.includes('foreign key') || error?.details?.includes('not present in table'))
      )

      console.log(`🔍 ASSESSMENT SERVICE TRACE: Is foreign key error?:`, isForeignKeyError)

      if (isForeignKeyError) {
        console.log(`🔍 ASSESSMENT SERVICE TRACE: Foreign key constraint error - profile missing, creating profile...`)

        // Create the missing profile
        await this.createMissingProfile(userId)

        // Retry the assessment save
        console.log(`🔍 ASSESSMENT SERVICE TRACE: Retrying assessment save after profile creation...`)
        savedEntry = await this.executeApiCall(
          () => this.apiManager.supabaseInsert<AssessmentHistoryEntry>('assessment_results', apiData),
          'save assessment after profile creation'
        )
        console.log(`🔍 ASSESSMENT SERVICE TRACE: Retry executeApiCall result:`, savedEntry)
      } else {
        // Re-throw other errors
        console.log(`🔍 ASSESSMENT SERVICE TRACE: Re-throwing non-foreign-key error:`, error)
        throw error
      }
    }

    const assessment = this.transformSingleAssessment(savedEntry)
    console.log(`🔍 ASSESSMENT SERVICE TRACE: Transformed assessment:`, assessment)

    // Award credits for completing assessment
    try {
      console.log(`🔍 ASSESSMENT SERVICE TRACE: Awarding credits...`)
      await profileService.addCredits(userId, 5) // 5 credits per assessment
      this.logOperation('saveAssessment.creditsAwarded', { userId, credits: 5 })
      console.log(`🔍 ASSESSMENT SERVICE TRACE: Credits awarded successfully`)
    } catch (error) {
      console.warn(`🔍 ASSESSMENT SERVICE TRACE: Credits award failed:`, error)
    }

    this.logOperation('saveAssessment.success', { userId, assessmentId: assessmentData.assessmentId })
    console.log(`🔍 ASSESSMENT SERVICE TRACE: saveAssessment completed successfully`)
    return assessment
  }

  /**
   * Delete assessment
   */
  async deleteAssessment(userId: string, assessmentId: string, permanent = false): Promise<boolean> {
    this.logOperation('deleteAssessment', { userId, assessmentId, permanent })
    this.validateRequired({ userId, assessmentId }, ['userId', 'assessmentId'])

    try {
      console.log('🗑️ AssessmentService: Deleting assessment', { userId, assessmentId, permanent })

      const response = await fetch(`/api/assessments/${assessmentId}?permanent=${permanent}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${(await this.apiManager.supabase.auth.getSession()).data.session?.access_token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to delete assessment: ${errorData.error || response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ AssessmentService: Assessment deleted successfully', result)

      this.logOperation('deleteAssessment.success', { userId, assessmentId, permanent })
      return true
    } catch (error) {
      console.error('❌ AssessmentService: Failed to delete assessment:', error)
      this.logOperation('deleteAssessment.error', { userId, assessmentId, error: error.message })
      return false
    }
  }

  /**
   * Get assessment history
   */
  async getAssessmentHistory(userId: string, limit: number = 50): Promise<AssessmentHistoryEntry[]> {
    this.logOperation('getAssessmentHistory', { userId, limit })
    this.validateRequired({ userId }, ['userId'])

    const entries = await this.executeApiCall(
      () => this.apiManager.supabaseQuery<AssessmentHistoryEntry[]>('assessment_results', {
        select: '*',
        match: { user_id: userId },
        order: 'taken_at',
        limit
      }),
      'get assessment history'
    )

    this.logOperation('getAssessmentHistory.success', { userId, count: entries?.length || 0 })
    return entries || []
  }

  /**
   * Get latest assessment for each type
   */
  async getLatestAssessments(userId: string): Promise<AssessmentResult[]> {
    this.logOperation('getLatestAssessments', { userId })
    this.validateRequired({ userId }, ['userId'])

    const allAssessments = await this.getAssessments(userId)

    // Group by assessment type and get latest for each
    const latestByType = new Map<string, AssessmentResult>()

    for (const assessment of allAssessments) {
      const existing = latestByType.get(assessment.assessmentId)
      if (!existing || new Date(assessment.completedAt) > new Date(existing.completedAt)) {
        latestByType.set(assessment.assessmentId, assessment)
      }
    }

    const latestAssessments = Array.from(latestByType.values())
    this.logOperation('getLatestAssessments.success', { userId, count: latestAssessments.length })
    return latestAssessments
  }

  /**
   * Get assessment statistics
   */
  async getAssessmentStats(userId: string): Promise<{
  }> {
    this.logOperation('getAssessmentStats', { userId })
    this.validateRequired({ userId }, ['userId'])

    const assessments = await this.getAssessments(userId)

    if (assessments.length === 0) {
      return {
      }
    }

    const types = [...new Set(assessments.map(a => a.assessmentId))]
    const scores = assessments.map(a => a.score)
    const lastAssessment = assessments.reduce((latest, current) =>
      new Date(current.completedAt) > new Date(latest.completedAt) ? current : latest
    )

    const stats = {
      types,
    }

    this.logOperation('getAssessmentStats.success', { userId, stats })
    return stats
  }

  /**
   * Generate life impacts analysis using AI
   */
  async generateLifeImpacts(userId: string): Promise<any> {
    this.logOperation('generateLifeImpacts', { userId })
    this.validateRequired({ userId }, ['userId'])

    // Get assessment data
    const assessments = await this.getAssessments(userId)
    if (assessments.length === 0) {
      throw new BusinessError('No assessments found', 'Complete at least one assessment before generating life impacts')
    }

    // Transform data for AI analysis
    const assessmentData = {
      userId,
      assessments: assessments.reduce((acc, assessment) => {
        acc[assessment.assessmentId] = {
          score: assessment.score,
          title: assessment.title,
          timestamp: assessment.takenAt
        }
        return acc
      }, {} as Record<string, any>)
    }

    const result = await this.executeApiCall(
      () => this.apiManager.supabaseFunction('daily-life-impacts', { assessmentData }),
      'generate life impacts'
    )

    this.logOperation('generateLifeImpacts.success', { userId })
    return result
  }

  /**
   * Transform assessment entries from database format to AssessmentResult format
   */
  private transformAssessmentEntries(entries: AssessmentHistoryEntry[]): AssessmentResult[] {
    return entries.map(entry => this.transformSingleAssessment(entry))
  }

  /**
   * Transform single assessment entry
   */
  private transformSingleAssessment(entry: AssessmentHistoryEntry): AssessmentResult {
    return {
    }
  }

  /**
   * Create missing profile for user
   */
  private async createMissingProfile(userId: string): Promise<void> {
    console.log(`🔍 ASSESSMENT SERVICE TRACE: Creating missing profile for user:`, userId)

    try {
      // First check if profile already exists
      console.log(`🔍 ASSESSMENT SERVICE TRACE: Checking if profile already exists...`)
      const existingProfile = await this.executeApiCall(
        () => this.apiManager.supabaseQuery('profiles', {
          select: 'id',
          match: { id: userId }
        }),
        'check existing profile'
      )

      if (existingProfile && existingProfile.length > 0) {
        console.log(`🔍 ASSESSMENT SERVICE TRACE: Profile already exists for user:`, userId)
        return // Profile already exists, no need to create
      }

      // Create profile using the same structure as AuthManager
      const newProfileData = {
        id: userId,  // Use userId as the profile id
        user_id: userId,  // Also set user_id field (required by schema)
        display_name: 'User',
        username: null,
        avatar_url: null,
        bio: null,
        empathy_credits: 10,
        total_credits_earned: 10,
        total_credits_spent: 0,
        emotional_capacity: 'medium',
        preferred_mode: 'both',
        is_anonymous: false,
        last_active: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log(`🔍 ASSESSMENT SERVICE TRACE: Upserting profile data:`, newProfileData)

      // Use direct supabase client for upsert operation
      const { data, error } = await this.apiManager.supabase
        .from('profiles')
        .upsert(newProfileData, {
          onConflict: 'id',
          ignoreDuplicates: false
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      console.log(`🔍 ASSESSMENT SERVICE TRACE: Profile upserted successfully:`, data)

      console.log(`🔍 ASSESSMENT SERVICE TRACE: Profile created successfully for user:`, userId)
    } catch (error) {
      console.error(`🔍 ASSESSMENT SERVICE TRACE: Failed to create profile for user:`, userId, error)
      throw new Error(`Failed to create profile for user ${userId}: ${error}`)
    }
  }

  /**
   * Transform data for API
   */
  protected transformForApi(data: any, userId?: string): any {
    console.log(`🔍 ASSESSMENT SERVICE TRACE: transformForApi input:`, {
      dataKeys: Object.keys(data),
      sampleData: data,
      hasAssessmentId: !!data.assessmentId,
      hasScore: !!data.score,
      hasResponses: !!data.responses
    })

    // Convert frontend AssessmentResult format to database format
    const transformed = {
      user_id: userId || data.userId, // Use passed userId parameter first
      assessment_id: data.assessmentId,
      assessment_title: data.title,
      score: data.score,
      level: data.level || 'unknown',
      severity: data.severity || 'normal', 
      responses: data.responses || {},
      result_data: {
        score: data.score,
        level: data.level,
        severity: data.severity,
        recommendations: data.recommendations || [],
        insights: data.insights || [],
        nextSteps: data.nextSteps || [],
        manifestations: data.manifestations || [],
        interpretation: data.interpretation || 'Assessment completed'
      },
      friendly_explanation: data.interpretation || 'Assessment completed',
      taken_at: data.completedAt || new Date().toISOString()
    }

    console.log(`🔍 ASSESSMENT SERVICE TRACE: transformForApi output:`, {
      transformedKeys: Object.keys(transformed),
      user_id: transformed.user_id,
      assessment_id: transformed.assessment_id,
      hasResponses: !!transformed.responses,
      hasResultData: !!transformed.result_data
    })

    // Critical check: ensure user_id is present
    if (!transformed.user_id) {
      console.error(`🔍 ASSESSMENT SERVICE TRACE: CRITICAL ERROR - user_id is missing!`, {
        originalData: data,
        transformed
      })
      throw new Error('user_id is required but missing from assessment data')
    }

    return transformed
  }

  /**
   * Calculate date range from assessments
   */
  private calculateDateRange(assessments: AssessmentResult[]): { earliest: string; latest: string } {
    const dates = assessments.map(a => new Date(a.completedAt))
    const earliest = new Date(Math.min(...dates.map(d => d.getTime())))
    const latest = new Date(Math.max(...dates.map(d => d.getTime())))

    return {
    }
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary(assessments: AssessmentResult[]): any {
    const scores = assessments.map(a => a.score)
    const totalScore = scores.reduce((sum, score) => sum + score, 0)
    const averageScore = totalScore / assessments.length

    const highestRiskArea = assessments.reduce((highest, current) =>
      current.score > highest.score ? current : highest
    )

    return {
      totalScore,
      averageScore,
    }
  }

  /**
   * Calculate overall risk level
   */
  private calculateOverallRiskLevel(assessments: AssessmentResult[]): 'low' | 'moderate' | 'high' | 'critical' {
    const averageScore = assessments.reduce((sum, a) => sum + (a.score / a.maxScore), 0) / assessments.length
    const percentage = averageScore * 100

    if (percentage >= 80) return 'critical'
    if (percentage >= 60) return 'high'
    if (percentage >= 40) return 'moderate'
    return 'low'
  }

  /**
   * Business rules validation
   */
  protected validateBusinessRules(data: any, context: string): void {
    switch (context) {
      case 'saveAssessment':
        if (!data.assessmentId || typeof data.assessmentId !== 'string') {
          throw new ValidationError('assessmentId', 'Valid assessment ID is required')
        }
        if (typeof data.score !== 'number' || data.score < 0) {
          throw new ValidationError('score', 'Score must be a non-negative number')
        }
        if (!data.responses || typeof data.responses !== 'object') {
          throw new ValidationError('responses', 'Assessment responses are required')
        }
        if (data.title && data.title.length > 200) {
          throw new ValidationError('title', 'Assessment title cannot exceed 200 characters')
        }
        break
    }
  }
}

// Export singleton instance
export const assessmentService = new AssessmentService()
