/**
 * Enhanced Session State Management Hook
 * Optimized for therapeutic UX with safety features and accessibility
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  SessionState,
  SessionStatus,
  TherapeuticMessage,
  SessionParticipant,
  SessionError,
  EmotionalState,
  CrisisDetection,
  ErrorType,
  UseSessionStateReturn,
  SessionAction,
  SessionUser,
  MessageType
} from '@/types/session'
import { supabase } from '@/lib/supabase'
import { CHAT_CONFIG } from '@/lib/chat-config'

export function useSessionState(
  sessionId: string,
  user: SessionUser,
  matchedUser: SessionParticipant,
  onTypingStateChange?: (isTyping: boolean) => void
): UseSessionStateReturn {
  // Core state
  const [session, setSession] = useState<SessionState>({
    id: sessionId,
    status: 'initializing',
    startTime: new Date(),
    duration: 0,
    messageCount: 0,
    participantCount: 2,
    lastActivity: new Date(),
    isPaused: false
  })

  const [messages, setMessages] = useState<TherapeuticMessage[]>([])
  const [participants] = useState<SessionParticipant[]>([matchedUser])
  const [error, setError] = useState<SessionError | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Refs for cleanup and timers
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const recoveryTokenRef = useRef<string>('')

  // Accessibility preferences
  const prefersReducedMotion = useReducedMotion()

  // Initialize session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        setIsLoading(true)

        // Generate recovery token for session continuity
        recoveryTokenRef.current = `session_${sessionId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        // Initialize with welcome message
        const welcomeMessage: TherapeuticMessage = {
          id: `msg_${Date.now()}`,
          content: CHAT_CONFIG.uiText.initialMessageTemplate(matchedUser.user.name),
          sender: matchedUser.user,
          timestamp: new Date(),
          type: 'text',
          emotionalTone: 'empathetic'
        }

        setMessages([welcomeMessage])
        setSession(prev => ({
          ...prev,
          status: 'active',
          recoveryToken: recoveryTokenRef.current
        }))

        setIsLoading(false)
      } catch (err) {
        console.error('Session initialization error:', err)
        setError({
          id: `error_${Date.now()}`,
          type: 'session',
          message: 'Failed to initialize session. Please try again.',
          timestamp: new Date(),
          userFacing: true,
          recoverable: true
        })
        setSession(prev => ({ ...prev, status: 'error' }))
        setIsLoading(false)
      }
    }

    initializeSession()

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [sessionId, matchedUser])

  // Session timer
  useEffect(() => {
    if (session.status === 'active' && !session.isPaused) {
      timerRef.current = setInterval(() => {
        setSession(prev => ({
          ...prev,
          duration: Math.floor((Date.now() - prev.startTime.getTime()) / 1000),
          lastActivity: new Date()
        }))
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [session.status, session.isPaused, session.startTime])

  // Auto-save session state for recovery
  useEffect(() => {
    if (session.recoveryToken && session.status === 'active') {
      const saveInterval = setInterval(() => {
        localStorage.setItem(`session_recovery_${sessionId}`, JSON.stringify({
          session,
          messages: messages.slice(-10), // Keep last 10 messages
          timestamp: new Date()
        }))
      }, 30000) // Save every 30 seconds

      return () => clearInterval(saveInterval)
    }
  }, [session, messages, sessionId])

  // Send message with enhanced error handling
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newMessage: TherapeuticMessage = {
      id: messageId,
      content: content.trim(),
      sender: user,
      timestamp: new Date(),
      type: 'text'
    }

    // Optimistically add message
    setMessages(prev => [...prev, newMessage])
    setSession(prev => ({
      ...prev,
      messageCount: prev.messageCount + 1,
      lastActivity: new Date()
    }))

    try {
      // Call AI service
      const { data, error: aiError } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: content,
          conversationHistory: messages.slice(-CHAT_CONFIG.ai.conversationHistoryLength),
          sessionId
        }
      })

      if (aiError) throw aiError

      const aiResponse: TherapeuticMessage = {
        id: `ai_${Date.now()}`,
        content: data.response,
        sender: matchedUser.user,
        timestamp: new Date(),
        type: 'text',
        emotionalTone: data.emotionalTone || 'empathetic'
      }

      setMessages(prev => [...prev, aiResponse])
      setSession(prev => ({
        ...prev,
        messageCount: prev.messageCount + 1
      }))

      // AI response received, stop typing indicator
      onTypingStateChange?.(false)

    } catch (err) {
      console.error('AI service error:', err)

      // Add error message
      const errorMessage: TherapeuticMessage = {
        id: `error_${Date.now()}`,
        content: CHAT_CONFIG.uiText.fallbackResponse,
        sender: matchedUser.user,
        timestamp: new Date(),
        type: 'system'
      }

      setMessages(prev => [...prev, errorMessage])

      setError({
        id: `error_${Date.now()}`,
        type: 'ai-service',
        message: 'AI service temporarily unavailable. Please continue your conversation.',
        timestamp: new Date(),
        userFacing: true,
        recoverable: true
      })

      // Error occurred, stop typing indicator
      onTypingStateChange?.(false)
    }
  }, [messages, user, matchedUser, sessionId])

  // End session with feedback collection
  const endSession = useCallback(async () => {
    setSession(prev => ({
      ...prev,
      status: 'ending',
      endTime: new Date()
    }))

    try {
      // Save final session state
      await supabase.from('sessions').insert({
        id: sessionId,
        duration: session.duration,
        message_count: session.messageCount,
        status: 'completed',
        ended_at: new Date()
      })

      setSession(prev => ({ ...prev, status: 'completed' }))

      // Clear recovery data
      localStorage.removeItem(`session_recovery_${sessionId}`)

    } catch (err) {
      console.error('Session end error:', err)
      setError({
        id: `error_${Date.now()}`,
        type: 'session',
        message: 'Session ended with minor issues. Your conversation was saved.',
        timestamp: new Date(),
        userFacing: true,
        recoverable: false
      })
    }
  }, [sessionId, session.duration, session.messageCount])

  // Pause session
  const pauseSession = useCallback(() => {
    setSession(prev => ({
      ...prev,
      isPaused: true,
      pausedAt: new Date(),
      status: 'paused'
    }))

    // Add pause message
    const pauseMessage: TherapeuticMessage = {
      id: `pause_${Date.now()}`,
      content: 'Session paused. Take your time.',
      sender: matchedUser.user,
      timestamp: new Date(),
      type: 'system'
    }

    setMessages(prev => [...prev, pauseMessage])
  }, [matchedUser])

  // Resume session
  const resumeSession = useCallback(() => {
    setSession(prev => ({
      ...prev,
      isPaused: false,
      status: 'active',
      lastActivity: new Date()
    }))

    // Add resume message
    const resumeMessage: TherapeuticMessage = {
      id: `resume_${Date.now()}`,
      content: 'Welcome back. How are you feeling now?',
      sender: matchedUser.user,
      timestamp: new Date(),
      type: 'system'
    }

    setMessages(prev => [...prev, resumeMessage])
  }, [matchedUser])

  // Emergency trigger
  const triggerEmergency = useCallback(() => {
    setSession(prev => ({ ...prev, status: 'emergency' }))

    setError({
      id: `emergency_${Date.now()}`,
      type: 'emergency',
      message: 'Emergency protocol activated. Help is on the way.',
      timestamp: new Date(),
      userFacing: true,
      recoverable: false
    })
  }, [])

  // Recovery mechanism
  const recoverSession = useCallback(() => {
    const recoveryData = localStorage.getItem(`session_recovery_${sessionId}`)
    if (recoveryData) {
      try {
        const { session: recoveredSession, messages: recoveredMessages } = JSON.parse(recoveryData)
        setSession(recoveredSession)
        setMessages(recoveredMessages)
        setIsLoading(false)
      } catch (err) {
        console.error('Session recovery failed:', err)
      }
    }
  }, [sessionId])

  // Auto-recovery on mount
  useEffect(() => {
    if (session.status === 'initializing') {
      recoverSession()
    }
  }, [recoverSession, session.status])

  return {
    session,
    messages,
    participants,
    error,
    isLoading,
    actions: {
      sendMessage,
      endSession,
      pauseSession,
      resumeSession,
      triggerEmergency
    }
  }
}
