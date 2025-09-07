import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ASSESSMENTS } from '@/data/assessments'
import { getAssessmentIcon } from '@/data/assessment-icons'
import { useAssessmentData } from '@/hooks/useAssessmentData'
import { useAuth } from '@/stores/authStore'

type UserProfile = Database['public']['Tables']['user_assessment_profiles']['Row'] | null
type OverallAssessment = Database['public']['Tables']['overall_assessments']['Row']

interface AssessmentSummary {
  activeAssessments: Array<{
    assessment_id: string
    taken_at: string
  }>
  deletedAssessments: Array<{
    assessment_id: string
    deleted_at: string
  }>
  userProfile: UserProfile
  overallAssessments: OverallAssessment[]
}

interface AssessmentManagementProps {
  onClose?: () => void
  className?: string
}

export function AssessmentManagement({ onClose, className = '' }: AssessmentManagementProps) {
  const { user } = useAuth()
  const { deleteAssessment, bulkDeleteAssessments, restoreAssessment } = useAssessmentData()
  const [summary, setSummary] = useState<AssessmentSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedAssessments, setSelectedAssessments] = useState<Set<string>>(new Set())
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const loadAssessmentSummary = useCallback(async () => {
    try {
      setLoading(true)
      if (!user?.id) return

      const response = await fetch('/api/assessments/summary?include_deleted=true', {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSummary(data.data.summary)
      }
    } catch (error) {
      console.error('Error loading assessment summary:', error)
      showToast('Failed to load assessment data', 'error')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadAssessmentSummary()
  }, [loadAssessmentSummary])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000)
  }

  const handleDeleteAssessment = async (assessmentId: string, permanent = false) => {
    try {
      setActionLoading(assessmentId)

      const success = await deleteAssessment(assessmentId, permanent)

      if (success) {
        showToast('Assessment deleted successfully', 'success')
        await loadAssessmentSummary()
      } else {
        showToast('Failed to delete assessment', 'error')
      }
    } catch (error) {
      console.error('Error deleting assessment:', error)
      showToast('Failed to delete assessment', 'error')
    } finally {
      setActionLoading(null)
      setShowDeleteDialog(false)
      setDeleteTarget(null)
    }
  }

  const handleBulkDelete = async (permanent = false) => {
    try {
      setActionLoading('bulk')

      const assessmentIds = Array.from(selectedAssessments)
      const success = await bulkDeleteAssessments(assessmentIds, permanent)

      if (success) {
        showToast(`${assessmentIds.length} assessments deleted successfully`, 'success')
        await loadAssessmentSummary()
        setSelectedAssessments(new Set())
      } else {
        showToast('Failed to delete assessments', 'error')
      }
    } catch (error) {
      console.error('Error bulk deleting assessments:', error)
      showToast('Failed to delete assessments', 'error')
    } finally {
      setActionLoading(null)
      setShowBulkDeleteDialog(false)
    }
  }

  const handleRestoreAssessment = async (assessmentId: string) => {
    try {
      setActionLoading(assessmentId)

      const success = await restoreAssessment(assessmentId)

      if (success) {
        showToast('Assessment restored successfully', 'success')
        await loadAssessmentSummary()
      } else {
        showToast('Failed to restore assessment', 'error')
      }
    } catch (error) {
      console.error('Error restoring assessment:', error)
      showToast('Failed to restore assessment', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const toggleAssessmentSelection = (assessmentId: string) => {
    const newSelection = new Set(selectedAssessments)
    if (newSelection.has(assessmentId)) {
      newSelection.delete(assessmentId)
    } else {
      newSelection.add(assessmentId)
    }
    setSelectedAssessments(newSelection)
  }

  const getAssessmentStatus = (assessmentId: string) => {
    const active = summary?.activeAssessments.find(a => a.assessment_id === assessmentId)
    const deleted = summary?.deletedAssessments.find(a => a.assessment_id === assessmentId)

    if (active) return { status: 'active', takenAt: active.taken_at }
    if (deleted) return { status: 'deleted', deletedAt: deleted.deleted_at }
    return { status: 'never_taken' }
  }

  if (loading) {
    return (
      <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-sm ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-slate-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className={`bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-200/60">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Manage Assessments</h2>
            <p className="text-sm text-slate-600 mt-1">
              View, delete, or restore your mental health assessments
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-slate-500">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Bulk Actions */}
        {selectedAssessments.size > 0 && (
          <motion.div
            className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {selectedAssessments.size} assessment{selectedAssessments.size > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedAssessments(new Set())}
                  className="px-3 py-1 text-sm text-slate-600 hover:text-slate-800"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowBulkDeleteDialog(true)}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Assessment List */}
        <div className="space-y-4">
          {Object.entries(ASSESSMENTS).map(([assessmentId, assessment]) => {
            const status = getAssessmentStatus(assessmentId)
            const iconName = getAssessmentIcon(assessmentId)
            const isSelected = selectedAssessments.has(assessmentId)
            const isLoading = actionLoading === assessmentId

            return (
              <motion.div
                key={assessmentId}
                className={`p-4 rounded-lg border transition-all ${
                  status.status === 'active'
                    ? 'bg-green-50 border-green-200'
                    : status.status === 'deleted'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-slate-50 border-slate-200'
                } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Selection Checkbox */}
                    {status.status === 'active' && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleAssessmentSelection(assessmentId)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    )}

                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      status.status === 'active'
                        ? 'bg-green-100'
                        : status.status === 'deleted'
                        ? 'bg-red-100'
                        : 'bg-slate-100'
                    }`}>
                      <span className={`material-symbols-outlined ${
                        status.status === 'active'
                          ? 'text-green-600'
                          : status.status === 'deleted'
                          ? 'text-red-600'
                          : 'text-slate-400'
                      }`}>
                        {iconName}
                      </span>
                    </div>

                    {/* Assessment Info */}
                    <div>
                      <h3 className="font-medium text-slate-900">{assessment.shortTitle}</h3>
                      <p className="text-sm text-slate-600">{assessment.category}</p>
                      {status.status === 'active' && status.takenAt && (
                        <p className="text-xs text-slate-500">
                          Taken: {new Date(status.takenAt).toLocaleDateString()}
                        </p>
                      )}
                      {status.status === 'deleted' && status.deletedAt && (
                        <p className="text-xs text-red-600">
                          Deleted: {new Date(status.deletedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      status.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : status.status === 'deleted'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {status.status === 'active' ? 'Active' :
                       status.status === 'deleted' ? 'Deleted' : 'Not Taken'}
                    </span>

                    {/* Action Buttons */}
                    <div className="flex gap-1">
                      {status.status === 'active' && (
                        <button
                          onClick={() => {
                            setDeleteTarget(assessmentId)
                            setShowDeleteDialog(true)
                          }}
                          disabled={isLoading}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">
                            {isLoading ? 'hourglass_empty' : 'delete'}
                          </span>
                        </button>
                      )}

                      {status.status === 'deleted' && (
                        <button
                          onClick={() => handleRestoreAssessment(assessmentId)}
                          disabled={isLoading}
                          className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">
                            {isLoading ? 'hourglass_empty' : 'restore'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <h3 className="font-medium text-slate-900 mb-2">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {summary?.activeAssessments.length || 0}
              </div>
              <div className="text-slate-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {summary?.deletedAssessments.length || 0}
              </div>
              <div className="text-slate-600">Deleted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-600">
                {Object.keys(ASSESSMENTS).length - (summary?.activeAssessments.length || 0) - (summary?.deletedAssessments.length || 0)}
              </div>
              <div className="text-slate-600">Not Taken</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {summary?.overallAssessments.filter(a => !a.deleted_at).length || 0}
              </div>
              <div className="text-slate-600">Overall</div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteDialog && deleteTarget && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-md mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Assessment</h3>
              <p className="text-slate-600 mb-4">
                Are you sure you want to delete your {ASSESSMENTS[deleteTarget]?.shortTitle} assessment?
                This action can be undone within 30 days.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteAssessment(deleteTarget)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Delete Confirmation Dialog */}
      <AnimatePresence>
        {showBulkDeleteDialog && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-md mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Selected Assessments</h3>
              <p className="text-slate-600 mb-4">
                Are you sure you want to delete {selectedAssessments.size} assessment{selectedAssessments.size > 1 ? 's' : ''}?
                This action can be undone within 30 days.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBulkDeleteDialog(false)}
                  className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleBulkDelete(false)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed bottom-4 right-4 z-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className={`px-4 py-3 rounded-lg shadow-lg ${
              toast.type === 'success'
                ? 'bg-green-100 border border-green-200 text-green-800'
                : 'bg-red-100 border border-red-200 text-red-800'
            }`}>
              {toast.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
