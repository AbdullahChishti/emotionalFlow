/**
 * Chat Data Service
 * Handles chat operations and automatically updates chat store
 */

import { DataService } from './DataService'
import { useChatStore } from '@/stores/chatStore'
import { ChatMessage, ChatSession } from '@/lib/services/ChatService'
import { ChatPersonalizationService } from '@/lib/chat-personalization'
import { AssessmentDataService } from './AssessmentDataService'

interface ChatResponse {
  response: string
  isCrisis?: boolean
  emotionalTone?: string
  assessmentContext?: any
}

export class ChatDataService extends DataService {

  /**
   * Initialize chat session with assessment context
   */
  static async initializeChatSession(userId: string): Promise<ChatSession | null> {
    try {
      console.log('🚀 ChatDataService: Initializing chat session', { userId })

      const chatStore = useChatStore.getState()

      // Get fresh assessment context
      const assessmentContext = await AssessmentDataService.getAssessmentContext(userId)

      // Create session ID
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const session: ChatSession = {
        id: sessionId,
        userId,
        startedAt: new Date(),
        lastActivity: new Date(),
        messageCount: 0,
        assessmentContext
      }

      // Update chat store
      this.updateStore(
        (session) => chatStore.setCurrentSession(session),
        session
      )

      this.updateStore(
        (sessionId) => chatStore.setCurrentSessionId(sessionId),
        sessionId
      )

      // Clear any previous messages
      this.updateStore(
        () => chatStore.clearMessages(),
        undefined
      )

      // Notify subscribers
      this.notifySubscribers('chat_session_started', {
        userId,
        sessionId,
        session
      })

      console.log('✅ ChatDataService: Chat session initialized successfully')
      return session

    } catch (error) {
      console.error('❌ ChatDataService: Failed to initialize chat session', error)
      this.handleError(error, 'initializeChatSession', (msg) => {
        useChatStore.getState().setError(msg)
      })
      return null
    }
  }

  /**
   * Send message and get AI response
   */
  static async sendMessage(
    userId: string,
    message: string
  ): Promise<ChatResponse | null> {
    try {
      console.log('💬 ChatDataService: Sending message', {
        userId,
        messageLength: message.length
      })

      const chatStore = useChatStore.getState()

      // Set typing indicator
      this.updateStore(
        (typing) => chatStore.setTyping(typing),
        true
      )

      // Create user message
      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'user',
        content: message,
        timestamp: new Date()
      }

      // Add user message to store
      this.updateStore(
        (message) => chatStore.addMessage(message),
        userMessage
      )

      // Get AI response
      const response = await ChatPersonalizationService.sendMessage(
        message,
        chatStore.assessmentContext?.riskLevel
      )

      // Create AI message
      const aiMessage: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        emotionalTone: response.emotionalTone,
        isAffirmation: response.isAffirmation,
        assessmentContext: response.assessmentContext
      }

      // Add AI message to store
      this.updateStore(
        (message) => chatStore.addMessage(message),
        aiMessage
      )

      // Clear typing indicator
      this.updateStore(
        (typing) => chatStore.setTyping(typing),
        false
      )

      // Update session activity
      const currentSession = chatStore.currentSession
      if (currentSession) {
        const updatedSession = {
          ...currentSession,
          lastActivity: new Date(),
          messageCount: chatStore.messageCount
        }

        this.updateStore(
          (session) => chatStore.setCurrentSession(session),
          updatedSession
        )
      }

      // Notify subscribers
      this.notifySubscribers('message_sent', {
        userId,
        userMessage,
        aiMessage,
        response
      })

      console.log('✅ ChatDataService: Message sent successfully')
      return response

    } catch (error) {
      console.error('❌ ChatDataService: Failed to send message', error)

      // Clear typing indicator
      this.updateStore(
        (typing) => useChatStore.getState().setTyping(typing),
        false
      )

      this.handleError(error, 'sendMessage', (msg) => {
        useChatStore.getState().setError(msg)
      })
      return null
    }
  }

  /**
   * End current chat session
   */
  static endChatSession(): void {
    try {
      console.log('⏹️ ChatDataService: Ending chat session')

      const chatStore = useChatStore.getState()
      const currentSession = chatStore.currentSession

      if (currentSession) {
        // Update session with final data
        const finalSession = {
          ...currentSession,
          lastActivity: new Date(),
          messageCount: chatStore.messageCount
        }

        this.updateStore(
          (session) => chatStore.setCurrentSession(session),
          finalSession
        )

        // Notify subscribers
        this.notifySubscribers('chat_session_ended', {
          sessionId: currentSession.id,
          session: finalSession,
          messageCount: chatStore.messageCount
        })
      }

      // Reset chat state but keep messages for history
      this.updateStore(
        () => {
          chatStore.setCurrentSessionId(null)
          chatStore.setTyping(false)
          chatStore.setError(null)
        },
        undefined
      )

      console.log('✅ ChatDataService: Chat session ended successfully')

    } catch (error) {
      console.error('❌ ChatDataService: Failed to end chat session', error)
      this.handleError(error, 'endChatSession')
    }
  }

  /**
   * Refresh assessment context for chat
   */
  static async refreshAssessmentContext(userId: string): Promise<void> {
    try {
      console.log('🔄 ChatDataService: Refreshing assessment context', { userId })

      const chatStore = useChatStore.getState()

      // Set loading
      this.updateStore(
        (loading) => chatStore.setLoadingContext(loading),
        true
      )

      // Get fresh context
      const context = await AssessmentDataService.getAssessmentContext(userId)

      // Update chat store
      this.updateStore(
        (context) => {
          chatStore.setAssessmentContext(context)
          chatStore.updateContextTimestamp()
          chatStore.setLoadingContext(false)
        },
        context
      )

      // Notify subscribers
      this.notifySubscribers('context_refreshed', {
        userId,
        context
      })

      console.log('✅ ChatDataService: Assessment context refreshed successfully')

    } catch (error) {
      console.error('❌ ChatDataService: Failed to refresh assessment context', error)
      this.updateStore(
        (loading) => useChatStore.getState().setLoadingContext(loading),
        false
      )
      this.handleError(error, 'refreshAssessmentContext', (msg) => {
        useChatStore.getState().setError(msg)
      })
    }
  }

  /**
   * Load chat history from localStorage
   */
  static loadChatHistory(sessionId: string): ChatMessage[] {
    try {
      if (typeof window === 'undefined') return []

      const cacheKey = `chat-history-${sessionId}`
      const cached = localStorage.getItem(cacheKey)

      if (cached) {
        const { messages } = JSON.parse(cached)
        console.log('📚 ChatDataService: Loaded chat history from cache', {
          sessionId,
          messageCount: messages.length
        })
        return messages
      }

      return []
    } catch (error) {
      console.error('❌ ChatDataService: Failed to load chat history', error)
      return []
    }
  }

  /**
   * Save chat history to localStorage
   */
  static saveChatHistory(sessionId: string, messages: ChatMessage[]): void {
    try {
      if (typeof window === 'undefined') return

      const cacheKey = `chat-history-${sessionId}`
      const data = {
        messages: messages.slice(-50), // Keep last 50 messages
        timestamp: Date.now()
      }

      localStorage.setItem(cacheKey, JSON.stringify(data))
      console.log('💾 ChatDataService: Saved chat history to cache', {
        sessionId,
        messageCount: messages.length
      })

    } catch (error) {
      console.error('❌ ChatDataService: Failed to save chat history', error)
    }
  }

  /**
   * Clear chat data
   */
  static clearChatData(userId?: string): void {
    console.log('🗑️ ChatDataService: Clearing chat data', { userId })

    const chatStore = useChatStore.getState()

    // Reset chat store
    this.updateStore(
      () => chatStore.resetChatState(),
      undefined
    )

    // Clear localStorage cache
    if (typeof window !== 'undefined') {
      if (userId) {
        // Clear user-specific cache
        Object.keys(localStorage).forEach(key => {
          if (key.includes(`chat-`) && key.includes(userId)) {
            localStorage.removeItem(key)
          }
        })
      } else {
        // Clear all chat cache
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('chat-')) {
            localStorage.removeItem(key)
          }
        })
      }
    }

    // Notify subscribers
    this.notifySubscribers('chat_data_cleared', { userId })
  }

  /**
   * Get chat statistics
   */
  static getChatStatistics(): {
    totalMessages: number
    sessionsCount: number
    averageSessionLength: number
  } {
    const chatStore = useChatStore.getState()

    // This is a simplified version - in a real app you'd track this in the database
    return {
      totalMessages: chatStore.messageCount,
      sessionsCount: chatStore.currentSessionId ? 1 : 0,
      averageSessionLength: chatStore.messageCount // Simplified
    }
  }
}
