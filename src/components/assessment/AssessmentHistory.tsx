/**
 * Assessment History Component
 * Displays user's assessment history and progress
 */

'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '@/hooks/useApp'
import { AssessmentManager, AssessmentHistoryEntry } from '@/lib/services/AssessmentManager'
import { ASSESSMENTS } from '@/data/assessments'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { assessmentService } from '@/services/AssessmentService'

// Material Symbols icons import
import 'material-symbols/outlined.css'

interface AssessmentHistoryProps {
  className?: string
}

export default function AssessmentHistory({ className = '' }: AssessmentHistoryProps) {
  const { auth } = useApp()
  const { user, isLoading: authLoading } = auth
  const router = useRouter()
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    entry: AssessmentHistoryEntry | null
  }>({
    isOpen: false,
    entry: null
  })
  const mountedRef = useRef(false)

  const loadHistory = useCallback(async () => {
    setError(null)
    try {
      // Resolve userId from context or Supabase as a fallback
      const ctxUserId = user?.id
      const authUserId = ctxUserId || (await supabase.auth.getUser()).data.user?.id

      if (!authUserId) {
        setLoading(false)
        return
      }

      const cacheKey = `assessment-history-${authUserId}`
      const cachedData = typeof window !== 'undefined' ? localStorage.getItem(cacheKey) : null

      let usedCache = false
      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData)
          // If cache is fresh (<5 min), show immediately, but still revalidate in background
          if (Date.now() - parsedData.timestamp < 5 * 60 * 1000) {
            setAssessmentHistory(parsedData.data)
            setLoading(false)
            usedCache = true
          }
        } catch (_) {
          // Ignore cache parse errors
        }
      }

      if (!usedCache) setLoading(true)

      // Fetch fresh data (stale-while-revalidate)
      const history = await AssessmentManager.getAssessmentHistory(authUserId)

      // Update cache & UI if different/new
      if (typeof window !== 'undefined') {
        localStorage.setItem(cacheKey, JSON.stringify({ data: history, timestamp: Date.now() }))
      }
      setAssessmentHistory(history)
    } catch (error) {
      console.error('Error loading assessment history:', error)
      setError('Failed to load assessment history. Please try again.')
      if (retryCount < 3) setTimeout(() => setRetryCount(prev => prev + 1), 2000)
    } finally {
      setLoading(false)
    }
  }, [user, retryCount])

  useEffect(() => {
    mountedRef.current = true
    // Try to load regardless of authLoading, we have an internal fallback
    loadHistory()
    return () => { mountedRef.current = false }
  }, [])

  // Re-run when user resolves or retry requested
  useEffect(() => {
    if (!mountedRef.current) return
    if (!authLoading) {
      loadHistory()
    }
  }, [authLoading, user?.id, retryCount, loadHistory])

  // Subscribe to realtime changes for immediate refresh after results save
  useEffect(() => {
    if (!user?.id) return
    const channel = supabase
      .channel('assessment_results_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assessment_results', filter: `user_id=eq.${user.id}` }, () => {
        loadHistory()
      })
      .subscribe()
    return () => {
      try { supabase.removeChannel(channel) } catch (_) {}
    }
  }, [user?.id, loadHistory])

  const getAssessmentIcon = (assessmentId: string) => {
    const assessment = ASSESSMENTS[assessmentId]
    if (!assessment) return 'assessment'
    
    switch (assessment.category) {
      case 'depression': return 'mood'
      case 'anxiety': return 'psychology'
      case 'trauma': return 'healing'
      case 'resilience': return 'fitness_center'
      case 'wellbeing': return 'self_improvement'
      default: return 'assessment'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'normal': return 'text-green-600 bg-green-100'
      case 'mild': return 'text-yellow-600 bg-yellow-100'
      case 'moderate': return 'text-orange-600 bg-orange-100'
      case 'severe': return 'text-red-600 bg-red-100'
      case 'critical': return 'text-red-800 bg-red-200'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Confirmation Dialog Component
  const ConfirmDeleteDialog = ({ entry, isOpen, onConfirm, onCancel }: {
    entry: AssessmentHistoryEntry | null
    isOpen: boolean
    onConfirm: () => void
    onCancel: () => void
  }) => (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-red-600">delete</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Assessment</h3>
            </div>

            {/* Content */}
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{entry?.assessmentTitle}</strong>?
              This action cannot be undone.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <motion.button
                onClick={onCancel}
                className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={onConfirm}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={deletingId === entry?.id}
              >
                {deletingId === entry?.id ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Deleting...
                  </div>
                ) : (
                  'Delete'
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  const handleAssessmentClick = (entry: AssessmentHistoryEntry) => {
    // Navigate to results page with assessment ID - results page will fetch data from database
    const target = `/results?assessment=${encodeURIComponent(entry.assessmentId)}`
    try {
      router.push(target)
    } catch {
      window.location.href = target
    }
  }

  const handleDeleteClick = useCallback((entry: AssessmentHistoryEntry, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click navigation
    setDeleteDialog({ isOpen: true, entry })
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteDialog.entry || !user?.id) return

    setDeletingId(deleteDialog.entry.id)

    try {
      // Call AssessmentService delete method
      await assessmentService.deleteAssessment(user.id, deleteDialog.entry.assessmentId)

      // Refresh local history
      await loadHistory()

      // Close dialog
      setDeleteDialog({ isOpen: false, entry: null })

      // Optional: Show success message
      console.log('Assessment deleted successfully')

    } catch (error) {
      console.error('Delete failed:', error)
      // Optional: Show error message
      console.error('Failed to delete assessment')
    } finally {
      setDeletingId(null)
    }
  }, [deleteDialog.entry, user?.id, loadHistory])

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialog({ isOpen: false, entry: null })
  }, [])

  // Enhanced Loading Skeleton
  const renderSkeleton = () => (
    <div className="space-y-8 max-w-4xl mx-auto">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="relative bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/60 overflow-hidden shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
        >
          {/* Skeleton Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100/50 to-slate-200/30"></div>

          {/* Animated Pulse Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/40 to-transparent animate-pulse"></div>

          <div className="relative p-8">
            {/* Delete Button Skeleton */}
            <div className="absolute top-6 right-6 w-10 h-10 bg-slate-200/60 rounded-xl animate-pulse"></div>

            <div className="flex items-start gap-6 pr-16">
              {/* Icon Skeleton */}
              <div className="flex-shrink-0 w-14 h-14 bg-slate-200/60 rounded-2xl animate-pulse"></div>

              <div className="flex-1 min-w-0">
                {/* Title Skeleton */}
                <div className="h-5 bg-slate-200/60 rounded-lg w-2/3 mb-3 animate-pulse"></div>

                {/* Date Skeleton */}
                <div className="h-4 bg-slate-200/40 rounded w-1/2 mb-6 animate-pulse"></div>

                {/* Metrics Skeleton */}
                <div className="flex items-center gap-8">
                  <div className="bg-slate-200/60 rounded-xl px-4 py-3 min-w-[80px] animate-pulse">
                    <div className="h-6 bg-slate-100/60 rounded w-8 mx-auto mb-1"></div>
                    <div className="h-3 bg-slate-100/40 rounded w-12 mx-auto"></div>
                  </div>
                  <div className="bg-slate-200/60 rounded-xl px-4 py-3 min-w-[80px] animate-pulse">
                    <div className="h-4 bg-slate-100/60 rounded w-12 mx-auto mb-1"></div>
                    <div className="h-3 bg-slate-100/40 rounded w-10 mx-auto"></div>
                  </div>
                </div>
              </div>

              {/* Arrow Skeleton */}
              <div className="flex-shrink-0 w-10 h-10 bg-slate-200/60 rounded-xl animate-pulse"></div>
            </div>

            {/* Bottom Accent Skeleton */}
            <div className="h-px bg-slate-200/40 mt-6 animate-pulse"></div>
          </div>
        </motion.div>
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className={`${className}`}>
        {/* Enhanced Loading Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="relative max-w-4xl mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Subtle Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 via-indigo-50/15 to-purple-50/20 rounded-3xl blur-2xl opacity-40 -z-10"></div>

            <div className="relative px-8 py-6">
              <motion.h2
                className="text-3xl md:text-4xl font-light text-gray-900 tracking-tight leading-tight mb-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Loading Your{' '}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent font-normal">
                  Assessment History
                </span>
              </motion.h2>

              <motion.p
                className="text-gray-600 font-light leading-relaxed max-w-md mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                Retrieving your mental wellness journey...
              </motion.p>
            </div>
          </motion.div>
        </motion.div>

        {renderSkeleton()}
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${className}`}>
        {/* Enhanced Error State */}
        <motion.div
          className="text-center py-20 px-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="relative max-w-lg mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Error Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/40 via-orange-50/30 to-red-50/40 rounded-3xl blur-xl opacity-60 -z-10"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white/90 rounded-3xl -z-10"></div>
            <div className="absolute inset-0 shadow-xl shadow-red-900/[0.08] rounded-3xl -z-10"></div>

            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-12 border border-slate-200/50 shadow-lg">
              {/* Enhanced Error Icon */}
              <motion.div
                className="relative w-20 h-20 mx-auto mb-8"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-100 via-orange-100 to-red-100 rounded-3xl shadow-sm"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-red-500 via-orange-500 to-red-500 rounded-3xl flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-white text-3xl">
                    error_outline
                  </span>
                </div>
              </motion.div>

              {/* Enhanced Error Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <h3 className="text-3xl font-light text-gray-900 mb-4 tracking-tight">
                  Unable to Load History
                </h3>
                <p className="text-gray-600 font-light mb-8 leading-relaxed max-w-sm mx-auto">
                  {error}
                </p>
              </motion.div>

              {/* Enhanced Retry Button */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <motion.button
                  onClick={loadHistory}
                  disabled={loading}
                  className="group relative w-full max-w-xs mx-auto overflow-hidden px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 hover:from-red-700 hover:via-orange-700 hover:to-red-700 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative flex items-center justify-center gap-3">
                    <span className="text-base">
                      {loading ? 'Retrying...' : 'Try Again'}
                    </span>
                    {!loading && (
                      <motion.span
                        className="material-symbols-outlined text-lg"
                        whileHover={{ x: 3 }}
                        transition={{ duration: 0.2 }}
                      >
                        refresh
                      </motion.span>
                    )}
                  </div>
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className={`${className}`}>
        {/* Enhanced Sign-in Prompt */}
        <motion.div
          className="text-center py-20 px-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="relative max-w-lg mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/40 via-gray-50/30 to-slate-50/40 rounded-3xl blur-xl opacity-60 -z-10"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white/90 rounded-3xl -z-10"></div>
            <div className="absolute inset-0 shadow-xl shadow-slate-900/[0.08] rounded-3xl -z-10"></div>

            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-12 border border-slate-200/50 shadow-lg">
              {/* Icon */}
              <motion.div
                className="relative w-20 h-20 mx-auto mb-8"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-gray-100 to-slate-100 rounded-3xl shadow-sm"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-slate-500 via-gray-500 to-slate-500 rounded-3xl flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-white text-3xl">
                    login
                  </span>
                </div>
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <h3 className="text-3xl font-light text-gray-900 mb-4 tracking-tight">
                  Sign In Required
                </h3>
                <p className="text-gray-600 font-light mb-8 leading-relaxed max-w-sm mx-auto">
                  Please sign in to view your assessment history and track your mental wellness journey.
                </p>
              </motion.div>

              {/* Sign In Button */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <motion.button
                  onClick={() => router.push('/login')}
                  className="group relative w-full max-w-xs mx-auto overflow-hidden px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 bg-gradient-to-r from-slate-600 via-gray-600 to-slate-600 hover:from-slate-700 hover:via-gray-700 hover:to-slate-700 shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative flex items-center justify-center gap-3">
                    <span className="text-base">Sign In</span>
                    <motion.span
                      className="material-symbols-outlined text-lg"
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.2 }}
                    >
                      arrow_forward
                    </motion.span>
                  </div>
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {/* Confirmation Dialog */}
      <ConfirmDeleteDialog
        entry={deleteDialog.entry}
        isOpen={deleteDialog.isOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Refined Header with Enhanced Visual Appeal */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Ultra-Sophisticated Header Container */}
        <motion.div
          className="relative max-w-4xl mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Subtle Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-indigo-50/20 to-purple-50/30 rounded-3xl blur-2xl opacity-50 -z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white/80 rounded-3xl -z-10"></div>

          <div className="relative px-8 py-10">
            {/* Enhanced Typography with Gradient */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-4xl md:text-5xl font-extralight text-gray-900 tracking-tight leading-tight mb-4">
                Your{' '}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent font-normal">
                  Assessment Journey
                </span>
              </h2>

              {/* Sophisticated Accent Line */}
              <motion.div
                className="w-24 h-px bg-gradient-to-r from-blue-400/60 via-indigo-400/60 to-purple-400/60 mx-auto mb-6"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              />
            </motion.div>

            {/* Refined Subtitle with Better Copy */}
            <motion.div
              className="max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <p className="text-lg md:text-xl text-gray-600 font-light leading-relaxed tracking-[-0.005em]">
                Revisit your progress, reflect on insights, and witness the transformation in your mental wellness journey.
              </p>

              {/* Professional Badge */}
              <motion.div
                className="mt-6 inline-flex items-center gap-2.5 px-4 py-2 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200/60 rounded-full shadow-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                whileHover={{ scale: 1.02 }}
              >
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-slate-700 tracking-wide">
                  Secure & Private
                </span>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Assessment History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-6"
        >
          {assessmentHistory.length === 0 ? (
            <motion.div
              className="text-center py-20 px-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {/* Ultra-Sophisticated Empty State Container */}
              <motion.div
                className="relative max-w-lg mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                {/* Elegant Background with Depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 via-purple-50/30 to-blue-50/40 rounded-3xl blur-xl opacity-60 -z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white/90 rounded-3xl -z-10"></div>
                <div className="absolute inset-0 shadow-xl shadow-indigo-900/[0.08] rounded-3xl -z-10"></div>

                <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-12 border border-slate-200/50 shadow-lg">
                  {/* Enhanced Icon with Animation */}
                  <motion.div
                    className="relative w-20 h-20 mx-auto mb-8"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                  >
                    {/* Icon Background with Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-100 rounded-3xl shadow-sm"></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-lg">
                      <span className="material-symbols-outlined text-white text-3xl">
                        psychology_alt
                      </span>
                    </div>

                    {/* Pulsing Animation */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-indigo-400/40 via-purple-400/40 to-blue-400/40 rounded-3xl"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.div>

                  {/* Enhanced Typography */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
                    <h3 className="text-3xl font-light text-gray-900 mb-4 tracking-tight">
                      Begin Your Journey
                    </h3>
                    <p className="text-gray-600 font-light mb-8 leading-relaxed max-w-sm mx-auto">
                      Your first assessment is the foundation of understanding and growth.
                      Discover insights that will guide your mental wellness path.
                    </p>
                  </motion.div>

                  {/* Enhanced Call-to-Action */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.0 }}
                  >
                    <motion.button
                      onClick={() => router.push('/assessments')}
                      className="group relative w-full max-w-xs mx-auto overflow-hidden px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl"
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Button Background Animation */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {/* Shine Effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-out"></div>
                      </div>

                      <div className="relative flex items-center justify-center gap-3">
                        <span className="text-base">Start Your First Assessment</span>
                        <motion.span
                          className="material-symbols-outlined text-lg"
                          whileHover={{ x: 3 }}
                          transition={{ duration: 0.2 }}
                        >
                          arrow_forward
                        </motion.span>
                      </div>
                    </motion.button>

                    {/* Additional Encouragement */}
                    <motion.p
                      className="text-sm text-gray-500 mt-4 font-light"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 1.2 }}
                    >
                      Takes only 2-5 minutes • Completely confidential
                    </motion.p>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <div className="space-y-8 max-w-4xl mx-auto">
              {assessmentHistory.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  className="group relative cursor-pointer overflow-hidden"
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: index * 0.12,
                    duration: 0.6,
                    ease: [0.25, 0.1, 0.25, 1]
                  }}
                  onClick={() => handleAssessmentClick(entry)}
                  whileHover={{
                    scale: 1.02,
                    y: -4,
                    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Ultra-Sophisticated Card Container */}
                  <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/60 overflow-hidden shadow-lg group-hover:shadow-2xl group-hover:shadow-slate-900/[0.12] transition-all duration-500">

                    {/* Multi-layer Background System */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/30 to-white"></div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-slate-25/15 to-transparent opacity-50"></div>

                    {/* Subtle Geometric Pattern */}
                    <div className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity duration-500">
                      <div className="absolute top-8 right-8 w-20 h-20 border border-slate-200 rounded-full"></div>
                      <div className="absolute bottom-8 left-8 w-16 h-16 border border-slate-200 rounded-full"></div>
                    </div>
                    {/* Content Container */}
                    <div className="relative p-8">
                      {/* Enhanced Delete Button - More Visible */}
                      <motion.button
                        className="absolute top-6 right-6 p-2.5 bg-white/80 backdrop-blur-sm border border-red-200/60 rounded-xl shadow-sm opacity-60 group-hover:opacity-100 hover:bg-red-50 hover:border-red-300/80 transition-all duration-300"
                        onClick={(e) => handleDeleteClick(entry, e)}
                        whileHover={{
                          scale: 1.1,
                          boxShadow: "0 8px 25px -8px rgba(239, 68, 68, 0.3)"
                        }}
                        whileTap={{ scale: 0.95 }}
                        disabled={deletingId === entry.id}
                        aria-label={`Delete ${entry.assessmentTitle} assessment`}
                      >
                        {deletingId === entry.id ? (
                          <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
                        ) : (
                          <span className="material-symbols-outlined text-red-500 text-lg">
                            delete_outline
                          </span>
                        )}
                      </motion.button>

                      <div className="flex items-start gap-6 pr-16">
                        {/* Enhanced Assessment Icon */}
                        <motion.div
                          className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300"
                          whileHover={{
                            scale: 1.05,
                            rotate: 5,
                            background: "linear-gradient(135deg, #e2e8f0, #cbd5e1)"
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <span className="material-symbols-outlined text-2xl text-slate-600 group-hover:text-slate-700 transition-colors duration-200">
                            {getAssessmentIcon(entry.assessmentId)}
                          </span>
                        </motion.div>

                        <div className="flex-1 min-w-0">
                          {/* Enhanced Title */}
                          <motion.h3
                            className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors duration-300 leading-tight"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                          >
                            {entry.assessmentTitle}
                          </motion.h3>

                          {/* Enhanced Date */}
                          <motion.p
                            className="text-sm text-gray-500 mb-6 font-light tracking-wide"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                          >
                            {formatDate(entry.takenAt)}
                          </motion.p>

                          {/* Enhanced Metrics Section */}
                          <motion.div
                            className="flex items-center gap-8"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                          >
                            {/* Score Metric */}
                            <div className="text-center bg-slate-50/80 rounded-xl px-4 py-3 min-w-[80px]">
                              <motion.div
                                className="text-2xl font-light text-gray-900 mb-1"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.2 }}
                              >
                                {entry.score}
                              </motion.div>
                              <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                                Score
                              </div>
                            </div>

                            {/* Severity Level */}
                            <div className="text-center bg-slate-50/80 rounded-xl px-4 py-3 min-w-[80px]">
                              <motion.div
                                className={`text-sm font-semibold mb-1 ${
                                  entry.severity === 'normal' ? 'text-green-600' :
                                  entry.severity === 'mild' ? 'text-yellow-600' :
                                  entry.severity === 'moderate' ? 'text-orange-600' :
                                  entry.severity === 'severe' ? 'text-red-600' : 'text-red-800'
                                }`}
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.2 }}
                              >
                                {entry.level}
                              </motion.div>
                              <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                                Level
                              </div>
                            </div>
                          </motion.div>
                        </div>

                        {/* Enhanced Arrow Indicator */}
                        <motion.div
                          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300"
                          whileHover={{ x: 4, scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="w-10 h-10 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl flex items-center justify-center shadow-sm border border-slate-300/50">
                            <span className="material-symbols-outlined text-slate-600">arrow_forward</span>
                          </div>
                        </motion.div>
                      </div>

                      {/* Sophisticated Bottom Accent */}
                      <motion.div
                        className="h-px bg-gradient-to-r from-transparent via-slate-200/60 to-transparent mt-6"
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        transition={{
                          delay: 0.4,
                          duration: 0.6,
                          ease: [0.25, 0.1, 0.25, 1]
                        }}
                      />
                    </div>

                    {/* Ultra-refined Hover Effects */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-slate-50/8 via-transparent to-slate-50/4 opacity-0 group-hover:opacity-100 transition-all duration-500"
                      initial={false}
                    />

                    {/* Enhanced Shadow System */}
                    <div className="absolute -inset-2 bg-gradient-to-br from-slate-200/15 via-slate-300/8 to-slate-200/15 rounded-3xl blur-lg opacity-0 group-hover:opacity-60 transition-all duration-700 -z-10"></div>
                    <div className="absolute -inset-1 bg-gradient-to-br from-slate-100/20 via-slate-200/10 to-slate-100/20 rounded-3xl blur-md opacity-0 group-hover:opacity-50 transition-all duration-500 -z-10"></div>
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-slate-50/25 via-transparent to-slate-50/25 rounded-3xl blur-sm opacity-0 group-hover:opacity-40 transition-all duration-300 -z-10"></div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
    </div>
  )
}

export { AssessmentHistory }
