'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Send, Clock, X, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { CHAT_CONFIG, detectMood, getRandomPlaceholder, getRandomSuggestion } from '@/lib/chat-config'

interface Message {
  id: number
  text: string
  sender: 'user' | 'other'
  timestamp: Date
}

interface ModernSessionScreenProps {
  onNavigate: (screen: string, params?: any) => void
  matchedUser: { name: string }
}

const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.sender === 'user'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-green-600 text-white rounded-br-md shadow-lg'
            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
        }`}
        style={isUser ? { backgroundColor: '#059669' } : {}}
      >
        <p className="text-sm leading-relaxed font-medium">{message.text}</p>
        <p className={`text-xs mt-1 ${
          isUser ? 'text-green-100' : 'text-gray-400'
        }`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  )
}

export function ModernSessionScreen({ onNavigate, matchedUser }: ModernSessionScreenProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [showEndModal, setShowEndModal] = useState(false)
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [currentSuggestion, setCurrentSuggestion] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [placeholder, setPlaceholder] = useState(getRandomPlaceholder())
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Initial message from the listener
  useEffect(() => {
    const messageTimer = setTimeout(() => {
      setMessages([
        {
          id: 1,
          text: `Hi there! I'm here to listen with an open heart. How are you feeling today? 💙`,
          sender: 'other',
          timestamp: new Date(),
        },
      ])
    }, 1500)

    return () => clearTimeout(messageTimer)
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
    setShowSuggestion(false)
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

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const newMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    }
    
    console.log('Adding user message:', newMessage)
    setMessages(prev => {
      const updated = [...prev, newMessage]
      console.log('Updated messages:', updated)
      return updated
    })
    setInputValue('')
    setIsTyping(true)

    // Call AI therapy function
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

      if (error) throw error

      const aiResponse: Message = {
        id: Date.now() + 1,
        text: data.response,
        sender: 'other',
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('AI Error:', error)
      const fallbackResponse: Message = {
        id: Date.now() + 1,
        text: "I'm here with you. Sometimes the most important thing is just being present together. How can I support you right now?",
        sender: 'other',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, fallbackResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
    const secs = (seconds % 60).toString().padStart(2, '0')
    return `${mins}:${secs}`
  }

  const handleEndSession = () => {
    setShowEndModal(false)
    onNavigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-green-50 via-white to-brand-green-100">
      {/* Minimal Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-brand-green-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-green-500 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-secondary-900">Safe Space</h1>
                <p className="text-xs text-secondary-500">with {matchedUser?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-green-50 rounded-full">
                <Clock className="w-3 h-3 text-brand-green-600" />
                <span className="text-xs font-medium text-brand-green-700">{formatTime(timeElapsed)}</span>
              </div>
              
              <button
                onClick={() => setShowEndModal(true)}
                className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-50 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50 shadow-lg overflow-hidden">
          {/* Messages */}
          <div className="h-[70vh] min-h-[400px] overflow-y-auto p-6 bg-gray-50/50">
            <div className="space-y-2">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  Start your conversation here...
                </div>
              )}
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              
              {/* Typing Indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex justify-start mb-4"
                  >
                    <div className="bg-white border border-secondary-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-brand-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-brand-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-brand-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-xs text-secondary-500">Listening with care...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Suggestion */}
          <AnimatePresence>
            {showSuggestion && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="px-6 pt-2"
              >
                <button
                  onClick={() => {
                    setInputValue(currentSuggestion + ' ')
                    setShowSuggestion(false)
                  }}
                  className="inline-flex items-center gap-2 text-xs text-brand-green-600 hover:text-brand-green-700 px-3 py-2 bg-brand-green-50 hover:bg-brand-green-100 rounded-full transition-colors"
                >
                  <span>💭</span>
                  <span>{currentSuggestion}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Area */}
          <div className="border-t border-brand-green-100 p-6 bg-white/40">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                  placeholder={placeholder}
                  className="w-full border border-brand-green-200 rounded-2xl px-4 py-3 resize-none focus:ring-2 focus:ring-brand-green-300 focus:border-brand-green-400 transition-all outline-none bg-white/80 text-secondary-900 placeholder:text-secondary-400"
                  rows={1}
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
              </div>
              <motion.button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className={`p-3 rounded-2xl transition-all ${
                  inputValue.trim()
                    ? 'bg-brand-green-500 text-white hover:bg-brand-green-600 shadow-lg shadow-brand-green-500/25'
                    : 'bg-secondary-200 text-secondary-400 cursor-not-allowed'
                }`}
                whileHover={inputValue.trim() ? { scale: 1.05 } : {}}
                whileTap={inputValue.trim() ? { scale: 0.95 } : {}}
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
            <p className="text-center text-xs text-secondary-400 mt-3">
              Your conversation is private and secure
            </p>
          </div>
        </div>
      </div>

      {/* End Session Modal */}
      <AnimatePresence>
        {showEndModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-white/50"
            >
              <div className="w-16 h-16 bg-brand-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-brand-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-secondary-900 mb-3">End Session?</h2>
              <p className="text-secondary-600 mb-6 leading-relaxed">
                You've shared {formatTime(timeElapsed)} of meaningful conversation. 
                Are you ready to close this session?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEndModal(false)}
                  className="flex-1 py-3 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 font-medium rounded-2xl transition-colors"
                >
                  Continue
                </button>
                <button
                  onClick={handleEndSession}
                  className="flex-1 py-3 bg-brand-green-500 hover:bg-brand-green-600 text-white font-medium rounded-2xl transition-colors"
                >
                  End Session
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
