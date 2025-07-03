'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, X, Clock } from 'lucide-react'

// --- Helper Components ---
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute bg-white/5 rounded-full"
        initial={{ y: '100%', x: `${Math.random() * 100}%`, opacity: 0 }}
        animate={{ y: '-10%', opacity: [0, 0.5, 0] }}
        transition={{
          duration: Math.random() * 15 + 15,
          repeat: Infinity,
          delay: Math.random() * 10,
          ease: 'linear',
        }}
        style={{ width: `${Math.random() * 4 + 2}px`, height: `${Math.random() * 4 + 2}px` }}
      />
    ))}
  </div>
)

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
      className={`flex my-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${isUser ? 'bg-purple-500/30 text-white rounded-br-none' : 'bg-white/10 text-gray-300 rounded-bl-none'}`}>
        <p className="text-base font-light leading-relaxed">{message.text}</p>
      </div>
    </motion.div>
  )
}

// --- Main Component ---
interface SessionScreenProps {
  onNavigate: (screen: string, params?: any) => void
  matchedUser: { name: string }
}

export function SessionScreen({ onNavigate, matchedUser }: SessionScreenProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [showEndModal, setShowEndModal] = useState(false)
  const [showIntroCard, setShowIntroCard] = useState(true)
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [currentSuggestion, setCurrentSuggestion] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  const themes = {
    default: 'from-gray-900 via-purple-900 to-blue-900',
    calm: 'from-blue-900 via-cyan-800 to-slate-900',
    warmth: 'from-rose-900 via-amber-800 to-stone-900',
    grounding: 'from-emerald-900 via-teal-800 to-slate-900',
  }

  const [activeTheme, setActiveTheme] = useState<keyof typeof themes>('default')

  const placeholders = [
    "Share what you're feeling...",
    'Start with one word, if that’s easier.',
    'No pressure. Just type what’s on your mind.',
    'You don’t have to explain. Just be here.',
  ]
  const [placeholder, setPlaceholder] = useState(placeholders[0])

  const quickTags = ['Overwhelmed', 'Anxious', 'Hopeful', 'Tired']
  const moodIcons = ['🌧️', '😐', '☀️']
  const typingSuggestions = [
    "You could start by telling me how you're feeling today.",
    'Is there something specific that’s weighing on you?',
    'No pressure, just share what comes to mind.',
  ]

  // Initial message from the listener & intro card timer
  useEffect(() => {
    const introTimer = setTimeout(() => setShowIntroCard(false), 8000)

    const messageTimer = setTimeout(() => {
      setMessages([
        {
          id: 1,
          text: `Hey, I'm ${matchedUser?.name || 'here'}. Thanks for reaching out. What's on your mind?`,
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
      setPlaceholder(p => {
        const currentIndex = placeholders.indexOf(p)
        return placeholders[(currentIndex + 1) % placeholders.length]
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Typing suggestion logic
  useEffect(() => {
    setShowSuggestion(false) // Hide on any interaction
    const lastMessage = messages[messages.length - 1]
    if (inputValue === '' && lastMessage && lastMessage.sender === 'other') {
      const suggestionTimer = setTimeout(() => {
        setCurrentSuggestion(typingSuggestions[Math.floor(Math.random() * typingSuggestions.length)])
        setShowSuggestion(true)
      }, 15000) // 15 seconds of inactivity
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

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: Date.now(),
        text: inputValue,
        sender: 'user',
      }
      setMessages(prev => [...prev, newMessage])
      setInputValue('')

      // Mock reply from listener
      setTimeout(() => {
        const reply: Message = {
          id: Date.now() + 1,
          text: 'Thank you for sharing that. Tell me more.',
          sender: 'other',
        }
        setMessages(prev => [...prev, reply])
      }, 2000)
    }
  }

  const handleEndSession = () => {
    setShowEndModal(false)
    // Here you would add logic for session summary, feedback, etc.
    onNavigate('Welcome')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
    const secs = (seconds % 60).toString().padStart(2, '0')
    return `${mins}:${secs}`
  }

  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-br ${themes[activeTheme]} text-white font-sans relative overflow-hidden bg-[length:200%_200%] animate-breathing-gradient`}>
      <FloatingParticles />

      <AnimatePresence>
        {showIntroCard && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.5 } }}
            className="absolute top-20 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-black/30 backdrop-blur-lg border border-white/10 rounded-xl p-4 text-center z-20">
            <p className="font-light text-gray-200">
              <span className="font-semibold text-white">{matchedUser?.name || 'Your listener'}</span> is here to listen without judgment. You’re safe here.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-white/10 backdrop-blur-sm sticky top-0 z-10">
        {/* Left: User Info */}
        <div className="text-left w-1/3">
          <p className="text-sm text-gray-400">You're with</p>
          <p className="font-bold text-lg">{matchedUser?.name || 'your listener'}</p>
        </div>

        {/* Center: Controls */}
        <div className="flex items-center justify-center gap-4 w-1/3">
          <div className="flex items-center gap-2">
            {Object.keys(themes).map(themeKey => (
              <button
                key={themeKey}
                onClick={() => setActiveTheme(themeKey as keyof typeof themes)}
                className={`w-5 h-5 rounded-full transition-all duration-300 ${activeTheme === themeKey ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-white' : 'ring-1 ring-white/20 hover:ring-white/50'}`}
                style={{ background: `linear-gradient(to right, ${themes[themeKey as keyof typeof themes].replace('from-', '').replace('via-', ', ').replace('to-', ', ')})` }}
                aria-label={`Set ${themeKey} theme`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 text-gray-300 bg-white/5 px-3 py-1 rounded-full">
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeElapsed)}</span>
          </div>
        </div>

        {/* Right: End Button */}
        <div className="w-1/3 flex justify-end">
          <button onClick={() => setShowEndModal(true)} className="px-4 py-2 text-sm bg-red-500/20 hover:bg-red-500/40 text-red-200 rounded-full transition-colors">
            End Session
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col p-4 overflow-y-auto">
        <div className="flex-1 space-y-4">
          {messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          <div ref={chatEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="p-4 border-t border-white/10 backdrop-blur-sm sticky bottom-0 z-10">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3 px-2">
          {quickTags.map(tag => (
            <button
              key={tag}
              onClick={() => setInputValue(prev => (prev ? `${prev} ${tag}` : `${tag} `))}
              className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300 hover:bg-white/10 transition-colors">
              {tag}
            </button>
          ))}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2">
            {moodIcons.map(icon => (
              <button
                key={icon}
                onClick={() => setInputValue(prev => `${prev}${icon} `)}
                className="p-1 text-lg rounded-full hover:bg-white/10 transition-colors">
                {icon}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {showSuggestion && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-2 text-center">
              <button
                onClick={() => {
                  setInputValue(currentSuggestion + ' ')
                  setShowSuggestion(false)
                }}
                className="text-sm text-purple-300 hover:text-white transition-colors p-1">
                {currentSuggestion}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3">
          <textarea
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
            placeholder={placeholder}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 resize-none focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-300 h-12 min-h-[48px] max-h-32"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="w-12 h-12 bg-purple-500 hover:bg-purple-400 rounded-full flex items-center justify-center transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-110 disabled:scale-100">
            <Send className="w-6 h-6" />
          </button>
        </div>
        <p className="text-center text-xs text-gray-500 mt-3 px-4">
          This session is private and won’t be saved. You’re in control—end anytime.
        </p>
      </footer>

      {/* End Session Modal */}
      <AnimatePresence>
        {showEndModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-800 border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center">
              <h2 className="text-2xl font-bold mb-4">End this session?</h2>
              <p className="text-gray-400 mb-8">You can always start a new one whenever you're ready.</p>
              <div className="flex gap-4">
                <button onClick={() => setShowEndModal(false)} className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                  Stay
                </button>
                <button onClick={handleEndSession} className="flex-1 py-3 bg-red-500 hover:bg-red-400 text-white font-bold rounded-full transition-colors">
                  End Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
