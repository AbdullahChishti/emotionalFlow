'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// Material Symbols icons import
import 'material-symbols/outlined.css'
import { ListenerPresence } from './ListenerPresence'
import { supabase } from '@/lib/supabase'
import { CHAT_CONFIG, detectMood, getRandomPlaceholder, getRandomSuggestion } from '@/lib/chat-config'

interface Message {
  id: number
  text: string
  sender: 'user' | 'other'
}

const ChatMessage = ({ message }: { message: Message }) => {
  const isUser = message.sender === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`flex my-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-sm ${
          isUser
            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-br-none'
            : 'glassmorphic text-secondary-800 rounded-bl-none'
        }`}>
        <p className="text-base font-light leading-relaxed">{message.text}</p>
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
    <div className="min-h-screen flex flex-row bg-gradient-to-br from-primary-100 via-white to-primary-50 text-secondary-800 font-sans relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute rounded-full opacity-20"
          style={{
            width: 300,
            height: 300,
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
            top: '10%',
            left: '10%'
          }}
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <motion.div
          className="absolute rounded-full opacity-20"
          style={{
            width: 250,
            height: 250,
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
            bottom: '20%',
            right: '15%'
          }}
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 8
          }}
        />
      </div>

      {/* Left Panel: Listener Presence */}
      <div className="w-1/2 h-screen sticky top-0 relative z-10">
        <ListenerPresence interactionCount={interactionCount} selectedMood={selectedMood} />
      </div>

      {/* Right Panel: Chat UI */}
      <div className="w-1/2 flex flex-col h-screen relative z-10">
        <AnimatePresence>
          {showIntroCard && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, transition: { duration: 0.5 } }}
              className="absolute top-4 right-4 w-[90%] max-w-md glassmorphic rounded-2xl p-6 text-center z-20 shadow-lg">
              <p className="font-medium text-secondary-700 leading-relaxed">
                {CHAT_CONFIG.uiText.listenerIntro(matchedUser?.name || 'Your listener')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="flex items-center justify-between p-6 glassmorphic shrink-0 relative z-20">
          <div className="flex items-center gap-4">
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <span className="material-symbols-outlined text-2xl text-primary-600">psychology</span>
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                  {CHAT_CONFIG.appName}
                </h2>
                <p className="text-xs text-secondary-500">{CHAT_CONFIG.uiText.therapySession}</p>
              </div>
            </motion.div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-sm text-secondary-500">{CHAT_CONFIG.uiText.youreWith}</p>
              <p className="font-bold text-secondary-800">{matchedUser?.name || 'your listener'}</p>
            </div>
            <div className="flex items-center gap-2 text-secondary-600 glassmorphic px-4 py-2 rounded-full">
              <span className="material-symbols-outlined text-lg">schedule</span>
              <span className="font-medium">{formatTime(timeElapsed)}</span>
            </div>
            <motion.button
              onClick={() => setShowEndModal(true)}
              className="px-6 py-2 text-sm bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-full transition-all duration-300 shadow-lg shadow-primary-500/30 hover:shadow-xl"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {CHAT_CONFIG.uiText.endSession}
            </motion.button>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col p-6 overflow-y-auto relative">
          <div className="flex-1 space-y-4">
            {messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={chatEndRef} />
          </div>
        </main>

        {/* Input Area */}
        <footer className="p-6 glassmorphic shrink-0 relative">
          <AnimatePresence>
            {showSuggestion && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-4 text-center">
                <motion.button
                  onClick={() => {
                    setInputValue(currentSuggestion + ' ')
                    setShowSuggestion(false)
                  }}
                  className="text-sm text-primary-600 hover:text-primary-700 transition-colors p-2 glassmorphic rounded-lg hover:bg-primary-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  💭 {currentSuggestion}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-3">
            <textarea
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
              placeholder={placeholder}
              className="flex-1 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl p-4 resize-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all duration-300 h-12 min-h-[52px] max-h-32 text-secondary-800 placeholder:text-secondary-400"
            />
            <motion.button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg transform ${
                inputValue.trim()
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-primary-500/30 hover:shadow-xl hover:scale-110'
                  : 'bg-secondary-200 text-secondary-400 cursor-not-allowed'
              }`}
              whileHover={inputValue.trim() ? { scale: 1.05 } : {}}
              whileTap={inputValue.trim() ? { scale: 0.95 } : {}}
            >
              <span className="material-symbols-outlined text-xl">send</span>
            </motion.button>
          </div>
          <p className="text-center text-xs text-secondary-500 mt-4 px-4">
            {CHAT_CONFIG.uiText.sessionPrivate}
          </p>
        </footer>
      </div>

      {/* End Session Modal */}
      <AnimatePresence>
        {showEndModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-secondary-900/20 backdrop-blur-lg flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glassmorphic rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
              <div className="mb-8">
                <span className="material-symbols-outlined text-5xl text-amber-500 mb-4 block">logout</span>
                <h2 className="text-2xl font-bold text-secondary-800 mb-3">{CHAT_CONFIG.uiText.endSessionConfirm}</h2>
                <p className="text-secondary-600 leading-relaxed">{CHAT_CONFIG.uiText.endSessionDescription}</p>
              </div>
              <div className="flex gap-4">
                <motion.button
                  onClick={() => setShowEndModal(false)}
                  className="flex-1 py-4 glassmorphic text-secondary-700 font-semibold rounded-xl hover:bg-white/60 transition-all duration-300"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
{CHAT_CONFIG.uiText.stayHere}
                </motion.button>
                <motion.button
                  onClick={handleEndSession}
                  className="flex-1 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.02, y: -1 }}
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
