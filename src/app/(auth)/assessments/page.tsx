'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AssessmentFlow } from '@/components/assessment/AssessmentFlow'
import AssessmentHistory from '@/components/assessment/AssessmentHistory'
import { useRouter } from 'next/navigation'
import { ASSESSMENTS, ASSESSMENT_CATEGORIES } from '@/data/assessments'
import { AssessmentResult, UserProfile } from '@/types'

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
      localStorage.setItem('assessmentResults', JSON.stringify(results))
      if (userProfile) {
        localStorage.setItem('userProfile', JSON.stringify(userProfile))
      }
      console.log('💾 Results cached to localStorage')
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

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const iconMap = {
      trauma: 'psychology_alt',
      depression: 'sentiment_dissatisfied',
      anxiety: 'psychology',
      resilience: 'fitness_center',
      wellbeing: 'sentiment_satisfied',
      personality: 'account_circle'
    }
    return iconMap[category as keyof typeof iconMap] || 'assessment'
  }

  // Get minimal category colors
  const getCategoryColor = (category: string) => {
    const colorMap = {
      trauma: 'hover:bg-red-50',
      depression: 'hover:bg-blue-50',
      anxiety: 'hover:bg-amber-50',
      resilience: 'hover:bg-emerald-50',
      wellbeing: 'hover:bg-violet-50',
      personality: 'hover:bg-cyan-50'
    }
    return colorMap[category as keyof typeof colorMap] || 'hover:bg-gray-50'
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
          <motion.h1
            className="text-5xl font-light text-gray-900 mb-6 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Clinical Assessments
          </motion.h1>
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-full">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-blue-800 tracking-wide">
                Professional Grade • Clinical Assessment • Evidence-Based
              </span>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-blue-600 text-base">verified</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          className="max-w-4xl mx-auto px-6 mb-8 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="inline-flex bg-gray-100 rounded-full p-1 gap-1">
            <motion.button
              onClick={() => setActiveTab('browse')}
              className={`relative px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                activeTab === 'browse'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              whileHover={{ scale: activeTab === 'browse' ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">grid_view</span>
                Browse Assessments
              </span>
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('history')}
              className={`relative px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              whileHover={{ scale: activeTab === 'history' ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">history</span>
                My History
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* Tab Content */}
        {activeTab === 'browse' ? (
          <>
            {/* Modern Pill Tabs */}
            <motion.div
              className="max-w-4xl mx-auto px-6 mb-16 flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="inline-flex flex-wrap items-center bg-gray-100 rounded-full p-1 gap-1">
                <motion.button
                  onClick={() => setSelectedCategory(null)}
                  className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    selectedCategory === null
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  whileHover={{ scale: selectedCategory === null ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  All
                </motion.button>
                {Object.entries(ASSESSMENT_CATEGORIES).map(([categoryId, category]) => (
                  <motion.button
                    key={categoryId}
                    onClick={() => setSelectedCategory(categoryId)}
                    className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                      selectedCategory === categoryId
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    whileHover={{ scale: selectedCategory === categoryId ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {category.title}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Assessment Grid - Minimal Cards */}
            <div className="max-w-6xl mx-auto px-6 pb-20">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Object.entries(assessmentsByCategory)
                  .filter(([categoryId]) => !selectedCategory || selectedCategory === categoryId)
                  .flatMap(([categoryId, assessments]) =>
                    assessments.map((assessment, index) => {
                      const categoryInfo = ASSESSMENT_CATEGORIES[categoryId as keyof typeof ASSESSMENT_CATEGORIES]

                      return (
                        <motion.div
                          key={assessment.id}
                          className={`group p-8 rounded-2xl border border-gray-200 cursor-pointer transition-all duration-300 hover:border-gray-300 hover:shadow-lg ${getCategoryColor(categoryId)}`}
                          onClick={() => {
                            setCurrentAssessmentId(assessment.id)
                            handleFlowSelect('single')
                          }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {/* Minimal icon */}
                          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-gray-200 transition-colors">
                            <span className="material-symbols-outlined text-gray-600 text-xl">
                              {getCategoryIcon(categoryId)}
                            </span>
                          </div>

                          {/* Assessment title */}
                          <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors">
                            {assessment.shortTitle}
                          </h3>

                          {/* Description */}
                          <p className="text-gray-600 leading-relaxed mb-6 text-sm">
                            {assessment.description}
                          </p>

                          {/* Meta info */}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-4">
                              <span>{assessment.questions.length} questions</span>
                              <span>{assessment.estimatedTime} min</span>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </div>
                          </div>

                          {/* Category pill badge - soothing green */}
                          <div className="mt-6">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {categoryInfo.title}
                            </span>
                          </div>
                        </motion.div>
                      )
                    })
                  )}
              </div>
            </div>
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
