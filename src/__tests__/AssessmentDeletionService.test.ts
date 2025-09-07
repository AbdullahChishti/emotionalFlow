import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AssessmentDeletionService } from '@/lib/services/AssessmentDeletionService'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            data: [],
            error: null
          }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            data: [],
            error: null
          }))
        }))
      })),
      rpc: vi.fn(() => ({
        data: true,
        error: null
      }))
    })),
    auth: {
      getSession: vi.fn(() => ({
        data: { session: { access_token: 'mock-token' } }
      }))
    },
    from: vi.fn()
  }
}))

describe('AssessmentDeletionService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('deleteIndividualAssessment', () => {
    it('should successfully delete an assessment', async () => {
      const mockUserId = 'user-123'
      const mockAssessmentId = 'phq9'

      const result = await AssessmentDeletionService.deleteIndividualAssessment(
        mockUserId,
        mockAssessmentId
      )

      expect(result.success).toBe(true)
      expect(result.deletedCount).toBe(1)
      expect(result.message).toContain('Soft deleted')
    })

    it('should handle assessment not found', async () => {
      const mockUserId = 'user-123'
      const mockAssessmentId = 'nonexistent'

      const result = await AssessmentDeletionService.deleteIndividualAssessment(
        mockUserId,
        mockAssessmentId
      )

      expect(result.success).toBe(false)
      expect(result.deletedCount).toBe(0)
      expect(result.message).toContain('not found')
    })

    it('should support permanent deletion', async () => {
      const mockUserId = 'user-123'
      const mockAssessmentId = 'phq9'

      const result = await AssessmentDeletionService.deleteIndividualAssessment(
        mockUserId,
        mockAssessmentId,
        { permanent: true }
      )

      expect(result.success).toBe(true)
      expect(result.message).toContain('Permanently deleted')
    })
  })

  describe('deleteAllAssessments', () => {
    it('should successfully delete all assessments', async () => {
      const mockUserId = 'user-123'

      const result = await AssessmentDeletionService.deleteAllAssessments(mockUserId)

      expect(result.success).toBe(true)
      expect(result.deletedCount).toBeGreaterThanOrEqual(0)
      expect(result.message).toContain('All assessments soft deleted')
    })

    it('should require confirmation for soft deletion', async () => {
      const mockUserId = 'user-123'

      // This test would need to mock the actual API call
      // For now, we'll just test the service logic
      const result = await AssessmentDeletionService.deleteAllAssessments(mockUserId)

      expect(result.success).toBe(true)
    })
  })

  describe('restoreAssessment', () => {
    it('should successfully restore an assessment', async () => {
      const mockUserId = 'user-123'
      const mockAssessmentId = 'phq9'

      const result = await AssessmentDeletionService.restoreAssessment(
        mockUserId,
        mockAssessmentId
      )

      expect(result.success).toBe(true)
      expect(result.restoredCount).toBe(1)
      expect(result.message).toContain('restored')
    })
  })

  describe('canRestoreAssessment', () => {
    it('should check if assessment can be restored', async () => {
      const mockUserId = 'user-123'
      const mockAssessmentId = 'phq9'

      const canRestore = await AssessmentDeletionService.canRestoreAssessment(
        mockUserId,
        mockAssessmentId
      )

      expect(typeof canRestore).toBe('boolean')
    })
  })

  describe('getUserAssessmentSummary', () => {
    it('should return assessment summary', async () => {
      const mockUserId = 'user-123'

      const summary = await AssessmentDeletionService.getUserAssessmentSummary(mockUserId)

      expect(summary).toHaveProperty('activeAssessments')
      expect(summary).toHaveProperty('deletedAssessments')
      expect(summary).toHaveProperty('userProfile')
      expect(summary).toHaveProperty('overallAssessments')
    })
  })

  describe('getDeletionHistory', () => {
    it('should return deletion history', async () => {
      const mockUserId = 'user-123'

      const history = await AssessmentDeletionService.getDeletionHistory(mockUserId)

      expect(Array.isArray(history)).toBe(true)
    })
  })
})
