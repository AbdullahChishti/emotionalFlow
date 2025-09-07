'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { track } from '@/lib/analytics'
import { ChatPersonalizationService } from '@/lib/chat-personalization'
import { CHAT_CONFIG, getRandomPlaceholder, getRandomSuggestion } from '@/lib/chat-config'
import { useAuth } from '@/stores/authStore'
import 'material-symbols/outlined.css'

interface Message {
  id: string
  text: string
  sender: 'user' | 'therapist'
  timestamp: Date
  emotion?: 'calm' | 'anxious' | 'sad' | 'hopeful' | 'neutral'
  isTyping?: boolean
}

interface ChatInterfaceProps {
  therapistName: string
}

const messageVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const }
  },
  exit: { 
    opacity: 0, 
    y: -5,
    transition: { duration: 0.2 }
  }
}

const TherapeuticMessage = ({ message }: { message: Message }) => {
  const isUser = message.sender === 'user'
  const emotion = message.emotion || 'neutral'

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
    >
      {/* Therapist Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 mr-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-md border border-white/50">
            <span className="material-symbols-outlined text-[#335f64] text-lg">psychology</span>
          </div>
        </div>
      )}

      <div className={`${isUser ? 'max-w-[20rem]' : 'max-w-[24rem]'}`}>
        <div className={`px-3 py-2.5 rounded-xl backdrop-blur-sm border shadow-sm ${
          isUser
            ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-white border-slate-600/30'
            : 'bg-white/80 border-slate-200/40'
        }`}>
          <p className={`text-sm leading-relaxed ${
            isUser ? 'text-white' : 'text-slate-800'
          }`}>
            {message.text}
          </p>

          <div className={`mt-2 pt-1.5 border-t ${
            isUser ? 'border-slate-600/40' : 'border-slate-200/60'
          }`}>
            <span className={`text-[10px] font-medium ${
              isUser ? 'text-slate-300' : 'text-slate-500'
            }`}>
              {message.timestamp.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              })}
            </span>
          </div>
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0 ml-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center shadow-md border border-white/50">
            <span className="material-symbols-outlined text-slate-600 text-lg">person</span>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export function ChatInterface({ therapistName }: ChatInterfaceProps) {
  const { user: authUser } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [sessionReady, setSessionReady] = useState(false)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [currentSuggestion, setCurrentSuggestion] = useState('')
  const [showInlineAffirmation, setShowInlineAffirmation] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [sessionMood, setSessionMood] = useState<'calm' | 'anxious' | 'sad' | 'hopeful' | 'neutral'>('neutral')
  const [placeholder, setPlaceholder] = useState(getRandomPlaceholder())
  
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)

  // Initialize chat session (robust to delayed auth)
  useEffect(() => {
    let cancelled = false
    let retryTimeout: any

    const initializeChat = async () => {
      try {
        const userId = authUser?.id || (await supabase.auth.getUser()).data.user?.id
        if (!userId) {
          retryTimeout = setTimeout(initializeChat, 600)
          return
        }

        await ChatPersonalizationService.initializeSession(userId, sessionMood)
        if (cancelled) return
        setSessionReady(true)
        setSessionError(null)

        setMessages(prev => {
          if (prev.length > 0) return prev
          const welcomeMessage: Message = {
            id: '1',
            text: `Hello, I'm ${therapistName}. I'm here to listen and support you today. This is a safe space where you can share whatever is on your mind. How are you feeling right now?`,
            sender: 'therapist',
            timestamp: new Date(),
            emotion: 'calm'
          }
          return [welcomeMessage]
        })
      } catch (error: any) {
        console.error('Failed to initialize chat session:', error)
        if (cancelled) return
        // Let the user proceed even if personalization fails
        setSessionReady(true)
        setSessionError('Personalization is unavailable right now. You can still chat.')
      }
    }

    initializeChat()
    return () => { cancelled = true; if (retryTimeout) clearTimeout(retryTimeout) }
  }, [therapistName, sessionMood, authUser?.id])

  // Placeholder rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholder(getRandomPlaceholder())
    }, CHAT_CONFIG.timing.placeholderRotation)
    return () => clearInterval(interval)
  }, [])

  // Suggestion logic
  useEffect(() => {
    setShowSuggestion(false)
    const lastMessage = messages[messages.length - 1]
    if (inputValue === '' && lastMessage && lastMessage.sender === 'therapist') {
      const suggestionTimer = setTimeout(() => {
        setCurrentSuggestion(getRandomSuggestion())
        setShowSuggestion(true)
      }, CHAT_CONFIG.timing.suggestionDelay)
      return () => clearTimeout(suggestionTimer)
    }
  }, [messages, inputValue])

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const detectEmotion = (text: string): 'calm' | 'anxious' | 'sad' | 'hopeful' | 'neutral' => {
    const lowerText = text.toLowerCase()
    if (lowerText.includes('anxious') || lowerText.includes('worried') || lowerText.includes('stressed') || lowerText.includes('panic')) return 'anxious'
    if (lowerText.includes('sad') || lowerText.includes('depressed') || lowerText.includes('down') || lowerText.includes('cry')) return 'sad'
    if (lowerText.includes('better') || lowerText.includes('hopeful') || lowerText.includes('good') || lowerText.includes('happy')) return 'hopeful'
    if (lowerText.includes('calm') || lowerText.includes('peaceful') || lowerText.includes('relaxed') || lowerText.includes('serene')) return 'calm'
    return 'neutral'
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const detectedEmotion = detectEmotion(inputValue)
    setSessionMood(detectedEmotion)

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
      emotion: detectedEmotion
    }

    setMessages(prev => [...prev, newMessage])
    
    // Show supportive affirmation
    const supportive = [
      "You're not alone. Thank you for sharing this.",
      "Take a moment to breathe before responding.",
      "You're doing your best, and that matters.",
      "It's okay to take things slowly."
    ]
    const pick = supportive[Math.floor(Math.random() * supportive.length)]
    setShowInlineAffirmation(pick)
    setTimeout(() => setShowInlineAffirmation(null), 6000)
    
    setInputValue('')
    setIsTyping(true)

    try {
      if (!sessionReady) {
        throw new Error('Chat session is still initializing. Please wait a moment.')
      }

      const aiResponse = await ChatPersonalizationService.sendMessage(inputValue, detectedEmotion)

      if (aiResponse.isCrisis) {
        console.warn('Crisis detected in user message')
      }

      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.response,
        sender: 'therapist',
        timestamp: new Date(),
        emotion: aiResponse.emotionalTone as 'calm' | 'anxious' | 'sad' | 'hopeful' | 'neutral'
      }

      setMessages(prev => [...prev, responseMessage])
      setIsTyping(false)
    } catch (error) {
      console.error('Chat error:', error)

      const fallbackResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: error instanceof Error && error.message.includes('initializing')
          ? "I'm still setting up our conversation space. Please wait just a moment and try again."
          : "I'm sorry, I'm having trouble connecting right now. Please try again in a moment. Your feelings are still valid and important.",
        sender: 'therapist',
        timestamp: new Date(),
        emotion: 'calm'
      }

      setMessages(prev => [...prev, fallbackResponse])
      setIsTyping(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-md border border-white/50">
            <span className="material-symbols-outlined text-[#335f64] text-xl">psychology</span>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">{therapistName}</h3>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-xs text-slate-600">Online & Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-1 min-h-0 chat-messages"
        role="log"
        aria-live="polite"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 #f1f5f9',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <TherapeuticMessage key={message.id} message={message} />
          ))}
        </AnimatePresence>

        {/* Inline affirmation */}
        <AnimatePresence mode="wait">
          {showInlineAffirmation && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="flex justify-center my-3"
            >
              <div className="px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-sm border border-slate-200/60 text-slate-600 text-xs flex items-center gap-2 shadow-sm">
                <span className="material-symbols-outlined text-sm text-[#335f64]">favorite</span>
                <span className="italic">{showInlineAffirmation}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence mode="wait">
          {isTyping && (
            <motion.div
              className="flex justify-start mb-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-md border border-white/50">
                  <span className="material-symbols-outlined text-[#335f64] text-lg">psychology</span>
                </div>
                <div className="bg-white/80 backdrop-blur-sm px-3 py-2.5 rounded-xl border border-slate-200/60 shadow-sm">
                  <div className="flex items-center gap-2">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-[#335f64] rounded-full animate-pulse opacity-60"
                        style={{ animationDelay: `${i * 0.25}s` }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 mt-2 font-medium">
                    {therapistName} is typing...
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Suggestions */}
        <AnimatePresence mode="wait">
          {showSuggestion && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="pt-2"
            >
              <button
                onClick={() => {
                  setInputValue(currentSuggestion + ' ')
                  setShowSuggestion(false)
                }}
                className="inline-flex items-center gap-2 text-xs text-slate-700 hover:text-slate-800 px-3 py-2 bg-white/80 hover:bg-white border border-slate-200/60 rounded-full transition-all duration-300 font-medium shadow-sm hover:shadow-md"
              >
                <span className="text-sm">💭</span>
                <span>{currentSuggestion}</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={chatEndRef} className="h-2" />
      </div>

      {/* Session status */}
      {!sessionReady && !sessionError && (
        <div className="text-center py-2 px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs">
            <div className="w-3 h-3 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin"></div>
            <span>Setting up conversation space...</span>
          </div>
        </div>
      )}

      {sessionError && (
        <div className="text-center py-2 px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs">
            <span className="material-symbols-outlined text-sm">error</span>
            <span>{sessionError}</span>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200/60 bg-white/80 backdrop-blur-sm">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
              placeholder={placeholder}
              className="w-full border border-slate-300/60 rounded-xl px-4 py-2.5 resize-none focus:ring-2 focus:ring-[#335f64]/30 focus:border-[#335f64]/50 transition-all duration-300 outline-none bg-white/90 backdrop-blur-sm text-slate-800 placeholder:text-slate-500 font-normal text-sm shadow-sm"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '88px' }}
              disabled={isTyping}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button
              className={`p-2.5 rounded-xl border transition-all duration-200 ${
                isRecording ? 'border-[#335f64] bg-emerald-50 text-[#335f64]' : 'border-slate-300 bg-white/70 text-slate-700'
              } hover:bg-white shadow-sm`}
              onClick={() => {
                // Voice input logic (simplified for this component)
                track('voice_toggle')
              }}
            >
              <span className="material-symbols-outlined text-base">
                {isRecording ? 'stop_circle' : 'mic'}
              </span>
            </button>
            
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping || !sessionReady}
              className={`p-3 rounded-xl transition-all duration-300 shadow-md border ${
                inputValue.trim() && !isTyping && sessionReady
                  ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-white hover:from-slate-800 hover:to-slate-900 border-slate-600/30 hover:shadow-lg transform hover:scale-105'
                  : 'bg-slate-200/80 text-slate-400 cursor-not-allowed border-slate-200/60'
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {isTyping ? 'hourglass_empty' : !sessionReady ? 'sync' : 'send'}
              </span>
            </button>
          </div>
        </div>
        
        <div className="text-center pt-2">
          <p className="text-xs text-slate-600">🔒 Private & secure</p>
        </div>
      </div>
    </div>
  )
}
