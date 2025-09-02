'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, X, Clock } from 'lucide-react'
import { ListenerPresence } from './ListenerPresence'

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
        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${isUser ? 'bg-purple-400/20 text-purple-100 rounded-br-none' : 'bg-white/5 text-gray-300 rounded-bl-none'}`}>
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
  // Set a single, calming theme for the session
  const theme = 'from-gray-900 via-purple-900 to-blue-900'
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
      
      // Simple mood detection based on message content
      // This is a basic implementation - in a real app, this would use NLP
      const lowerContent = inputValue.toLowerCase()
      if (lowerContent.includes('sad') || lowerContent.includes('unhappy') || lowerContent.includes('down')) {
        setSelectedMood('sad')
      } else if (lowerContent.includes('anxious') || lowerContent.includes('worry') || lowerContent.includes('stress')) {
        setSelectedMood('anxious')
      } else if (lowerContent.includes('angry') || lowerContent.includes('upset') || lowerContent.includes('frustrat')) {
        setSelectedMood('angry')
      } else if (lowerContent.includes('overwhelm') || lowerContent.includes('too much') || lowerContent.includes('can\'t handle')) {
        setSelectedMood('overwhelmed')
      } else if (lowerContent.includes('hope') || lowerContent.includes('better') || lowerContent.includes('improve')) {
        setSelectedMood('hopeful')
      }

      // Call AI therapy function
      setTimeout(async () => {
        try {
          // Import Supabase client
          const { createClient } = await import('@supabase/supabase-js')
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          )

          // Call the Edge Function
          const { data, error } = await supabase.functions.invoke('chat-ai', {
            body: {
              message: inputValue,
              conversationHistory: messages.slice(-3).map(m => ({
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

          // Log usage for cost tracking
          if (data.usage) {
            console.log('AI Usage:', data.usage)
          }

        } catch (error) {
          console.error('AI Error:', error)

          // Fallback response
          const fallbackResponse: Message = {
            id: Date.now() + 1,
            text: 'Thank you for sharing that. Tell me more.',
            sender: 'other',
          }
          setMessages(prev => [...prev, fallbackResponse])
          setInteractionCount(c => c + 1)
        }
      }, 1000)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
    const secs = (seconds % 60).toString().padStart(2, '0')
    return `${mins}:${secs}`
  }

  return (
    <div className={`min-h-screen flex flex-row bg-gradient-to-br ${theme} text-white font-sans relative overflow-hidden bg-[length:200%_200%] animate-breathing-gradient`}>

      {/* Left Panel: Listener Presence */}
      <div className="w-1/2 h-screen sticky top-0">
        <ListenerPresence interactionCount={interactionCount} selectedMood={selectedMood} />
      </div>

      {/* Right Panel: Chat UI */}
      <div className="w-1/2 flex flex-col h-screen">
        <AnimatePresence>
          {showIntroCard && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, transition: { duration: 0.5 } }}
              className="absolute top-4 right-4 w-[90%] max-w-md bg-black/30 backdrop-blur-lg border border-white/10 rounded-xl p-4 text-center z-20">
              <p className="font-light text-gray-200">
                <span className="font-semibold text-white">{matchedUser?.name || 'Your listener'}</span> is here to listen without judgment. You’re safe here.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-white/10 backdrop-blur-sm shrink-0">
          <div>
            <p className="text-sm text-gray-400">You're with</p>
            <p className="font-bold text-lg">{matchedUser?.name || 'your listener'}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-300 bg-white/5 px-3 py-1 rounded-full">
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeElapsed)}</span>
            </div>
            <button onClick={() => setShowEndModal(true)} className="px-4 py-2 text-sm bg-purple-500/20 hover:bg-purple-500/40 text-purple-200 rounded-full transition-colors">
              Close Space
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
        <footer className="p-4 border-t border-white/10 backdrop-blur-sm shrink-0">
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
              className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 resize-none focus:ring-1 focus:ring-purple-300/70 focus:outline-none transition-all duration-300 h-12 min-h-[48px] max-h-32"
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
      </div>

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
