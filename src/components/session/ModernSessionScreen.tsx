'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { CHAT_CONFIG, detectMood, getRandomPlaceholder, getRandomSuggestion } from '@/lib/chat-config'
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
  matchedUser: { name: string }
}

// Enhanced therapeutic color palette with improved contrast
const therapeuticPalette = {
  backgrounds: {
    calm: 'bg-emerald-50',
    anxious: 'bg-orange-50',
    sad: 'bg-blue-50',
    hopeful: 'bg-green-50',
    neutral: 'bg-slate-50'
  },
  messages: {
    calm: 'bg-white border-emerald-200 shadow-sm',
    anxious: 'bg-white border-orange-200 shadow-sm',
    sad: 'bg-white border-blue-200 shadow-sm',
    hopeful: 'bg-white border-green-200 shadow-sm',
    neutral: 'bg-white border-slate-200 shadow-sm'
  },
  accents: {
    calm: 'text-emerald-700',
    anxious: 'text-orange-700',
    sad: 'text-blue-700',
    hopeful: 'text-green-700',
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

// Enhanced Therapeutic Message Component
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
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
    >
      {/* Therapist Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 mr-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-emerald-600 text-xl">psychology</span>
          </div>
        </div>
      )}

      <div className={`max-w-sm ${isUser ? 'max-w-md' : 'max-w-lg'}`}>
        {/* Message Bubble */}
        <div className={`px-5 py-4 rounded-3xl ${
          isUser
            ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-lg'
            : `${messageStyle}`
        }`}>
          <p className={`text-base leading-relaxed font-medium ${
            isUser ? 'text-white' : 'text-slate-800'
          }`}>
            {message.text}
          </p>
          
          {/* Timestamp */}
          <div className={`mt-3 pt-2 border-t ${
            isUser ? 'border-slate-600/60' : 'border-slate-200/60'
          }`}>
            <span className={`text-xs font-medium ${
              isUser ? 'text-slate-300' : 'text-slate-500'
            }`}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0 ml-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-slate-600 text-xl">person</span>
          </div>
        </div>
      )}
    </motion.div>
  )
}

// Enhanced Comfort Zone Component
const ComfortZone = ({ currentAffirmation }: { currentAffirmation: number }) => {
  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-emerald-50 border-r border-slate-200 flex flex-col justify-center items-center p-8">
      <div className="text-center max-w-sm">
        {/* Comforting icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
          <span className="material-symbols-outlined text-emerald-600 text-3xl">favorite</span>
        </div>

        {/* Rotating affirmations */}
        <div className="h-24 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentAffirmation}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="text-xl font-semibold text-slate-800 leading-relaxed text-center"
            >
              "{therapeuticAffirmations[currentAffirmation]}"
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Gentle breathing indicator */}
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-3 text-slate-600">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Breathe gently</span>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

// Minimal Breathing Exercise Component
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
      scale: 1.2
    },
    hold: {
      instruction: 'Hold gently',
      scale: 1.2
    },
    exhale: {
      instruction: 'Release slowly',
      scale: 0.8
    }
  }

  const currentPhase = phaseConfig[phase]

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
      <div className="text-center">
        <h3 className="text-xl font-bold text-slate-900 mb-3">
          Mindful Breathing
        </h3>
        <p className="text-base text-slate-600 mb-8">
          Follow the rhythm to find your center
        </p>

        {/* Enhanced breathing circle */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <motion.div
            className="w-full h-full rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center shadow-sm"
            animate={{ scale: currentPhase.scale }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            <span className="text-3xl font-bold text-emerald-700">
              {count}
            </span>
          </motion.div>
        </div>

        {/* Phase instruction */}
        <div className="mb-6">
          <p className="text-lg font-semibold text-slate-900 mb-2">
            {currentPhase.instruction}
          </p>
          <p className="text-sm text-slate-600 capitalize font-medium">
            {phase} phase
          </p>
        </div>

        {/* Control button */}
        <button
          onClick={() => setIsActive(!isActive)}
          className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
            isActive
              ? 'bg-red-100 text-red-700 hover:bg-red-200 shadow-sm'
              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 shadow-sm'
          }`}
        >
          {isActive ? 'Pause' : 'Resume'}
        </button>
      </div>
    </div>
  )
}

// Therapeutic affirmations for the comfort zone
const therapeuticAffirmations = [
  "You are safe here",
  "Your feelings are valid",
  "Take your time, there's no rush",
  "You are worthy of care and support",
  "It's okay to feel what you're feeling",
  "You are not alone in this journey",
  "Your healing matters",
  "You have the strength within you",
  "This too shall pass",
  "You deserve peace and comfort",
  "Your story is important",
  "You are enough, just as you are"
]

export function ModernSessionScreen({ onNavigate, matchedUser }: ModernSessionScreenProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hello, I'm ${matchedUser.name}. I'm here to listen and support you today. This is a safe space where you can share whatever is on your mind. How are you feeling right now?`,
      sender: 'therapist',
      timestamp: new Date(),
      emotion: 'calm'
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [showEndModal, setShowEndModal] = useState(false)
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [currentSuggestion, setCurrentSuggestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

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
  const [showBreathing, setShowBreathing] = useState(false)
  const [placeholder, setPlaceholder] = useState(getRandomPlaceholder())
  const [sessionMood, setSessionMood] = useState<'calm' | 'anxious' | 'sad' | 'hopeful' | 'neutral'>('neutral')
  const [currentAffirmation, setCurrentAffirmation] = useState(0)
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

  // Affirmation rotation system
  useEffect(() => {
    const affirmationTimer = setInterval(() => {
      setCurrentAffirmation(prev => (prev + 1) % therapeuticAffirmations.length)
    }, 4500) // Change every 4.5 seconds

    return () => clearInterval(affirmationTimer)
  }, [])

  // Enhanced emotion detection
  const detectEmotion = (text: string): 'calm' | 'anxious' | 'sad' | 'hopeful' | 'neutral' => {
    const lowerText = text.toLowerCase()
    if (lowerText.includes('anxious') || lowerText.includes('worried') || lowerText.includes('stressed') || lowerText.includes('panic')) return 'anxious'
    if (lowerText.includes('sad') || lowerText.includes('depressed') || lowerText.includes('down') || lowerText.includes('cry')) return 'sad'
    if (lowerText.includes('better') || lowerText.includes('hopeful') || lowerText.includes('good') || lowerText.includes('happy')) return 'hopeful'
    if (lowerText.includes('calm') || lowerText.includes('peaceful') || lowerText.includes('relaxed') || lowerText.includes('serene')) return 'calm'
    return 'neutral'
  }

  const getTherapeuticResponse = (emotion: string): string => {
    const responses = {
      anxious: "I can hear that you're feeling anxious right now. That's completely understandable. Let's take this one step at a time. What's one small thing that might help you feel a bit more grounded?",
      sad: "I'm here with you in this difficult moment. Your feelings are valid, and it's okay to sit with them. You don't have to carry this alone. What would feel most supportive right now?",
      hopeful: "I'm so glad to hear there's some hope in your voice. That takes real strength. What's helping you feel this way? Let's explore what's working for you.",
      calm: "It sounds like you're in a peaceful space right now. That's wonderful. How can we build on this feeling of calm?",
      neutral: "Thank you for sharing that with me. I'm here to listen and support you. What would be most helpful to explore together right now?"
    }
    return responses[emotion as keyof typeof responses] || responses.neutral
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
    setInputValue('')
    setIsTyping(true)

    // Enhanced AI therapy function call
    try {
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: inputValue,
          emotion: detectedEmotion,
          conversationHistory: messages.slice(-CHAT_CONFIG.ai.conversationHistoryLength).map(m => ({
            sender: m.sender,
            text: m.text
          }))
        }
      })

      const responseText = error ? getTherapeuticResponse(detectedEmotion) : data.response

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'therapist',
        timestamp: new Date(),
        emotion: getResponseEmotion(detectedEmotion)
      }

      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('AI Error:', error)
      const fallbackResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getTherapeuticResponse(detectedEmotion),
        sender: 'therapist',
        timestamp: new Date(),
        emotion: 'calm'
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
    onNavigate('dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full h-full"
      >
        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 h-screen">

          {/* Left Column - Comfort Zone (1/4 width) */}
          <div className="lg:col-span-1 hidden lg:block">
            <ComfortZone currentAffirmation={currentAffirmation} />
          </div>

          {/* Right Column - Chat Interface (3/4 width) */}
          <div className="lg:col-span-3 flex flex-col h-full bg-white">

            {/* Main Chat Area */}
            <div className="flex-1 flex">

              {/* Messages Area */}
              <div className="flex-1 flex flex-col">

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-8">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <TherapeuticMessage key={message.id} message={message} />
                    ))}
                  </AnimatePresence>

                  {/* Enhanced Typing Indicator */}
                  {isTyping && (
                    <motion.div
                      className="flex justify-start mb-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center shadow-sm">
                          <span className="material-symbols-outlined text-emerald-600 text-xl">psychology</span>
                        </div>
                        <div className="bg-white px-5 py-4 rounded-3xl border border-slate-200 shadow-sm">
                          <div className="flex items-center gap-2">
                            {[0, 1, 2].map((i) => (
                              <div
                                key={i}
                                className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"
                                style={{ animationDelay: `${i * 0.2}s` }}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-slate-600 mt-2 font-medium">
                            {matchedUser?.name} is typing...
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Suggestion */}
                <AnimatePresence>
                  {showSuggestion && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="px-8 pt-2"
                    >
                      <button
                        onClick={() => {
                          setInputValue(currentSuggestion + ' ')
                          setShowSuggestion(false)
                        }}
                        className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 rounded-full transition-colors font-medium"
                      >
                        <span>💭</span>
                        <span>{currentSuggestion}</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Enhanced Input Area */}
                <div className="border-t border-slate-200 p-8 bg-white">
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <textarea
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                        placeholder="Share what's on your mind..."
                        className="w-full border border-slate-300 rounded-3xl px-6 py-4 resize-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all duration-200 outline-none bg-white text-slate-900 placeholder:text-slate-500 font-medium text-base"
                        rows={1}
                        style={{ minHeight: '56px', maxHeight: '120px' }}
                        disabled={isTyping}
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isTyping}
                      className={`p-4 rounded-3xl transition-all duration-200 shadow-sm ${
                        inputValue.trim() && !isTyping
                          ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-white hover:from-slate-800 hover:to-slate-900'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {isTyping ? 'hourglass_empty' : 'send'}
                      </span>
                    </button>
                  </div>
                  <p className="text-center text-sm text-slate-600 mt-4 font-medium">
                    🔒 Your conversation is private and secure
                  </p>
                </div>
              </div>

              {/* Enhanced Sidebar */}
              <div className="w-72 border-l border-slate-200 bg-slate-50 p-6 space-y-6 overflow-y-auto">

                {/* Breathing Exercise */}
                <AnimatePresence>
                  {showBreathing && <BreathingExercise />}
                </AnimatePresence>

                {/* Therapeutic Tools */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Tools</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowBreathing(!showBreathing)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl text-base font-medium transition-all duration-200 ${
                        showBreathing
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl">self_improvement</span>
                      <span>Breathing</span>
                    </button>

                    <button className="w-full flex items-center gap-4 p-4 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-base font-medium transition-all duration-200">
                      <span className="material-symbols-outlined text-xl">spa</span>
                      <span>Grounding</span>
                    </button>

                    <button className="w-full flex items-center gap-4 p-4 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-base font-medium transition-all duration-200">
                      <span className="material-symbols-outlined text-xl">edit_note</span>
                      <span>Journal</span>
                    </button>

                    {/* End Session Button */}
                    <button
                      onClick={() => setShowEndModal(true)}
                      className="w-full flex items-center gap-4 p-4 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-base font-medium transition-all duration-200 border border-red-200"
                    >
                      <span className="material-symbols-outlined text-xl">logout</span>
                      <span>End Session</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Enhanced End Session Modal */}
      <AnimatePresence>
        {showEndModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-slate-200"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <span className="material-symbols-outlined text-emerald-600 text-3xl">psychology</span>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-3">Complete Your Session?</h2>
              <p className="text-slate-600 mb-8 text-base">
                You've shared <span className="font-semibold text-slate-900">{formatTime(timeElapsed)}</span> of meaningful conversation.
              </p>

              {/* Session summary */}
              <div className="bg-slate-50 rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-center gap-8 text-base">
                  <div className="text-center">
                    <div className="font-bold text-slate-900 text-xl">{messages.length}</div>
                    <div className="text-slate-600 font-medium">Messages</div>
                  </div>
                  <div className="w-px h-8 bg-slate-300"></div>
                  <div className="text-center">
                    <div className="font-bold text-slate-900 text-xl capitalize">{sessionMood}</div>
                    <div className="text-slate-600 font-medium">Mood</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowEndModal(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-700 font-semibold rounded-2xl transition-all duration-200 hover:bg-slate-200"
                >
                  Continue
                </button>
                <button
                  onClick={handleEndSession}
                  className="flex-1 py-4 bg-gradient-to-r from-slate-700 to-slate-800 text-white font-semibold rounded-2xl transition-all duration-200 hover:from-slate-800 hover:to-slate-900 shadow-sm"
                >
                  End Session
                </button>
              </div>

              <p className="text-sm text-slate-600 mt-6 font-medium">
                Your progress will be saved automatically
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
    </div>
  )
}
