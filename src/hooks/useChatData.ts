/**
 * Chat Data Hook
 * Provides chat functionality with automatic store updates
 */

import { useCallback, useEffect } from 'react'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStore'
import { ChatDataService } from '@/lib/services/ChatDataService'
import { ChatSession, ChatMessage } from '@/lib/services/ChatService'

interface ChatResponse {
  response: string
  isCrisis?: boolean
  emotionalTone?: string
  assessmentContext?: any
}

export function useChatData() {
  const {
    currentSessionId,
    currentSession,
    messages,
    assessmentContext,
    isTyping,
    error,
    messageCount
  } = useChatStore()

  const { user } = useAuthStore()

  // Initialize chat session
  const initializeChat = useCallback(async () => {
    if (!user?.id) return null

    try {
      const session = await ChatDataService.initializeChatSession(user.id)
      return session
    } catch (error) {
      console.error('Failed to initialize chat:', error)
      return null
    }
  }, [user?.id])

  // Send message and get AI response
  const sendMessage = useCallback(async (message: string): Promise<ChatResponse | null> => {
    if (!user?.id) throw new Error('No user found')

    try {
      const response = await ChatDataService.sendMessage(user.id, message)
      return response
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    }
  }, [user?.id])

  // End current session
  const endSession = useCallback(() => {
    ChatDataService.endChatSession()
  }, [])

  // Refresh assessment context
  const refreshContext = useCallback(async () => {
    if (!user?.id) return

    try {
      await ChatDataService.refreshAssessmentContext(user.id)
    } catch (error) {
      console.error('Failed to refresh context:', error)
    }
  }, [user?.id])

  // Load chat history
  const loadHistory = useCallback((sessionId: string): ChatMessage[] => {
    return ChatDataService.loadChatHistory(sessionId)
  }, [])

  // Save chat history
  const saveHistory = useCallback((sessionId: string, messages: ChatMessage[]) => {
    ChatDataService.saveChatHistory(sessionId, messages)
  }, [])

  // Clear chat data
  const clearChatData = useCallback(() => {
    ChatDataService.clearChatData(user?.id)
  }, [user?.id])

  // Get chat statistics
  const getStatistics = useCallback(() => {
    return ChatDataService.getChatStatistics()
  }, [])

  // Auto-initialize chat session on mount
  useEffect(() => {
    if (user?.id && !currentSessionId) {
      initializeChat()
    }
  }, [user?.id, currentSessionId, initializeChat])

  // Auto-refresh context periodically
  useEffect(() => {
    if (user?.id && currentSessionId) {
      const interval = setInterval(() => {
        refreshContext()
      }, 5 * 60 * 1000) // Every 5 minutes

      return () => clearInterval(interval)
    }
  }, [user?.id, currentSessionId, refreshContext])

  return {
    // Data
    currentSessionId,
    currentSession,
    messages,
    assessmentContext,

    // States
    isTyping,
    error,
    messageCount,
    hasActiveSession: !!currentSessionId,
    isInitialized: !!currentSession,

    // Actions
    initializeChat,
    sendMessage,
    endSession,
    refreshContext,
    loadHistory,
    saveHistory,
    clearChatData,
    getStatistics,

    // Computed values
    lastMessage: messages[messages.length - 1],
    sessionDuration: currentSession
      ? Date.now() - currentSession.startedAt.getTime()
      : 0,
    messagesToday: messages.filter(msg => {
      const today = new Date()
      const messageDate = new Date(msg.timestamp)
      return messageDate.toDateString() === today.toDateString()
    }).length
  }
}
