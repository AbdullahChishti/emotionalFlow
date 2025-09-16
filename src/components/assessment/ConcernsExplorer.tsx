/**
 * Concerns Explorer Component
 * Shows assessments organized by major life areas/issues
 */

'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ASSESSMENTS } from '@/data/assessments'
import { useRouter } from 'next/navigation'

// Material Symbols icons import
import 'material-symbols/outlined.css'

interface ConcernsExplorerProps {
  className?: string
  onAssessmentSelect?: (assessmentId: string) => void
}

// Major concern categories
const MAJOR_CONCERNS = [
  {
    id: 'emotional-wellbeing',
    title: 'Do I struggle with my emotions?',
    subtitle: 'Understanding your mood & feelings',
    description: 'Explore how you feel about yourself and your emotional state',
    icon: 'sentiment_satisfied',
    color: 'from-emerald-500 to-teal-500',
    concerns: [
      'Am I depressed?',
      'Do I have low motivation?',
      'Am I losing interest in activities?',
      'Am I struggling with sadness?',
      'Do I have trouble sleeping?',
      'Am I happy?',
      'Do I enjoy life?',
      'Am I feeling good?',
      'Do I have energy?',
      'Am I content?',
      'Do I feel positive?'
    ]
  },
  {
    id: 'relationships',
    title: 'Do I sabotage my relationships?',
    subtitle: 'Connection, trust & belonging',
    description: 'Understand how you relate to others and form connections',
    icon: 'group',
    color: 'from-pink-500 to-rose-500',
    concerns: [
      'Do I sabotage my relationships?',
      'Am I carrying childhood trauma?',
      'Do I have unresolved childhood experiences?',
      'Is my past affecting my current relationships?',
      'Do I struggle with trust issues?',
      'Am I affected by my family history?'
    ]
  },
  {
    id: 'stress-resilience',
    title: 'Can I handle life\'s challenges?',
    subtitle: 'Coping with stress & building resilience',
    description: 'Discover your ability to handle stress and bounce back',
    icon: 'fitness_center',
    color: 'from-amber-500 to-orange-500',
    concerns: [
      'Am I stressed?',
      'Do I feel overwhelmed?',
      'Am I always stressed?',
      'Do I handle stress well?',
      'Am I dealing with too much?',
      'Do I feel out of control?',
      'Am I resilient?',
      'Do I handle stress well?',
      'Can I bounce back from difficulties?',
      'Am I adaptable?',
      'Do I stay calm under pressure?',
      'Am I strong in tough times?'
    ]
  },
  {
    id: 'anxiety-fear',
    title: 'Do I worry too much?',
    subtitle: 'Worry, fear & finding peace',
    description: 'Examine patterns of worry and anxiety in your life',
    icon: 'psychology',
    color: 'from-blue-500 to-indigo-500',
    concerns: [
      'Am I anxious?',
      'Do I worry too much?',
      'Am I always stressed?',
      'Do I have panic attacks?',
      'Am I restless or on edge?',
      'Do I feel overwhelmed?'
    ]
  },
  {
    id: 'identity-purpose',
    title: 'Do I have unresolved trauma?',
    subtitle: 'Self-worth, confidence & healing',
    description: 'Explore who you are and what gives your life meaning',
    icon: 'person',
    color: 'from-violet-500 to-purple-500',
    concerns: [
      'Do I have PTSD?',
      'Am I reliving traumatic experiences?',
      'Do I avoid reminders of trauma?',
      'Am I emotionally numb?',
      'Do I have flashbacks?',
      'Am I hypervigilant?'
    ]
  }
]

const ConcernsExplorer: React.FC<ConcernsExplorerProps> = ({
  className = '',
  onAssessmentSelect
}) => {
  const router = useRouter()
  const [selectedConcern, setSelectedConcern] = useState<string | null>(null)

  // Get assessments that match a specific concern category
  const getAssessmentsForConcern = (concernId: string) => {
    const concernData = MAJOR_CONCERNS.find(c => c.id === concernId)
    if (!concernData) return []

    return Object.values(ASSESSMENTS).filter(assessment =>
      assessment.commonConcerns?.some(concern =>
        concernData.concerns.includes(concern)
      )
    )
  }

  const handleConcernClick = (concernId: string) => {
    setSelectedConcern(selectedConcern === concernId ? null : concernId)
  }

  const handleAssessmentClick = (assessmentId: string) => {
    if (onAssessmentSelect) {
      onAssessmentSelect(assessmentId)
    } else {
      router.push(`/assessments?assessment=${assessmentId}`)
    }
  }

  return (
    <div className={`${className} space-y-8`}>
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl md:text-4xl font-light text-slate-900 tracking-tight mb-4">
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent font-normal">
            Explore Your Concerns
          </span>
        </h2>
        <p className="text-lg text-slate-600 font-light max-w-2xl mx-auto">
          Discover assessments organized around the major areas of life that matter most to you.
        </p>
      </motion.div>

      {/* Major Concerns Grid */}
      <motion.div
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {MAJOR_CONCERNS.map((concern, index) => {
          const assessments = getAssessmentsForConcern(concern.id)
          const isSelected = selectedConcern === concern.id

          return (
            <motion.div
              key={concern.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
            >
              <motion.button
                onClick={() => handleConcernClick(concern.id)}
                className={`w-full text-left transition-all duration-700 group relative overflow-hidden ${
                  isSelected
                    ? 'bg-white/95 backdrop-blur-2xl border border-slate-200/30 shadow-2xl shadow-slate-900/[0.08]'
                    : 'bg-white/80 backdrop-blur-xl border border-white/40 hover:border-white/60 hover:shadow-xl shadow-lg shadow-slate-900/[0.04]'
                }`}
                style={{
                  borderRadius: '28px',
                  padding: '32px',
                  marginBottom: '8px'
                }}
                whileHover={{
                  scale: 1.01,
                  y: -2,
                  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
                }}
                whileTap={{ scale: 0.99 }}
              >
                {/* Subtle background gradient - Johnny Ive style */}
                <div className={`absolute inset-0 bg-gradient-to-br ${concern.color} opacity-3 group-hover:opacity-6 transition-all duration-700`} />

                {/* Minimal floating accent */}
                <motion.div
                  className={`absolute top-8 right-8 w-20 h-20 bg-gradient-to-br ${concern.color} rounded-full blur-3xl`}
                  style={{ opacity: 0.04 }}
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.04, 0.06, 0.04]
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                <div className="relative z-10">
                  {/* Elegant icon with subtle shadow */}
                  <motion.div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 bg-gradient-to-br ${concern.color} text-white shadow-sm`}
                    whileHover={{
                      scale: 1.05,
                      transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
                    }}
                  >
                    <span className="material-symbols-outlined text-2xl">
                      {concern.icon}
                    </span>
                  </motion.div>

                  {/* Typography hierarchy */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-xl font-light text-slate-900 leading-tight tracking-tight mb-2 group-hover:text-slate-800 transition-colors duration-500">
                        {concern.title}
                      </h3>
                      <p className="text-sm text-slate-600 font-light leading-relaxed group-hover:text-slate-700 transition-colors duration-500">
                        {concern.subtitle}
                      </p>
                    </div>

                    {/* Minimal description */}
                    <p className="text-sm text-slate-500 leading-relaxed font-light">
                      {concern.description}
                    </p>
                  </div>

                  {/* Clean bottom section */}
                  <motion.div
                    className="flex items-center justify-between pt-6 mt-6 border-t border-slate-200/40"
                    initial={{ opacity: 0.8 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                      <span className="text-xs text-slate-600 font-medium tracking-wide">
                        {assessments.length} ASSESSMENT{assessments.length !== 1 ? 'S' : ''}
                      </span>
                    </div>

                    <motion.div
                      className="flex items-center gap-2 text-xs font-medium text-slate-600 group-hover:text-slate-800 transition-colors duration-500 tracking-wide"
                      animate={{ x: isSelected ? 1 : 0 }}
                    >
                      <span>{isSelected ? 'COLLAPSE' : 'EXPAND'}</span>
                      <motion.span
                        className="material-symbols-outlined text-sm"
                        animate={{ rotate: isSelected ? 180 : 0 }}
                        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                      >
                        {isSelected ? 'expand_less' : 'expand_more'}
                      </motion.span>
                    </motion.div>
                  </motion.div>
                </div>

                {/* Subtle hover glow */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{
                    borderRadius: '28px'
                  }}
                />
              </motion.button>

              {/* Expanded Assessment List - Johnny Ive Style */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -20 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -20 }}
                    transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                    className="overflow-hidden"
                  >
                    {/* Premium Container */}
                    <div
                      className="mt-8 bg-white/40 backdrop-blur-xl border border-white/30 shadow-lg"
                      style={{
                        borderRadius: '32px',
                        padding: '40px'
                      }}
                    >
                      {/* Elegant Header */}
                      <motion.div
                        className="text-center mb-10"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                          <span className="material-symbols-outlined text-slate-600 text-xl">
                            {concern.icon}
                          </span>
                        </div>
                        <h4 className="text-2xl font-light text-slate-900 mb-3 tracking-tight">
                          Available Assessments
                        </h4>
                        <p className="text-base text-slate-600 font-light leading-relaxed max-w-sm mx-auto">
                          Choose an assessment to explore this area of your life
                        </p>
                        <motion.div
                          className="w-16 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mx-auto mt-6"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 0.4, duration: 0.6 }}
                        />
                      </motion.div>

                      {/* Assessment Cards */}
                      <div className="space-y-4">
                        {assessments.map((assessment, assessmentIndex) => (
                          <motion.button
                            key={assessment.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAssessmentClick(assessment.id)
                            }}
                            className="w-full text-left bg-white/70 backdrop-blur-sm border border-slate-200/30 hover:border-slate-300/50 transition-all duration-700 group relative overflow-hidden"
                            style={{
                              padding: '28px',
                              borderRadius: '24px'
                            }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: 0.3 + assessmentIndex * 0.1,
                              duration: 0.6,
                              ease: [0.25, 0.1, 0.25, 1]
                            }}
                            whileHover={{
                              scale: 1.005,
                              y: -2,
                              transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
                            }}
                            whileTap={{ scale: 0.995 }}
                          >
                            {/* Subtle background gradient */}
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-50/30 via-transparent to-slate-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                            {/* Minimal floating accent */}
                            <motion.div
                              className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-slate-100/40 to-transparent rounded-full blur-xl"
                              animate={{
                                scale: [1, 1.05, 1],
                                opacity: [0.3, 0.4, 0.3]
                              }}
                              transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: assessmentIndex * 0.5
                              }}
                            />

                            <div className="relative z-10">
                              <div className="flex items-start gap-6">
                                {/* Elegant Icon */}
                                <motion.div
                                  className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-500"
                                  whileHover={{
                                    scale: 1.05,
                                    rotate: 2,
                                    transition: { duration: 0.3 }
                                  }}
                                >
                                  <span className="material-symbols-outlined text-slate-600 text-xl">
                                    {assessment.category === 'trauma' ? 'healing' :
                                     assessment.category === 'depression' ? 'mood' :
                                     assessment.category === 'anxiety' ? 'psychology' :
                                     assessment.category === 'resilience' ? 'fitness_center' :
                                     assessment.category === 'wellbeing' ? 'self_improvement' : 'assessment'}
                                  </span>
                                </motion.div>

                                {/* Content Section */}
                                <div className="flex-1 min-w-0">
                                  <div className="mb-4">
                                    <h4 className="text-lg font-light text-slate-900 group-hover:text-slate-800 transition-colors duration-500 leading-tight mb-2">
                                      {assessment.shortTitle}
                                    </h4>
                                    <p className="text-sm text-slate-600 group-hover:text-slate-700 transition-colors duration-500 leading-relaxed font-light">
                                      {assessment.description}
                                    </p>
                                  </div>

                                  {/* Metadata Row */}
                                  <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-3">
                                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                                      <span className="text-sm text-slate-600 font-medium tracking-wide">
                                        {assessment.estimatedTime} MIN
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                                      <span className="text-sm text-slate-600 font-medium tracking-wide">
                                        {assessment.questions.length} QUESTIONS
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Elegant Arrow */}
                                <motion.div
                                  className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-slate-50/50 group-hover:bg-slate-100/80 transition-colors duration-500"
                                  whileHover={{
                                    scale: 1.1,
                                    x: 2
                                  }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <span className="material-symbols-outlined text-slate-500 group-hover:text-slate-700 text-lg transition-colors duration-500">
                                    chevron_right
                                  </span>
                                </motion.div>
                              </div>
                            </div>

                            {/* Subtle bottom accent */}
                            <motion.div
                              className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                              initial={{ scaleX: 0 }}
                              whileHover={{ scaleX: 1 }}
                              transition={{ duration: 0.4 }}
                            />
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

export default ConcernsExplorer
