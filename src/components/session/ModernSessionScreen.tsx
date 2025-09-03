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

// Enhanced therapeutic color palette with sophisticated gradients
const therapeuticPalette = {
  backgrounds: {
    calm: 'from-blue-50/80 via-indigo-50/60 to-purple-50/40',
    anxious: 'from-amber-50/80 via-orange-50/60 to-red-50/40',
    sad: 'from-slate-50/80 via-gray-50/60 to-blue-50/40',
    hopeful: 'from-emerald-50/80 via-green-50/60 to-teal-50/40',
    neutral: 'from-brand-green-50/80 via-blue-50/60 to-indigo-50/40'
  },
  messages: {
    calm: 'from-blue-100/90 to-indigo-100/80',
    anxious: 'from-amber-100/90 to-orange-100/80',
    sad: 'from-slate-100/90 to-gray-100/80',
    hopeful: 'from-emerald-100/90 to-green-100/80',
    neutral: 'from-white/95 to-blue-50/90'
  },
  accents: {
    calm: 'bg-blue-500',
    anxious: 'bg-amber-500',
    sad: 'bg-slate-500',
    hopeful: 'bg-emerald-500',
    neutral: 'bg-brand-green-500'
  }
}

// Animation variants for enhanced micro-interactions
const messageVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
    filter: 'blur(4px)'
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
      mass: 0.8
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: { duration: 0.2 }
  }
}

const buttonVariants = {
  idle: { scale: 1, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  hover: {
    scale: 1.02,
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
    transition: { type: 'spring' as const, stiffness: 400, damping: 25 }
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 }
  }
}

// Enhanced Therapeutic Message Component
const TherapeuticMessage = ({ message }: { message: Message }) => {
  const isUser = message.sender === 'user'
  const emotion = message.emotion || 'neutral'
  const messageGradient = therapeuticPalette.messages[emotion]
  const accentColor = therapeuticPalette.accents[emotion]

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 group`}
    >
      {/* Enhanced Therapist Avatar */}
      {!isUser && (
        <motion.div
          className="flex-shrink-0 mr-4"
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <div className="relative">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-green-400 to-brand-green-600 flex items-center justify-center shadow-xl border-2 border-white/50 backdrop-blur-sm`}>
              <span className="material-symbols-outlined text-white text-xl">psychology</span>
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white shadow-lg">
              <div className="w-full h-full bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </motion.div>
      )}

      <div className={`max-w-md ${isUser ? 'max-w-sm' : 'max-w-lg'}`}>
        {/* Enhanced Message Bubble */}
        <motion.div
          whileHover={{ y: -2, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={`relative px-7 py-5 rounded-3xl backdrop-blur-xl border transition-all duration-500 group-hover:shadow-2xl ${
            isUser
              ? 'bg-gradient-to-br from-brand-green-500 via-brand-green-600 to-brand-green-700 text-white border-brand-green-400/30 rounded-br-lg shadow-lg shadow-brand-green-500/20'
              : `bg-gradient-to-br ${messageGradient} text-secondary-800 border-white/60 rounded-bl-lg shadow-lg shadow-black/5`
          }`}
        >
          {/* Message content with enhanced typography */}
          <p className={`text-base leading-relaxed font-medium tracking-wide ${
            isUser ? 'text-white' : 'text-secondary-800'
          }`}>
            {message.text}
          </p>

          {/* Enhanced timestamp and emotion section */}
          <div className={`flex items-center justify-between mt-4 pt-3 border-t ${
            isUser ? 'border-brand-green-400/30' : 'border-secondary-200/40'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold tracking-wider uppercase ${
                isUser ? 'text-brand-green-100' : 'text-secondary-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>

              {!isUser && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 500 }}
                  className="flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs text-secondary-400">verified</span>
                </motion.div>
              )}
            </div>

            {/* Enhanced emotion indicator */}
            {message.emotion && !isUser && (
              <motion.div
                className="flex items-center gap-2 px-2 py-1 rounded-full bg-white/50 backdrop-blur-sm"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${accentColor} shadow-sm`}>
                  <div className={`w-full h-full rounded-full ${accentColor} animate-pulse`}></div>
                </div>
                <span className="text-xs font-medium text-secondary-600 capitalize tracking-wide">
                  {message.emotion}
                </span>
              </motion.div>
            )}
          </div>

          {/* Subtle glow effect for user messages */}
          {isUser && (
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-green-400/20 to-transparent pointer-events-none"></div>
          )}
        </motion.div>
      </div>

      {/* Enhanced User Avatar */}
      {isUser && (
        <motion.div
          className="flex-shrink-0 ml-4"
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary-400 via-secondary-500 to-secondary-600 flex items-center justify-center shadow-xl border-2 border-white/50 backdrop-blur-sm">
            <span className="material-symbols-outlined text-white text-lg">person</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

// Comfort Zone Component with Rotating Affirmations
const ComfortZone = ({ currentAffirmation }: { currentAffirmation: number }) => {
  return (
    <div className="h-full bg-gradient-to-br from-blue-50/90 via-indigo-50/80 to-purple-50/70 backdrop-blur-xl border-r border-white/50 flex flex-col justify-center items-center p-8 relative overflow-hidden">
      {/* Subtle background patterns */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-gradient-to-br from-teal-200 to-cyan-200 rounded-full blur-xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-sm">
        {/* Comfort icon */}
        <motion.div
          className="w-20 h-20 bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-400/30"
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <span className="material-symbols-outlined text-white text-3xl">favorite</span>
        </motion.div>

        {/* Rotating affirmations */}
        <div className="h-24 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentAffirmation}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              className="text-2xl font-medium text-secondary-800 leading-relaxed text-center tracking-wide"
            >
              "{therapeuticAffirmations[currentAffirmation]}"
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Gentle breathing indicator */}
        <motion.div
          className="mt-8 flex justify-center"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="flex items-center gap-2 text-secondary-600">
            <motion.div
              className="w-2 h-2 bg-blue-400 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="text-sm font-medium">Breathe gently</span>
            <motion.div
              className="w-2 h-2 bg-indigo-400 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// Enhanced Breathing Exercise Component
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
      color: 'from-blue-400 via-cyan-400 to-teal-400',
      instruction: 'Breathe in slowly',
      icon: 'air',
      scale: 1.3,
      glow: 'shadow-blue-400/50'
    },
    hold: {
      color: 'from-purple-400 via-violet-400 to-indigo-400',
      instruction: 'Hold gently',
      icon: 'pause_circle',
      scale: 1.3,
      glow: 'shadow-purple-400/50'
    },
    exhale: {
      color: 'from-emerald-400 via-green-400 to-lime-400',
      instruction: 'Release slowly',
      icon: 'wind_power',
      scale: 0.7,
      glow: 'shadow-emerald-400/50'
    }
  }

  const currentPhase = phaseConfig[phase]

  return (
    <motion.div
      className="bg-gradient-to-br from-white/80 via-white/60 to-white/40 backdrop-blur-xl rounded-3xl p-8 border border-white/60 shadow-2xl"
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, type: 'spring', stiffness: 300 }}
    >
      <div className="text-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xl font-bold text-secondary-900 mb-2 tracking-wide">
            Mindful Breathing
          </h3>
          <p className="text-sm text-secondary-600 mb-8 leading-relaxed">
            Follow the rhythm to find your center
          </p>
        </motion.div>

        {/* Enhanced breathing circle */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          {/* Outer glow ring */}
          <motion.div
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${currentPhase.color} opacity-20 blur-xl ${currentPhase.glow}`}
            animate={{
              scale: currentPhase.scale + 0.2,
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{
              duration: 1,
              ease: "easeInOut",
              opacity: { duration: 2, repeat: Infinity }
            }}
          />

          {/* Main breathing circle */}
          <motion.div
            className={`relative w-full h-full rounded-full bg-gradient-to-br ${currentPhase.color} shadow-2xl ${currentPhase.glow}`}
            animate={{
              scale: currentPhase.scale,
            }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            {/* Inner content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <motion.span
                className="material-symbols-outlined text-2xl mb-1"
                animate={{ rotate: phase === 'hold' ? 0 : 360 }}
                transition={{ duration: 4, ease: "linear", repeat: Infinity }}
              >
                {currentPhase.icon}
              </motion.span>
              <motion.span
                className="text-2xl font-bold"
                key={count}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {count}
              </motion.span>
            </div>

            {/* Ripple effect */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-white/30"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </div>

        {/* Phase instruction */}
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <p className="text-lg font-semibold text-secondary-800 mb-1">
            {currentPhase.instruction}
          </p>
          <p className="text-sm text-secondary-500 capitalize tracking-wider">
            {phase} phase
          </p>
        </motion.div>

        {/* Control button */}
        <motion.button
          onClick={() => setIsActive(!isActive)}
          variants={buttonVariants}
          initial="idle"
          whileHover="hover"
          whileTap="tap"
          className={`px-6 py-3 rounded-2xl font-medium text-sm transition-all duration-300 ${
            isActive
              ? 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-lg shadow-red-400/30'
              : 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white shadow-lg shadow-emerald-400/30'
          }`}
        >
          {isActive ? 'Pause' : 'Resume'}
        </motion.button>
      </div>
    </motion.div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
      {/* Motion wrapper for animations */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full h-full"
      >
        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 h-screen">

          {/* Left Column - Comfort Zone (1/3 width) */}
          <div className="lg:col-span-1 hidden lg:block">
            <ComfortZone currentAffirmation={currentAffirmation} />
          </div>

          {/* Right Column - Chat Interface (2/3 width) */}
          <div className="lg:col-span-2 flex flex-col h-full bg-gradient-to-br from-white/80 to-blue-50/60 backdrop-blur-xl">



            {/* Main Chat Area with Sidebar */}
            <div className="flex-1 flex">

              {/* Messages Area */}
              <div className="flex-1 flex flex-col">

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-secondary-200 scrollbar-track-transparent">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <TherapeuticMessage key={message.id} message={message} />
                    ))}
                  </AnimatePresence>

                  {/* Enhanced Typing Indicator */}
                  {isTyping && (
                    <motion.div
                      className="flex justify-start"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center gap-4">
                        <motion.div
                          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-green-400 to-brand-green-600 flex items-center justify-center shadow-xl"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <span className="material-symbols-outlined text-white text-xl">psychology</span>
                        </motion.div>
                        <div className="bg-gradient-to-br from-white/95 to-blue-50/90 backdrop-blur-xl px-6 py-4 rounded-3xl rounded-bl-lg shadow-xl border border-white/60">
                          <div className="flex items-center gap-2">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-3 h-3 bg-gradient-to-br from-brand-green-400 to-brand-green-500 rounded-full"
                                animate={{
                                  scale: [1, 1.2, 1],
                                  opacity: [0.5, 1, 0.5]
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  delay: i * 0.2
                                }}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-secondary-500 mt-2 font-medium">
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

                {/* Enhanced Input Area with Prominent Styling */}
                <div className="border-t-2 border-white/40 p-6 bg-gradient-to-r from-white/70 to-white/50 backdrop-blur-xl shadow-lg">
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <textarea
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                        placeholder="Share what's on your mind... I'm here to listen with care and understanding."
                        className="w-full border-3 border-secondary-300/80 rounded-3xl px-6 py-4 resize-none focus:ring-4 focus:ring-brand-green-300/60 focus:border-brand-green-500 transition-all duration-300 outline-none bg-white/95 backdrop-blur-sm text-secondary-900 placeholder:text-secondary-500 shadow-2xl shadow-secondary-900/20"
                        rows={1}
                        style={{
                          minHeight: '56px',
                          maxHeight: '120px',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        }}
                        disabled={isTyping}
                      />
                    </div>
                    <motion.button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isTyping}
                      variants={buttonVariants}
                      initial="idle"
                      whileHover={inputValue.trim() && !isTyping ? "hover" : "idle"}
                      whileTap={inputValue.trim() && !isTyping ? "tap" : "idle"}
                      className={`p-4 rounded-3xl transition-all duration-300 shadow-2xl ${
                        inputValue.trim() && !isTyping
                          ? 'bg-gradient-to-br from-brand-green-500 to-brand-green-600 text-white shadow-brand-green-500/40 hover:shadow-brand-green-500/60 border-2 border-brand-green-400'
                          : 'bg-secondary-200 text-secondary-400 cursor-not-allowed shadow-secondary-200/40 border-2 border-secondary-300'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {isTyping ? 'hourglass_empty' : 'send'}
                      </span>
                    </motion.button>
                  </div>
                  <p className="text-center text-xs text-secondary-500 mt-4 font-medium">
                    🔒 Your conversation is private and secure
                  </p>
                </div>
              </div>

              {/* Sidebar within right column */}
              <div className="w-80 border-l border-white/50 bg-white/40 backdrop-blur-xl p-6 space-y-6 overflow-y-auto">

                {/* Breathing Exercise */}
                <AnimatePresence>
                  {showBreathing && <BreathingExercise />}
                </AnimatePresence>

                {/* Therapeutic Tools */}
                <motion.div
                  className="bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-xl rounded-2xl p-4 border border-white/60 shadow-lg"
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <h3 className="text-lg font-bold text-secondary-900 mb-4 tracking-wide">Therapeutic Tools</h3>
                  <div className="space-y-3">
                    <motion.button
                      onClick={() => setShowBreathing(!showBreathing)}
                      variants={buttonVariants}
                      initial="idle"
                      whileHover="hover"
                      whileTap="tap"
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 text-sm ${
                        showBreathing
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30'
                          : 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">self_improvement</span>
                      <span className="font-medium">Breathing</span>
                    </motion.button>

                    <motion.button
                      variants={buttonVariants}
                      initial="idle"
                      whileHover="hover"
                      whileTap="tap"
                      className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 text-emerald-700 rounded-xl transition-all duration-300 text-sm"
                    >
                      <span className="material-symbols-outlined text-lg">spa</span>
                      <span className="font-medium">Grounding</span>
                    </motion.button>

                    <motion.button
                      variants={buttonVariants}
                      initial="idle"
                      whileHover="hover"
                      whileTap="tap"
                      className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 text-purple-700 rounded-xl transition-all duration-300 text-sm"
                    >
                      <span className="material-symbols-outlined text-lg">edit_note</span>
                      <span className="font-medium">Journal</span>
                    </motion.button>

                    {/* End Session Button */}
                    <motion.button
                      onClick={() => setShowEndModal(true)}
                      variants={buttonVariants}
                      initial="idle"
                      whileHover="hover"
                      whileTap="tap"
                      className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-red-700 rounded-xl transition-all duration-300 border border-red-200/50 text-sm"
                    >
                      <span className="material-symbols-outlined text-lg">logout</span>
                      <span className="font-medium">End Session</span>
                    </motion.button>
                  </div>
                </motion.div>
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
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-white/50"
            >
              <motion.div
                className="w-20 h-20 bg-gradient-to-br from-brand-green-400 to-brand-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand-green-500/30"
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <span className="material-symbols-outlined text-white text-3xl">psychology</span>
              </motion.div>

              <h2 className="text-2xl font-bold text-secondary-900 mb-3 tracking-wide">Complete Your Session?</h2>
              <p className="text-secondary-600 mb-8 leading-relaxed text-lg">
                You've shared <span className="font-semibold text-brand-green-600">{formatTime(timeElapsed)}</span> of meaningful conversation.
                Your journey of self-discovery and healing is valuable.
              </p>

              {/* Session summary */}
              <div className="bg-gradient-to-r from-brand-green-50 to-blue-50 rounded-2xl p-4 mb-8">
                <div className="flex items-center justify-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-brand-green-600 text-lg">{messages.length}</div>
                    <div className="text-secondary-600">Messages</div>
                  </div>
                  <div className="w-px h-8 bg-secondary-300"></div>
                  <div className="text-center">
                    <div className="font-bold text-brand-green-600 text-lg capitalize">{sessionMood}</div>
                    <div className="text-secondary-600">Current Mood</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <motion.button
                  onClick={() => setShowEndModal(false)}
                  variants={buttonVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                  className="flex-1 py-4 bg-gradient-to-r from-secondary-100 to-secondary-200 hover:from-secondary-200 hover:to-secondary-300 text-secondary-700 font-semibold rounded-2xl transition-all duration-300 shadow-lg"
                >
                  Continue Session
                </motion.button>
                <motion.button
                  onClick={handleEndSession}
                  variants={buttonVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                  className="flex-1 py-4 bg-gradient-to-r from-brand-green-500 to-brand-green-600 hover:from-brand-green-600 hover:to-brand-green-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg shadow-brand-green-500/30"
                >
                  End Session
                </motion.button>
              </div>

              <p className="text-xs text-secondary-500 mt-4">
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
