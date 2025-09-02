/**
 * Glassmorphic SessionScreen - Complete Redesign
 * Ethereal glassmorphism with therapeutic UX
 */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import {
  glassmorphicPalette,
  glassStyles,
  glassVariants,
  glassAnimations,
  glassLayout
} from '@/styles/glassmorphic-design-system'
import { TherapeuticMessage, EmotionalState, SessionParticipant, SessionUser } from '@/types/session'

// Glassmorphic Message Bubble Component
interface GlassMessageBubbleProps {
  message: TherapeuticMessage
  isUser: boolean
  emotionalState: EmotionalState
}

function GlassMessageBubble({ message, isUser, emotionalState }: GlassMessageBubbleProps) {
  const [isHovered, setIsHovered] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useTransform(mouseY, [-50, 50], [5, -5])
  const rotateY = useTransform(mouseX, [-50, 50], [-5, 5])

  const getGlassColor = () => {
    if (isUser) {
      switch (emotionalState) {
        case 'calm': return 'rgba(16, 185, 129, 0.15)'
        case 'anxious': return 'rgba(245, 158, 11, 0.12)'
        case 'overwhelmed': return 'rgba(239, 68, 68, 0.12)'
        case 'hopeful': return 'rgba(139, 92, 246, 0.12)'
        default: return glassmorphicPalette.glass.primary
      }
    }
    return glassmorphicPalette.glass.secondary
  }

  return (
    <motion.div
      className={`flex mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        mouseX.set(e.clientX - rect.left - rect.width / 2)
        mouseY.set(e.clientY - rect.top - rect.height / 2)
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className={`max-w-xs md:max-w-md px-6 py-4 rounded-2xl backdrop-blur-xl border ${
          isUser ? 'ml-auto' : 'mr-auto'
        }`}
        style={{
          background: getGlassColor(),
          borderColor: isUser ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.3)',
          boxShadow: isUser
            ? '0 8px 32px rgba(16, 185, 129, 0.15), 0 1px 0 rgba(255, 255, 255, 0.2) inset'
            : '0 8px 32px rgba(0, 0, 0, 0.08), 0 1px 0 rgba(255, 255, 255, 0.3) inset',
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          transformStyle: 'preserve-3d'
        }}
        whileHover={{
          scale: 1.02,
          backdropFilter: 'blur(24px)',
          transition: { duration: 0.3 }
        }}
      >
        <p className={`text-sm leading-relaxed ${
          isUser ? 'text-white' : 'text-gray-800'
        }`}>
          {message.content}
        </p>

        {/* Message timestamp */}
        <div className={`text-xs mt-2 ${
          isUser ? 'text-emerald-100' : 'text-gray-500'
        }`}>
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>

        {/* Emotional indicator */}
        {message.emotionalTone && (
          <motion.div
            className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-xs">
              {message.emotionalTone === 'calming' ? '😌' :
               message.emotionalTone === 'empathetic' ? '🤝' :
               message.emotionalTone === 'supportive' ? '💙' : '💭'}
            </span>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}

// Glassmorphic Floating Panel Component
interface GlassPanelProps {
  children: React.ReactNode
  className?: string
  size?: 'small' | 'medium' | 'large'
  position?: 'floating' | 'overlay' | 'modal'
}

function GlassPanel({ children, className = '', size = 'medium', position = 'floating' }: GlassPanelProps) {
  const getPanelStyles = () => {
    const baseStyles = {
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      background: glassmorphicPalette.glass.primary,
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 1px 0 rgba(255, 255, 255, 0.3) inset'
    }

    switch (position) {
      case 'floating':
        return {
          ...baseStyles,
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12), 0 2px 0 rgba(255, 255, 255, 0.2) inset, 0 -1px 0 rgba(0, 0, 0, 0.05) inset'
        }
      case 'overlay':
        return {
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          background: glassmorphicPalette.glass.tertiary,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06), 0 1px 0 rgba(255, 255, 255, 0.15) inset'
        }
      case 'modal':
        return {
          ...baseStyles,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 1px 0 rgba(255, 255, 255, 0.3) inset'
        }
      default:
        return baseStyles
    }
  }

  return (
    <motion.div
      className={`${glassVariants.panelSizes[size]} ${className}`}
      style={getPanelStyles()}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      whileHover={{ scale: 1.02 }}
    >
      {children}
    </motion.div>
  )
}

// Glassmorphic Ambient Orbs Component
function AmbientOrbs() {
  return (
    <>
      <motion.div
        className="absolute top-20 right-20 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
          filter: 'blur(40px)'
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 8,
          repeat: Infinity
        }}
      />

      <motion.div
        className="absolute bottom-32 left-16 w-64 h-64 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%)',
          filter: 'blur(30px)'
        }}
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.2, 0.5, 0.2]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          delay: 2
        }}
      />

      <motion.div
        className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 70%)',
          filter: 'blur(25px)'
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.4, 0.1]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          delay: 4
        }}
      />
    </>
  )
}

// Glassmorphic Emotional Aura Component
interface EmotionalAuraProps {
  emotionalState: EmotionalState
  intensity?: number
}

function EmotionalAura({ emotionalState, intensity = 0.5 }: EmotionalAuraProps) {
  const getAuraColor = () => {
    switch (emotionalState) {
      case 'calm':
        return `rgba(16, 185, 129, ${intensity * 0.15})`
      case 'anxious':
        return `rgba(245, 158, 11, ${intensity * 0.12})`
      case 'overwhelmed':
        return `rgba(239, 68, 68, ${intensity * 0.12})`
      case 'hopeful':
        return `rgba(139, 92, 246, ${intensity * 0.12})`
      case 'sad':
        return `rgba(59, 130, 246, ${intensity * 0.1})`
      default:
        return `rgba(107, 114, 128, ${intensity * 0.08})`
    }
  }

  return (
    <motion.div
      className="absolute inset-0 rounded-3xl"
      style={{
        background: `radial-gradient(circle at center, ${getAuraColor()} 0%, transparent 70%)`,
        filter: 'blur(20px)'
      }}
      animate={{
        scale: [1, 1.05, 1],
        opacity: [0.3, 0.6, 0.3]
      }}
      transition={{
        duration: 4,
        repeat: Infinity
      }}
    />
  )
}

// Main Glassmorphic SessionScreen Component
interface GlassmorphicSessionScreenProps {
  matchedUser: SessionParticipant
  user: SessionUser
  onNavigate: (screen: string) => void
}

export function GlassmorphicSessionScreen({
  matchedUser,
  user,
  onNavigate
}: GlassmorphicSessionScreenProps) {
  const [messages, setMessages] = useState<TherapeuticMessage[]>([
    {
      id: '1',
      content: `Hello! I'm ${matchedUser.user.name}. I'm here to listen and support you. What's on your mind today?`,
      sender: matchedUser.user,
      timestamp: new Date(),
      type: 'text',
      emotionalTone: 'empathetic'
    }
  ])

  const [currentMessage, setCurrentMessage] = useState('')
  const [emotionalState, setEmotionalState] = useState<EmotionalState>('calm')
  const [isTyping, setIsTyping] = useState(false)
  const [sessionDuration, setSessionDuration] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionDuration(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Mock AI response simulation
  const simulateResponse = (userMessage: string) => {
    setIsTyping(true)

    // Detect emotional state from message
    const lowerMessage = userMessage.toLowerCase()
    let detectedEmotion: EmotionalState = 'calm'

    if (lowerMessage.includes('anxious') || lowerMessage.includes('worried')) {
      detectedEmotion = 'anxious'
    } else if (lowerMessage.includes('overwhelmed') || lowerMessage.includes('too much')) {
      detectedEmotion = 'overwhelmed'
    } else if (lowerMessage.includes('hope') || lowerMessage.includes('better')) {
      detectedEmotion = 'hopeful'
    } else if (lowerMessage.includes('sad') || lowerMessage.includes('down')) {
      detectedEmotion = 'sad'
    }

    setEmotionalState(detectedEmotion)

    setTimeout(() => {
      const responses = [
        "I hear you. That sounds really challenging. Can you tell me more about what's been weighing on you?",
        "Thank you for sharing that with me. It takes courage to open up about these feelings.",
        "I can sense how important this is to you. Let's explore this together.",
        "Your feelings are completely valid. There's no right or wrong way to feel about this.",
        "I'm here with you in this moment. Take your time - there's no rush."
      ]

      const aiResponse: TherapeuticMessage = {
        id: `ai_${Date.now()}`,
        content: responses[Math.floor(Math.random() * responses.length)],
        sender: matchedUser.user,
        timestamp: new Date(),
        type: 'text',
        emotionalTone: detectedEmotion === 'anxious' ? 'calming' :
                     detectedEmotion === 'overwhelmed' ? 'supportive' :
                     detectedEmotion === 'hopeful' ? 'encouraging' : 'empathetic'
      }

      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 2000 + Math.random() * 2000) // 2-4 second delay
  }

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return

    const newMessage: TherapeuticMessage = {
      id: `user_${Date.now()}`,
      content: currentMessage.trim(),
      sender: user,
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, newMessage])
    const messageToSend = currentMessage
    setCurrentMessage('')

    // Simulate AI response
    simulateResponse(messageToSend)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
    const secs = (seconds % 60).toString().padStart(2, '0')
    return `${mins}:${secs}`
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Glassmorphic Background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(236, 254, 255, 0.8) 0%, rgba(249, 250, 251, 0.6) 50%, rgba(255, 255, 255, 0.4) 100%)',
          backdropFilter: 'blur(100px)'
        }}
      />

      {/* Ambient Orbs */}
      <AmbientOrbs />

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Glassmorphic Header */}
        <motion.header
          className="relative p-6 backdrop-blur-xl"
          style={{
            background: glassmorphicPalette.glass.primary,
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {/* Session Info */}
            <div className="flex items-center space-x-4">
              <motion.div
                className="w-12 h-12 rounded-2xl backdrop-blur-xl flex items-center justify-center"
                style={{
                  background: glassmorphicPalette.therapeutic.serenity,
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <span className="text-2xl">💙</span>
              </motion.div>
              <div>
                <h1 className="text-xl font-light text-gray-800">Therapeutic Session</h1>
                <p className="text-sm text-gray-600">Safe space for healing</p>
              </div>
            </div>

            {/* Session Controls */}
            <div className="flex items-center space-x-4">
              {/* Session Timer */}
              <GlassPanel size="small" position="overlay">
                <div className="text-center">
                  <div className="text-lg font-light text-gray-800">{formatTime(sessionDuration)}</div>
                  <div className="text-xs text-gray-600">Session Time</div>
                </div>
              </GlassPanel>

              {/* Listener Info */}
              <GlassPanel size="small" position="floating">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-sm">👤</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{matchedUser.user.name}</div>
                    <div className="text-xs text-gray-600">Active Listener</div>
                  </div>
                </div>
              </GlassPanel>

              {/* End Session Button */}
              <motion.button
                className="px-4 py-2 rounded-xl backdrop-blur-xl text-red-600 font-medium"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)'
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('/dashboard')}
              >
                End Session
              </motion.button>
            </div>
          </div>
        </motion.header>

        {/* Chat Area */}
        <div className="flex-1 relative">
          <div className="max-w-4xl mx-auto h-full flex flex-col">
            {/* Messages Container */}
            <motion.div
              className="flex-1 p-6 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <GlassMessageBubble
                      key={message.id}
                      message={message}
                      isUser={message.sender.id === user.id}
                      emotionalState={emotionalState}
                    />
                  ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    className="flex justify-start mb-6"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <GlassPanel size="small" position="overlay">
                      <div className="flex items-center space-x-3">
                        <motion.div
                          className="w-2 h-2 rounded-full bg-emerald-500"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                        <motion.div
                          className="w-2 h-2 rounded-full bg-emerald-500"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-2 h-2 rounded-full bg-emerald-500"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        />
                        <span className="text-sm text-gray-600 ml-2">Thinking...</span>
                      </div>
                    </GlassPanel>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </motion.div>

            {/* Emotional Aura Overlay */}
            <EmotionalAura emotionalState={emotionalState} intensity={0.3} />

            {/* Input Area */}
            <motion.div
              className="p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <GlassPanel size="medium" position="floating" className="max-w-4xl mx-auto">
                <div className="flex items-end space-x-4">
                  {/* Message Input */}
                  <div className="flex-1">
                    <textarea
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Share what's on your mind... Take your time."
                      className="w-full p-4 rounded-xl backdrop-blur-sm resize-none focus:outline-none"
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: glassmorphicPalette.text.primary
                      }}
                      rows={3}
                    />
                  </div>

                  {/* Send Button */}
                  <motion.button
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim()}
                    className="p-3 rounded-xl backdrop-blur-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: currentMessage.trim()
                        ? glassmorphicPalette.therapeutic.trust
                        : glassmorphicPalette.interactive.disabled,
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                    }}
                    whileHover={currentMessage.trim() ? { scale: 1.05 } : {}}
                    whileTap={currentMessage.trim() ? { scale: 0.95 } : {}}
                  >
                    <span className="text-xl">✨</span>
                  </motion.button>
                </div>

                {/* Privacy Notice */}
                <div className="mt-4 text-center">
                  <span className="text-xs text-gray-500">
                    This conversation is private and secure • Your safety matters
                  </span>
                </div>
              </GlassPanel>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GlassmorphicSessionScreen
