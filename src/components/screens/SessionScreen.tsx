'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Wallet, Play, Pause, Send, Mic, MicOff, Phone } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface SessionScreenProps {
  onNavigate: (screen: string, params?: any) => void
  mood: number
  mode: 'listen' | 'support'
  matchedUser: any
}

export function SessionScreen({ onNavigate, mood, mode, matchedUser }: SessionScreenProps) {
  const [sessionMode, setSessionMode] = useState<'therapist' | 'friend'>('therapist')
  const [isBreathing, setIsBreathing] = useState(false)
  const [message, setMessage] = useState('')
  const [sessionTime, setSessionTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'system',
      text: `Connected with ${matchedUser?.name}. Session started.`,
      timestamp: new Date()
    }
  ])

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handlePlayBreathing = () => {
    setIsBreathing(!isBreathing)
  }

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        sender: 'me',
        text: message,
        timestamp: new Date()
      }])
      setMessage('')
    }
  }

  const handleEndSession = () => {
    onNavigate('Wallet')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background gradients matching landing page */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-secondary/5" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-accent/10 to-transparent rounded-full blur-3xl" />
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6 bg-white/60 backdrop-blur-sm border-b border-white/20 relative z-10">
        <button
          onClick={() => onNavigate('Matching', { mood, mode })}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
        <div className="text-center">
          <motion.h1
            className="text-lg font-medium text-foreground"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Session in Progress
          </motion.h1>
          <div className="flex items-center justify-center gap-2 mt-1">
            <motion.div
              className="w-2 h-2 bg-green-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <p className="text-sm text-muted-foreground">
              {formatTime(sessionTime)} • {matchedUser?.name}
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('Wallet')}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <Wallet className="w-6 h-6 text-foreground" />
        </button>
      </div>

      {/* Mode Selector */}
      <div className="p-2 md:p-4 relative z-10">
        <motion.div
          className="flex bg-white/40 backdrop-blur-sm rounded-2xl p-1 max-w-sm mx-auto border border-white/30 shadow-lg"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            onClick={() => setSessionMode('therapist')}
            className={`flex-1 py-2 md:py-3 px-2 md:px-4 rounded-xl font-medium transition-all duration-300 relative ${
              sessionMode === 'therapist'
                ? 'bg-gradient-to-r from-primary to-blue-500 text-primary-foreground shadow-lg'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/30'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Therapist Mode
            {sessionMode === 'therapist' && (
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-blue-500/20"
                layoutId="activeMode"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.button>
          <motion.button
            onClick={() => setSessionMode('friend')}
            className={`flex-1 py-2 md:py-3 px-2 md:px-4 rounded-xl font-medium transition-all duration-300 relative ${
              sessionMode === 'friend'
                ? 'bg-gradient-to-r from-primary to-blue-500 text-primary-foreground shadow-lg'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/30'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Friend Mode
            {sessionMode === 'friend' && (
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-blue-500/20"
                layoutId="activeMode"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.button>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Floating Ambient Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary/10 rounded-full"
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.7, 0.3],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.8,
                ease: "easeInOut"
              }}
              style={{
                left: `${20 + i * 20}%`,
                top: `${30 + (i % 2) * 40}%`
              }}
            />
          ))}
        </div>

        {/* Chat Area & Breathing Exercise (scrollable if needed) */}
        <div className="flex-1 flex flex-col gap-4 md:gap-6 p-2 md:p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto w-full">
            <motion.h2
              className="text-center text-muted-foreground mb-4 md:mb-8 font-light text-base md:text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Safe space for emotional connection
            </motion.h2>

            {/* Messages */}
            <div className="space-y-4 md:space-y-6 mb-4 md:mb-8 max-h-48 md:max-h-64 overflow-y-auto pr-2">
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs px-4 md:px-6 py-3 md:py-4 rounded-2xl md:rounded-3xl backdrop-blur-sm border shadow-lg ${
                    msg.sender === 'me'
                      ? 'bg-gradient-to-r from-primary to-blue-500 text-primary-foreground border-primary/20 shadow-primary/20'
                      : msg.sender === 'system'
                      ? 'bg-white/50 text-muted-foreground border-white/30 shadow-gray-200/50'
                      : 'bg-white/70 text-foreground border-white/30 shadow-gray-200/50'
                  }`}>
                    <p className="text-xs md:text-sm leading-relaxed">{msg.text}</p>
                    <div className="text-xs opacity-70 mt-2">
                      {msg.timestamp instanceof Date ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : msg.timestamp}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Breathing Exercise */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.7, type: "spring", bounce: 0.3 }}
              className="bg-white/60 backdrop-blur-sm rounded-2xl md:rounded-3xl p-4 md:p-8 border border-white/30 text-center shadow-xl relative overflow-hidden"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-4 right-4 w-20 md:w-32 h-20 md:h-32 bg-gradient-to-br from-primary to-blue-500 rounded-full blur-3xl" />
                <div className="absolute bottom-4 left-4 w-12 md:w-24 h-12 md:h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full blur-3xl" />
              </div>

              <div className="relative">
                <h3 className="text-lg md:text-xl font-light text-foreground mb-4 md:mb-8">
                  Mindful Breathing
                </h3>

                {/* Beautiful Breathing Visualization */}
                <div className="flex justify-center mb-4 md:mb-8">
                  <div className="relative">
                    {/* Central breathing circle */}
                    <motion.div
                      animate={isBreathing ? {
                        scale: [1, 1.3, 1],
                        opacity: [0.6, 0.9, 0.6]
                      } : {}}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="w-16 md:w-24 h-16 md:h-24 bg-gradient-to-br from-primary/30 to-blue-500/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30"
                    >
                      <motion.div
                        animate={isBreathing ? {
                          scale: [0.8, 1.2, 0.8],
                          rotate: [0, 180, 360]
                        } : {}}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-8 md:w-12 h-8 md:h-12 bg-gradient-to-br from-primary to-blue-500 rounded-full"
                      />
                    </motion.div>

                    {/* Orbiting dots */}
                    {[1, 2, 3, 4, 5, 6].map((dot) => (
                      <motion.div
                        key={dot}
                        animate={isBreathing ? {
                          scale: [0.5, 1, 0.5],
                          opacity: [0.4, 0.8, 0.4]
                        } : {}}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          delay: dot * 0.3,
                          ease: "easeInOut"
                        }}
                        className="absolute w-2 md:w-3 h-2 md:h-3 bg-gradient-to-r from-primary to-blue-500 rounded-full"
                        style={{
                          left: '50%',
                          top: '50%',
                          transform: `translate(-50%, -50%) rotate(${dot * 60}deg) translateY(-32px)`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                <motion.p
                  className="text-foreground font-medium mb-1 md:mb-2 text-base md:text-lg"
                  animate={isBreathing ? { opacity: [0.7, 1, 0.7] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {isBreathing ? 'Breathe In... Hold... Breathe Out' : 'Ready to breathe mindfully'}
                </motion.p>
                <p className="text-muted-foreground text-xs md:text-sm mb-4 md:mb-8 font-light">
                  4 seconds in • 4 seconds hold • 4 seconds out
                </p>

                <motion.button
                  onClick={handlePlayBreathing}
                  className="w-10 md:w-16 h-10 md:h-16 bg-gradient-to-r from-primary to-blue-500 hover:from-violet-500 hover:to-blue-500 text-primary-foreground rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl shadow-primary/30"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={isBreathing ? {
                    boxShadow: [
                      "0 0 20px rgba(139, 92, 246, 0.3)",
                      "0 0 40px rgba(139, 92, 246, 0.6)",
                      "0 0 20px rgba(139, 92, 246, 0.3)"
                    ]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {isBreathing ? <Pause className="w-5 md:w-6 h-5 md:h-6" /> : <Play className="w-5 md:w-6 h-5 md:h-6" />}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Message Input */}
        <div className="p-2 md:p-6 bg-white/60 backdrop-blur-sm border-t border-white/20 z-10">
          <div className="max-w-2xl mx-auto flex gap-2 md:gap-3">
            <div className="flex-1 flex gap-2 md:gap-3">
              <motion.input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Share your thoughts..."
                className="flex-1 px-4 md:px-6 py-3 md:py-4 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder-muted-foreground shadow-lg transition-all duration-300 focus:shadow-xl"
                whileFocus={{ scale: 1.02 }}
              />
              <motion.button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 md:p-4 rounded-xl md:rounded-2xl transition-all duration-300 shadow-lg ${
                  isMuted
                    ? 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-red-300/50'
                    : 'bg-white/70 text-muted-foreground hover:text-foreground shadow-gray-200/50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isMuted ? <MicOff className="w-4 md:w-5 h-4 md:h-5" /> : <Mic className="w-4 md:w-5 h-4 md:h-5" />}
              </motion.button>
            </div>
            <motion.button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-primary to-blue-500 hover:from-violet-500 hover:to-blue-500 disabled:from-gray-300 disabled:to-gray-400 text-primary-foreground rounded-xl md:rounded-2xl transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              whileHover={{ scale: message.trim() ? 1.05 : 1 }}
              whileTap={{ scale: message.trim() ? 0.95 : 1 }}
            >
              <Send className="w-4 md:w-5 h-4 md:h-5" />
            </motion.button>
          </div>
        </div>

        {/* End Session Button */}
        <div className="p-2 md:p-6 bg-background-secondary z-10">
          <div className="max-w-2xl mx-auto">
            <Button
              onClick={handleEndSession}
              variant="secondary"
              className="w-full flex items-center justify-center gap-2 md:gap-3 bg-status-error hover:bg-status-error text-text-primary"
            >
              <Phone className="w-4 md:w-5 h-4 md:h-5" />
              End Session
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
