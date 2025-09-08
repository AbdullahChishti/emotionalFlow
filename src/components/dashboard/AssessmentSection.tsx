'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ASSESSMENTS } from '@/data/assessments'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

// Material Symbols icons import
import 'material-symbols/outlined.css'

interface AssessmentSectionProps {
  coverage: {
    assessed: string[]
    stale: string[]
    missing: string[]
  }
  className?: string
  loading?: boolean
}

// Enhanced minimal list item for an assessment row
function Row({
  id,
  status,
  onClick,
}: {
  id: string
  status: 'completed' | 'stale' | 'available'
  onClick: () => void
}) {
  const a = ASSESSMENTS[id]
  if (!a) return null

  const isCompleted = status === 'completed'
  const isStale = status === 'stale'
  const isAvailable = status === 'available'

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'trauma': return 'healing'
      case 'depression': return 'mood'
      case 'anxiety': return 'psychology'
      case 'personality': return 'person'
      case 'resilience': return 'fitness_center'
      case 'wellbeing': return 'self_improvement'
      default: return 'assessment'
    }
  }

  return (
    <motion.button
      onClick={onClick}
      className="group relative w-full flex items-center gap-3 py-3 px-3 text-left rounded-xl transition-all duration-300 overflow-hidden"
      whileHover={{
        scale: 1.01,
        transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }
      }}
      whileTap={{ scale: 0.99 }}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Multi-layered background with depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-slate-50/80 to-white rounded-xl"></div>
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl shadow-sm"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>

      {/* Subtle shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700 ease-out"></div>
      </div>

      {/* Enhanced status icon */}
      <div className="relative z-10 flex-shrink-0">
        <motion.div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
            isCompleted ? 'bg-gradient-to-br from-emerald-100 to-emerald-200 shadow-emerald-200/50' :
            isStale ? 'bg-gradient-to-br from-amber-100 to-amber-200 shadow-amber-200/50' :
            'bg-gradient-to-br from-slate-100 to-slate-200 shadow-slate-200/50'
          }`}
          whileHover={{
            scale: 1.1,
            rotate: 5,
            transition: { duration: 0.2 }
          }}
        >
          <span
            className={`material-symbols-outlined text-base ${
              isCompleted ? 'text-emerald-700' : isStale ? 'text-amber-700' : 'text-slate-500'
            }`}
          >
            {isCompleted ? 'check_circle' : isStale ? 'schedule' : getCategoryIcon(a.category)}
          </span>
        </motion.div>
      </div>

      {/* Enhanced content */}
      <div className="relative z-10 flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-slate-700 truncate group-hover:text-slate-900 transition-colors duration-300">
            {a.shortTitle}
          </span>
          {isStale && (
            <motion.span
              className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border border-amber-300/50 font-medium flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              Update
            </motion.span>
          )}
        </div>
        <div className="flex items-center justify-between">
          {isAvailable && (
            <span className="text-xs text-slate-500 font-light">
              {a.estimatedTime}m estimated
            </span>
          )}
        </div>
      </div>

      {/* Enhanced arrow with animation */}
      <motion.span
        className={`material-symbols-outlined text-lg flex-shrink-0 transition-all duration-300 ${
          isCompleted ? 'text-emerald-600' : isStale ? 'text-amber-600' : 'text-slate-400'
        }`}
        whileHover={{
          x: 3,
          scale: 1.1,
          transition: { duration: 0.2 }
        }}
      >
        chevron_right
      </motion.span>
    </motion.button>
  )
}

const AssessmentSection: React.FC<AssessmentSectionProps> = ({ coverage, className = '', loading = false }) => {
  const router = useRouter()
  const handleAssessmentClick = (_id: string, _status: 'completed' | 'stale' | 'available') => {
    // Always navigate to the assessments page
    router.push('/assessments')
  }

  const totalCompleted = coverage.assessed.length + coverage.stale.length
  const totalAssessments = Object.keys(ASSESSMENTS).length
  const completionPercentage = Math.round((totalCompleted / totalAssessments) * 100)

  // Completed: prioritize stale updates first for visibility
  const completedList = useMemo(() => (
    [...coverage.stale, ...coverage.assessed]
  ), [coverage.assessed, coverage.stale])

  // Remaining: sort by shortest time to encourage quick wins
  const remainingList = useMemo(() => {
    const ids = [...coverage.missing]
    return ids.sort((a, b) => {
      const ta = ASSESSMENTS[a]?.estimatedTime ?? 999
      const tb = ASSESSMENTS[b]?.estimatedTime ?? 999
      return ta - tb
    })
  }, [coverage.missing])

  // Caps + toggles (responsive)
  const [showAllCompleted, setShowAllCompleted] = useState(false)
  const [showAllRemaining, setShowAllRemaining] = useState(false)
  const [caps, setCaps] = useState({ completed: 3, remaining: 4 })

  useEffect(() => {
    const updateCaps = () => {
      const w = typeof window !== 'undefined' ? window.innerWidth : 1024
      if (w < 640) {
        setCaps({ completed: 2, remaining: 3 })
      } else if (w < 1024) {
        setCaps({ completed: 3, remaining: 4 })
      } else {
        setCaps({ completed: 4, remaining: 6 })
      }
    }
    updateCaps()
    window.addEventListener('resize', updateCaps)
    return () => window.removeEventListener('resize', updateCaps)
  }, [])

  return (
    <div className={`${className}`}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="space-y-6"
      >
        {/* Ultra-Sophisticated Header */}
        <motion.div
          className="relative bg-gradient-to-br from-white via-slate-50/90 to-white/95 rounded-2xl p-5 border border-slate-200/50 shadow-lg shadow-slate-900/10 overflow-hidden"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 via-transparent to-teal-50/30 rounded-2xl"></div>

          {/* Header content */}
          <div className="relative z-10 flex items-center justify-between mb-4">
            {loading ? (
              <div className="space-y-2">
                <div className="h-4 w-20 bg-slate-200/60 rounded-lg animate-pulse"></div>
                <div className="h-3 w-16 bg-slate-200/40 rounded animate-pulse"></div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-lg font-bold text-slate-800 tabular-nums">
                  {totalCompleted}
                  <span className="text-slate-400 font-normal">/{totalAssessments}</span>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Assessments completed
                </div>
              </div>
            )}
            {!loading && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/assessments"
                  className="group inline-flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 bg-white/60 hover:bg-white/80 rounded-xl border border-slate-200/40 hover:border-slate-300/60 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <span className="font-medium">View all</span>
                  <motion.span
                    className="material-symbols-outlined text-base"
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.2 }}
                  >
                    chevron_right
                  </motion.span>
                </Link>
              </motion.div>
            )}
          </div>

          {/* Ultra-Sophisticated Progress Bar */}
          {!loading && (
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              {/* Progress container with enhanced styling */}
              <div className="relative w-full bg-gradient-to-r from-slate-100 to-slate-200 rounded-2xl h-3 overflow-hidden shadow-inner border border-slate-200/40">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-200/30 via-teal-200/30 to-emerald-200/30 rounded-2xl animate-pulse"></div>

                {/* Main progress bar with sophisticated gradient */}
                <motion.div
                  className="relative h-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 rounded-2xl shadow-sm"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{
                    duration: 1.2,
                    ease: [0.25, 0.1, 0.25, 1],
                    delay: 0.5
                  }}
                >
                  {/* Animated shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-2xl"
                    animate={{
                      x: ['-100%', '100%']
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1
                    }}
                  />
                </motion.div>

                {/* Pulsing effect at the end */}
                {completionPercentage > 0 && (
                  <motion.div
                    className="absolute top-0 h-full w-6 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl opacity-70 shadow-lg"
                    animate={{
                      x: `${completionPercentage - 4}%`,
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    style={{
                      left: `${completionPercentage}%`,
                      transform: 'translateX(-100%)'
                    }}
                  />
                )}
              </div>

              {/* Progress percentage display */}
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-slate-500 font-light">Progress</span>
                <motion.span
                  className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.3 }}
                >
                  {completionPercentage}%
                </motion.span>
              </div>
            </motion.div>
          )}

          {/* Loading state for header */}
          {loading && (
            <div className="space-y-3">
              <div className="w-full bg-slate-100 rounded-2xl h-3 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 bg-[length:200%_100%] animate-pulse rounded-2xl"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-3 w-12 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-3 w-8 bg-slate-200 rounded animate-pulse"></div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Ultra-Sophisticated Section Lists */}
        <div className="space-y-8">
          {/* Enhanced Completed Section */}
          {(completedList.length > 0 || loading) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {/* Enhanced section header */}
              <motion.div
                className="flex items-center gap-3 mb-4"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <motion.div
                  className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center shadow-sm"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="material-symbols-outlined text-emerald-700 text-base">check_circle</span>
                </motion.div>
                <div>
                  <span className="text-sm font-semibold text-slate-800">Completed</span>
                  {!loading && (
                    <span className="text-xs text-slate-500 font-medium ml-2 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                      {completedList.length} assessments
                    </span>
                  )}
                </div>
              </motion.div>

              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {[1, 2].map((i) => (
                      <div key={i} className="relative bg-gradient-to-r from-white via-slate-50/80 to-white rounded-xl p-4 border border-slate-200/40 shadow-sm overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-100/50 to-slate-200/50 animate-pulse rounded-xl"></div>
                        <div className="relative flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-200/60 rounded-lg animate-pulse"></div>
                          <div className="flex-1">
                            <div className="w-2/3 h-4 bg-slate-200/60 rounded-lg animate-pulse mb-2"></div>
                            <div className="w-1/2 h-3 bg-slate-200/40 rounded animate-pulse"></div>
                          </div>
                          <div className="w-6 h-6 bg-slate-200/40 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {(showAllCompleted ? completedList : completedList.slice(0, caps.completed)).map((id, index) => (
                      <motion.div
                        key={id}
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          delay: index * 0.08,
                          duration: 0.4,
                          ease: [0.25, 0.1, 0.25, 1]
                        }}
                      >
                        <Row
                          id={id}
                          status={coverage.stale.includes(id) ? 'stale' : 'completed'}
                          onClick={() => handleAssessmentClick(id, coverage.stale.includes(id) ? 'stale' : 'completed')}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {!loading && completedList.length > caps.completed && (
                <motion.div
                  className="mt-4 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <motion.button
                    onClick={() => setShowAllCompleted(v => !v)}
                    className="group inline-flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-800 bg-white/80 hover:bg-white/90 rounded-xl border border-slate-200/50 hover:border-slate-300/60 transition-all duration-300 shadow-sm hover:shadow-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="font-medium">
                      {showAllCompleted ? 'Show less' : `Show ${completedList.length - caps.completed} more`}
                    </span>
                    <motion.span
                      className="material-symbols-outlined text-base"
                      animate={{ rotate: showAllCompleted ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      expand_more
                    </motion.span>
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Enhanced Available Section */}
          {(remainingList.length > 0 || loading) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {/* Enhanced section header */}
              <motion.div
                className="flex items-center gap-3 mb-4"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <motion.div
                  className="w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center shadow-sm"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="material-symbols-outlined text-slate-600 text-base">radio_button_unchecked</span>
                </motion.div>
                <div>
                  <span className="text-sm font-semibold text-slate-800">Available</span>
                  {!loading && (
                    <span className="text-xs text-slate-500 font-medium ml-2 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200/50">
                      {remainingList.length} assessments
                    </span>
                  )}
                </div>
              </motion.div>

              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="relative bg-gradient-to-r from-white via-slate-50/80 to-white rounded-xl p-4 border border-slate-200/40 shadow-sm overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-100/50 to-slate-200/50 animate-pulse rounded-xl"></div>
                        <div className="relative flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-200/60 rounded-lg animate-pulse"></div>
                          <div className="flex-1">
                            <div className="w-3/4 h-4 bg-slate-200/60 rounded-lg animate-pulse mb-2"></div>
                            <div className="w-1/2 h-3 bg-slate-200/40 rounded animate-pulse"></div>
                          </div>
                          <div className="w-6 h-6 bg-slate-200/40 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ) : remainingList.length > 0 ? (
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {(showAllRemaining ? remainingList : remainingList.slice(0, caps.remaining)).map((id, index) => (
                      <motion.div
                        key={id}
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          delay: index * 0.08,
                          duration: 0.4,
                          ease: [0.25, 0.1, 0.25, 1]
                        }}
                      >
                        <Row
                          id={id}
                          status="available"
                          onClick={() => handleAssessmentClick(id, 'available')}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    className="text-center py-8 px-6 bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/30 rounded-2xl border border-emerald-200/40"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <motion.div
                      className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm"
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="material-symbols-outlined text-emerald-600 text-xl">celebration</span>
                    </motion.div>
                    <motion.p
                      className="text-sm text-emerald-700 font-medium mb-1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      All assessments completed!
                    </motion.p>
                    <motion.p
                      className="text-xs text-slate-500 font-light"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      Congratulations on your wellness journey
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>

              {!loading && remainingList.length > caps.remaining && (
                <motion.div
                  className="mt-4 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <motion.button
                    onClick={() => setShowAllRemaining(v => !v)}
                    className="group inline-flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-800 bg-white/80 hover:bg-white/90 rounded-xl border border-slate-200/50 hover:border-slate-300/60 transition-all duration-300 shadow-sm hover:shadow-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="font-medium">
                      {showAllRemaining ? 'Show less' : `Show ${remainingList.length - caps.remaining} more`}
                    </span>
                    <motion.span
                      className="material-symbols-outlined text-base"
                      animate={{ rotate: showAllRemaining ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      expand_more
                    </motion.span>
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>

        {/* Ultra-Sophisticated CTA Section */}
        <AnimatePresence>
          {!loading && remainingList.length > 0 && (
            <motion.div
              className="pt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {(() => {
                const nextId = remainingList[0]
                const next = ASSESSMENTS[nextId]
                const label = next ? `Start ${next.shortTitle}` : 'Start next'
                const time = next ? `${next.estimatedTime}m` : ''
                const href = next ? `/assessments/${nextId}` : '/assessments'

                return (
                  <motion.div
                    className="relative bg-gradient-to-br from-white via-emerald-50/30 to-white rounded-2xl p-6 border border-emerald-200/40 shadow-lg shadow-emerald-900/10 overflow-hidden"
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    {/* Subtle background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-teal-50/30 rounded-2xl"></div>

                    {/* Floating orbs for visual interest */}
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-100/40 to-transparent rounded-full transform translate-x-8 -translate-y-8"></div>
                    <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-teal-100/40 to-transparent rounded-full transform -translate-x-6 translate-y-6"></div>

                    <div className="relative z-10">
                      {/* CTA Header */}
                      <motion.div
                        className="text-center mb-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.7 }}
                      >
                        <motion.div
                          className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm"
                          whileHover={{ scale: 1.05, rotate: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <span className="material-symbols-outlined text-emerald-600 text-lg">psychology</span>
                        </motion.div>
                        <h3 className="text-sm font-semibold text-slate-800 mb-1">Continue Your Journey</h3>
                        <p className="text-xs text-slate-600 font-light">
                          {next ? `Next up: ${next.shortTitle}` : 'Discover your next assessment'}
                        </p>
                      </motion.div>

                      {/* Enhanced CTA Button */}
                      <motion.button
                        onClick={() => router.push(href)}
                        className="group relative w-full overflow-hidden px-6 py-4 rounded-2xl font-semibold text-base transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-emerald-400/20 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98] border border-transparent bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-600 text-white shadow-3xl hover:shadow-3xl hover:shadow-emerald-900/50 hover:from-emerald-700 hover:via-emerald-800 hover:to-emerald-700 border-emerald-500/20"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                        aria-label={next ? `Start ${next.shortTitle} assessment` : 'Start next assessment'}
                        title={next ? `Start ${next.shortTitle}` : 'Start next assessment'}
                        data-cta="continue-assessments"
                        data-next-id={nextId}
                      >
                        {/* Animated background gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Subtle shine effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-out"></div>
                        </div>

                        <div className="relative flex items-center justify-center gap-3">
                          <motion.span
                            className="material-symbols-outlined text-xl"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            play_arrow
                          </motion.span>
                          <span className="truncate font-semibold">{label}</span>
                          {time && (
                            <motion.span
                              className="ml-1 text-sm px-3 py-1 rounded-full bg-white/20 text-white font-medium border border-white/30"
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.2 }}
                            >
                              {time}
                            </motion.span>
                          )}
                        </div>
                      </motion.button>

                      {/* Quick stats */}
                      <motion.div
                        className="flex justify-center gap-6 mt-4 text-xs text-slate-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.9 }}
                      >
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                          {totalCompleted} completed
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                          {remainingList.length} remaining
                        </span>
                      </motion.div>
                    </div>
                  </motion.div>
                )
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default AssessmentSection
