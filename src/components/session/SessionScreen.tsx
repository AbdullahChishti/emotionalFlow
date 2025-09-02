/**
 * Minimal SessionScreen
 * Clean, single‑column layout with modern, restrained styling
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSessionState } from '@/hooks/useSessionState'
import { SessionHeader } from './SessionHeader'
import { ChatInterface } from './ChatInterface'
import { SessionCompletionScreen, SessionFeedback } from '../screens/SessionCompletionScreen'
import {
  SessionUser,
  SessionParticipant,
  EmotionalState,
  LayoutState,
  AccessibilityPreferences,
  SessionAction
} from '@/types/session'
import { therapeuticAnimations } from '@/styles/session-design-system'

interface SessionScreenProps {
  onNavigate: (screen: string, params?: Record<string, any>) => void
  matchedUser: SessionParticipant
  user: SessionUser
  initialEmotionalState?: EmotionalState
}

// Mock typing suggestions (would come from AI service)
const MOCK_SUGGESTIONS = [
  { id: '1', text: "I'd like to talk about what's been weighing on me lately", category: 'opening' as const, priority: 1, isUsed: false, createdAt: new Date() },
  { id: '2', text: "I'm feeling overwhelmed and need some guidance", category: 'opening' as const, priority: 1, isUsed: false, createdAt: new Date() },
  { id: '3', text: "Can you help me understand my emotions better?", category: 'reflection' as const, priority: 2, isUsed: false, createdAt: new Date() },
  { id: '4', text: "I need a moment to collect my thoughts", category: 'transition' as const, priority: 3, isUsed: false, createdAt: new Date() }
]

export function SessionScreen({
  onNavigate,
  matchedUser,
  user,
  initialEmotionalState = 'calm'
}: SessionScreenProps) {
  // Generate session ID first
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Core session state
  const {
    session,
    messages,
    participants,
    error,
    isLoading,
    actions
  } = useSessionState(sessionId, user, matchedUser)

  // Local UI state
  const [emotionalState, setEmotionalState] = useState<EmotionalState>(initialEmotionalState)
  const [layout, setLayout] = useState<LayoutState>({
    screenSize: 'desktop',
    orientation: 'landscape',
    sidebarCollapsed: true,
    chatFullscreen: true,
    presenceMinimized: true
  })
  const [preferences] = useState<AccessibilityPreferences>({
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    screenReader: false,
    voiceInput: false,
    voiceOutput: false,
    fontSize: 'medium',
    colorScheme: 'default'
  })
  const [showCompletionScreen, setShowCompletionScreen] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      let screenSize: LayoutState['screenSize'] = 'desktop'
      if (width < 768) screenSize = 'mobile'
      else if (width < 1024) screenSize = 'tablet'

      const orientation: LayoutState['orientation'] = width > height ? 'landscape' : 'portrait'

      setLayout(prev => ({
        ...prev,
        screenSize,
        orientation
      }))
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle session actions
  const handleSessionAction = useCallback((action: SessionAction) => {
    switch (action) {
      case 'end-session':
        setShowCompletionScreen(true)
        break
      case 'pause-session':
        actions.pauseSession()
        break
      case 'resume-session':
        actions.resumeSession()
        break
      case 'emergency-help':
        actions.triggerEmergency()
        // Navigate to crisis support
        onNavigate('/crisis-support')
        break
      default:
        console.log('Unhandled action:', action)
    }
  }, [actions, onNavigate])

  // Handle message sending with typing indicator
  const handleSendMessage = useCallback(async (content: string) => {
    setIsTyping(true)
    await actions.sendMessage(content)

    // Simulate AI thinking time
    setTimeout(() => setIsTyping(false), 2000)
  }, [actions])

  // Handle message reactions
  const handleMessageReaction = useCallback((messageId: string, reaction: string) => {
    console.log('Message reaction:', messageId, reaction)
    // This would update the message with the reaction
  }, [])

  // Handle completion screen
  const handleCompletionComplete = useCallback((feedback: SessionFeedback) => {
    setShowCompletionScreen(false)

    // Navigate based on user feedback
    if (feedback.nextSteps.includes('check-in')) {
      onNavigate('/check-in')
    } else if (feedback.nextSteps.includes('meditation')) {
      onNavigate('/meditation')
    } else if (feedback.nextSteps.includes('journal')) {
      onNavigate('/dashboard')
    } else {
      onNavigate('/')
    }
  }, [onNavigate])

  // Handle emotional state updates (would come from AI analysis)
  const handleEmotionalStateUpdate = useCallback((newState: EmotionalState) => {
    setEmotionalState(newState)
  }, [])

  // Simple page shell classes
  const pageClasses = 'min-h-screen bg-neutral-50 text-neutral-900'

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex items-center gap-3 text-neutral-700">
          <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
          <span>Connecting with {matchedUser.user.name}…</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error && error.userFacing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl p-6 border border-neutral-200">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-[12px] leading-none">⚠️</span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 mb-1">Connection issue</h2>
              <p className="text-sm text-neutral-600 mb-4">{error.message}</p>
              <div className="flex gap-2">
                <button onClick={() => window.location.reload()} className="px-3 py-2 rounded-lg bg-neutral-900 text-white text-sm">
                  Retry
                </button>
                <button onClick={() => onNavigate('/')} className="px-3 py-2 rounded-lg border border-neutral-300 text-sm">
                  Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={pageClasses}>
      <div className="mx-auto w-full max-w-4xl">
        {/* Header */}
        <SessionHeader
          sessionState={session}
          matchedUser={matchedUser}
          onAction={handleSessionAction}
          isEmergencyMode={session.status === 'emergency'}
        />

        {/* Card */}
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            onReact={handleMessageReaction}
            isTyping={isTyping}
            suggestions={MOCK_SUGGESTIONS}
            layout={layout}
          />
        </div>
      </div>

      {/* Session Completion */}
      <AnimatePresence>
        {showCompletionScreen && (
          <SessionCompletionScreen
            sessionData={{
              duration: session.duration,
              messageCount: messages.length,
              initialMood: '😊',
              finalMood: emotionalState === 'calm' ? '😌' : emotionalState === 'hopeful' ? '😊' : '😐',
              creditsEarned: Math.floor(session.duration / 60) * 5,
              matchedUser: { name: matchedUser.user.name }
            }}
            onComplete={handleCompletionComplete}
            onClose={() => setShowCompletionScreen(false)}
          />
        )}
      </AnimatePresence>

      {/* Accessibility Live Region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Session status: {session.status}. Duration: {Math.floor(session.duration / 60)} minutes. Messages: {messages.length}. Connected with {matchedUser.user.name}.
      </div>
    </div>
  )
}

export default SessionScreen
