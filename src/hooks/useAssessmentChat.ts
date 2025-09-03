/**
 * React Hook for Assessment-Enhanced Chat
 * Provides easy integration with the personalized chat system
 */

"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { ChatPersonalizationService, ChatMessage, ChatSession, ChatResponse } from '@/lib/chat-personalization'
import { useAuth } from '@/components/providers/AuthProvider'

export interface UseAssessmentChatReturn {
  // Session management
  session: ChatSession | null
  isInitialized: boolean
  initializeSession: (emotionalState?: string) => Promise<void>
  endSession: () => void
  
  // Messaging
  messages: ChatMessage[]
  sendMessage: (message: string, emotionalState?: string) => Promise<ChatResponse>
  isSending: boolean
  
  // Assessment context
  hasAssessmentData: boolean
  riskLevel: string
  focusAreas: string[]
  recommendations: string[]
  lastAssessed: Date | null
  
  // Session state
  emotionalState: string
  setEmotionalState: (state: string) => void
  
  // Error handling
  error: string | null
  clearError: () => void
}

export function useAssessmentChat(): UseAssessmentChatReturn {
  const { user } = useAuth()
  const [session, setSession] = useState<ChatSession | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emotionalState, setEmotionalState] = useState<string>('neutral')
  
  // Auto-initialize session when user is available
  useEffect(() => {
    if (user && !isInitialized) {
      initializeSession()
    }
  }, [user, isInitialized])

  const initializeSession = useCallback(async (initialEmotionalState: string = 'neutral') => {
    if (!user) {
      setError('User not authenticated')
      return
    }

    try {
      setError(null)
      const newSession = await ChatPersonalizationService.initializeSession(user.id, initialEmotionalState)
      setSession(newSession)
      setEmotionalState(initialEmotionalState)
      setIsInitialized(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize chat session'
      setError(errorMessage)
      console.error('Error initializing chat session:', err)
    }
  }, [user])

  const endSession = useCallback(() => {
    ChatPersonalizationService.endSession()
    setSession(null)
    setIsInitialized(false)
    setEmotionalState('neutral')
    setError(null)
  }, [])

  const sendMessage = useCallback(async (message: string, messageEmotionalState?: string): Promise<ChatResponse> => {
    if (!session) {
      const errorResponse: ChatResponse = {
        response: 'No active chat session. Please initialize a session first.',
        success: false,
        isCrisis: false,
        emotionalTone: 'neutral',
        isAffirmation: false,
        assessmentContext: {
          hasAssessmentData: false,
          riskLevel: 'low',
          focusAreas: [],
          recommendations: [],
          lastAssessed: null
        },
        error: 'No active session'
      }
      return errorResponse
    }

    setIsSending(true)
    setError(null)

    try {
      const response = await ChatPersonalizationService.sendMessage(message, messageEmotionalState)
      
      // Update session state
      const currentSession = ChatPersonalizationService.getCurrentSession()
      if (currentSession) {
        setSession(currentSession)
      }

      // Handle crisis response
      if (response.isCrisis) {
        setError('Crisis detected - please seek immediate help')
      }

      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
      setError(errorMessage)
      
      const errorResponse: ChatResponse = {
        response: 'I\'m sorry, I\'m having trouble responding right now. Please try again in a moment.',
        success: false,
        isCrisis: false,
        emotionalTone: 'neutral',
        isAffirmation: false,
        assessmentContext: session.assessmentContext,
        error: errorMessage
      }
      
      return errorResponse
    } finally {
      setIsSending(false)
    }
  }, [session])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Derived state
  const messages = session?.messages || []
  const hasAssessmentData = session?.assessmentContext.hasAssessmentData || false
  const riskLevel = session?.assessmentContext.riskLevel || 'low'
  const focusAreas = session?.assessmentContext.focusAreas || []
  const recommendations = session?.assessmentContext.recommendations || []
  const lastAssessed = session?.assessmentContext.lastAssessed || null

  return {
    // Session management
    session,
    isInitialized,
    initializeSession,
    endSession,
    
    // Messaging
    messages,
    sendMessage,
    isSending,
    
    // Assessment context
    hasAssessmentData,
    riskLevel,
    focusAreas,
    recommendations,
    lastAssessed,
    
    // Session state
    emotionalState,
    setEmotionalState,
    
    // Error handling
    error,
    clearError
  }
}

export default useAssessmentChat
