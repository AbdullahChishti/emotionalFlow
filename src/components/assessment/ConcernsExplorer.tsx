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
                className={`w-full text-left transition-all duration-500 group relative ${
                  isSelected
                    ? 'bg-white/95 backdrop-blur-sm border border-slate-200/20'
                    : 'bg-white/80 backdrop-blur-sm border border-white/40 hover:border-white/60'
                }`}
                style={{
                  borderRadius: '16px',
                  padding: '24px',
                  marginBottom: '16px'
                }}
                whileHover={{
                  scale: 1.005,
                  y: -1,
                  transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
                }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Minimal background accent */}
                <div className={`absolute inset-0 bg-gradient-to-br ${concern.color} opacity-2 group-hover:opacity-4 transition-opacity duration-500`} />

                <div className="relative z-10">
                  {/* Header with icon and title */}
                  <div className="flex items-center gap-4 mb-3">
                    <motion.div
                      className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br ${concern.color} text-white`}
                      whileHover={{
                        scale: 1.03,
                        transition: { duration: 0.2 }
                      }}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {concern.icon}
                      </span>
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-light text-slate-900 leading-tight tracking-tight group-hover:text-slate-800 transition-colors duration-300">
                        {concern.title}
                      </h3>
                    </div>
                  </div>

                  {/* Subtitle */}
                  <p className="text-sm text-slate-600 font-light leading-relaxed mb-4 group-hover:text-slate-700 transition-colors duration-300">
                    {concern.subtitle}
                  </p>

                  {/* Footer with metadata and action */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <span>{assessments.length}</span>
                      <span className="hidden sm:inline">ASSESSMENTS</span>
                    </div>

                    <motion.div
                      className="flex items-center gap-1 text-xs font-medium text-slate-600 group-hover:text-slate-800 transition-colors duration-300"
                      animate={{ x: isSelected ? 1 : 0 }}
                    >
                      <span>{isSelected ? 'COLLAPSE' : 'EXPAND'}</span>
                      <motion.span
                        className="material-symbols-outlined text-sm"
                        animate={{ rotate: isSelected ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {isSelected ? 'expand_less' : 'expand_more'}
                      </motion.span>
                    </motion.div>
                  </div>
                </div>
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
                    {/* Minimal Container */}
                    <div
                      className="mt-6 bg-white/50 backdrop-blur-sm border border-white/40"
                      style={{
                        borderRadius: '20px',
                        padding: '24px'
                      }}
                    >
                      {/* Simple Header */}
                      <motion.div
                        className="text-center mb-6"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                      >
                        <h4 className="text-xl font-light text-slate-900 mb-2 tracking-tight">
                          Available Assessments
                        </h4>
                        <p className="text-sm text-slate-600 font-light leading-relaxed">
                          Choose an assessment to explore this area
                        </p>
                      </motion.div>

                      {/* Assessment Cards */}
                      <div className="space-y-3">
                        {assessments.map((assessment, assessmentIndex) => (
                          <motion.button
                            key={assessment.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAssessmentClick(assessment.id)
                            }}
                            className="w-full text-left bg-white/60 backdrop-blur-sm border border-slate-200/30 hover:border-slate-300/50 transition-all duration-500 group"
                            style={{
                              padding: '16px',
                              borderRadius: '12px'
                            }}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: 0.2 + assessmentIndex * 0.05,
                              duration: 0.4,
                              ease: [0.25, 0.1, 0.25, 1]
                            }}
                            whileHover={{
                              scale: 1.005,
                              x: 1,
                              transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
                            }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center gap-4">
                              {/* Clean Icon */}
                              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
                                <span className="material-symbols-outlined text-slate-600 text-sm">
                                  {assessment.category === 'trauma' ? 'healing' :
                                   assessment.category === 'depression' ? 'mood' :
                                   assessment.category === 'anxiety' ? 'psychology' :
                                   assessment.category === 'resilience' ? 'fitness_center' :
                                   assessment.category === 'wellbeing' ? 'self_improvement' : 'assessment'}
                                </span>
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-light text-slate-800 group-hover:text-slate-900 transition-colors duration-400 leading-tight mb-0.5">
                                  {assessment.shortTitle}
                                </h4>
                                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                  <span>{assessment.estimatedTime} min</span>
                                  <span>•</span>
                                  <span>{assessment.questions.length} questions</span>
                                </div>
                              </div>

                              {/* Minimal Arrow */}
                              <motion.span
                                className="material-symbols-outlined text-slate-400 group-hover:text-slate-600 text-base transition-colors duration-300"
                                whileHover={{ x: 1 }}
                                transition={{ duration: 0.2 }}
                              >
                                chevron_right
                              </motion.span>
                            </div>
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
