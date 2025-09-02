'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// Material Symbols icons import
import 'material-symbols/outlined.css'

import { supabase } from '@/lib/supabase'
import { CHAT_CONFIG, detectMood, getRandomPlaceholder, getRandomSuggestion } from '@/lib/chat-config'
import { ListenerPresence } from './ListenerPresence'
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
  const [showIntroCard, setShowIntroCard] = useState(true)
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [interactionCount, setInteractionCount] = useState(0)
  const [currentSuggestion, setCurrentSuggestion] = useState('')
  const [selectedMood, setSelectedMood] = useState<string>('calm')
  const chatEndRef = useRef<HTMLDivElement>(null)

  const [placeholder, setPlaceholder] = useState(getRandomPlaceholder())

  // Initial message from the listener & intro card timer
  useEffect(() => {
    const introTimer = setTimeout(() => setShowIntroCard(false), CHAT_CONFIG.timing.introCardDuration)

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
      clearTimeout(introTimer)
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
    <div className="min-h-[calc(100vh-12rem)] flex bg-gray-50 text-gray-800 font-sans relative">
      {/* Clean Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100"></div>

      {/* Two-Panel Layout */}
      <div className="flex w-full h-full relative">
        {/* Left Panel: Listener Presence */}
        <div className="w-1/2 h-full bg-white border-r border-gray-200 flex flex-col">
          <div className="flex-1">
            <ListenerPresence interactionCount={interactionCount} selectedMood={selectedMood} />
          </div>
        </div>

        {/* Right Panel: Chat Interface */}
        <div className="w-1/2 flex flex-col h-full bg-white">
        <AnimatePresence>
          {showIntroCard && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, transition: { duration: 0.3 } }}
              className="absolute top-6 right-6 max-w-sm bg-white rounded-xl p-6 text-center z-20 shadow-lg border border-gray-200"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg">💙</span>
              </div>
              <p className="text-gray-700 leading-relaxed text-sm">
                {CHAT_CONFIG.uiText.listenerIntro(matchedUser?.name || 'Your listener')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="border-b border-gray-200 p-6 shrink-0 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-sm text-blue-600">psychology</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {CHAT_CONFIG.appName}
                </h2>
                <p className="text-xs text-gray-500">{CHAT_CONFIG.uiText.therapySession}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{CHAT_CONFIG.uiText.youreWith}</p>
                <p className="font-semibold text-gray-900">{matchedUser?.name || 'your listener'}</p>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-full text-sm text-gray-600">
                <span className="material-symbols-outlined text-sm">schedule</span>
                <span className="font-medium">{formatTime(timeElapsed)}</span>
              </div>

              <button
                onClick={() => setShowEndModal(true)}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                {CHAT_CONFIG.uiText.endSession}
              </button>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col px-6 py-4 overflow-y-auto bg-gray-50">
          <div className="flex-1 space-y-4 w-full">
            {messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={chatEndRef} />
          </div>
        </main>

        {/* Input Area */}
        <footer className="border-t border-gray-200 p-6 bg-white">
          <AnimatePresence>
            {showSuggestion && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-4 text-center"
              >
                <button
                  onClick={() => {
                    setInputValue(currentSuggestion + ' ')
                    setShowSuggestion(false)
                  }}
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"
                >
                  <span>💭</span>
                  <span>{currentSuggestion}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="w-full">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                  placeholder={placeholder}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors h-12 min-h-[48px] max-h-32 text-gray-900 placeholder:text-gray-500"
                  rows={1}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  inputValue.trim()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </div>
            <p className="text-center text-xs text-gray-500 mt-3">
              {CHAT_CONFIG.uiText.sessionPrivate}
            </p>
          </div>
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

      {/* Enhanced Session Completion Screen */}
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
