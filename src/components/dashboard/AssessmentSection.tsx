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
    <button
      onClick={onClick}
      className="group w-full flex items-center gap-2 py-2.5 px-1.5 text-left hover:bg-slate-50/50 rounded-md transition-colors duration-200"
    >
      {/* Simple status icon */}
      <span
        className={`material-symbols-outlined text-sm ${
          isCompleted ? 'text-emerald-600' : isStale ? 'text-amber-600' : 'text-slate-400'
        }`}
      >
        {isCompleted ? 'check_circle' : isStale ? 'schedule' : getCategoryIcon(a.category)}
      </span>
      
      {/* Clean content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-normal text-slate-700 truncate">
            {a.shortTitle}
          </span>
          {isStale && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
              Update
            </span>
          )}
        </div>
      </div>

      {isAvailable && (
        <span className="text-[11px] text-slate-400 mr-1">
          {a.estimatedTime}m
        </span>
      )}

      {/* Minimal arrow */}
      <span className="material-symbols-outlined text-sm text-slate-400 group-hover:text-slate-600 transition-colors">
        chevron_right
      </span>
    </button>
  )
}

const AssessmentSection: React.FC<AssessmentSectionProps> = ({ coverage, className = '', loading = false }) => {
  const router = useRouter()
  const handleAssessmentClick = (id: string, status: 'completed' | 'stale' | 'available') => {
    if (status === 'completed' || status === 'stale') {
      // Navigate to results
      router.push(`/results?assessment=${encodeURIComponent(id)}`)
    } else {
      // Navigate to take assessment
      router.push(`/assessments/${id}`)
    }
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
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        {/* Minimal header: just progress count + View all */}
        <div className="flex items-center justify-between">
          {loading ? (
            <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
          ) : (
            <div className="text-sm font-semibold text-slate-800 tabular-nums">
              {totalCompleted}
              <span className="text-slate-400">/{totalAssessments}</span>
            </div>
          )}
          {!loading && (
            <Link
              href="/assessments"
              className="text-xs text-slate-500 hover:text-slate-700 inline-flex items-center gap-1"
            >
              View all
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </Link>
          )}
        </div>
        {/* Simplified progress bar */}
        {!loading && (
          <div className="mt-1">
            <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
              <motion.div
                className="bg-emerald-500 h-1 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* Clean section lists */}
        <div className="space-y-8">
          {/* Completed section - minimal */}
          {(completedList.length > 0 || loading) && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>
                <span className="text-xs font-medium text-slate-600">Completed</span>
                {!loading && (
                  <span className="text-[10px] text-slate-400">{completedList.length}</span>
                )}
              </div>
            
              <AnimatePresence>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex items-center gap-3 py-3">
                        <div className="w-4 h-4 bg-slate-200 rounded animate-pulse"></div>
                        <div className="flex-1">
                          <div className="w-2/3 h-3 bg-slate-200 rounded animate-pulse mb-1"></div>
                          <div className="w-1/3 h-2 bg-slate-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-slate-200/60 bg-white/50 divide-y divide-slate-100 overflow-hidden">
                    {(showAllCompleted ? completedList : completedList.slice(0, caps.completed)).map((id, index) => (
                      <motion.div
                        key={id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.15 }}
                      >
                        <Row
                          id={id}
                          status={coverage.stale.includes(id) ? 'stale' : 'completed'}
                          onClick={() => handleAssessmentClick(id, coverage.stale.includes(id) ? 'stale' : 'completed')}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
              {!loading && completedList.length > caps.completed && (
                <div className="mt-2 text-right">
                  <button
                    onClick={() => setShowAllCompleted(v => !v)}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    {showAllCompleted ? 'Show less' : 'Show more'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Available section - minimal */}
          {(remainingList.length > 0 || loading) && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-slate-500 text-sm">radio_button_unchecked</span>
                <span className="text-xs font-medium text-slate-600">Available</span>
                {!loading && (
                  <span className="text-[10px] text-slate-400">{remainingList.length}</span>
                )}
              </div>
            
              <AnimatePresence>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 py-3">
                        <div className="w-4 h-4 bg-slate-200 rounded animate-pulse"></div>
                        <div className="flex-1">
                          <div className="w-3/4 h-3 bg-slate-200 rounded animate-pulse mb-1"></div>
                          <div className="w-1/2 h-2 bg-slate-200 rounded animate-pulse"></div>
                        </div>
                        <div className="w-8 h-2 bg-slate-200 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : remainingList.length > 0 ? (
                  <div className="rounded-lg border border-slate-200/60 bg-white/50 divide-y divide-slate-100 overflow-hidden">
                    {(showAllRemaining ? remainingList : remainingList.slice(0, caps.remaining)).map((id, index) => (
                      <motion.div
                        key={id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.15 }}
                      >
                        <Row 
                          id={id} 
                          status="available" 
                          onClick={() => handleAssessmentClick(id, 'available')} 
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-emerald-500 text-2xl mb-2 block">check_circle</span>
                    <p className="text-sm text-slate-500">All assessments completed!</p>
                  </div>
                )}
              </AnimatePresence>
              {!loading && remainingList.length > caps.remaining && (
                <div className="mt-2 text-right">
                  <button
                    onClick={() => setShowAllRemaining(v => !v)}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    {showAllRemaining ? 'Show less' : 'Show more'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Minimal CTA */}
        <AnimatePresence>
          {!loading && remainingList.length > 0 && (
            <motion.div
              className="pt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {(() => {
                const nextId = remainingList[0]
                const next = ASSESSMENTS[nextId]
                const label = next ? `Start ${next.shortTitle}` : 'Start next'
                const time = next ? `${next.estimatedTime}m` : ''
                const href = next ? `/assessments/${nextId}` : '/assessments'
                return (
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full gap-2"
                    onClick={() => router.push(href)}
                    aria-label={next ? `Start ${next.shortTitle} assessment` : 'Start next assessment'}
                    title={next ? `Start ${next.shortTitle}` : 'Start next assessment'}
                    data-cta="continue-assessments"
                    data-next-id={nextId}
                  >
                    <span className="material-symbols-outlined text-base">play_arrow</span>
                    <span className="truncate">{label}</span>
                    {time && (
                      <span className="ml-1 text-[11px] px-2 py-0.5 rounded-full bg-white/20 text-white">
                        {time}
                      </span>
                    )}
                  </Button>
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
