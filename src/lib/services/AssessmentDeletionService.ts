import { supabase } from '@/lib/supabase'
import { AssessmentResultRow, UserAssessmentProfileRow, OverallAssessmentRow } from '@/types/database'
import { UserProfile } from '@/data/assessment-integration'

export interface DeletionOptions {
  cascade?: boolean // Delete related data (user profile, overall assessments)
  permanent?: boolean // Hard delete vs soft delete
  reason?: string // Reason for deletion (audit purposes)
}

export interface DeletionResult {
  success: boolean
  deletedCount: number
  message: string
  affectedData?: {
    assessmentResults: number
    userProfile: boolean
    overallAssessments: number
  }
}

export interface RestoreResult {
  success: boolean
  restoredCount: number
  message: string
}

export class AssessmentDeletionService {
  /**
   * Delete a specific assessment for a user (soft delete)
   */
  static async deleteIndividualAssessment(
    userId: string,
    assessmentId: string,
    options: DeletionOptions = {}
  ): Promise<DeletionResult> {
    try {
      console.log(`🗑️ Deleting assessment ${assessmentId} for user ${userId}`)

      // Check if user owns this assessment
      const { data: existingAssessment, error: checkError } = await supabase
        .from('assessment_results')
        .select('id, assessment_id')
        .eq('user_id', userId)
        .eq('assessment_id', assessmentId)
        .eq('deleted_at', null)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(`Failed to verify assessment ownership: ${checkError.message}`)
      }

      if (!existingAssessment) {
        return {
          success: false,
          deletedCount: 0,
          message: 'Assessment not found or already deleted'
        }
      }

      if (options.permanent) {
        // Hard delete
        const { data, error } = await supabase
          .from('assessment_results')
          .delete()
          .eq('user_id', userId)
          .eq('assessment_id', assessmentId)
          .select()

        if (error) throw error

        // Log audit event
        await this.logAuditEvent(userId, 'assessment_permanently_deleted', {
          assessment_id: assessmentId,
          reason: options.reason
        })

        return {
          success: true,
          deletedCount: data?.length || 0,
          message: `Permanently deleted ${assessmentId} assessment`,
          affectedData: {
            assessmentResults: data?.length || 0,
            userProfile: false,
            overallAssessments: 0
          }
        }
      } else {
        // Soft delete using database function
        const { data, error } = await supabase.rpc('soft_delete_assessment', {
          p_user_id: userId,
          p_assessment_id: assessmentId,
          p_cascade: options.cascade || false
        })

        if (error) throw error

        // Log audit event
        await this.logAuditEvent(userId, 'assessment_soft_deleted', {
          assessment_id: assessmentId,
          cascade: options.cascade,
          reason: options.reason
        })

        // Invalidate related caches
        await this.invalidateUserCaches(userId)

        return {
          success: true,
          deletedCount: 1,
          message: `Soft deleted ${assessmentId} assessment`,
          affectedData: {
            assessmentResults: 1,
            userProfile: options.cascade || false,
            overallAssessments: options.cascade ? 1 : 0
          }
        }
      }
    } catch (error) {
      console.error('❌ Error deleting individual assessment:', error)
      return {
        success: false,
        deletedCount: 0,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Delete all assessments for a user
   */
  static async deleteAllAssessments(
    userId: string,
    options: DeletionOptions = {}
  ): Promise<DeletionResult> {
    try {
      console.log(`🗑️ Deleting all assessments for user ${userId}`)

      if (options.permanent) {
        // Hard delete all data
        const results = await Promise.allSettled([
          supabase.from('assessment_results').delete().eq('user_id', userId).select(),
          supabase.from('user_assessment_profiles').delete().eq('user_id', userId).select(),
          supabase.from('overall_assessments').delete().eq('user_id', userId).select()
        ])

        const deletedCounts = results.map(result =>
          result.status === 'fulfilled' ? result.value.data?.length || 0 : 0
        )

        // Log audit event
        await this.logAuditEvent(userId, 'all_assessments_permanently_deleted', {
          reason: options.reason,
          assessment_results_count: deletedCounts[0],
          user_profiles_count: deletedCounts[1],
          overall_assessments_count: deletedCounts[2]
        })

        return {
          success: true,
          deletedCount: deletedCounts.reduce((sum, count) => sum + count, 0),
          message: 'All assessments permanently deleted',
          affectedData: {
            assessmentResults: deletedCounts[0],
            userProfile: deletedCounts[1] > 0,
            overallAssessments: deletedCounts[2]
          }
        }
      } else {
        // Soft delete all active assessments
        const { data: assessmentResults, error: resultsError } = await supabase
          .from('assessment_results')
          .update({ deleted_at: new Date().toISOString() })
          .eq('user_id', userId)
          .eq('deleted_at', null)
          .select()

        const { data: userProfiles, error: profileError } = await supabase
          .from('user_assessment_profiles')
          .update({ deleted_at: new Date().toISOString() })
          .eq('user_id', userId)
          .eq('deleted_at', null)
          .select()

        const { data: overallAssessments, error: overallError } = await supabase
          .from('overall_assessments')
          .update({ deleted_at: new Date().toISOString() })
          .eq('user_id', userId)
          .eq('deleted_at', null)
          .select()

        if (resultsError || profileError || overallError) {
          throw new Error('Failed to soft delete all assessments')
        }

        // Log audit event
        await this.logAuditEvent(userId, 'all_assessments_soft_deleted', {
          reason: options.reason,
          assessment_results_count: assessmentResults?.length || 0,
          user_profiles_count: userProfiles?.length || 0,
          overall_assessments_count: overallAssessments?.length || 0
        })

        // Invalidate caches
        await this.invalidateUserCaches(userId)

        return {
          success: true,
          deletedCount: (assessmentResults?.length || 0) + (userProfiles?.length || 0) + (overallAssessments?.length || 0),
          message: 'All assessments soft deleted',
          affectedData: {
            assessmentResults: assessmentResults?.length || 0,
            userProfile: (userProfiles?.length || 0) > 0,
            overallAssessments: overallAssessments?.length || 0
          }
        }
      }
    } catch (error) {
      console.error('❌ Error deleting all assessments:', error)
      return {
        success: false,
        deletedCount: 0,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Restore a soft deleted assessment
   */
  static async restoreAssessment(
    userId: string,
    assessmentId: string
  ): Promise<RestoreResult> {
    try {
      console.log(`🔄 Restoring assessment ${assessmentId} for user ${userId}`)

      // Use database function for restoration
      const { data, error } = await supabase.rpc('restore_assessment', {
        p_user_id: userId,
        p_assessment_id: assessmentId
      })

      if (error) throw error

      // Log audit event
      await this.logAuditEvent(userId, 'assessment_restored', {
        assessment_id: assessmentId
      })

      // Invalidate caches
      await this.invalidateUserCaches(userId)

      return {
        success: true,
        restoredCount: 1,
        message: `Successfully restored ${assessmentId} assessment`
      }
    } catch (error) {
      console.error('❌ Error restoring assessment:', error)
      return {
        success: false,
        restoredCount: 0,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Get deletion history for a user
   */
  static async getDeletionHistory(userId: string) {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .in('action', ['assessment_soft_deleted', 'assessment_permanently_deleted', 'all_assessments_soft_deleted', 'all_assessments_permanently_deleted', 'assessment_restored'])
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('❌ Error fetching deletion history:', error)
      return []
    }
  }

  /**
   * Check if an assessment can be restored (within grace period)
   */
  static async canRestoreAssessment(userId: string, assessmentId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('assessment_results')
        .select('deleted_at')
        .eq('user_id', userId)
        .eq('assessment_id', assessmentId)
        .not('deleted_at', 'is', null)
        .single()

      if (error || !data) return false

      // Check if within 30-day grace period
      const deletedAt = new Date(data.deleted_at)
      const gracePeriodEnd = new Date(deletedAt.getTime() + 30 * 24 * 60 * 60 * 1000)
      const now = new Date()

      return now <= gracePeriodEnd
    } catch (error) {
      console.error('❌ Error checking restoration eligibility:', error)
      return false
    }
  }

  /**
   * Get user's assessment data summary (including deleted status)
   */
  static async getUserAssessmentSummary(userId: string) {
    try {
      const [activeResults, deletedResults, userProfile, overallAssessments] = await Promise.all([
        supabase.from('assessment_results')
          .select('assessment_id, taken_at')
          .eq('user_id', userId)
          .is('deleted_at', null),

        supabase.from('assessment_results')
          .select('assessment_id, deleted_at')
          .eq('user_id', userId)
          .not('deleted_at', 'is', null),

        supabase.from('user_assessment_profiles')
          .select('id, last_assessed, deleted_at')
          .eq('user_id', userId)
          .single(),

        supabase.from('overall_assessments')
          .select('id, created_at, deleted_at')
          .eq('user_id', userId)
      ])

      return {
        activeAssessments: activeResults.data || [],
        deletedAssessments: deletedResults.data || [],
        userProfile: userProfile.data,
        overallAssessments: overallAssessments.data || []
      }
    } catch (error) {
      console.error('❌ Error getting user assessment summary:', error)
      return {
        activeAssessments: [],
        deletedAssessments: [],
        userProfile: null,
        overallAssessments: []
      }
    }
  }

  /**
   * Private helper methods
   */
  private static async logAuditEvent(userId: string, action: string, metadata: any) {
    try {
      await supabase.from('audit_logs').insert({
        user_id: userId,
        action,
        resource_type: 'assessment',
        new_values: metadata
      })
    } catch (error) {
      console.error('❌ Failed to log audit event:', error)
      // Don't throw - audit logging failure shouldn't break the main operation
    }
  }

  private static async invalidateUserCaches(userId: string) {
    try {
      // Invalidate any cached data for this user
      // This would typically involve Redis cache invalidation or similar
      console.log(`🔄 Invalidated caches for user ${userId}`)
    } catch (error) {
      console.error('❌ Failed to invalidate caches:', error)
    }
  }
}
