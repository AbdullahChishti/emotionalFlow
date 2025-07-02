'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Wallet, Play, Pause, Send, Mic, MicOff, Phone, CornerDownLeft } from 'lucide-react'
import SketchbookBackground from '../ui/SketchbookBackground'

// A custom hook to generate a scribbled path for the breathing circle
const useScribbledPath = (radius: number, points: number, randomness: number) => {
  return useMemo(() => {
    let path = ''
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * 2 * Math.PI
      const r = radius + (Math.random() - 0.5) * randomness
      const x = 50 + r * Math.cos(angle)
      const y = 50 + r * Math.sin(angle)
      if (i === 0) {
        path += `M ${x} ${y}`
      } else {
        path += ` L ${x} ${y}`
      }
    }
    return path + ' Z'
  }, [radius, points, randomness])
}

// A component to render the scribbled path
const ScribbledPath = ({ radius, color, strokeWidth, animate }: any) => {
  const path = useScribbledPath(radius, 30, 10)
  return (
    <motion.svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeInOut' }}
      />
      {animate && (
        <motion.path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth * 1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0.5 }}
          animate={{ pathLength: 1, opacity: 0 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </motion.svg>
  )
}

interface SessionScreenProps {
  onNavigate: (screen: string, params?: any) => void
  mood: number
  mode: 'listen' | 'support'
  matchedUser: any
}

export function SessionScreen({ onNavigate, mood, mode, matchedUser }: SessionScreenProps) {
  const [isBreathing, setIsBreathing] = useState(false)
  const [message, setMessage] = useState('')
  const [sessionTime, setSessionTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'system',
      text: `You've connected with ${matchedUser?.name || 'a friend'}.`,
      timestamp: new Date(),
    },
    {
      id: 2,
      sender: 'them',
      text: "Hey, thanks for being here. I've been feeling a bit overwhelmed lately.",
      timestamp: new Date(Date.now() + 1000),
    },
  ])

  useEffect(() => {
    const timer = setInterval(() => setSessionTime((prev) => prev + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, sender: 'me', text: message, timestamp: new Date() },
      ])
      setMessage('')
    }
  }

  const handleEndSession = () => onNavigate('Wallet')

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
    const secs = (seconds % 60).toString().padStart(2, '0')
    return `${mins}:${secs}`
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 font-sans relative">
      <SketchbookBackground />
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-stone-50/80 backdrop-blur-sm border-b border-zinc-200/80 z-10">
        <button onClick={() => onNavigate('Matching', { mood, mode })} className="p-2 text-zinc-600 hover:bg-zinc-200/70 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-medium text-zinc-800">Session</h1>
          <div className="flex items-center justify-center gap-2 mt-0.5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-sm text-zinc-500 font-mono">{formatTime(sessionTime)}</p>
          </div>
        </div>
        <button onClick={() => onNavigate('Wallet')} className="p-2 text-zinc-600 hover:bg-zinc-200/70 rounded-full transition-colors">
          <Wallet className="w-6 h-6" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden p-4 z-0">
        <div className="flex-1 flex flex-col-reverse gap-4 overflow-y-auto pr-2">
          <AnimatePresence initial={false}>
            {messages.slice().reverse().map((msg, index) => (
              <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={`flex w-full ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl relative border ${ msg.sender === 'me'
                    ? 'bg-indigo-50 border-indigo-200/80 text-zinc-800 rounded-br-lg'
                    : 'bg-white/80 border-zinc-200/80 text-zinc-700 rounded-bl-lg' }`}>
                  <p className="text-base leading-relaxed">{msg.text}</p>
                  <p className={`text-xs mt-1.5 ${msg.sender === 'me' ? 'text-indigo-400' : 'text-zinc-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Breathing Exercise & Input */}
        <div className="mt-4 pt-4 border-t border-zinc-200/80">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Breathing Exercise */}
            <div className="hidden md:flex flex-col items-center justify-center p-4 bg-white/60 border border-zinc-200/80 rounded-2xl relative h-full">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <ScribbledPath radius={30} color="#d4d4d8" strokeWidth={1} />
                <motion.div
                  animate={isBreathing ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <ScribbledPath radius={20} color="#818cf8" strokeWidth={1.5} animate={isBreathing} />
                </motion.div>
              </div>
              <button onClick={() => setIsBreathing(!isBreathing)} className="mt-4 px-4 py-2 bg-white border border-zinc-300/80 rounded-full text-sm text-zinc-700 font-medium hover:bg-zinc-100 transition-colors shadow-sm">
                {isBreathing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>

            {/* Message Input */}
            <div className="md:col-span-2 flex flex-col gap-2">
                <div className="flex-1 relative">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                        placeholder="Scribble your thoughts..."
                        className="w-full p-4 pr-12 border border-zinc-300/80 rounded-2xl bg-white/80 resize-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200 shadow-sm text-zinc-800 placeholder-zinc-400 leading-tight"
                        rows={3}
                    />
                    <button onClick={handleSendMessage} disabled={!message.trim()} className="absolute bottom-3 right-3 p-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-full shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-105 transition-all duration-300 disabled:bg-zinc-300 disabled:shadow-none disabled:scale-100">
                        <Send className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsMuted(!isMuted)} className={`p-2 rounded-full transition-colors ${isMuted ? 'bg-red-100 text-red-600' : 'bg-zinc-200/70 text-zinc-600 hover:bg-zinc-300/70'}`}>
                            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </button>
                        <p className="text-xs text-zinc-400">Shift + Enter for new line</p>
                    </div>
                    <button onClick={handleEndSession} className="px-4 py-2 bg-zinc-800 text-white rounded-full text-sm font-medium hover:bg-zinc-900 transition-colors flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>End</span>
                    </button>
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
