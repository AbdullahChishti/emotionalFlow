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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
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
                  Chat with {matchedUser.user.name}
                </h1>
                <p className="text-sm text-slate-500">
                  {messages.length} messages • Online
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
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
      <div className="bg-white/80 backdrop-blur-xl border-t border-white/20 px-6 py-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
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
  )
}

export default GlassmorphicSessionScreen