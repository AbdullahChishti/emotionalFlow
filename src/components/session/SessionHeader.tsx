/**
 * Enhanced Session Header Component
 * Optimized for therapeutic UX with improved typography and accessibility
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { MaterialSymbolsOutlined } from '@/components/ui/icons'
import { SessionState, SessionParticipant, SessionAction } from '@/types/session'
import { therapeuticTypography } from '@/styles/session-typography'
import { therapeuticPalette, therapeuticShadows, therapeuticAnimations } from '@/styles/session-design-system'
import { formatTime } from '@/lib/utils'

interface SessionHeaderProps {
  sessionState: SessionState
  matchedUser: SessionParticipant
  onAction: (action: SessionAction) => void
  isEmergencyMode?: boolean
}

export function SessionHeader({
  sessionState,
  matchedUser,
  onAction,
  isEmergencyMode = false
}: SessionHeaderProps) {
  const handleEndSession = () => {
    onAction('end-session')
  }

  const handleEmergency = () => {
    onAction('emergency-help')
  }

  return (
    <motion.header
      initial={therapeuticAnimations.fadeIn.initial}
      animate={therapeuticAnimations.fadeIn.animate}
      transition={therapeuticAnimations.fadeIn.transition}
      className={`border-b border-neutral-200 p-6 shrink-0 bg-white ${therapeuticShadows.subtle}`}
    >
      <div className="flex items-center justify-between">
        {/* Left Section: Session Info */}
        <div className="flex items-center gap-3">
          <motion.div
            className="w-8 h-8 bg-brand-green-100 rounded-lg flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MaterialSymbolsOutlined
              icon="psychology"
              className="text-lg text-brand-green-600"
              aria-hidden={true}
            />
          </motion.div>
          <div>
            <h1 className={therapeuticTypography.headline.h1}>
              {isEmergencyMode ? 'Crisis Support' : 'Therapy Session'}
            </h1>
            <p className={`${therapeuticTypography.body.caption} mt-1`}>
              {isEmergencyMode ? 'Immediate support available' : 'Safe space for healing'}
            </p>
          </div>
        </div>

        {/* Center Section: Listener Info */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className={therapeuticTypography.body.caption}>
            Connected with
          </p>
          <p className={`${therapeuticTypography.headline.h3} text-brand-green-700`}>
            {matchedUser.user.name}
          </p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <div className="w-2 h-2 bg-brand-green-500 rounded-full animate-pulse"></div>
            <span className={therapeuticTypography.body.small}>
              Online
            </span>
          </div>
        </motion.div>

        {/* Right Section: Controls */}
        <div className="flex items-center gap-4">
          {/* Session Timer */}
          <motion.div
            className="flex items-center gap-2 px-3 py-2 bg-neutral-100 rounded-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <MaterialSymbolsOutlined
              icon="schedule"
              className="text-sm text-neutral-600"
              aria-hidden={true}
            />
            <span className={`${therapeuticTypography.body.small} font-medium text-neutral-700`}>
              {formatTime(sessionState.duration)}
            </span>
          </motion.div>

          {/* Session Status Indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              sessionState.isPaused
                ? 'bg-amber-500'
                : sessionState.status === 'active'
                ? 'bg-brand-green-500'
                : 'bg-neutral-400'
            }`}></div>
            <span className={therapeuticTypography.body.caption}>
              {sessionState.isPaused ? 'Paused' : 'Active'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Pause/Resume Button */}
            <motion.button
              onClick={() => onAction(sessionState.isPaused ? 'resume-session' : 'pause-session')}
              className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                sessionState.isPaused
                  ? 'bg-brand-green-600 hover:bg-brand-green-700 text-white'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-800'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label={sessionState.isPaused ? 'Resume session' : 'Pause session'}
            >
              <MaterialSymbolsOutlined
                icon={sessionState.isPaused ? 'play_arrow' : 'pause'}
                className="text-sm mr-1"
              />
              {sessionState.isPaused ? 'Resume' : 'Pause'}
            </motion.button>

            {/* Emergency Button - Always Visible */}
            <motion.button
              onClick={handleEmergency}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-1"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label="Emergency help"
            >
              <MaterialSymbolsOutlined
                icon="emergency"
                className="text-sm"
              />
              <span className="hidden sm:inline">Emergency</span>
            </motion.button>

            {/* End Session Button */}
            <motion.button
              onClick={handleEndSession}
              className="px-4 py-2 bg-neutral-600 hover:bg-neutral-700 text-white rounded-lg font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={sessionState.status === 'ending'}
              aria-label="End session"
            >
              {sessionState.status === 'ending' ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Ending...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <MaterialSymbolsOutlined
                    icon="logout"
                    className="text-sm"
                  />
                  <span>End Session</span>
                </div>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <motion.div
        className="mt-4 w-full bg-neutral-200 rounded-full h-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          className="bg-gradient-to-r from-brand-green-500 to-brand-green-700 h-1 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((sessionState.duration / 1800) * 100, 100)}%` }} // 30 minutes max
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </motion.div>

      {/* Accessibility Status */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Session duration: {formatTime(sessionState.duration)}.
        Status: {sessionState.isPaused ? 'Paused' : 'Active'}.
        Connected with {matchedUser.user.name}.
      </div>
    </motion.header>
  )
}
