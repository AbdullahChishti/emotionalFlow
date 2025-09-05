'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { track } from '@/lib/analytics'
import { ChatPersonalizationService } from '@/lib/chat-personalization'
import { CHAT_CONFIG, getRandomPlaceholder, getRandomSuggestion } from '@/lib/chat-config'
import 'material-symbols/outlined.css'

interface Message {
  id: string
  text: string
  sender: 'user' | 'therapist'
  timestamp: Date
  emotion?: 'calm' | 'anxious' | 'sad' | 'hopeful' | 'neutral'
  isTyping?: boolean
}

interface ModernSessionScreenProps {
  onNavigate: (screen: string, params?: any) => void
  matchedUser?: { name: string }
}

// Sophisticated therapeutic color palette matching landing page
const therapeuticPalette = {
  primary: '#335f64',
  gradients: {
    background: 'bg-gradient-to-br from-slate-50 via-white to-slate-100',
    accent: 'bg-gradient-to-br from-slate-100 to-slate-200',
    message: 'bg-gradient-to-br from-white to-slate-50'
  },
  decorative: {
    primary: 'text-[#335f64]',
    secondary: 'text-slate-600',
    muted: 'text-slate-500'
  },
  backgrounds: {
    calm: 'bg-gradient-to-br from-green-50 to-emerald-50',
    anxious: 'bg-gradient-to-br from-orange-50 to-amber-50',
    sad: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    hopeful: 'bg-gradient-to-br from-green-100 to-emerald-100',
    neutral: 'bg-gradient-to-br from-slate-50 to-slate-100'
  },
  messages: {
    calm: 'bg-white/80 backdrop-blur-sm border-green-200/50 shadow-sm',
    anxious: 'bg-white/80 backdrop-blur-sm border-orange-200/50 shadow-sm',
    sad: 'bg-white/80 backdrop-blur-sm border-blue-200/50 shadow-sm',
    hopeful: 'bg-white/80 backdrop-blur-sm border-green-300/50 shadow-sm',
    neutral: 'bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm'
  },
  accents: {
    calm: 'text-green-700',
    anxious: 'text-orange-700',
    sad: 'text-blue-700',
    hopeful: 'text-green-800',
    neutral: 'text-slate-700'
  }
}

// Subtle animation variants
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

const buttonVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.01 },
  tap: { scale: 0.99 }
}

// Elegant Therapeutic Message Component with Glassmorphic Design
const TherapeuticMessage = ({ message }: { message: Message }) => {
  const isUser = message.sender === 'user'
  const emotion = message.emotion || 'neutral'
  const messageStyle = therapeuticPalette.messages[emotion]
  const accentColor = therapeuticPalette.accents[emotion]

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2 md:mb-3`}
    >
      {/* Therapist Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 mr-3 md:mr-4">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-md border border-white/50 backdrop-blur-sm">
            <span className="material-symbols-outlined text-[#335f64] text-lg md:text-xl">psychology</span>
          </div>
        </div>
      )}

      <div className={`${
        isUser
          ? 'max-w-[16rem] sm:max-w-[20rem] md:max-w-[24rem]'
          : 'max-w-[18rem] sm:max-w-[24rem] md:max-w-[30rem]'
      }`}>
        {/* Elegant Message Bubble with Glassmorphic Effect */}
        <div className={`px-2.5 py-2 md:px-3 md:py-2.5 rounded-xl backdrop-blur-sm border shadow-sm ${
          isUser
            ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-white border-slate-600/30'
            : `${messageStyle} border-slate-200/40`
        }`}>
          <p className={`text-sm md:text-base leading-relaxed font-normal ${
            isUser ? 'text-white' : 'text-slate-800'
          }`}>
            {message.text}
          </p>

          {/* Sophisticated Timestamp */}
          <div className={`mt-2 pt-1.5 border-t ${
            isUser ? 'border-slate-600/40' : 'border-slate-200/60'
          }`}>
            <span className={`text-[10px] font-medium ${
              isUser ? 'text-slate-300' : therapeuticPalette.decorative.muted
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
        <div className="flex-shrink-0 ml-3 md:ml-4">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center shadow-md border border-white/50 backdrop-blur-sm">
            <span className="material-symbols-outlined text-slate-600 text-lg md:text-xl">person</span>
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ComfortZone removed in favor of a focused, single-column layout

// Elegant Breathing Exercise with Glassmorphic Design
const BreathingExercise = () => {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale')
  const [count, setCount] = useState(4)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (!isActive) return

    const timer = setInterval(() => {
      setCount(prev => {
        if (prev === 1) {
          setPhase(current => {
            if (current === 'inhale') return 'hold'
            if (current === 'hold') return 'exhale'
            return 'inhale'
          })
          return 4
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isActive])

  const phaseConfig = {
    inhale: {
      instruction: 'Breathe in slowly',
      scale: 1.3
    },
    hold: {
      instruction: 'Hold gently',
      scale: 1.3
    },
    exhale: {
      instruction: 'Release slowly',
      scale: 0.7
    }
  }

  const currentPhase = phaseConfig[phase]

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-10 border border-slate-200/60 shadow-lg">
      <div className="text-center">
        <h3 className="text-xl md:text-2xl font-semibold text-slate-800 mb-3 md:mb-4">
          Mindful Breathing
        </h3>
        <p className="text-sm md:text-base text-slate-600 mb-8 md:mb-10 leading-relaxed font-light">
          Follow the rhythm to find your center
        </p>

        {/* Sophisticated breathing circle */}
          <div className="relative w-36 h-36 mx-auto mb-10">
            <motion.div
              className="w-full h-full rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-xl border border-white/60 backdrop-blur-sm"
              animate={{ scale: currentPhase.scale }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            >
              <span className="text-4xl font-bold text-[#335f64] tracking-wider">
                {count}
              </span>
            </motion.div>
          {/* Decorative ring */}
          <div className="absolute inset-0 rounded-full border-2 border-[#335f64]/20 motion-safe:animate-pulse" />
          </div>

        {/* Phase instruction with elegant typography */}
        <div className="mb-8">
          <p className="text-lg font-semibold text-slate-800 mb-2 md:mb-3">
            {currentPhase.instruction}
          </p>
          <p className="text-xs text-slate-500 capitalize font-medium">
            {phase} phase
          </p>
        </div>

        {/* Sophisticated control button */}
        <button
          onClick={() => setIsActive(!isActive)}
          className={`px-6 py-3 rounded-2xl text-xs md:text-sm font-semibold transition-all duration-300 shadow-sm ${
            isActive
              ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-700 hover:from-red-200 hover:to-red-300 border border-red-200/50'
              : 'bg-gradient-to-r from-slate-100 to-slate-200 text-[#335f64] hover:from-slate-200 hover:to-slate-300 border border-slate-200/50'
          }`}
        >
          {isActive ? 'Pause' : 'Resume'}
        </button>
      </div>
    </div>
  )
}

// Affirmations moved to inline microcopy when sending messages

export function ModernSessionScreen({ onNavigate, matchedUser }: ModernSessionScreenProps) {
  // Provide default values for safety
  const therapistName = matchedUser?.name || 'MindWell'

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hello, I'm ${therapistName}. I'm here to listen and support you today. This is a safe space where you can share whatever is on your mind. How are you feeling right now?`,
      sender: 'therapist',
      timestamp: new Date(),
      emotion: 'calm'
    }
  ])

  // Session state management
  const [sessionReady, setSessionReady] = useState(false)
  const [sessionError, setSessionError] = useState<string | null>(null)

  // Initialize chat session with assessment context
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const { data: user } = await supabase.auth.getUser()
        if (user?.user?.id) {
          // Initialize session with user's emotional state
          await ChatPersonalizationService.initializeSession(user.user.id, sessionMood)
          setSessionReady(true)
          setSessionError(null)
        } else {
          throw new Error('User not authenticated')
        }
      } catch (error) {
        console.error('Failed to initialize chat session:', error)
        setSessionError('Failed to initialize chat session. Please refresh the page.')
        setSessionReady(false)
      }
    }

    initializeChat()
  }, []) // Only run once on mount
  const [inputValue, setInputValue] = useState('')
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [showEndModal, setShowEndModal] = useState(false)
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [currentSuggestion, setCurrentSuggestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [showBreathing, setShowBreathing] = useState(false)
  const [showGrounding, setShowGrounding] = useState(false)
  const [showJournal, setShowJournal] = useState(false)
  const [showInlineAffirmation, setShowInlineAffirmation] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef<any>(null)

  // --- START: Informed Welcome Message Logic ---
  useEffect(() => {
    // Only run on initial component mount if there are no messages
    if (messages.length === 0) {
      const fetchWelcomeMessage = async () => {
        setIsLoading(true)
        try {
          const { data, error } = await supabase.functions.invoke('chat-ai', {
            body: {
              message: 'initial_welcome',
              conversationHistory: [], // Empty history triggers the welcome message
            },
          })

          if (error) throw error

          if (data && data.isWelcomeMessage) {
            const welcomeMessage: Message = {
              id: `welcome-${Date.now()}`,
              text: data.response,
              sender: 'therapist',
              timestamp: new Date(),
              emotion: 'hopeful', // A welcoming, positive emotion
            }
            setMessages([welcomeMessage])
          }
        } catch (err) {
          console.error('Error fetching welcome message:', err)
          // Optionally, set an error message in the UI
        } finally {
          setIsLoading(false)
        }
      }

      fetchWelcomeMessage()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array ensures this runs only once
  // --- END: Informed Welcome Message Logic ---
  const [currentEmotion, setCurrentEmotion] = useState<'calm' | 'anxious' | 'sad' | 'hopeful' | 'neutral'>('neutral')
  const [placeholder, setPlaceholder] = useState(getRandomPlaceholder())
  const [sessionMood, setSessionMood] = useState<'calm' | 'anxious' | 'sad' | 'hopeful' | 'neutral'>('neutral')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)



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
    if (inputValue === '' && lastMessage && lastMessage.sender === 'therapist') {
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

  // Removed rotating sidebar affirmations in focused layout

  // Enhanced emotion detection
  const detectEmotion = (text: string): 'calm' | 'anxious' | 'sad' | 'hopeful' | 'neutral' => {
    const lowerText = text.toLowerCase()
    if (lowerText.includes('anxious') || lowerText.includes('worried') || lowerText.includes('stressed') || lowerText.includes('panic')) return 'anxious'
    if (lowerText.includes('sad') || lowerText.includes('depressed') || lowerText.includes('down') || lowerText.includes('cry')) return 'sad'
    if (lowerText.includes('better') || lowerText.includes('hopeful') || lowerText.includes('good') || lowerText.includes('happy')) return 'hopeful'
    if (lowerText.includes('calm') || lowerText.includes('peaceful') || lowerText.includes('relaxed') || lowerText.includes('serene')) return 'calm'
    return 'neutral'
  }


  const getResponseEmotion = (userEmotion: string): 'calm' | 'hopeful' | 'neutral' => {
    if (userEmotion === 'anxious' || userEmotion === 'sad') return 'calm'
    if (userEmotion === 'hopeful') return 'hopeful'
    return 'neutral'
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const detectedEmotion = detectEmotion(inputValue)
    setCurrentEmotion(detectedEmotion)
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
      // Check if session is ready
      if (!sessionReady) {
        throw new Error('Chat session is still initializing. Please wait a moment.')
      }

      // Use ChatPersonalizationService for dynamic AI responses
      const aiResponse = await ChatPersonalizationService.sendMessage(inputValue, detectedEmotion)

      // Handle crisis detection
      if (aiResponse.isCrisis) {
        console.warn('Crisis detected in user message')
        // Could add additional crisis handling here
      }

      const newMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.response,
        sender: 'therapist',
        timestamp: new Date(),
        emotion: aiResponse.emotionalTone as 'calm' | 'anxious' | 'sad' | 'hopeful' | 'neutral'
      }

      setMessages(prev => [...prev, newMessage])
      setIsTyping(false)
    } catch (error) {
      console.error('Chat error:', error)

      // Enhanced fallback with better error handling
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
    const secs = (seconds % 60).toString().padStart(2, '0')
    return `${mins}:${secs}`
  }

  const handleEndSession = () => {
    setShowEndModal(false)
    onNavigate('dashboard')
  }

  return (
    <div className="min-h-screen max-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden flex flex-col">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating curved lines */}
        <div className="absolute top-20 left-10 w-32 h-32 border-l-2 border-t-2 border-slate-400/15 rounded-tl-full" />
        <div className="absolute top-40 right-20 w-24 h-24 border-r-2 border-b-2 border-slate-500/20 rounded-br-full" />

        {/* Organic therapy symbols */}
        <div className="absolute top-16 right-1/4 w-16 h-16">
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <path
              d="M32 8 Q48 16 56 32 Q48 48 32 56 Q16 48 8 32 Q16 16 32 8 Z"
              fill="#335f64"
              opacity="0.06"
            />
          </svg>
        </div>

        {/* Flowing emotional healing waves */}
        <div className="absolute bottom-32 left-1/4 w-48 h-24">
          <svg viewBox="0 0 192 96" fill="none" className="w-full h-full">
            <path
              d="M0 48 Q32 24 64 48 T128 48 T192 48"
              stroke="#335f64"
              strokeWidth="1.5"
              fill="none"
              opacity="0.08"
            />
            <path
              d="M0 56 Q32 32 64 56 T128 56 T192 56"
              stroke="#335f64"
              strokeWidth="1"
              fill="none"
              opacity="0.06"
            />
          </svg>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full flex-1 relative z-10 flex flex-col overflow-hidden"
      >
        {/* Single-column, session-focused layout (no local header to avoid conflicts) */}
        <div className="flex-1 flex flex-col min-h-0 max-h-full overflow-hidden">

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${therapeuticPalette.backgrounds[sessionMood]} min-h-0 max-h-full overflow-hidden`}>
            <div className="flex-1 overflow-y-auto p-2 md:p-3 xl:p-4 max-w-4xl mx-auto w-full min-h-0" role="log" aria-live="polite" aria-relevant="additions">
              <div className="space-y-2 md:space-y-3">
                <AnimatePresence mode="popLayout">
                  {messages.map((message) => (
                    <TherapeuticMessage key={message.id} message={message} />
                  ))}
                </AnimatePresence>

                {/* Inline supportive microcopy */}
                <AnimatePresence mode="wait">
                  {showInlineAffirmation && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.3 }}
                      className="flex justify-center my-2 md:my-3"
                    >
                      <div className="px-2.5 py-1 rounded-full bg-white/70 backdrop-blur-sm border border-slate-200/60 text-slate-600 text-xs flex items-center gap-1.5 shadow-sm">
                        <span className="material-symbols-outlined text-sm text-[#335f64]">favorite</span>
                        <span className="italic">{showInlineAffirmation}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Sophisticated Typing Indicator */}
                <AnimatePresence mode="wait">
                  {isTyping && (
                    <motion.div
                      className="flex justify-start mb-2 md:mb-3"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-md border border-white/50 backdrop-blur-sm">
                          <span className="material-symbols-outlined text-[#335f64] text-lg md:text-xl">psychology</span>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm px-2.5 py-2 md:px-3 md:py-2.5 rounded-xl border border-slate-200/60 shadow-sm">
                          <div className="flex items-center gap-2">
                            {[0, 1, 2].map((i) => (
                              <div
                                key={i}
                                className="w-2 h-2 bg-[#335f64] rounded-full motion-safe:animate-pulse opacity-60"
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

                {/* Gentle suggestions */}
                <AnimatePresence mode="wait">
                  {showSuggestion && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="pt-2"
                    >
                      <button
                        onClick={() => {
                          setInputValue(currentSuggestion + ' ')
                          setShowSuggestion(false)
                        }}
                        className="inline-flex items-center gap-2.5 text-xs text-slate-700 hover:text-slate-800 px-4 py-2 bg-white/80 hover:bg-white border border-slate-200/60 rounded-full transition-all duration-300 font-medium shadow-sm hover:shadow-md"
                      >
                        <span className="text-sm">💭</span>
                        <span>{currentSuggestion}</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={chatEndRef} className="h-2" />
              </div>
            </div>

            {/* Bottom dock: Wellness Tools + Input */}
            <div className="border-t border-slate-200/60 bg-white/90 backdrop-blur-sm flex-shrink-0">
              <div className="max-w-4xl mx-auto w-full p-2 md:p-3 xl:p-4">
                <div className="space-y-1.5 md:space-y-2">
                  <div className="flex items-center justify-between gap-2 md:gap-3">
                    <button
                      onClick={() => {
                        const next = !toolsOpen
                        setToolsOpen(next)
                        track('tools_toggle', { open: next })
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white/70 hover:bg-white text-slate-700 text-xs font-medium shadow-sm transition-all duration-200"
                    >
                      <span className="material-symbols-outlined text-sm md:text-base">spa</span>
                      <span>Wellness Tools</span>
                      <span className="material-symbols-outlined text-sm md:text-base">{toolsOpen ? 'expand_less' : 'expand_more'}</span>
                    </button>
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <div className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200/70">
                        {formatTime(timeElapsed)}
                      </div>
                      <button
                        onClick={() => setShowEndModal(true)}
                        onMouseDown={() => track('session_end_click')}
                        aria-label="End Session"
                        title="End Session"
                        className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors text-xs font-medium"
                      >
                        End Session
                      </button>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {toolsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2 md:gap-3 flex-wrap"
                      >
                                              <button
                        onClick={() => { setShowBreathing(true); track('tool_open', { tool: 'breathing' }) }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/80 hover:bg-white border border-slate-200/60 shadow-sm text-slate-700 text-xs transition-all duration-200"
                      >
                        <span className="material-symbols-outlined text-sm">self_improvement</span>
                        <span>Breathing</span>
                      </button>
                        <button
                          onClick={() => { setShowGrounding(true); track('tool_open', { tool: 'grounding' }) }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/80 hover:bg-white border border-slate-200/60 shadow-sm text-slate-700 text-xs transition-all duration-200"
                        >
                          <span className="material-symbols-outlined text-sm">spa</span>
                          <span>Grounding</span>
                        </button>
                        <button
                          onClick={() => { setShowJournal(true); track('tool_open', { tool: 'journal' }) }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/80 hover:bg-white border border-slate-200/60 shadow-sm text-slate-700 text-xs transition-all duration-200"
                        >
                          <span className="material-symbols-outlined text-sm">edit_note</span>
                          <span>Journal</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-end gap-2 md:gap-3">
                    <div className="flex-1">
                      <textarea
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                        placeholder="Share what's on your mind..."
                        className="w-full border border-slate-300/60 rounded-lg md:rounded-xl px-2.5 md:px-4 py-2 md:py-2.5 resize-none focus:ring-2 focus:ring-[#335f64]/30 focus:border-[#335f64]/50 transition-all duration-300 outline-none bg-white/90 backdrop-blur-sm text-slate-800 placeholder:text-slate-500 font-normal text-sm md:text-base shadow-sm"
                        rows={1}
                        style={{ minHeight: '44px', maxHeight: '88px' }}
                        disabled={isTyping}
                      />
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <button
                        className={`p-2 md:p-2.5 rounded-lg md:rounded-xl border transition-all duration-200 ${isRecording ? 'border-[#335f64] bg-emerald-50 text-[#335f64]' : 'border-slate-300 bg-white/70 text-slate-700'} hover:bg-white shadow-sm`}
                        aria-label="Voice input"
                        aria-pressed={isRecording}
                        onClick={() => {
                          // Setup recognition
                          const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
                          if (!SpeechRecognition) {
                            setShowInlineAffirmation('Voice input is not supported in this browser.')
                            setTimeout(() => setShowInlineAffirmation(null), 4000)
                            return
                          }
                          if (!recognitionRef.current) {
                            recognitionRef.current = new SpeechRecognition()
                            recognitionRef.current.continuous = false
                            recognitionRef.current.lang = 'en-US'
                            recognitionRef.current.interimResults = false
                            recognitionRef.current.maxAlternatives = 1
                            recognitionRef.current.onresult = (event: any) => {
                              const transcript = event.results[0][0].transcript
                              setInputValue(prev => (prev ? prev + ' ' : '') + transcript)
                            }
                            recognitionRef.current.onend = () => {
                              setIsRecording(false)
                              track('voice_stop')
                            }
                          }
                          if (!isRecording) {
                            try {
                              recognitionRef.current.start()
                              setIsRecording(true)
                              track('voice_start')
                            } catch (e) {
                              console.warn('Voice start failed', e)
                            }
                          } else {
                            try {
                              recognitionRef.current.stop()
                            } catch (e) {
                              console.warn('Voice stop failed', e)
                            }
                          }
                        }}
                      >
                        <span className="material-symbols-outlined text-base md:text-lg">{isRecording ? 'stop_circle' : 'mic'}</span>
                      </button>
                      <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isTyping || !sessionReady}
                        className={`p-2.5 md:p-3 rounded-lg md:rounded-xl transition-all duration-300 shadow-md border ${
                          inputValue.trim() && !isTyping && sessionReady
                            ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-white hover:from-slate-800 hover:to-slate-900 border-slate-600/30 hover:shadow-lg transform hover:scale-105'
                            : 'bg-slate-200/80 text-slate-400 cursor-not-allowed border-slate-200/60'
                        }`}
                      >
                        <span className="material-symbols-outlined text-base md:text-lg">
                          {isTyping ? 'hourglass_empty' : !sessionReady ? 'sync' : 'send'}
                        </span>
                      </button>
                    </div>
                  </div>
                  {/* Session status indicator */}
                  {!sessionReady && !sessionError && (
                    <div className="text-center py-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs">
                        <div className="w-3 h-3 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin"></div>
                        <span>Setting up conversation space...</span>
                      </div>
                    </div>
                  )}

                  {sessionError && (
                    <div className="text-center py-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs">
                        <span className="material-symbols-outlined text-sm">error</span>
                        <span>{sessionError}</span>
                      </div>
                    </div>
                  )}

                  <div className="text-center pt-1">
                    <p className="text-xs text-slate-600">🔒 Private & secure</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Sophisticated End Session Modal */}
      <AnimatePresence>
        {showEndModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 md:p-10 max-w-lg w-full text-center shadow-2xl border border-slate-200/60"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg border border-white/60">
                <span className="material-symbols-outlined text-[#335f64] text-4xl">psychology</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-semibold text-slate-800 mb-3 md:mb-4">Complete Your Session?</h2>
              <p className="text-slate-600 mb-8 md:mb-10 text-base leading-relaxed font-light">
                You've shared <span className="font-semibold text-slate-800">{formatTime(timeElapsed)}</span> of meaningful conversation.
              </p>

              {/* Elegant Session Summary */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-6 md:p-8 mb-8 md:mb-10 border border-slate-200/40">
                <div className="flex items-center justify-center gap-8 md:gap-10 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-slate-800 text-xl md:text-2xl mb-1">{messages.length}</div>
                    <div className="text-slate-600 font-medium tracking-wide">Messages</div>
                  </div>
                  <div className="w-px h-12 bg-gradient-to-b from-slate-300 to-transparent"></div>
                  <div className="text-center">
                    <div className="font-bold text-slate-800 text-xl md:text-2xl mb-1 capitalize">{sessionMood}</div>
                    <div className="text-slate-600 font-medium tracking-wide">Mood</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-6">
                <button
                  onClick={() => setShowEndModal(false)}
                  className="flex-1 py-4 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 text-sm font-semibold rounded-2xl transition-all duration-300 hover:from-slate-200 hover:to-slate-300 shadow-sm hover:shadow-md"
                >
                  Continue
                </button>
                <button
                  onClick={handleEndSession}
                  className="flex-1 py-4 bg-gradient-to-r from-slate-700 to-slate-800 text-white text-sm font-semibold rounded-2xl transition-all duration-300 hover:from-slate-800 hover:to-slate-900 shadow-lg hover:shadow-xl"
                >
                  End Session
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200/60">
                <p className="text-xs text-slate-600 font-medium">
                  Your progress will be saved automatically
                </p>
                <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-[#335f64] to-transparent mx-auto mt-4 opacity-60" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Wellness Tool Modals */}
      <AnimatePresence>
        {showBreathing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowBreathing(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.25 }}
              className="max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <BreathingExercise />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGrounding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowGrounding(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.25 }}
            className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 md:p-8 max-w-md w-full text-center border border-slate-200/60 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto mb-4 flex items-center justify-center border border-white/60">
                <span className="material-symbols-outlined text-[#335f64] text-2xl">spa</span>
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-slate-800 mb-2">5-4-3-2-1 Grounding</h3>
              <p className="text-slate-600 text-sm md:text-base mb-5">Notice 5 things you can see, 4 you can feel, 3 you can hear, 2 you can smell, and 1 you can taste.</p>
              <button
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 text-sm font-semibold border border-slate-200/60"
                onClick={() => setShowGrounding(false)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showJournal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowJournal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.25 }}
            className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 md:p-8 max-w-lg w-full border border-slate-200/60 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg md:text-xl font-semibold text-slate-800 mb-2">Gentle Journal</h3>
              <p className="text-slate-600 text-sm md:text-base mb-3">Write anything that comes up for you right now.</p>
              <textarea className="w-full rounded-2xl border border-slate-300/60 p-3 bg-white/90 outline-none focus:ring-2 focus:ring-[#335f64]/30 focus:border-[#335f64]/50 text-slate-800 text-sm md:text-base" rows={5} placeholder="Let your thoughts flow..." />
              <div className="mt-4 flex justify-end gap-3">
                <button className="px-4 py-2 rounded-2xl border border-slate-300 bg-white/70 text-slate-700 text-sm" onClick={() => setShowJournal(false)}>Close</button>
                <button className="px-4 py-2 rounded-2xl bg-gradient-to-r from-slate-700 to-slate-800 text-white text-sm">Save</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
    </div>
  )
}
