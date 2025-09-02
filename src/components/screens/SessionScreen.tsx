'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// Material Symbols icons import
import 'material-symbols/outlined.css'

import { supabase } from '@/lib/supabase'
import { CHAT_CONFIG, detectMood, getRandomPlaceholder, getRandomSuggestion } from '@/lib/chat-config'
import { ListenerPresence } from './ListenerPresence'

interface Message {
  id: number
  text: string
  sender: 'user' | 'other'
}

const ChatMessage = ({ message }: { message: Message }) => {
  const isUser = message.sender === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-sm md:max-w-md px-5 py-3 rounded-2xl ${
          isUser
            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-br-sm shadow-lg'
            : 'bg-white/80 backdrop-blur-sm text-secondary-800 rounded-bl-sm shadow-sm border border-white/50'
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
    // Here you would add logic for session summary, feedback, etc.
    onNavigate('Welcome')
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
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-primary-50 text-secondary-800 font-sans relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-secondary-100/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-50/10 rounded-full blur-2xl"></div>
      </div>

      {/* Two-Panel Layout */}
      <div className="flex w-full h-screen">
        {/* Left Panel: Listener Presence */}
        <div className="w-1/2 h-screen border-r border-white/20">
          <ListenerPresence interactionCount={interactionCount} selectedMood={selectedMood} />
        </div>

        {/* Right Panel: Chat Interface */}
        <div className="w-1/2 flex flex-col h-screen relative z-10">
        <AnimatePresence>
          {showIntroCard && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.4 } }}
              className="absolute top-6 right-6 max-w-sm bg-white/90 backdrop-blur-xl rounded-2xl p-6 text-center z-20 shadow-xl border border-white/50">
              <div className="w-12 h-12 bg-primary-100/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">💙</span>
              </div>
              <p className="text-secondary-700 leading-relaxed text-sm">
                {CHAT_CONFIG.uiText.listenerIntro(matchedUser?.name || 'Your listener')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-white/50 p-6 shrink-0 relative z-20">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <div className="w-10 h-10 bg-primary-100/50 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-xl text-primary-600">psychology</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-secondary-800">
                  {CHAT_CONFIG.appName}
                </h2>
                <p className="text-xs text-secondary-500">{CHAT_CONFIG.uiText.therapySession}</p>
              </div>
            </motion.div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xs text-secondary-500 uppercase tracking-wide font-medium">{CHAT_CONFIG.uiText.youreWith}</p>
                <p className="font-semibold text-secondary-800">{matchedUser?.name || 'your listener'}</p>
              </div>

              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/50">
                <span className="material-symbols-outlined text-base text-primary-600">schedule</span>
                <span className="font-medium text-secondary-700">{formatTime(timeElapsed)}</span>
              </div>

              <motion.button
                onClick={() => setShowEndModal(true)}
                className="px-5 py-2 text-sm bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full font-medium transition-all duration-300 shadow-lg shadow-red-500/30 hover:shadow-xl"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                {CHAT_CONFIG.uiText.endSession}
              </motion.button>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col px-6 py-4 overflow-y-auto relative">
          <div className="flex-1 space-y-3 w-full">
            {messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={chatEndRef} />
          </div>
        </main>

        {/* Input Area */}
        <footer className="bg-white/80 backdrop-blur-xl border-t border-white/50 p-6 shrink-0 relative">
          <AnimatePresence>
            {showSuggestion && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="mb-4 text-center">
                <motion.button
                  onClick={() => {
                    setInputValue(currentSuggestion + ' ')
                    setShowSuggestion(false)
                  }}
                  className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 transition-colors px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/50 hover:bg-white/80"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>💭</span>
                  <span>{currentSuggestion}</span>
                </motion.button>
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
                  className="w-full bg-white/90 backdrop-blur-sm border border-white/40 rounded-2xl px-5 py-3 resize-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all duration-300 h-12 min-h-[48px] max-h-32 text-secondary-800 placeholder:text-secondary-400 shadow-sm"
                  rows={1}
                />
              </div>
              <motion.button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                  inputValue.trim()
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-primary-500/30 hover:shadow-xl'
                    : 'bg-secondary-200 text-secondary-400 cursor-not-allowed'
                }`}
                whileHover={inputValue.trim() ? { scale: 1.05 } : {}}
                whileTap={inputValue.trim() ? { scale: 0.95 } : {}}
              >
                <span className="material-symbols-outlined text-lg">send</span>
              </motion.button>
            </div>
            <p className="text-center text-xs text-secondary-500 mt-3">
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
            className="fixed inset-0 bg-black/20 backdrop-blur-xl flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-white/50">
              <div className="mb-6">
                <div className="w-16 h-16 bg-red-100/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl text-red-500">logout</span>
                </div>
                <h2 className="text-xl font-bold text-secondary-800 mb-2">{CHAT_CONFIG.uiText.endSessionConfirm}</h2>
                <p className="text-secondary-600 text-sm leading-relaxed">{CHAT_CONFIG.uiText.endSessionDescription}</p>
              </div>
              <div className="flex gap-3">
                <motion.button
                  onClick={() => setShowEndModal(false)}
                  className="flex-1 py-3 bg-white/80 text-secondary-700 font-medium rounded-xl border border-white/50 hover:bg-white/90 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {CHAT_CONFIG.uiText.stayHere}
                </motion.button>
                <motion.button
                  onClick={handleEndSession}
                  className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-xl shadow-lg shadow-red-500/30 hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  End Session
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
