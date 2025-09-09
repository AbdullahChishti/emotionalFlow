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
      const success = await assessmentService.deleteAssessment(user.id, deleteDialog.entry.assessmentId)

      if (success) {
        // Refresh local history
        await loadHistory()

        // Close dialog
        setDeleteDialog({ isOpen: false, entry: null })
      } else {
        console.error('Failed to delete assessment')
        setError('Failed to delete assessment. Please try again.')
      }

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

  // Loading skeleton
  const renderSkeleton = () => (
    <div className="space-y-6 max-w-4xl mx-auto">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="relative bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/60 overflow-hidden shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
        >
          <div className="relative p-8">
            <div className="absolute top-6 right-6 w-10 h-10 bg-slate-200/60 rounded-xl animate-pulse"></div>
            <div className="flex items-start gap-6 pr-16">
              <div className="flex-shrink-0 w-14 h-14 bg-slate-200/60 rounded-2xl animate-pulse"></div>
              <div className="flex-1 min-w-0">
                <div className="h-5 bg-slate-200/60 rounded-lg w-2/3 mb-3 animate-pulse"></div>
                <div className="h-4 bg-slate-200/40 rounded w-1/2 mb-6 animate-pulse"></div>
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
              <div className="flex-shrink-0 w-10 h-10 bg-slate-200/60 rounded-xl animate-pulse"></div>
            </div>
            <div className="h-px bg-slate-200/40 mt-6 animate-pulse"></div>
          </div>
        </motion.div>
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className={className}>
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
            <div className="relative px-8 py-6">
              <motion.h2
                className="text-3xl md:text-4xl font-light text-gray-900 tracking-tight leading-tight mb-3"
                style={{
                  fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  letterSpacing: '-0.02em',
                  fontWeight: '200'
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Loading Your{' '}
                <span 
                  className="relative inline-block bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent font-normal"
                  style={{
                    fontWeight: '300'
                  }}
                >
                  Assessment History
                </span>
              </motion.h2>
              <motion.p
                className="text-gray-600 font-light leading-relaxed max-w-md mx-auto"
                style={{
                  fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  letterSpacing: '-0.01em',
                  fontWeight: '300'
                }}
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
      <div className={className}>
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
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/40 via-orange-50/30 to-red-50/40 rounded-3xl blur-xl opacity-60 -z-10"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white/90 rounded-3xl -z-10"></div>
            <div className="absolute inset-0 shadow-xl shadow-red-900/[0.08] rounded-3xl -z-10"></div>
            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-12 border border-slate-200/50 shadow-lg">
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
      <div className={className}>
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
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/40 via-gray-50/30 to-slate-50/40 rounded-3xl blur-xl opacity-60 -z-10"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white/90 rounded-3xl -z-10"></div>
            <div className="absolute inset-0 shadow-xl shadow-slate-900/[0.08] rounded-3xl -z-10"></div>
            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-12 border border-slate-200/50 shadow-lg">
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
    <div 
      className={`${className} relative overflow-hidden`}
      style={{
        fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Sophisticated floating animated elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-80 h-80 bg-gradient-to-br from-emerald-100/25 to-teal-50/15 rounded-full blur-3xl"
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.2, 1],
            opacity: [0.6, 0.8, 0.6]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: [0.25, 0.1, 0.25, 1]
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-tl from-teal-100/20 to-emerald-50/12 rounded-full blur-3xl"
          animate={{
            y: [0, 25, 0],
            x: [0, -25, 0],
            scale: [1, 0.9, 1],
            opacity: [0.5, 0.7, 0.5]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: [0.25, 0.1, 0.25, 1],
            delay: 2
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-slate-100/15 via-emerald-50/8 to-slate-100/15 rounded-full blur-3xl"
          animate={{
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <motion.div
        className="relative text-center mb-16 z-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <motion.div
          className="relative max-w-4xl mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 via-indigo-50/15 to-purple-50/20 rounded-3xl blur-2xl opacity-40 -z-10"></div>
          <div className="relative px-8 py-10">
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 
                className="relative text-4xl md:text-5xl font-extralight text-gray-900 tracking-tight leading-tight mb-4"
                style={{
                  fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  letterSpacing: '-0.02em',
                  fontWeight: '200'
                }}
              >
                Your{' '}
                <span 
                  className="relative inline-block bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent font-normal"
                  style={{
                    fontWeight: '300'
                  }}
                >
                  Assessment Journey
                </span>
                
                {/* Sophisticated underline accent */}
                <motion.div
                  className="absolute -bottom-2 left-0 h-px bg-gradient-to-r from-emerald-400/60 via-teal-400/80 to-emerald-400/60"
                  initial={{ width: 0 }}
                  animate={{ width: '70%' }}
                  transition={{ duration: 1.5, delay: 1.0, ease: "easeOut" }}
                />
              </h2>
              <motion.div
                className="w-24 h-px bg-gradient-to-r from-emerald-400/60 via-teal-400/60 to-emerald-400/60 mx-auto mb-6"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              />
            </motion.div>
            <motion.div
              className="max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <p 
                className="text-lg md:text-xl text-gray-600 font-light leading-relaxed"
                style={{
                  fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  letterSpacing: '-0.01em',
                  fontWeight: '300'
                }}
              >
                Revisit your progress, reflect on insights, and witness the transformation in your mental wellness journey.
              </p>
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
            <motion.div
              className="relative max-w-lg mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/40 via-teal-50/30 to-emerald-50/40 rounded-3xl blur-xl opacity-60 -z-10"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white/90 rounded-3xl -z-10"></div>
              <div className="absolute inset-0 shadow-xl shadow-emerald-900/[0.08] rounded-3xl -z-10"></div>
              <div 
                className="relative rounded-3xl p-12 border shadow-lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                }}
              >
                <motion.div
                  className="relative w-20 h-20 mx-auto mb-8"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 via-teal-100 to-emerald-100 rounded-3xl shadow-sm"></div>
                  <div className="relative w-full h-full bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-500 rounded-3xl flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-white text-3xl">
                      psychology_alt
                    </span>
                  </div>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-emerald-400/40 via-teal-400/40 to-emerald-400/40 rounded-3xl"
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
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <h3 
                    className="text-3xl font-light text-gray-900 mb-4 tracking-tight"
                    style={{
                      fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      letterSpacing: '-0.02em',
                      fontWeight: '200'
                    }}
                  >
                    Begin Your Journey
                  </h3>
                  <p 
                    className="text-gray-600 font-light mb-8 leading-relaxed max-w-sm mx-auto"
                    style={{
                      fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      letterSpacing: '-0.01em',
                      fontWeight: '300'
                    }}
                  >
                    Your first assessment is the foundation of understanding and growth.
                    Discover insights that will guide your mental wellness path.
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                >
                  <motion.button
                    onClick={() => router.push('/assessments')}
                    className="group relative w-full max-w-xs mx-auto overflow-hidden px-8 py-4 rounded-2xl font-medium text-white transition-all duration-500 shadow-lg hover:shadow-xl"
                    style={{
                      fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      letterSpacing: '-0.005em',
                      fontWeight: '500',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                      boxShadow: '0 8px 32px -8px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                    }}
                    whileHover={{ 
                      scale: 1.02, 
                      y: -2,
                      boxShadow: '0 12px 40px -8px rgba(16, 185, 129, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2)'
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-out"></div>
                    </div>
                    <div className="relative flex items-center justify-center gap-3">
                      <span 
                        className="text-base"
                        style={{
                          fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                          letterSpacing: '-0.005em',
                          fontWeight: '500'
                        }}
                      >
                        Start Your First Assessment
                      </span>
                      <motion.span
                        className="material-symbols-outlined text-lg"
                        whileHover={{ x: 3 }}
                        transition={{ duration: 0.2 }}
                      >
                        arrow_forward
                      </motion.span>
                    </div>
                  </motion.button>
                  <motion.p
                    className="text-sm text-gray-500 mt-4 font-light"
                    style={{
                      fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      letterSpacing: '-0.005em',
                      fontWeight: '300'
                    }}
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
                <div 
                  className="relative overflow-hidden group-hover:shadow-2xl group-hover:shadow-emerald-900/[0.12] transition-all duration-500"
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                    borderRadius: '24px'
                  }}
                >
                  {/* Ultra-sophisticated gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/40 via-transparent to-teal-50/40 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/20 rounded-3xl pointer-events-none"></div>

                  {/* Sophisticated animated background pattern */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-25 transition-all duration-700">
                    <div className="absolute top-8 right-8 w-24 h-24 bg-gradient-to-bl from-emerald-200/60 to-transparent rounded-full transform translate-x-8 -translate-y-8"></div>
                    <div className="absolute bottom-8 left-8 w-20 h-20 bg-gradient-to-tr from-teal-200/60 to-transparent rounded-full transform -translate-x-6 translate-y-6"></div>
                  </div>

                  {/* Sophisticated shimmer effect */}
                  <motion.div
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100"
                    style={{
                      background: 'linear-gradient(110deg, transparent 40%, rgba(255, 255, 255, 0.3) 50%, transparent 60%)',
                      transform: 'translateX(-100%)'
                    }}
                    animate={{
                      transform: ['translateX(-100%)', 'translateX(100%)']
                    }}
                    transition={{
                      duration: 1.5,
                      delay: 0.2,
                      ease: "easeInOut"
                    }}
                  />

                  <div className="relative p-8">
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
                        <motion.h3
                          className="text-xl font-medium text-gray-900 mb-3 group-hover:text-gray-800 transition-colors duration-300 leading-tight"
                          style={{
                            fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            letterSpacing: '-0.01em',
                            fontWeight: '500'
                          }}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1, duration: 0.5 }}
                        >
                          {entry.assessmentTitle}
                        </motion.h3>

                        <motion.p
                          className="text-sm text-gray-500 mb-6 font-light"
                          style={{
                            fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            letterSpacing: '-0.005em',
                            fontWeight: '300'
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                        >
                          {formatDate(entry.takenAt)}
                        </motion.p>

                        <motion.div
                          className="flex items-center gap-8"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                        >
                          <div 
                            className="text-center rounded-xl px-4 py-3 min-w-[80px] group-hover:bg-emerald-50/60 transition-all duration-300"
                            style={{
                              background: 'rgba(248, 250, 252, 0.8)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              boxShadow: '0 4px 12px -4px rgba(0, 0, 0, 0.1)'
                            }}
                          >
                            <motion.div
                              className="text-2xl font-light text-gray-900 mb-1"
                              style={{
                                fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                letterSpacing: '-0.01em',
                                fontWeight: '300'
                              }}
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.2 }}
                            >
                              {entry.score}
                            </motion.div>
                            <div 
                              className="text-xs text-gray-500 uppercase font-medium"
                              style={{
                                fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                letterSpacing: '0.05em',
                                fontWeight: '500'
                              }}
                            >
                              Score
                            </div>
                          </div>

                          <div 
                            className="text-center rounded-xl px-4 py-3 min-w-[80px] group-hover:bg-emerald-50/60 transition-all duration-300"
                            style={{
                              background: 'rgba(248, 250, 252, 0.8)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              boxShadow: '0 4px 12px -4px rgba(0, 0, 0, 0.1)'
                            }}
                          >
                            <motion.div
                              className={`text-sm font-medium mb-1 ${
                                entry.severity === 'normal' ? 'text-green-600' :
                                entry.severity === 'mild' ? 'text-yellow-600' :
                                entry.severity === 'moderate' ? 'text-orange-600' :
                                entry.severity === 'severe' ? 'text-red-600' : 'text-red-800'
                              }`}
                              style={{
                                fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                letterSpacing: '-0.005em',
                                fontWeight: '500'
                              }}
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.2 }}
                            >
                              {entry.level}
                            </motion.div>
                            <div 
                              className="text-xs text-gray-500 uppercase font-medium"
                              style={{
                                fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                letterSpacing: '0.05em',
                                fontWeight: '500'
                              }}
                            >
                              Level
                            </div>
                          </div>
                        </motion.div>
                      </div>

                      <motion.div
                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300"
                        whileHover={{ x: 4, scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: '0 4px 12px -4px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                          <span className="material-symbols-outlined text-emerald-600 text-lg">arrow_forward</span>
                        </div>
                      </motion.div>
                    </div>

                    <motion.div
                      className="relative mt-6"
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{
                        delay: 0.4,
                        duration: 0.6,
                        ease: [0.25, 0.1, 0.25, 1]
                      }}
                    >
                      <div className="h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent"></div>
                      <motion.div
                        className="absolute top-0 left-0 h-px bg-gradient-to-r from-emerald-400/60 via-teal-400/80 to-emerald-400/60"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1.0, delay: 0.6, ease: "easeOut" }}
                      />
                    </motion.div>
                  </div>

                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-emerald-50/8 via-transparent to-teal-50/4 opacity-0 group-hover:opacity-100 transition-all duration-500"
                    initial={false}
                  />

                  <div className="absolute -inset-2 bg-gradient-to-br from-emerald-200/15 via-teal-200/8 to-emerald-200/15 rounded-3xl blur-lg opacity-0 group-hover:opacity-60 transition-all duration-700 -z-10"></div>
                  <div className="absolute -inset-1 bg-gradient-to-br from-emerald-100/20 via-teal-100/10 to-emerald-100/20 rounded-3xl blur-md opacity-0 group-hover:opacity-50 transition-all duration-500 -z-10"></div>
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-50/25 via-transparent to-emerald-50/25 rounded-3xl blur-sm opacity-0 group-hover:opacity-40 transition-all duration-300 -z-10"></div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}