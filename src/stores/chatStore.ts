/**
 * Chat Store
 * Manages chat state, conversations, and session data
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ChatMessage, ChatSession, ConversationAnalysis } from '@/lib/services/ChatService'
import { AssessmentContext } from '@/lib/services/AssessmentManager'

interface ChatState {
  // Current session
  currentSessionId: string | null
  currentSession: ChatSession | null

  // Messages
  messages: ChatMessage[]
  messageCount: number

  // Assessment context
  assessmentContext: AssessmentContext | null
  contextLastUpdated: Date | null

  // Session analytics
  conversationAnalysis: ConversationAnalysis | null

  // UI state
  isTyping: boolean
  isLoadingContext: boolean
  error: string | null

  // Actions
  setCurrentSessionId: (sessionId: string | null) => void
  setCurrentSession: (session: ChatSession | null) => void

  addMessage: (message: ChatMessage) => void
  clearMessages: () => void

  setAssessmentContext: (context: AssessmentContext | null) => void
  updateAssessmentContext: (context: Partial<AssessmentContext>) => void

  setConversationAnalysis: (analysis: ConversationAnalysis | null) => void

  setTyping: (typing: boolean) => void
  setLoadingContext: (loading: boolean) => void
  setError: (error: string | null) => void

  // Session management
  startNewSession: (userId: string, assessmentContext: AssessmentContext) => void
  endCurrentSession: () => void

  // Message management
  sendMessage: (content: string, role: 'user' | 'assistant') => void
  receiveMessage: (content: string, analysis?: ConversationAnalysis) => void

  // Context management
  refreshAssessmentContext: () => Promise<void>
  updateContextTimestamp: () => void

  // Analytics
  updateConversationAnalysis: (analysis: ConversationAnalysis) => void

  // Cleanup
  resetChatState: () => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSessionId: null,
      currentSession: null,

      messages: [],
      messageCount: 0,

      assessmentContext: null,
      contextLastUpdated: null,

      conversationAnalysis: null,

      isTyping: false,
      isLoadingContext: false,
      error: null,

      // Basic setters
      setCurrentSessionId: (sessionId) => set({ currentSessionId: sessionId }),

      setCurrentSession: (session) => set({ currentSession: session }),

      // Message management
      addMessage: (message) => {
        console.log('💬 Chat store: Adding message', { role: message.role, contentLength: message.content.length })
        const { messages, messageCount } = get()

        set({
          messages: [...messages, message],
          messageCount: messageCount + 1
        })
      },

      clearMessages: () => {
        console.log('🗑️ Chat store: Clearing messages')
        set({
          messages: [],
          messageCount: 0
        })
      },

      // Assessment context
      setAssessmentContext: (context) => {
        console.log('📊 Chat store: Setting assessment context', {
          hasProfile: !!context?.userProfile,
          riskLevel: context?.riskLevel
        })
        set({
          assessmentContext: context,
          contextLastUpdated: new Date()
        })
      },

      updateAssessmentContext: (updates) => {
        const { assessmentContext } = get()
        if (assessmentContext) {
          const updatedContext = { ...assessmentContext, ...updates }
          set({
            assessmentContext: updatedContext,
            contextLastUpdated: new Date()
          })
        }
      },

      // Conversation analysis
      setConversationAnalysis: (analysis) => set({ conversationAnalysis: analysis }),

      // UI state
      setTyping: (typing) => set({ isTyping: typing }),

      setLoadingContext: (loading) => set({ isLoadingContext: loading }),

      setError: (error) => set({ error }),

      // Session management
      startNewSession: (userId, assessmentContext) => {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const session: ChatSession = {
          id: sessionId,
          userId,
          startedAt: new Date(),
          lastActivity: new Date(),
          messageCount: 0,
          assessmentContext
        }

        console.log('🚀 Chat store: Starting new session', { sessionId, userId })

        set({
          currentSessionId: sessionId,
          currentSession: session,
          messages: [],
          messageCount: 0,
          assessmentContext,
          contextLastUpdated: new Date(),
          error: null
        })
      },

      endCurrentSession: () => {
        console.log('⏹️ Chat store: Ending current session')
        const { currentSession } = get()

        if (currentSession) {
          // Update session with final message count
          const updatedSession = {
            ...currentSession,
            lastActivity: new Date(),
            messageCount: get().messageCount
          }

          set({
            currentSession: updatedSession
          })
        }

        // Don't clear the session data, just mark as ended
        set({
          isTyping: false,
          error: null
        })
      },

      // Message sending/receiving
      sendMessage: (content, role) => {
        const message: ChatMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          role,
          content,
          timestamp: new Date()
        }

        get().addMessage(message)

        // Update session activity
        const { currentSession } = get()
        if (currentSession) {
          const updatedSession = {
            ...currentSession,
            lastActivity: new Date(),
            messageCount: get().messageCount
          }
          set({ currentSession: updatedSession })
        }
      },

      receiveMessage: (content, analysis) => {
        const message: ChatMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          role: 'assistant',
          content,
          timestamp: new Date()
        }

        get().addMessage(message)

        if (analysis) {
          get().updateConversationAnalysis(analysis)
        }

        set({ isTyping: false })
      },

      // Context management
      refreshAssessmentContext: async () => {
        console.log('🔄 Chat store: Refreshing assessment context')
        set({ isLoadingContext: true, error: null })

        try {
          // This would typically call the AssessmentManager
          // For now, we'll simulate the refresh
          await new Promise(resolve => setTimeout(resolve, 1000))

          set({
            contextLastUpdated: new Date(),
            isLoadingContext: false
          })

          console.log('✅ Chat store: Assessment context refreshed')
        } catch (error) {
          console.error('❌ Chat store: Failed to refresh context', error)
          set({
            error: 'Failed to refresh assessment context',
            isLoadingContext: false
          })
        }
      },

      updateContextTimestamp: () => {
        set({ contextLastUpdated: new Date() })
      },

      // Analytics
      updateConversationAnalysis: (analysis) => {
        console.log('📈 Chat store: Updating conversation analysis', {
          sentiment: analysis.averageSentiment,
          themes: analysis.therapeuticThemes.length
        })
        set({ conversationAnalysis: analysis })
      },

      // Cleanup
      resetChatState: () => {
        console.log('🔄 Chat store: Resetting chat state')
        set({
          currentSessionId: null,
          currentSession: null,
          messages: [],
          messageCount: 0,
          assessmentContext: null,
          contextLastUpdated: null,
          conversationAnalysis: null,
          isTyping: false,
          isLoadingContext: false,
          error: null
        })
      }
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        messages: state.messages.slice(-50), // Keep last 50 messages
        messageCount: state.messageCount,
        assessmentContext: state.assessmentContext,
        contextLastUpdated: state.contextLastUpdated,
        conversationAnalysis: state.conversationAnalysis
      })
    }
  )
)
