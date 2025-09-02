/**
 * Modern SessionScreen - Clean Design with Real AI Integration
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface GlassmorphicSessionScreenProps {
  matchedUser: { user: { id: string; name: string } }
  user: { id: string; name: string }
  onNavigate: (screen: string) => void
}

interface Message {
  id: string
  content: string
  sender: { id: string; name: string }
  timestamp: Date
}

export function GlassmorphicSessionScreen({
  matchedUser,
  user,
  onNavigate
}: GlassmorphicSessionScreenProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hello! I'm ${matchedUser.user.name}. How can I help you today?`,
      sender: matchedUser.user,
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Therapeutic affirmations for the left panel
  const affirmations = [
    {
      text: "You are worthy of love and belonging",
      author: "Brené Brown",
      category: "self-worth"
    },
    {
      text: "Your feelings are valid and important",
      author: "Therapy Wisdom",
      category: "validation"
    },
    {
      text: "It's okay to not be okay sometimes",
      author: "Mental Health Awareness",
      category: "acceptance"
    },
    {
      text: "You are stronger than you know",
      author: "Inner Strength",
      category: "resilience"
    },
    {
      text: "Progress, not perfection",
      author: "Recovery Mindset",
      category: "growth"
    },
    {
      text: "You are not alone in this journey",
      author: "Community Support",
      category: "connection"
    }
  ]

  const [currentAffirmation, setCurrentAffirmation] = useState(0)

  // Rotate affirmations every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAffirmation((prev) => (prev + 1) % affirmations.length)
    }, 10000)
    return () => clearInterval(interval)
  }, [affirmations.length])

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: user,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const messageText = input.trim()
    setInput('')
    setIsTyping(true)

    try {
      // Call Supabase Edge Function for AI response
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: messageText,
          conversationHistory: messages.slice(-3).map(msg => ({
            text: msg.content,
            sender: msg.sender.id === user.id ? 'user' : 'assistant'
          }))
        }
      })

      if (error) throw error

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: matchedUser.user,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('AI Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble responding right now. Please try again.",
        sender: matchedUser.user,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('/')}
              className="group flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors duration-200"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg">
                <span className="text-white font-semibold text-sm">
                  {matchedUser.user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">
                  Therapeutic Session
                </h1>
                <p className="text-sm text-slate-500">
                  {messages.length} messages • Online
                </p>
              </div>
            </div>
          </div>
              </div>
            </div>

      {/* Split-Screen Layout */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto">
        {/* Left Panel - Affirmations */}
        <div className="w-full lg:w-1/3 lg:min-w-[320px] p-4 lg:p-6 border-r border-white/20 lg:border-r">
          <div className="h-full flex flex-col">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Daily Affirmations</h2>
              <p className="text-sm text-slate-600">Positive reminders for your journey</p>
                </div>

            {/* Main Affirmation Card */}
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-sm">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-8 shadow-lg backdrop-blur-sm">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                  </div>
                    <blockquote className="text-lg font-medium text-slate-900 mb-3 leading-relaxed">
                      "{affirmations[currentAffirmation].text}"
                    </blockquote>
                    <cite className="text-sm text-slate-600 font-medium">
                      — {affirmations[currentAffirmation].author}
                    </cite>
                  </div>
                </div>
              </div>
            </div>

            {/* Affirmation Navigation Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {affirmations.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentAffirmation(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentAffirmation
                      ? 'bg-emerald-500 scale-125'
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>

            {/* Breathing Exercise */}
            <div className="mt-8 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl p-4">
              <h3 className="font-medium text-slate-900 mb-2">Quick Breathing Exercise</h3>
              <p className="text-sm text-slate-600 mb-3">
                Take a deep breath in for 4 counts, hold for 4, exhale for 4.
              </p>
              <div className="flex justify-center gap-1">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
          </div>
        </div>

                {/* Right Panel - Chat Interface */}
        <div className="flex-1 flex flex-col">
            {/* Messages Container */}
          <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 lg:py-6">
            <div className="max-w-2xl mx-auto space-y-4 lg:space-y-6">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender.id === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`group max-w-lg px-6 py-4 rounded-2xl shadow-sm transition-all duration-300 ${
                      message.sender.id === user.id
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-200'
                        : 'bg-white/90 backdrop-blur-sm border border-white/50 text-slate-900 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <p className={`text-sm leading-relaxed ${
                      message.sender.id === user.id ? 'text-white' : 'text-slate-700'
                    }`}>
                      {message.content}
                    </p>
                    <div className={`text-xs mt-3 flex items-center gap-2 ${
                      message.sender.id === user.id ? 'text-blue-100' : 'text-slate-500'
                    }`}>
                      <span>{message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                      {message.sender.id === user.id && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Modern Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/90 backdrop-blur-sm border border-white/50 px-6 py-4 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                        <span className="text-xs font-medium text-slate-600">
                          {matchedUser.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-slate-600 font-medium">Typing...</span>
                    </div>
                  </div>
                </div>
                )}

                <div ref={messagesEndRef} />
              </div>
          </div>

          {/* Modern Input Area */}
          <div className="bg-white/80 backdrop-blur-xl border-t border-white/20 px-4 lg:px-6 py-4 lg:py-6 shadow-lg">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-end gap-4">
                <div className="flex-1 relative">
                    <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                    placeholder="Share what's on your mind..."
                    className="w-full min-h-[52px] max-h-32 resize-none rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm px-4 py-3 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                    disabled={isTyping}
                    rows={1}
                  />
                  {input.length > 0 && (
                    <div className="absolute bottom-2 right-3 text-xs text-slate-400">
                      {input.length}/1000
                  </div>
                  )}
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isTyping}
                  className="group flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:shadow-none"
                >
                  <span>Send</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              <div className="mt-3 text-center">
                <p className="text-xs text-slate-500">
                  Your conversation is private and secure
                </p>
              </div>
                </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GlassmorphicSessionScreen