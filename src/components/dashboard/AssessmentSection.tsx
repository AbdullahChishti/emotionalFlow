'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ASSESSMENTS } from '@/data/assessments'
import { useRouter } from 'next/navigation'

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

  const totalCompleted = coverage.assessed.length + coverage.stale.length
  const totalAssessments = Object.keys(ASSESSMENTS).length
  const completionPercentage = Math.round((totalCompleted / totalAssessments) * 100)

  const handleNavigateToAssessments = () => {
    router.push('/assessments')
  }





  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.8,
        ease: [0.23, 1, 0.32, 1],
        delay: 0.1
      }}
      className={`${className} relative overflow-hidden`}
    >
        {/* Subtle ambient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/40 via-white to-slate-50/20 rounded-3xl"></div>

        {/* Card content */}
        <motion.div
          className="relative bg-white/90 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl shadow-slate-900/[0.08]"
          whileHover={{
            scale: 1.02,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)"
          }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Static content */}
          <motion.button
            onClick={handleNavigateToAssessments}
            className="w-full px-12 py-10 text-center group cursor-pointer"
            whileHover={{ backgroundColor: 'rgba(248, 250, 252, 0.3)' }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {/* Clean header */}
            <div className="mb-8">
              <motion.h3
                className="text-2xl font-normal text-slate-800 tracking-[-0.02em] text-center"
                style={{
                  fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  letterSpacing: '-0.02em',
                  fontWeight: '400'
                }}
              >
                Assessments
              </motion.h3>
            </div>

            {/* Centered subtitle */}
            <div className="text-center mb-6">
              <motion.p
                className="text-sm text-slate-500 font-normal tracking-wide"
                style={{
                  fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  letterSpacing: '0.02em'
                }}
              >
                Your mental wellness journey
              </motion.p>
            </div>

            {/* Essential progress information */}
            <div className="space-y-8">
              {/* Progress ring */}
              <div className="flex items-center justify-center">
                <div className="relative">
                  <svg width="120" height="120" className="transform -rotate-90">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      className="text-slate-100"
                    />
                    <motion.circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                      className="text-emerald-500"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: completionPercentage / 100 }}
                      transition={{
                        duration: 1.2,
                        ease: [0.23, 1, 0.32, 1],
                        delay: 0.3
                      }}
                      style={{
                        strokeDasharray: `${2 * Math.PI * 50}`,
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <motion.div
                        className="text-3xl font-normal text-slate-800 tracking-tight"
                        style={{
                          fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                          fontWeight: '400',
                          letterSpacing: '-0.02em'
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                      >
                        {completionPercentage}%
                      </motion.div>
                      <motion.div
                        className="text-sm text-slate-500 font-normal mt-2 tracking-wide"
                        style={{
                          fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                          letterSpacing: '0.03em'
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                      >
                        complete
                      </motion.div>
              </div>
                </div>
                </div>
              </div>

              {/* Compact status indicators */}
              <motion.div
                className="flex items-center justify-center gap-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                {/* Completed indicator */}
                <motion.div
                  className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50/60 rounded-lg border border-emerald-200/30"
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(236, 253, 245, 0.8)' }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="w-2.5 h-2.5 bg-emerald-500 rounded-full"
                    animate={{
                      scale: [1, 1.15, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  ></motion.div>
                  <span className="text-xs font-medium text-emerald-700">
                    {totalCompleted} done
                  </span>
        </motion.div>

                {/* Separator */}
                <div className="w-px h-4 bg-slate-300/60"></div>

                {/* Remaining indicator */}
                <motion.div
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-50/60 rounded-lg border border-slate-200/30"
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(248, 250, 252, 0.8)' }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="w-2.5 h-2.5 bg-slate-400 rounded-full"
                    animate={{
                      opacity: [0.5, 0.8, 0.5],
                    }}
                        transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  ></motion.div>
                  <span className="text-xs font-medium text-slate-600">
                    {coverage.missing.length} left
                    </span>
                </motion.div>
              </motion.div>
            </div>
          </motion.button>
        </motion.div>
      </motion.div>
  )
}

export default AssessmentSection
