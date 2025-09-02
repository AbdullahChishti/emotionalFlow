/**
 * Enhanced Chat Interface Component
 * Optimized for therapeutic conversations with improved accessibility and UX
 */

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { TherapeuticMessage, TypingSuggestion, LayoutState } from '@/types/session'
import { therapeuticTypography } from '@/styles/session-typography'
import { messageStyling, therapeuticPalette, layoutConfig, therapeuticAnimations } from '@/styles/session-design-system'
import { TherapeuticIcon, AnimatedTherapeuticIcon } from '@/components/ui/icons'
import { CHAT_CONFIG } from '@/lib/chat-config'

interface ChatInterfaceProps {
  messages: TherapeuticMessage[]
  onSendMessage: (content: string) => void
  onReact: (messageId: string, reaction: string) => void
  isTyping: boolean
  suggestions: TypingSuggestion[]
  layout: LayoutState
}

interface MessageBubbleProps {
  message: TherapeuticMessage
  onReact: (messageId: string, reaction: string) => void
  isUser: boolean
}

function MessageBubble({ message, onReact, isUser }: MessageBubbleProps) {
  const [showReactions, setShowReactions] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  const reactions = ['❤️', '💭', '👍', '🙏', '💪']

  const handleReaction = (reaction: string) => {
    onReact(message.id, reaction)
    setShowReactions(false)
  }

  return (
    <motion.div
      initial={therapeuticAnimations.messageSlide.initial}
      animate={therapeuticAnimations.messageSlide.animate}
      transition={therapeuticAnimations.messageSlide.transition}
      className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'} group`}
      onHoverStart={() => !isUser && setShowReactions(true)}
      onHoverEnd={() => setShowReactions(false)}
    >
      <div className="flex flex-col max-w-sm md:max-w-md">
        {/* Message Content */}
        <div
          className={`px-4 py-3 rounded-lg shadow-sm ${
            isUser
              ? `${messageStyling.user.background} ${messageStyling.user.text} ${messageStyling.user.border} ${messageStyling.user.shadow}`
              : `${messageStyling.ai.background} ${messageStyling.ai.text} ${messageStyling.ai.border} ${messageStyling.ai.shadow}`
          }`}
        >
          <p className={therapeuticTypography.message[isUser ? 'user' : 'ai']}>
            {message.content}
          </p>
        </div>

        {/* Message Metadata */}
        <div className={`flex items-center gap-2 mt-1 px-2 ${
          isUser ? 'justify-end' : 'justify-start'
        }`}>
          <span className={therapeuticTypography.body.caption}>
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>

          {/* Reaction Button (for AI messages) */}
          {!isUser && (
            <motion.button
              onClick={() => setShowReactions(!showReactions)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-neutral-100 rounded-full"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Add reaction"
            >
              <TherapeuticIcon name="add" size="xs" />
            </motion.button>
          )}
        </div>

        {/* Reaction Picker */}
        <AnimatePresence>
          {showReactions && !isUser && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.2 }}
              className="flex gap-1 mt-2 p-2 bg-white rounded-full shadow-lg border border-neutral-200"
            >
              {reactions.map((reaction) => (
                <motion.button
                  key={reaction}
                  onClick={() => handleReaction(reaction)}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={`React with ${reaction}`}
                >
                  {reaction}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Existing Reactions Display */}
        {message.reactions && message.reactions.length > 0 && (
          <div className={`flex gap-1 mt-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {message.reactions.map((reaction, index) => (
              <motion.span
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-sm"
              >
                {reaction.emoji}
              </motion.span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function TypingIndicator() {
  return (
    <motion.div
      initial={therapeuticAnimations.fadeIn.initial}
      animate={therapeuticAnimations.fadeIn.animate}
      exit={therapeuticAnimations.fadeIn.initial}
      transition={therapeuticAnimations.fadeIn.transition}
      className="flex mb-4 justify-start"
    >
      <div className="bg-neutral-100 border border-neutral-200 rounded-lg px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <AnimatedTherapeuticIcon name="message" animation="pulse" size="sm" />
          <span className={therapeuticTypography.body.small}>
            Thinking...
          </span>
        </div>
      </div>
    </motion.div>
  )
}

function SuggestionBubble({
  suggestion,
  onClick,
  onDismiss
}: {
  suggestion: TypingSuggestion
  onClick: () => void
  onDismiss: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="mb-4 text-center"
    >
      <div className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full shadow-sm">
        <TherapeuticIcon name="message" size="sm" color="#059669" />
        <button
          onClick={onClick}
          className={`${therapeuticTypography.interactive.primary} hover:underline`}
        >
          {suggestion.text}
        </button>
        <button
          onClick={onDismiss}
          className="p-1 hover:bg-emerald-100 rounded-full transition-colors"
          aria-label="Dismiss suggestion"
        >
          <TherapeuticIcon name="close" size="xs" color="#059669" />
        </button>
      </div>
    </motion.div>
  )
}

export function ChatInterface({
  messages,
  onSendMessage,
  onReact,
  isTyping,
  suggestions,
  layout
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('')
  const [currentSuggestion, setCurrentSuggestion] = useState<TypingSuggestion | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const prefersReducedMotion = useReducedMotion()

  // Auto-scroll to bottom
  useEffect(() => {
    if (!prefersReducedMotion) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, prefersReducedMotion])

  // Handle suggestion cycling
  useEffect(() => {
    if (suggestions.length > 0 && inputValue === '') {
      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)]
      setCurrentSuggestion(randomSuggestion)
    } else {
      setCurrentSuggestion(null)
    }
  }, [suggestions, inputValue])

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim())
      setInputValue('')
      setCurrentSuggestion(null)
      textareaRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSuggestionClick = () => {
    if (currentSuggestion) {
      setInputValue(currentSuggestion.text + ' ')
      setCurrentSuggestion(null)
      textareaRef.current?.focus()
    }
  }

  const handleSuggestionDismiss = () => {
    setCurrentSuggestion(null)
  }

  return (
    <div className={`flex flex-col h-full bg-neutral-50 ${layout.screenSize === 'mobile' ? 'min-h-0' : 'min-h-[calc(100vh-12rem)]'}`}>
      {/* Chat Messages Area */}
      <div className="flex-1 flex flex-col px-6 py-4 overflow-y-auto">
        <div className="flex-1 space-y-4 w-full max-w-4xl mx-auto">
          <AnimatePresence>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onReact={onReact}
                isUser={message.sender.id === 'user'}
              />
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && <TypingIndicator />}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-neutral-200 bg-white px-6 py-4">
        <AnimatePresence>
          {currentSuggestion && (
            <SuggestionBubble
              suggestion={currentSuggestion}
              onClick={handleSuggestionClick}
              onDismiss={handleSuggestionDismiss}
            />
          )}
        </AnimatePresence>

        <div className="w-full max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            {/* Message Input */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={CHAT_CONFIG.placeholders[Math.floor(Math.random() * CHAT_CONFIG.placeholders.length)]}
                className={`w-full border border-neutral-300 rounded-lg px-4 py-3 resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 h-12 min-h-[48px] max-h-32 text-neutral-900 placeholder:text-neutral-500 ${therapeuticTypography.body.regular}`}
                rows={1}
                aria-label="Type your message"
              />

              {/* Character Counter (optional) */}
              {inputValue.length > 100 && (
                <div className="absolute bottom-2 right-3 text-xs text-neutral-400">
                  {inputValue.length}/500
                </div>
              )}
            </div>

            {/* Send Button */}
            <motion.button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 ${
                inputValue.trim()
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
              }`}
              whileHover={inputValue.trim() ? { scale: 1.05 } : {}}
              whileTap={inputValue.trim() ? { scale: 0.95 } : {}}
              aria-label="Send message"
            >
              <TherapeuticIcon name="message" size="lg" />
            </motion.button>
          </div>

          {/* Privacy Notice */}
          <p className={`${therapeuticTypography.body.caption} text-center mt-3 text-neutral-500`}>
            This session is private and secure. Your conversation is not saved.
          </p>
        </div>
      </div>
    </div>
  )
}
