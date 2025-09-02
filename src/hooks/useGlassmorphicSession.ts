/**
 * Glassmorphic Session Hook - Enhanced Therapeutic State Management
 * Optimized for glassmorphic UX with emotional intelligence
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  TherapeuticMessage,
  EmotionalState,
  CrisisDetection,
  SessionState,
  SessionUser,
  SessionParticipant
} from '@/types/session'
import { supabase } from '@/lib/supabase'
import { glassAnimations } from '@/styles/glassmorphic-design-system'

interface GlassmorphicSessionConfig {
  enableEmotionalTracking: boolean
  enableCrisisDetection: boolean
  enableVoiceInput: boolean
  enableTypingIndicators: boolean
  sessionDurationLimit: number // in minutes
  messageHistoryLimit: number
}

interface UseGlassmorphicSessionProps {
  user: SessionUser
  matchedUser: SessionParticipant
  config?: Partial<GlassmorphicSessionConfig>
}

export function useGlassmorphicSession({
  user,
  matchedUser,
  config = {}
}: UseGlassmorphicSessionProps) {
  // Default configuration
  const defaultConfig: GlassmorphicSessionConfig = {
    enableEmotionalTracking: true,
    enableCrisisDetection: true,
    enableVoiceInput: false,
    enableTypingIndicators: true,
    sessionDurationLimit: 45,
    messageHistoryLimit: 100
  }

  const sessionConfig = { ...defaultConfig, ...config }

  // Core state
  const [messages, setMessages] = useState<TherapeuticMessage[]>([])
  const [emotionalState, setEmotionalState] = useState<EmotionalState>('calm')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<any>(null)
  const [sessionState, setSessionState] = useState<SessionState>({
    id: `session_${Date.now()}`,
    status: 'active',
    startTime: new Date(),
    duration: 0,
    messageCount: 0,
    participantCount: 2,
    lastActivity: new Date(),
    isPaused: false
  })
  const [crisisDetection, setCrisisDetection] = useState<CrisisDetection | null>(null)

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Accessibility
  const prefersReducedMotion = useReducedMotion()

  // Initialize session with welcome message
  useEffect(() => {
    const welcomeMessage: TherapeuticMessage = {
      id: `welcome_${Date.now()}`,
      content: `Hello! I'm ${matchedUser.user.name}. I'm here to listen and support you with complete confidentiality. What's on your mind today?`,
      sender: matchedUser.user,
      timestamp: new Date(),
      type: 'text',
      emotionalTone: 'empathetic',
      isAffirmation: false
    }

    setMessages([welcomeMessage])
  }, [matchedUser])

  // Session timer
  useEffect(() => {
    if (sessionState.status === 'active' && !sessionState.isPaused) {
      timerRef.current = setInterval(() => {
        setSessionState(prev => ({
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
  }, [sessionState.status, sessionState.isPaused, sessionState.startTime])

  // Auto-scroll to latest message
  useEffect(() => {
    if (!prefersReducedMotion && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end'
      })
    }
  }, [messages, prefersReducedMotion])

  // Emotional state detection from messages
  const detectEmotionalState = useCallback((message: string): EmotionalState => {
    const lowerMessage = message.toLowerCase()

    // Crisis keywords (highest priority)
    const crisisKeywords = [
      'suicide', 'kill myself', 'end it all', 'self-harm', 'cutting',
      'emergency', 'crisis', 'help me', 'want to die', 'can\'t go on'
    ]

    if (crisisKeywords.some(keyword => lowerMessage.includes(keyword))) {
      // Trigger crisis detection
      setCrisisDetection({
        isActive: true,
        triggers: [{
          keyword: crisisKeywords.find(k => lowerMessage.includes(k)) || 'emergency',
          category: 'emergency',
          severity: 'high',
          matchedAt: new Date()
        }],
        severity: 'high',
        response: {
          type: 'emergency',
          message: 'I\'m concerned about your safety. Please reach out for immediate help.',
          actions: [{
            type: 'call',
            label: 'Emergency Services',
            phone: '911',
            priority: 1
          }],
          resources: []
        },
        timestamp: new Date()
      })
      return 'overwhelmed'
    }

    // Emotional state keywords
    const emotionalPatterns = {
      anxious: ['anxious', 'worried', 'worrying', 'nervous', 'panicked', 'stressed', 'stress'],
      overwhelmed: ['overwhelmed', 'overwhelming', 'too much', 'can\'t handle', 'swamped', 'drowning'],
      sad: ['sad', 'unhappy', 'depressed', 'down', 'blue', 'low', 'heartbroken'],
      angry: ['angry', 'upset', 'frustrated', 'mad', 'furious', 'annoyed', 'irritated'],
      hopeful: ['hope', 'hopeful', 'better', 'optimistic', 'positive', 'grateful', 'thankful'],
      calm: ['calm', 'peaceful', 'relaxed', 'content', 'okay', 'fine']
    }

    for (const [state, keywords] of Object.entries(emotionalPatterns)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return state as EmotionalState
      }
    }

    return 'neutral'
  }, [])

  // Generate therapeutic response based on emotional state
  const generateTherapeuticResponse = useCallback((emotionalState: EmotionalState): string => {
    const responses = {
      calm: [
        "I'm glad you're feeling calm. What's contributing to this peaceful state?",
        "That sounds like a moment of clarity. Tell me more about what's working well for you.",
        "Peaceful moments are precious. What helps you maintain this sense of calm?"
      ],
      anxious: [
        "I can hear the anxiety in your words. Would you like to try a gentle breathing exercise together?",
        "Anxiety can feel overwhelming. What's one small thing we could focus on right now?",
        "It's brave of you to share this anxiety with me. Remember that you're safe in this moment."
      ],
      overwhelmed: [
        "Feeling overwhelmed is completely valid. Let's break this down into smaller, manageable pieces.",
        "When everything feels like too much, it's okay to pause and breathe. What's one thing you can let go of right now?",
        "You're not alone in feeling overwhelmed. Many people experience this. What's been the hardest part?"
      ],
      sad: [
        "Sadness deserves to be acknowledged and felt. I'm here with you through this.",
        "It's okay to feel sad. Can you tell me what this sadness feels like in your body?",
        "Grief and sadness are natural responses. What do you need most right now?"
      ],
      angry: [
        "Anger is a valid emotion that deserves expression. What's underneath this anger?",
        "It's healthy to acknowledge anger. How does it want to be expressed?",
        "Anger often protects something vulnerable. What might that be?"
      ],
      hopeful: [
        "Hope is powerful. What's giving you this sense of hope right now?",
        "That's wonderful to hear hope in your words. What would you like to see happen next?",
        "Hope can be a guiding light. How can we nurture this hope together?"
      ],
      neutral: [
        "Sometimes neutrality is exactly what we need. How are you feeling about where you are right now?",
        "It's okay to feel neutral too. What's present for you in this moment?",
        "Every emotion has its place. What's been on your mind lately?"
      ],
      excited: [
        "I can hear your excitement! What's got you feeling energized right now?",
        "That's wonderful to hear such enthusiasm. What would you like to explore together?",
        "Your excitement is contagious. How can we build on this positive energy?"
      ],
      confused: [
        "It's completely okay to feel confused. Many important insights come from moments of uncertainty.",
        "Confusion often precedes clarity. What's feeling unclear to you right now?",
        "Let's explore this confusion together. What questions are coming up for you?"
      ]
    }

    const stateResponses = responses[emotionalState] || responses.neutral
    return stateResponses[Math.floor(Math.random() * stateResponses.length)]
  }, [])

  // Send message with real AI service integration
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    const messageId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newMessage: TherapeuticMessage = {
      id: messageId,
      content: content.trim(),
      sender: user,
      timestamp: new Date(),
      type: 'text'
    }

    // Add user message
    setMessages(prev => [...prev, newMessage])
    setSessionState(prev => ({
      ...prev,
      messageCount: prev.messageCount + 1,
      lastActivity: new Date()
    }))

    // Detect emotional state for UI purposes
    const detectedEmotion = detectEmotionalState(content)
    if (sessionConfig.enableEmotionalTracking) {
      setEmotionalState(detectedEmotion)
    }

    // Show typing indicator
    if (sessionConfig.enableTypingIndicators) {
      setIsTyping(true)
    }

    try {
      // Call the actual AI service
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: content,
          conversationHistory: messages.slice(-5).map(msg => ({
            sender: msg.sender.id === user.id ? 'user' : 'therapist',
            text: msg.content
          })),
          emotionalState: detectedEmotion,
          sessionId: sessionState.id
        }
      })

      if (error) {
        console.error('AI Service Error:', error)
        throw new Error('AI service unavailable')
      }

      // Create AI response with proper metadata
      const aiResponse: TherapeuticMessage = {
        id: `ai_${Date.now()}`,
        content: data.response || 'I\'m here to listen. Can you tell me more?',
        sender: matchedUser.user,
        timestamp: new Date(),
        type: 'text',
        emotionalTone: data.emotionalTone || (detectedEmotion === 'anxious' ? 'calming' :
                      detectedEmotion === 'overwhelmed' ? 'supportive' :
                      detectedEmotion === 'hopeful' ? 'encouraging' : 'empathetic'),
        isAffirmation: data.isAffirmation || Math.random() > 0.7
      }

      setMessages(prev => [...prev, aiResponse])
      setSessionState(prev => ({
        ...prev,
        messageCount: prev.messageCount + 1
      }))

    } catch (error) {
      console.error('Failed to get AI response:', error)

      // Fallback to contextual response based on emotional state
      const fallbackResponse = generateTherapeuticResponse(detectedEmotion)
      const aiResponse: TherapeuticMessage = {
        id: `ai_fallback_${Date.now()}`,
        content: fallbackResponse,
        sender: matchedUser.user,
        timestamp: new Date(),
        type: 'text',
        emotionalTone: detectedEmotion === 'anxious' ? 'calming' :
                     detectedEmotion === 'overwhelmed' ? 'supportive' :
                     detectedEmotion === 'hopeful' ? 'encouraging' : 'empathetic',
        isAffirmation: true // Fallback responses are often supportive
      }

      setMessages(prev => [...prev, aiResponse])
      setSessionState(prev => ({
        ...prev,
        messageCount: prev.messageCount + 1
      }))

      // Set error state for user feedback
      setError({
        id: `error_${Date.now()}`,
        type: 'ai-service',
        message: 'AI service temporarily unavailable. Using therapeutic fallback.',
        timestamp: new Date(),
        userFacing: true,
        recoverable: true
      })
    } finally {
      setIsTyping(false)
    }

  }, [user, matchedUser, messages, sessionConfig, detectEmotionalState, generateTherapeuticResponse, sessionState.id])

  // Pause session
  const pauseSession = useCallback(() => {
    setSessionState(prev => ({
      ...prev,
      isPaused: true,
      status: 'paused'
    }))

    const pauseMessage: TherapeuticMessage = {
      id: `system_pause_${Date.now()}`,
      content: "Session paused. Take the time you need. We'll be here when you're ready.",
      sender: matchedUser.user,
      timestamp: new Date(),
      type: 'system'
    }

    setMessages(prev => [...prev, pauseMessage])
  }, [matchedUser])

  // Resume session
  const resumeSession = useCallback(() => {
    setSessionState(prev => ({
      ...prev,
      isPaused: false,
      status: 'active',
      lastActivity: new Date()
    }))

    const resumeMessage: TherapeuticMessage = {
      id: `system_resume_${Date.now()}`,
      content: "Welcome back. I'm here whenever you're ready to continue.",
      sender: matchedUser.user,
      timestamp: new Date(),
      type: 'system'
    }

    setMessages(prev => [...prev, resumeMessage])
  }, [matchedUser])

  // End session
  const endSession = useCallback(() => {
    setSessionState(prev => ({
      ...prev,
      status: 'completed',
      endTime: new Date()
    }))

    const endMessage: TherapeuticMessage = {
      id: `system_end_${Date.now()}`,
      content: "Thank you for trusting me with your thoughts today. Remember, healing is a journey, and you're taking important steps. Take care of yourself.",
      sender: matchedUser.user,
      timestamp: new Date(),
      type: 'system'
    }

    setMessages(prev => [...prev, endMessage])
  }, [])

  // Emergency action
  const triggerEmergency = useCallback(() => {
    setSessionState(prev => ({ ...prev, status: 'emergency' }))

    const emergencyMessage: TherapeuticMessage = {
      id: `emergency_${Date.now()}`,
      content: "I'm activating emergency support. Please stay with me - help is on the way.",
      sender: matchedUser.user,
      timestamp: new Date(),
      type: 'emergency'
    }

    setMessages(prev => [...prev, emergencyMessage])

    // Trigger crisis detection
    setCrisisDetection({
      isActive: true,
      triggers: [{
        keyword: 'emergency',
        category: 'emergency',
        severity: 'critical',
        matchedAt: new Date()
      }],
      severity: 'critical',
      response: {
        type: 'emergency',
        message: 'Emergency services are being contacted.',
        actions: [{
          type: 'call',
          label: 'Emergency Services',
          phone: '911',
          priority: 1
        }],
        resources: []
      },
      timestamp: new Date()
    })
  }, [])

  // Clear crisis detection
  const clearCrisis = useCallback(() => {
    setCrisisDetection(null)
  }, [])

  return {
    // State
    messages,
    emotionalState,
    isTyping,
    sessionState,
    error,
    crisisDetection,

    // Refs
    messagesEndRef,

    // Actions
    sendMessage,
    pauseSession,
    resumeSession,
    endSession,
    triggerEmergency,
    clearCrisis,

    // Configuration
    config: sessionConfig,

    // Animations (respect reduced motion preference)
    animations: prefersReducedMotion ? {} : glassAnimations
  }
}
