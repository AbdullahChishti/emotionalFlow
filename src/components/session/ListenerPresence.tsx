/**
 * Enhanced Listener Presence Component
 * Redesigned for therapeutic UX with improved emotional safety and visual hierarchy
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { SessionParticipant, EmotionalState, AccessibilityPreferences } from '@/types/session'
import { therapeuticTypography } from '@/styles/session-typography'
import { therapeuticPalette, therapeuticShadows, therapeuticAnimations } from '@/styles/session-design-system'
import { TherapeuticIcon, AnimatedTherapeuticIcon, EmotionalIcon } from '@/components/ui/icons'

interface ListenerPresenceProps {
  participant: SessionParticipant
  emotionalState: EmotionalState
  interactionCount: number
  layout: {
    screenSize: 'mobile' | 'tablet' | 'desktop'
    minimized: boolean
  }
  preferences: AccessibilityPreferences
}

interface Affirmation {
  id: string
  text: string
  category: 'general' | 'calming' | 'empowering' | 'mindful' | 'supportive'
  emotionalTarget: EmotionalState[]
}

// Enhanced therapeutic affirmations with better categorization
const AFFIRMATIONS: Affirmation[] = [
  // General Support
  { id: 'general_1', text: "You're not being judged here.", category: 'general', emotionalTarget: ['anxious', 'sad', 'angry'] },
  { id: 'general_2', text: "Take your time. Someone is listening.", category: 'general', emotionalTarget: ['overwhelmed', 'anxious'] },
  { id: 'general_3', text: "You don't have to explain everything.", category: 'general', emotionalTarget: ['overwhelmed'] },
  { id: 'general_4', text: "This space is for you.", category: 'general', emotionalTarget: ['sad', 'anxious'] },
  { id: 'general_5', text: "What you're feeling makes sense.", category: 'general', emotionalTarget: ['confused', 'angry'] },
  { id: 'general_6', text: "We're here with you, not ahead of you.", category: 'general', emotionalTarget: ['overwhelmed'] },
  { id: 'general_7', text: "You're allowed to feel what you feel.", category: 'general', emotionalTarget: ['sad', 'angry'] },
  { id: 'general_8', text: "You've already done something brave.", category: 'general', emotionalTarget: ['anxious', 'hopeful'] },
  { id: 'general_9', text: "Your feelings are valid.", category: 'general', emotionalTarget: ['sad', 'angry'] },
  { id: 'general_10', text: "This is a safe space.", category: 'general', emotionalTarget: ['anxious'] },

  // Calming affirmations
  { id: 'calming_1', text: "One breath at a time.", category: 'calming', emotionalTarget: ['anxious', 'overwhelmed'] },
  { id: 'calming_2', text: "You're safe in this moment.", category: 'calming', emotionalTarget: ['anxious'] },
  { id: 'calming_3', text: "This anxiety doesn't define you.", category: 'calming', emotionalTarget: ['anxious'] },
  { id: 'calming_4', text: "Your feelings are temporary, not permanent.", category: 'calming', emotionalTarget: ['anxious', 'sad'] },
  { id: 'calming_5', text: "You are stronger than you know.", category: 'calming', emotionalTarget: ['overwhelmed', 'sad'] },

  // Empowering affirmations
  { id: 'empowering_1', text: "Your voice matters here.", category: 'empowering', emotionalTarget: ['sad', 'anxious'] },
  { id: 'empowering_2', text: "You're capable of healing.", category: 'empowering', emotionalTarget: ['sad', 'hopeful'] },
  { id: 'empowering_3', text: "Your story deserves to be heard.", category: 'empowering', emotionalTarget: ['sad'] },
  { id: 'empowering_4', text: "You have the power to choose your next step.", category: 'empowering', emotionalTarget: ['overwhelmed'] },

  // Mindful affirmations
  { id: 'mindful_1', text: "Notice your breath.", category: 'mindful', emotionalTarget: ['anxious', 'overwhelmed'] },
  { id: 'mindful_2', text: "This moment contains everything you need.", category: 'mindful', emotionalTarget: ['anxious'] },
  { id: 'mindful_3', text: "You're exactly where you need to be.", category: 'mindful', emotionalTarget: ['confused', 'sad'] },
  { id: 'mindful_4', text: "Listen to what your body is telling you.", category: 'mindful', emotionalTarget: ['overwhelmed'] },

  // Supportive affirmations
  { id: 'supportive_1', text: "I'm here to support you.", category: 'supportive', emotionalTarget: ['sad', 'anxious'] },
  { id: 'supportive_2', text: "Your healing journey matters.", category: 'supportive', emotionalTarget: ['sad', 'hopeful'] },
  { id: 'supportive_3', text: "You don't have to do this alone.", category: 'supportive', emotionalTarget: ['overwhelmed'] },
  { id: 'supportive_4', text: "Every step forward counts.", category: 'supportive', emotionalTarget: ['sad', 'hopeful'] }
]

export function ListenerPresence({
  participant,
  emotionalState,
  interactionCount,
  layout,
  preferences
}: ListenerPresenceProps) {
  const [currentAffirmation, setCurrentAffirmation] = useState<Affirmation | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [affirmationsEnabled, setAffirmationsEnabled] = useState(true)
  const [showControls, setShowControls] = useState(false)
  const controls = useAnimation()

  // Select appropriate affirmation based on emotional state
  const selectAffirmation = useCallback((): Affirmation => {
    // Filter affirmations by emotional state
    const relevantAffirmations = AFFIRMATIONS.filter(affirmation =>
      affirmation.emotionalTarget.includes(emotionalState) ||
      affirmation.category === 'general'
    )

    // If no relevant affirmations, use general ones
    const pool = relevantAffirmations.length > 0 ? relevantAffirmations : AFFIRMATIONS

    return pool[Math.floor(Math.random() * pool.length)]
  }, [emotionalState])

  // Cycle through affirmations
  useEffect(() => {
    if (!affirmationsEnabled) return

    // Initial affirmation
    setCurrentAffirmation(selectAffirmation())

    const cycleInterval = setInterval(() => {
      setIsVisible(false)

      setTimeout(() => {
        setCurrentAffirmation(selectAffirmation())
        setIsVisible(true)
      }, 1000)
    }, 12000) // Change every 12 seconds for better therapeutic rhythm

    return () => clearInterval(cycleInterval)
  }, [selectAffirmation, affirmationsEnabled])

  // Handle interaction-based updates
  useEffect(() => {
    if (interactionCount > 0 && interactionCount % 3 === 0) {
      // Show a new affirmation after every 3 interactions
      controls.start({
        scale: [1, 1.05, 1],
        transition: { duration: 0.5 }
      })
    }
  }, [interactionCount, controls])

  const toggleAffirmations = () => {
    setAffirmationsEnabled(prev => !prev)
    if (!affirmationsEnabled) {
      setCurrentAffirmation(selectAffirmation())
      setIsVisible(true)
    }
  }

  // Map EmotionalState to EmotionalIcon emotion values
  const mapEmotionalStateToIcon = (state: EmotionalState): 'happy' | 'sad' | 'angry' | 'anxious' | 'calm' | 'excited' | 'neutral' => {
    switch (state) {
      case 'calm':
        return 'calm'
      case 'anxious':
        return 'anxious'
      case 'overwhelmed':
        return 'anxious' // Map overwhelmed to anxious
      case 'hopeful':
        return 'excited' // Map hopeful to excited
      case 'sad':
        return 'sad'
      case 'angry':
        return 'angry'
      case 'excited':
        return 'excited'
      case 'neutral':
        return 'neutral'
      case 'confused':
        return 'neutral' // Map confused to neutral
      default:
        return 'neutral'
    }
  }

  const handleEmotionalStateChange = (newState: EmotionalState) => {
    // This would be passed up to parent component
    console.log('Emotional state change requested:', newState)
  }

  // Responsive layout adjustments
  const containerClasses = layout.screenSize === 'mobile'
    ? 'h-1/3 p-4'
    : layout.screenSize === 'tablet'
    ? 'h-2/5 p-6'
    : 'h-full p-8'

  const isMinimized = layout.minimized || layout.screenSize === 'mobile'

  if (isMinimized) {
    return (
      <motion.div
        className="h-full bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center border-r border-neutral-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center">
          <motion.div
            animate={controls}
            className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3"
          >
            <EmotionalIcon emotion={mapEmotionalStateToIcon(emotionalState)} size="lg" />
          </motion.div>
          <h3 className={`${therapeuticTypography.headline.h4} text-emerald-800`}>
            {participant.user.name}
          </h3>
          <p className={therapeuticTypography.body.caption}>
            Listening
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={`h-full bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50 backdrop-blur-sm flex flex-col ${containerClasses}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      onHoverStart={() => setShowControls(true)}
      onHoverEnd={() => setShowControls(false)}
    >
      {/* Soft background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-emerald-400/5 to-transparent opacity-50" />

      {/* Header with participant info */}
      <motion.div
        className="relative z-10 flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
          >
            <EmotionalIcon emotion={mapEmotionalStateToIcon(emotionalState)} size="lg" />
          </motion.div>
          <div>
            <h2 className={`${therapeuticTypography.headline.h3} text-emerald-800`}>
              {participant.user.name}
            </h2>
            <p className={therapeuticTypography.body.caption}>
              Your listener
            </p>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className={therapeuticTypography.body.small}>
            Active
          </span>
        </div>
      </motion.div>

      {/* Emotional state indicator */}
      <motion.div
        className="relative z-10 mb-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <span className={therapeuticTypography.body.small}>
            Current mood:
          </span>
          <div className="flex items-center gap-2">
            <EmotionalIcon emotion={mapEmotionalStateToIcon(emotionalState)} size="sm" />
            <span className={`${therapeuticTypography.body.small} capitalize`}>
              {emotionalState}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Affirmations area */}
      {affirmationsEnabled && (
        <motion.div
          className="relative z-10 flex-1 flex items-center justify-center"
          animate={controls}
        >
          <AnimatePresence mode="wait">
            {isVisible && currentAffirmation && (
              <motion.div
                key={currentAffirmation.id}
                className={`text-center max-w-xs px-6 ${therapeuticTypography.therapeutic.calming}`}
                style={{
                  filter: "drop-shadow(0 0 2px rgba(16, 185, 129, 0.3))",
                  textShadow: "0 0 10px rgba(16, 185, 129, 0.2)",
                }}
                initial={preferences.reducedMotion ?
                  therapeuticAnimations.fadeIn.initial :
                  { opacity: 0, y: 10, scale: 0.95 }
                }
                animate={preferences.reducedMotion ?
                  therapeuticAnimations.fadeIn.animate :
                  { opacity: 1, y: 0, scale: 1 }
                }
                exit={preferences.reducedMotion ?
                  therapeuticAnimations.fadeIn.initial :
                  { opacity: 0, y: -10, scale: 0.95 }
                }
                transition={therapeuticAnimations.affirmationFade.transition}
              >
                <motion.div
                  className="mb-4"
                  animate={preferences.reducedMotion ? {} : {
                    scale: [1, 1.05, 1],
                    transition: { duration: 4, repeat: Infinity }
                  }}
                >
                  <TherapeuticIcon name="heart" size="lg" color="#059669" />
                </motion.div>
                <p className="leading-relaxed">
                  {currentAffirmation.text}
                </p>
                <div className="mt-4 text-xs text-emerald-600 opacity-60">
                  {currentAffirmation.category}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Interaction counter */}
      <motion.div
        className="relative z-10 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="text-center">
          <div className="text-2xl font-light text-emerald-700 mb-1">
            {interactionCount}
          </div>
          <div className={therapeuticTypography.body.caption}>
            Interactions
          </div>
        </div>
      </motion.div>

      {/* Control panel */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            className="relative z-10 mt-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-center gap-3">
              <motion.button
                onClick={toggleAffirmations}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  affirmationsEnabled
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={affirmationsEnabled ? 'Pause affirmations' : 'Resume affirmations'}
              >
                <TherapeuticIcon
                  name={affirmationsEnabled ? 'pause' : 'play'}
                  size="sm"
                  className="mr-1"
                />
                {affirmationsEnabled ? 'Pause' : 'Resume'}
              </motion.button>

              <motion.button
                onClick={() => setShowControls(false)}
                className="px-3 py-2 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded-lg font-medium transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Hide controls"
              >
                <TherapeuticIcon name="close" size="sm" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accessibility features */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Listener {participant.user.name} is {participant.user.isOnline ? 'online' : 'offline'}.
        Current emotional state: {emotionalState}.
        {currentAffirmation && `Affirmation: ${currentAffirmation.text}`}
        {interactionCount} interactions in this session.
      </div>
    </motion.div>
  )
}
