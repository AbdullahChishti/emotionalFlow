'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AssessmentFlowMigrated as AssessmentFlow } from '@/components/assessment/AssessmentFlowMigrated'
import AssessmentHistory from '@/components/assessment/AssessmentHistory'
import { useRouter } from 'next/navigation'
import { ASSESSMENTS, ASSESSMENT_CATEGORIES } from '@/data/assessments'
import { AssessmentResult } from '@/data/assessments'
import { UserProfile } from '@/types'

export default function AssessmentsPage() {
  const router = useRouter()
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null)
  const [currentAssessmentId, setCurrentAssessmentId] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'browse' | 'history'>('browse')

  const handleFlowSelect = (flowId: string) => {
    setSelectedFlow(flowId)
  }

  const handleAssessmentComplete = (results: Record<string, AssessmentResult>, userProfile: UserProfile) => {
    console.log('🎯 AssessmentsPage: handleAssessmentComplete called!')
    console.log('📊 Results received:', {
      count: Object.keys(results).length,
      assessments: Object.keys(results),
      userId: userProfile?.id
    })

    // Temporarily cache results for immediate access while database operations complete
    // Results page will prioritize database data and use this as fallback only
    try {
      const resultsString = JSON.stringify(results)
      localStorage.setItem('assessmentResults', resultsString)
      console.log('💾 Results cached to localStorage:', {
        stringLength: resultsString.length,
        keys: Object.keys(results),
        sampleResult: results[Object.keys(results)[0]]
      })
      
      if (userProfile) {
        localStorage.setItem('userProfile', JSON.stringify(userProfile))
        console.log('💾 User profile cached to localStorage')
      }
      
      // Verify the data was saved correctly
      const verifyResults = localStorage.getItem('assessmentResults')
      console.log('🔍 Verification - localStorage contains:', verifyResults ? 'data' : 'nothing')
    } catch (error) {
      console.warn('Failed to cache assessment results:', error)
    }

    // Navigate to results page
    console.log('🚀 Navigating to /results')
    try {
      router.push('/results')
      console.log('✅ Navigation initiated')
    } catch (navError) {
      console.error('❌ Navigation failed:', navError)
      // Fallback: try window.location
      window.location.href = '/results'
    }
  }

  const handleRetakeAssessment = (assessmentId: string) => {
    setCurrentAssessmentId(assessmentId)
    setSelectedFlow('single')
  }

  // Group assessments by category
  const assessmentsByCategory = Object.values(ASSESSMENTS).reduce((acc, assessment) => {
    if (!acc[assessment.category]) {
      acc[assessment.category] = []
    }
    acc[assessment.category].push(assessment)
    return acc
  }, {} as Record<string, typeof ASSESSMENTS[keyof typeof ASSESSMENTS][]>)


  // Professional green category styling
  const getCategoryStyling = (category: string, isSelected: boolean) => {
    const stylingMap = {
      trauma: {
        gradient: isSelected ? 'bg-emerald-700' : 'hover:bg-emerald-50',
        text: isSelected ? 'text-white' : 'text-emerald-600 hover:text-emerald-800',
        shadow: 'shadow-emerald-200/30 hover:shadow-emerald-300/50'
      },
      depression: {
        gradient: isSelected ? 'bg-emerald-700' : 'hover:bg-emerald-50',
        text: isSelected ? 'text-white' : 'text-emerald-600 hover:text-emerald-800',
        shadow: 'shadow-emerald-200/30 hover:shadow-emerald-300/50'
      },
      anxiety: {
        gradient: isSelected ? 'bg-emerald-700' : 'hover:bg-emerald-50',
        text: isSelected ? 'text-white' : 'text-emerald-600 hover:text-emerald-800',
        shadow: 'shadow-emerald-200/30 hover:shadow-emerald-300/50'
      },
      resilience: {
        gradient: isSelected ? 'bg-emerald-700' : 'hover:bg-emerald-50',
        text: isSelected ? 'text-white' : 'text-emerald-600 hover:text-emerald-800',
        shadow: 'shadow-emerald-200/30 hover:shadow-emerald-300/50'
      },
      wellbeing: {
        gradient: isSelected ? 'bg-emerald-700' : 'hover:bg-emerald-50',
        text: isSelected ? 'text-white' : 'text-emerald-600 hover:text-emerald-800',
        shadow: 'shadow-emerald-200/30 hover:shadow-emerald-300/50'
      },
      personality: {
        gradient: isSelected ? 'bg-emerald-700' : 'hover:bg-emerald-50',
        text: isSelected ? 'text-white' : 'text-emerald-600 hover:text-emerald-800',
        shadow: 'shadow-emerald-200/30 hover:shadow-emerald-300/50'
      }
    }
    return stylingMap[category as keyof typeof stylingMap] || {
      gradient: isSelected ? 'bg-emerald-700' : 'hover:bg-emerald-50',
      text: isSelected ? 'text-white' : 'text-emerald-600 hover:text-emerald-800',
      shadow: 'shadow-emerald-200/30 hover:shadow-emerald-300/50'
    }
  }

  // Show assessment selection by default
  if (!selectedFlow) {
    return (
      <div className="min-h-screen bg-white">
        {/* Minimal Header */}
        <motion.div
          className="max-w-4xl mx-auto px-6 py-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="relative max-w-5xl mx-auto">

              {/* Ultra-precise background with refined depth */}
              <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/12 to-white/98 rounded-2xl"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-slate-25/8 to-transparent rounded-2xl"></div>
              <div className="absolute inset-0 bg-white/92 backdrop-blur-xl rounded-2xl border border-slate-200/15 shadow-inner shadow-slate-100/30"></div>

              <div className="relative px-12 py-6">

                {/* Ultra-Polished Title Banner */}
                <motion.div
                  className="text-center py-6 px-6"
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <div className="relative">
                    {/* Refined background accent */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/20 via-slate-50/10 to-teal-50/20 rounded-xl blur-lg -z-10"></div>

                    {/* Enhanced typography with refined sizing */}
                    <motion.div
                      className="relative"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                      <h2 className="text-3xl md:text-4xl font-light text-slate-900 tracking-tight leading-tight">
                        Next step in your{' '}
                        <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent font-normal">
                          mental Wellness
                        </span>
                      </h2>
                    </motion.div>

                    {/* Professional accreditation badge */}
                    <motion.div
                      className="mt-3 flex items-center justify-center gap-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1.4, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                      <motion.div
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-slate-50/80 to-slate-100/80 border border-slate-200/60 rounded-full shadow-sm"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs text-slate-700 font-medium tracking-wide">
                          Clinically Validated
                        </span>
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>


              </div>

              {/* Ultra-sophisticated Multi-layer Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent rounded-2xl pointer-events-none opacity-60"></div>
              <div className="absolute -inset-1 bg-gradient-to-br from-slate-200/20 via-slate-300/10 to-slate-200/20 rounded-2xl blur-sm opacity-40"></div>
              <div className="absolute -inset-2 bg-gradient-to-br from-slate-100/8 via-transparent to-slate-100/8 rounded-3xl blur-lg opacity-30"></div>

            </div>
          </motion.div>
        </motion.div>

        {/* Premium Main Tab Navigation */}
        <motion.div
          className="max-w-4xl mx-auto px-6 mb-12 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="bg-white border border-gray-200/60 rounded-2xl p-2 shadow-lg shadow-gray-200/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
            <motion.button
              onClick={() => setActiveTab('browse')}
                className={`group relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap overflow-hidden ${
                activeTab === 'browse'
                    ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-200/50'
                    : 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'
                }`}
                whileHover={{ scale: activeTab === 'browse' ? 1 : 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="relative z-10 flex items-center">
                  <span className="hidden sm:inline">Browse Assessments</span>
                  <span className="sm:hidden">Browse</span>
                  {activeTab === 'browse' && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </div>
                {activeTab === 'browse' && (
                  <div className="absolute inset-0 bg-white/10 rounded-xl"></div>
                )}
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('history')}
                className={`group relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap overflow-hidden ${
                activeTab === 'history'
                    ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-200/50'
                    : 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'
                }`}
                whileHover={{ scale: activeTab === 'history' ? 1 : 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="relative z-10 flex items-center">
                  <span className="hidden sm:inline">My History</span>
                  <span className="sm:hidden">History</span>
                  {activeTab === 'history' && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </div>
                {activeTab === 'history' && (
                  <div className="absolute inset-0 bg-white/10 rounded-xl"></div>
                )}
            </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Tab Content */}
        {activeTab === 'browse' ? (
          <>
            {/* Premium Category Tabs */}
            <motion.div
              className="max-w-6xl mx-auto px-6 mb-20 flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="bg-white border border-gray-200/60 rounded-2xl p-2 shadow-lg shadow-gray-200/50 backdrop-blur-sm">
                <div className="flex flex-wrap items-center gap-2">
                  {/* All Assessments Tab */}
                  <motion.button
                    onClick={() => setSelectedCategory(null)}
                    className={`group relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap overflow-hidden ${
                      selectedCategory === null
                        ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-200/50'
                        : 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'
                    }`}
                    whileHover={{ scale: selectedCategory === null ? 1 : 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div className="relative z-10 flex items-center">
                      <span>All</span>
                      {selectedCategory === null && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      )}
                    </div>
                    {selectedCategory === null && (
                      <div className="absolute inset-0 bg-white/10 rounded-xl"></div>
                    )}
                  </motion.button>

                  {/* Category Tabs */}
                  {Object.entries(ASSESSMENT_CATEGORIES).map(([categoryId, category], index) => {
                    const isSelected = selectedCategory === categoryId
                    const styling = getCategoryStyling(categoryId, isSelected)

                    return (
                      <motion.button
                        key={categoryId}
                        onClick={() => setSelectedCategory(categoryId)}
                        className={`group relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap overflow-hidden ${styling.text} ${
                          isSelected
                            ? `${styling.gradient} shadow-lg ${styling.shadow}`
                            : `${styling.gradient} hover:shadow-md ${styling.shadow}`
                        }`}
                        whileHover={{ scale: isSelected ? 1 : 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                      >
                        <div className="relative z-10 flex items-center">
                          <span className="hidden sm:inline">{category.title}</span>
                          <span className="sm:hidden">{category.title.split(' ')[0]}</span>
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          )}
                        </div>
                        {isSelected && (
                          <div className="absolute inset-0 bg-white/10 rounded-xl"></div>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </motion.div>

            {/* Refined Assessment Cards */}
            <motion.div
              className="max-w-7xl mx-auto px-6 pb-24"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Object.entries(assessmentsByCategory)
                  .filter(([categoryId]) => !selectedCategory || selectedCategory === categoryId)
                  .flatMap(([categoryId, assessments]) =>
                    assessments.map((assessment, index) => {
                      const categoryInfo = ASSESSMENT_CATEGORIES[categoryId as keyof typeof ASSESSMENT_CATEGORIES]

                      return (
                        <motion.div
                          key={assessment.id}
                          className="group relative cursor-pointer"
                          onClick={() => {
                            setCurrentAssessmentId(assessment.id)
                            handleFlowSelect('single')
                          }}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{
                            y: -8,
                            boxShadow: "0 28px 60px -12px rgba(0, 0, 0, 0.18), 0 12px 24px -6px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(148, 163, 184, 0.08)"
                          }}
                          transition={{
                            duration: 0.7,
                            delay: 0.6 + index * 0.08,
                            ease: [0.25, 0.1, 0.25, 1],
                            boxShadow: { duration: 0.35 }
                          }}
                        >
                          {/* Card Container with Depth */}
                          <div className="relative bg-white rounded-2xl border border-slate-100/60 overflow-hidden shadow-sm group-hover:shadow-2xl group-hover:shadow-slate-200/50 transition-all duration-500">

                            {/* Subtle Background Pattern */}
                            <div className="absolute inset-0 opacity-[0.015] group-hover:opacity-[0.03] transition-opacity duration-500">
                              <div className="absolute top-6 right-6 w-16 h-16 border border-slate-200 rounded-full"></div>
                              <div className="absolute bottom-6 left-6 w-12 h-12 border border-slate-200 rounded-full"></div>
                          </div>

                            {/* Content */}
                            <div className="relative p-8">

                              {/* Category Badge - Top Right */}
                              <motion.div
                                className="absolute top-4 right-4"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.8 + index * 0.05 }}
                              >
                                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 border border-slate-200/40 shadow-sm">
                                  {categoryInfo.title}
                                </span>
                              </motion.div>

                              {/* Assessment Title */}
                              <motion.h3
                                className="text-xl font-semibold text-gray-900 mb-3 pr-24 group-hover:text-gray-800 transition-colors duration-300"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.7 + index * 0.05 }}
                              >
                            {assessment.shortTitle}
                              </motion.h3>

                          {/* Description */}
                              <motion.p
                                className="text-gray-600 leading-relaxed mb-6 text-sm"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.8 + index * 0.05 }}
                              >
                            {assessment.description}
                              </motion.p>

                              {/* Meta Information */}
                              <motion.div
                                className="flex items-center justify-between mb-6"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.9 + index * 0.05 }}
                              >
                            <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                              <span>{assessment.questions.length} questions</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                              <span>{assessment.estimatedTime} min</span>
                            </div>
                                </div>

                                {/* Subtle Arrow Indicator */}
                                <motion.div
                                  className="opacity-0 group-hover:opacity-100 transition-all duration-300"
                                  whileHover={{ x: 2 }}
                                >
                                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                                  </svg>
                                </motion.div>
                              </motion.div>

                              {/* Sophisticated Bottom Accent */}
                              <motion.div
                                className="h-px bg-gradient-to-r from-transparent via-slate-200/60 to-transparent"
                                initial={{ scaleX: 0, opacity: 0 }}
                                animate={{ scaleX: 1, opacity: 1 }}
                                transition={{
                                  duration: 0.8,
                                  delay: 1.0 + index * 0.05,
                                  ease: [0.25, 0.1, 0.25, 1]
                                }}
                              ></motion.div>

                            </div>

                            {/* Ultra-refined Hover Overlay */}
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-white/4 opacity-0 group-hover:opacity-100 transition-all duration-700"
                              initial={false}
                            />

                            {/* Ultra-precise Shadow System */}
                            <div className="absolute -inset-1.5 bg-gradient-to-br from-slate-200/10 via-slate-300/6 to-slate-200/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-all duration-800 -z-10"></div>
                            <div className="absolute -inset-1 bg-gradient-to-br from-slate-100/15 via-slate-200/8 to-slate-100/15 rounded-2xl blur-md opacity-0 group-hover:opacity-40 transition-all duration-600 -z-10"></div>
                            <div className="absolute -inset-0.5 bg-gradient-to-br from-slate-50/20 via-transparent to-slate-50/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-30 transition-all duration-400 -z-10"></div>

                          </div>
                        </motion.div>
                      )
                    })
                  )}
              </div>
            </motion.div>
          </>
        ) : (
          /* Assessment History Tab */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto px-6 pb-20"
          >
            <AssessmentHistory />
          </motion.div>
        )}

      </div>
    )
  }

  // Show assessment flow
  if (selectedFlow) {
    const assessmentIds = selectedFlow === 'single' && currentAssessmentId
      ? [currentAssessmentId]
      : ['phq9', 'gad7', 'pss10', 'who5']

    return (
      <AssessmentFlow
        assessmentIds={assessmentIds}
        onComplete={handleAssessmentComplete}
        onExit={() => setSelectedFlow(null)}
      />
    )
  }

  return null
}
