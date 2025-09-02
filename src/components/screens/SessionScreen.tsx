'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Wallet, Play, Pause, Send, Mic, MicOff, Phone } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface SessionScreenProps {
  onNavigate: (screen: string, params?: Record<string, unknown>) => void
  mood: number
  mode: 'listen' | 'support'
  matchedUser?: { name?: string } | null
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
      setSessionTime((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, sender: 'me', text: message, timestamp: new Date() }
      ])
      setMessage('')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <header className="flex items-center justify-between p-4 border-b border-border-primary bg-surface-primary">
        <button
          onClick={() => onNavigate('Matching', { mood, mode })}
          className="p-2 rounded-lg hover:bg-surface-secondary"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="text-sm font-medium">Session in Progress</p>
          <p className="text-xs text-secondary">
            {formatTime(sessionTime)} • {matchedUser?.name}
          </p>
        </div>
        <button
          onClick={() => onNavigate('Wallet')}
          className="p-2 rounded-lg hover:bg-surface-secondary"
        >
          <Wallet className="w-5 h-5" />
        </button>
      </header>

      <div className="p-4">
        <div className="max-w-md mx-auto flex rounded-lg border border-border-secondary bg-surface-secondary overflow-hidden">
          <button
            onClick={() => setSessionMode('therapist')}
            className={cn(
              'flex-1 py-2 text-sm transition-colors',
              sessionMode === 'therapist'
                ? 'bg-accent text-text-primary'
                : 'text-secondary hover:bg-surface-primary'
            )}
          >
            Therapist
          </button>
          <button
            onClick={() => setSessionMode('friend')}
            className={cn(
              'flex-1 py-2 text-sm transition-colors',
              sessionMode === 'friend'
                ? 'bg-accent text-text-primary'
                : 'text-secondary hover:bg-surface-primary'
            )}
          >
            Friend
          </button>
        </div>
      </div>

      <main className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn('flex', msg.sender === 'me' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-xs px-4 py-2 rounded-lg text-sm',
                  msg.sender === 'me'
                    ? 'bg-accent text-text-primary'
                    : msg.sender === 'system'
                    ? 'bg-surface-secondary text-secondary'
                    : 'bg-surface-primary'
                )}
              >
                <p>{msg.text}</p>
                <span className="block mt-1 text-xs text-tertiary">
                  {msg.timestamp instanceof Date
                    ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : msg.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>

        <Card className="p-6 text-center space-y-4">
          <h3 className="font-medium">Mindful Breathing</h3>
          <div className="flex justify-center">
            <motion.div
              animate={isBreathing ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center"
            >
              <div className="w-12 h-12 rounded-full bg-accent" />
            </motion.div>
          </div>
          <p className="text-secondary">
            {isBreathing ? 'Breathe in... Hold... Breathe out' : 'Ready to breathe?'}
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsBreathing((prev) => !prev)}
            className="mx-auto"
          >
            {isBreathing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
        </Card>
      </main>

      <footer className="p-4 border-t border-border-secondary bg-surface-primary">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Share your thoughts..."
            className="flex-1 rounded-lg border border-border-secondary bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMuted((prev) => !prev)}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSendMessage}
            disabled={!message.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </footer>

      <div className="p-4">
        <Button
          onClick={() => onNavigate('Wallet')}
          variant="secondary"
          className="w-full flex items-center justify-center gap-2 bg-status-error text-text-primary"
        >
          <Phone className="w-4 h-4" />
          End Session
        </Button>
      </div>
    </div>
  )
}

