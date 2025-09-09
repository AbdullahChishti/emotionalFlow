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
      <div 
        className="min-h-screen relative overflow-hidden"
        style={{
          fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.6) 0%, rgba(255, 255, 255, 1) 50%, rgba(248, 250, 252, 0.6) 100%)'
        }}
      >
        {/* Ultra-sophisticated multi-layered background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/60 via-white to-slate-50/40"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-emerald-50/10 to-transparent"></div>
        
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
        {/* Sophisticated Header */}
        <motion.div
          className="relative max-w-4xl mx-auto px-6 py-16 text-center z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
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
                      <h2 
                        className="relative text-3xl md:text-4xl font-extralight text-slate-900 tracking-tight leading-tight"
                        style={{
                          fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                          letterSpacing: '-0.02em',
                          fontWeight: '200'
                        }}
                      >
                        Next step in your{' '}
                        <span 
                          className="relative inline-block"
                          style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            fontWeight: '300'
                          }}
                        >
                          mental Wellness
                        </span>
                        
                        {/* Sophisticated underline accent */}
                        <motion.div
                          className="absolute -bottom-2 left-0 h-px bg-gradient-to-r from-emerald-400/60 via-teal-400/80 to-emerald-400/60"
                          initial={{ width: 0 }}
                          animate={{ width: '60%' }}
                          transition={{ duration: 1.5, delay: 1.0, ease: "easeOut" }}
                        />
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

        {/* Sophisticated Main Tab Navigation */}
        <motion.div
          className="relative max-w-4xl mx-auto px-6 mb-12 flex justify-center z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div 
            className="relative overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)',
              borderRadius: '24px'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/20 rounded-2xl pointer-events-none"></div>
            <div className="relative p-2">
            <div className="flex items-center gap-2">
            <motion.button
              onClick={() => setActiveTab('browse')}
                className={`group relative px-6 py-3 rounded-xl text-sm font-medium transition-all duration-500 whitespace-nowrap overflow-hidden ${
                activeTab === 'browse'
                    ? 'text-white'
                    : 'text-emerald-600 hover:text-emerald-800'
                }`}
                style={{
                  fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  letterSpacing: '-0.005em',
                  fontWeight: '500',
                  background: activeTab === 'browse' 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)'
                    : 'transparent',
                  boxShadow: activeTab === 'browse' 
                    ? '0 8px 32px -8px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                    : 'none'
                }}
                whileHover={{ 
                  scale: activeTab === 'browse' ? 1 : 1.03,
                  y: activeTab === 'browse' ? 0 : -2
                }}
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
                className={`group relative px-6 py-3 rounded-xl text-sm font-medium transition-all duration-500 whitespace-nowrap overflow-hidden ${
                activeTab === 'history'
                    ? 'text-white'
                    : 'text-emerald-600 hover:text-emerald-800'
                }`}
                style={{
                  fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  letterSpacing: '-0.005em',
                  fontWeight: '500',
                  background: activeTab === 'history' 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)'
                    : 'transparent',
                  boxShadow: activeTab === 'history' 
                    ? '0 8px 32px -8px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                    : 'none'
                }}
                whileHover={{ 
                  scale: activeTab === 'history' ? 1 : 1.03,
                  y: activeTab === 'history' ? 0 : -2
                }}
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
          </div>
        </motion.div>

        {/* Tab Content */}
        {activeTab === 'browse' ? (
          <>
            {/* Sophisticated Category Tabs */}
            <motion.div
              className="relative max-w-6xl mx-auto px-6 mb-20 flex justify-center z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div 
                className="relative overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                  borderRadius: '24px'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/20 rounded-2xl pointer-events-none"></div>
                <div className="relative p-2">
                <div className="flex flex-wrap items-center gap-2">
                  {/* All Assessments Tab */}
                  <motion.button
                    onClick={() => setSelectedCategory(null)}
                    className={`group relative px-6 py-3 rounded-xl text-sm font-medium transition-all duration-500 whitespace-nowrap overflow-hidden ${
                      selectedCategory === null
                        ? 'text-white'
                        : 'text-emerald-600 hover:text-emerald-800'
                    }`}
                    style={{
                      fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      letterSpacing: '-0.005em',
                      fontWeight: '500',
                      background: selectedCategory === null 
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)'
                        : 'transparent',
                      boxShadow: selectedCategory === null 
                        ? '0 8px 32px -8px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                        : 'none'
                    }}
                    whileHover={{ 
                      scale: selectedCategory === null ? 1 : 1.03,
                      y: selectedCategory === null ? 0 : -2
                    }}
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
                        className={`group relative px-6 py-3 rounded-xl text-sm font-medium transition-all duration-500 whitespace-nowrap overflow-hidden ${
                          isSelected ? 'text-white' : 'text-emerald-600 hover:text-emerald-800'
                        }`}
                        style={{
                          fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                          letterSpacing: '-0.005em',
                          fontWeight: '500',
                          background: isSelected 
                            ? 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)'
                            : 'transparent',
                          boxShadow: isSelected 
                            ? '0 8px 32px -8px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                            : 'none'
                        }}
                        whileHover={{ 
                          scale: isSelected ? 1 : 1.03,
                          y: isSelected ? 0 : -2
                        }}
                        whileTap={{ scale: 0.97 }}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 + index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
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
              </div>
            </motion.div>

            {/* Sophisticated Assessment Cards */}
            <motion.div
              className="relative max-w-7xl mx-auto px-6 pb-24 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.0, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
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
                          initial={{ opacity: 0, y: 30, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          whileHover={{
                            y: -12,
                            scale: 1.03,
                            rotateY: 2,
                            transition: { 
                              duration: 0.4,
                              ease: [0.25, 0.1, 0.25, 1],
                              type: "spring",
                              stiffness: 300,
                              damping: 20
                            }
                          }}
                          transition={{
                            duration: 0.8,
                            delay: 0.6 + index * 0.08,
                            ease: [0.25, 0.1, 0.25, 1]
                          }}
                        >
                          {/* Sophisticated Card Container */}
                          <div 
                            className="relative overflow-hidden"
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
                              <div className="absolute top-6 right-6 w-20 h-20 bg-gradient-to-bl from-emerald-200/60 to-transparent rounded-full transform translate-x-8 -translate-y-8"></div>
                              <div className="absolute bottom-6 left-6 w-16 h-16 bg-gradient-to-tr from-teal-200/60 to-transparent rounded-full transform -translate-x-6 translate-y-6"></div>
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
                                className="text-xl font-medium text-gray-900 mb-3 pr-24 group-hover:text-gray-800 transition-colors duration-300"
                                style={{
                                  fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                  letterSpacing: '-0.01em',
                                  fontWeight: '500'
                                }}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.7 + index * 0.05 }}
                              >
                            {assessment.shortTitle}
                              </motion.h3>

                          {/* Description */}
                              <motion.p
                                className="text-gray-600 leading-relaxed mb-6 text-sm"
                                style={{
                                  fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                  letterSpacing: '-0.005em',
                                  fontWeight: '300'
                                }}
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
                                  <div 
                                    className="flex items-center gap-1.5 text-xs text-gray-500 font-medium"
                                    style={{
                                      fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                      letterSpacing: '-0.005em',
                                      fontWeight: '400'
                                    }}
                                  >
                                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                              <span>{assessment.questions.length} questions</span>
                                  </div>
                                  <div 
                                    className="flex items-center gap-1.5 text-xs text-gray-500 font-medium"
                                    style={{
                                      fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                      letterSpacing: '-0.005em',
                                      fontWeight: '400'
                                    }}
                                  >
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
                                className="relative"
                                initial={{ opacity: 0, scaleX: 0 }}
                                animate={{ opacity: 1, scaleX: 1 }}
                                transition={{
                                  duration: 1.2,
                                  delay: 1.0 + index * 0.05,
                                  ease: [0.25, 0.1, 0.25, 1]
                                }}
                              >
                                <div className="h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent"></div>
                                <motion.div
                                  className="absolute top-0 left-0 h-px bg-gradient-to-r from-emerald-400/60 via-teal-400/80 to-emerald-400/60"
                                  initial={{ width: 0 }}
                                  animate={{ width: '100%' }}
                                  transition={{ duration: 1.0, delay: 1.2 + index * 0.05, ease: "easeOut" }}
                                />
                              </motion.div>

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
