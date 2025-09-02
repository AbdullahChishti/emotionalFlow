'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import 'material-symbols/outlined.css'

import { supabase } from '@/lib/supabase'
import { CHAT_CONFIG, detectMood, getRandomPlaceholder, getRandomSuggestion } from '@/lib/chat-config'
import { SessionCompletionScreen, SessionFeedback } from './SessionCompletionScreen'

interface Message {
  id: number
  text: string
  sender: 'user' | 'other'
}

const ChatMessage = ({ message }: { message: Message }) => {
  const isUser = message.sender === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-sm md:max-w-md px-4 py-3 rounded-lg shadow-sm ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
        }`}>
        <p className="text-sm leading-relaxed">{message.text}</p>
      </div>
    </motion.div>
  )
}

// --- Main Component ---
interface NavigationParams {
  mode?: 'listen' | 'support'
}

interface SessionScreenProps {
  onNavigate: (screen: string, params?: NavigationParams) => void
  matchedUser: { name: string }
}

export function SessionScreen({ onNavigate, matchedUser }: SessionScreenProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [showEndModal, setShowEndModal] = useState(false)
  const [showCompletionScreen, setShowCompletionScreen] = useState(false)
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [interactionCount, setInteractionCount] = useState(0)
  const [currentSuggestion, setCurrentSuggestion] = useState('')
  const [selectedMood, setSelectedMood] = useState<string>('calm')
  const chatEndRef = useRef<HTMLDivElement>(null)

  const [placeholder, setPlaceholder] = useState(getRandomPlaceholder())

  // Initial message from the listener
  useEffect(() => {
    const messageTimer = setTimeout(() => {
      setMessages([
        {
          id: 1,
          text: CHAT_CONFIG.uiText.initialMessageTemplate(matchedUser?.name || 'here'),
          sender: 'other',
        },
      ])
    }, 1500)

    return () => {
      clearTimeout(messageTimer)
    }
  }, [matchedUser])

  // Placeholder rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholder(getRandomPlaceholder())
    }, CHAT_CONFIG.timing.placeholderRotation)
    return () => clearInterval(interval)
  }, [])

  // Typing suggestion logic
  useEffect(() => {
    setShowSuggestion(false) // Hide on any interaction
    const lastMessage = messages[messages.length - 1]
    if (inputValue === '' && lastMessage && lastMessage.sender === 'other') {
      const suggestionTimer = setTimeout(() => {
        setCurrentSuggestion(getRandomSuggestion())
        setShowSuggestion(true)
      }, CHAT_CONFIG.timing.suggestionDelay)
      return () => clearTimeout(suggestionTimer)
    }
  }, [messages, inputValue])

  // Session Timer
  useEffect(() => {
    const timer = setInterval(() => setTimeElapsed(prev => prev + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // Handle ending the session
  const handleEndSession = () => {
    setShowEndModal(false)
    // Show the enhanced completion screen
    setShowCompletionScreen(true)
  }

  // Handle completion screen feedback
  const handleCompletionComplete = (feedback: SessionFeedback) => {
    setShowCompletionScreen(false)
    // Here you would save the feedback and session data
    console.log('Session feedback:', feedback)
    // Navigate based on user's next steps selection
    if (feedback.nextSteps.includes('check-in')) {
      onNavigate('/check-in')
    } else if (feedback.nextSteps.includes('meditation')) {
      onNavigate('/meditation')
    } else if (feedback.nextSteps.includes('journal')) {
      onNavigate('/dashboard')
    } else {
      onNavigate('/')
    }
  }
  
  // Handle sending a new message with mood detection
  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: Date.now(),
        text: inputValue,
        sender: 'user',
      }
      setMessages(prev => [...prev, newMessage])
      setInputValue('')
      setInteractionCount(c => c + 1)
      
      // Mood detection using configurable keywords
      const detectedMood = detectMood(inputValue)
      setSelectedMood(detectedMood)

      // Call AI therapy function with proper configuration
      setTimeout(async () => {
        try {
          const { data, error } = await supabase.functions.invoke('chat-ai', {
            body: {
              message: inputValue,
              conversationHistory: messages.slice(-CHAT_CONFIG.ai.conversationHistoryLength).map(m => ({
                sender: m.sender,
                text: m.text
              }))
            }
          })

          if (error) {
            console.error('Edge Function error:', error)
            throw error
          }

          const aiResponse: Message = {
            id: Date.now() + 1,
            text: data.response,
            sender: 'other',
          }

          setMessages(prev => [...prev, aiResponse])
          setInteractionCount(c => c + 1)

          // Log usage for cost tracking (only in development)
          if (process.env.NODE_ENV === 'development' && data.usage) {
            console.log('AI Usage:', data.usage)
          }

        } catch (error) {
          console.error('AI Error:', error)

          // Use fallback response from config
          const fallbackResponse: Message = {
            id: Date.now() + 1,
            text: CHAT_CONFIG.uiText.fallbackResponse,
            sender: 'other',
          }
          setMessages(prev => [...prev, fallbackResponse])
          setInteractionCount(c => c + 1)
        }
      }, CHAT_CONFIG.timing.aiResponseDelay)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
    const secs = (seconds % 60).toString().padStart(2, '0')
    return `${mins}:${secs}`
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-3xl flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-neutral-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-[14px] text-neutral-700">psychology</span>
            </div>
            <div>
              <div className="text-sm font-medium">{CHAT_CONFIG.appName}</div>
              <div className="text-xs text-neutral-500">{CHAT_CONFIG.uiText.therapySession}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-sm text-neutral-600">
              {CHAT_CONFIG.uiText.youreWith} <span className="font-medium text-neutral-900">{matchedUser?.name}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-full text-xs text-neutral-700">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              <span className="font-medium">{formatTime(timeElapsed)}</span>
            </div>
            <button onClick={() => setShowEndModal(true)} className="px-3 py-2 text-sm bg-neutral-900 text-white rounded-md hover:bg-black">
              {CHAT_CONFIG.uiText.endSession}
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-3xl px-4 py-6">
        {/* Chat Card */}
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          {/* Messages */}
          <main className="h-[60vh] min-h-[360px] overflow-y-auto p-4 bg-white">
            <div className="space-y-3">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              <div ref={chatEndRef} />
            </div>
          </main>

          {/* Suggestion */}
          <AnimatePresence>
            {showSuggestion && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="px-4 pt-3"
              >
                <button
                  onClick={() => {
                    setInputValue(currentSuggestion + ' ')
                    setShowSuggestion(false)
                  }}
                  className="inline-flex items-center gap-2 text-xs text-neutral-700 hover:text-neutral-900 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors"
                >
                  <span>💭</span>
                  <span>{currentSuggestion}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input */}
          <footer className="border-t border-neutral-200 p-4 bg-white">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <textarea
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                  placeholder={placeholder}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-3 resize-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-colors h-12 min-h-[48px] max-h-32 text-neutral-900 placeholder:text-neutral-500"
                  rows={1}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className={`px-3 h-10 rounded-lg flex items-center justify-center text-sm ${
                  inputValue.trim() ? 'bg-neutral-900 text-white hover:bg-black' : 'bg-neutral-300 text-neutral-600 cursor-not-allowed'
                }`}
                title="Send"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </div>
            <p className="text-center text-[11px] text-neutral-500 mt-3">
              {CHAT_CONFIG.uiText.sessionPrivate}
            </p>
          </footer>
        </div>
      </div>

      {/* End Session Modal */}
      <AnimatePresence>
        {showEndModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-sm w-full text-center shadow-xl"
            >
              <div className="mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-xl text-red-600">logout</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{CHAT_CONFIG.uiText.endSessionConfirm}</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{CHAT_CONFIG.uiText.endSessionDescription}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEndModal(false)}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  {CHAT_CONFIG.uiText.stayHere}
                </button>
                <button
                  onClick={handleEndSession}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                  End Session
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session Completion */}
      <AnimatePresence>
        {showCompletionScreen && (
          <SessionCompletionScreen
            sessionData={{
              duration: timeElapsed,
              messageCount: messages.length,
              initialMood: '😊', // This should come from session start
              finalMood: selectedMood === 'calm' ? '😌' : selectedMood === 'happy' ? '😊' : '😐',
              creditsEarned: Math.floor(timeElapsed / 60) * 5, // Simple calculation
              matchedUser
            }}
            onComplete={handleCompletionComplete}
            onClose={() => setShowCompletionScreen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
