/**
 * Chat Slice - Centralized Chat State Management
 * Handles chat sessions, messages, and AI interactions
 */

import { StateCreator } from 'zustand'
import { chatService, ChatSession, ChatMessage, ChatResponse } from '@/services/ChatService'

// Chat slice state interface
export interface ChatSlice {
  // Chat data

  // Actions
  // Session operations

  // Message operations

  // State setters

  // Utility operations

  // Computed getters
}

// Chat slice implementation
export const createChatSlice: StateCreator<
  ChatSlice & any, // Will be combined with other slices
  [],
  [],
  ChatSlice
> = (set, get) => ({
  // Initial state

  // Session operations
  initializeChatSession: async (userId) => {
    const { setCurrentSession, setChatError } = get()

    setChatError(null)

    try {

      const session = await chatService.initializeChatSession(userId)
      setCurrentSession(session)

      // Load existing messages for this session
      if (session.messages && session.messages.length > 0) {
        set({ messages: session.messages })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize chat'
      setChatError(errorMessage)
    }
  },

  sendMessage: async (message) => {
    const { setTyping, setChatError, addMessage, currentSession } = get()

    if (!currentSession) {
      setChatError('No active chat session')
      return null
    }

    setTyping(true)
    setChatError(null)

    try {
      const response = await chatService.sendMessage(userId, message)

      // Add user message to local state
      const userMessage: ChatMessage = {
      }
      addMessage(userMessage)

      // Add AI response to local state
      if (response?.message) {
        addMessage(response.message)
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message'
      setChatError(errorMessage)
      return null
    } finally {
      setTyping(false)
    }
  },

  endChatSession: async () => {
    const { currentSession, setCurrentSession, clearMessages } = get()

    if (!currentSession) return

    try {

      await chatService.endChatSession(currentSession.id)
      setCurrentSession(null)
      clearMessages()

    } catch (error) {
      // Still clear local state
      setCurrentSession(null)
      clearMessages()
    }
  },

  loadChatHistory: async (sessionId) => {
    const { setMessages, setChatError } = get()

    setChatError(null)

    try {

      const messages = await chatService.getChatHistory(sessionId)
      setMessages(messages)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load chat history'
      setChatError(errorMessage)
    }
  },

  // Message operations
  addMessage: (message) => {
    const { messages } = get()
    set({ messages: [...messages, message] })
  },

  clearMessages: () => {
    set({ messages: [] })
  },

  // State setters
  setCurrentSession: (session) => {
    set({ currentSession: session })
  },

  setMessages: (messages) => {
    set({ messages })
  },

  setTyping: (isTyping) => {
    set({ isTyping })
  },

  setChatError: (chatError) => {
    set({ chatError })
  },

  // Utility operations
  clearChatData: async (userId) => {
    const { setCurrentSession, clearMessages, setChatError } = get()

    setChatError(null)

    try {

      await chatService.clearChatData(userId)
      setCurrentSession(null)
      clearMessages()

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear chat data'
      setChatError(errorMessage)
    }
  },

  getChatStatistics: async (userId) => {
    try {
      const stats = await chatService.getChatStatistics(userId)
      return stats
    } catch (error) {
      return {
        totalSessions: 0,
        totalMessages: 0,
        averageSessionDuration: 0
      }
    }
  },

  // Computed getters
  hasActiveSession: () => {
    const { currentSession } = get()
    return !!currentSession
  },

  messageCount: () => {
    const { messages } = get()
    return messages.length
  },

  latestMessage: () => {
    const { messages } = get()
    return messages.length > 0 ? messages[messages.length - 1] : null
  },

  sessionDuration: () => {
    const { currentSession } = get()
    if (!currentSession) return 0
    return Date.now() - new Date(currentSession.createdAt).getTime()
  },

  todaysMessagesCount: () => {
    const { messages } = get()
    const today = new Date()
    const todayString = today.toDateString()
    return messages.filter(message => {
      const messageDate = new Date(message.timestamp)
      return messageDate.toDateString() === todayString
    }).length
  }
})
