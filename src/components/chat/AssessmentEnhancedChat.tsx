/**
 * Assessment-Enhanced Chat Component
 * Demonstrates the complete integration of assessment data with ChatGPT
 */

"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useAssessmentChat } from '@/hooks/useAssessmentChat'
import { PersonalizedRecommendationEngine, PersonalizedRecommendation } from '@/lib/personalized-recommendations'
import { ProgressTrackingService, ConversationAnalysis } from '@/lib/progress-tracking'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface AssessmentEnhancedChatProps {
  className?: string
}

export function AssessmentEnhancedChat({ className = '' }: AssessmentEnhancedChatProps) {
  const {
    session,
    isInitialized,
    initializeSession,
    endSession,
    messages,
    sendMessage,
    isSending,
    hasAssessmentData,
    riskLevel,
    focusAreas,
    recommendations,
    lastAssessed,
    emotionalState,
    setEmotionalState,
    error,
    clearError
  } = useAssessmentChat()

  const [inputMessage, setInputMessage] = useState('')
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<PersonalizedRecommendation[]>([])
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [progressSummary, setProgressSummary] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load personalized recommendations when session is initialized
  useEffect(() => {
    if (isInitialized && session) {
      loadPersonalizedRecommendations()
      loadProgressSummary()
    }
  }, [isInitialized, session])

  const loadPersonalizedRecommendations = async () => {
    if (!session) return

    try {
      const context = {
        userProfile: session.assessmentContext.hasAssessmentData ? {
          // Mock user profile - in real implementation, this would come from the database
          id: session.userId,
          traumaHistory: { aceScore: 0, traumaCategories: [], needsTraumaInformedCare: false },
          currentSymptoms: {
            depression: { level: 'normal', score: 0, needsIntervention: false },
            anxiety: { level: 'normal', score: 0, needsIntervention: false },
            stress: 0
          },
          resilience: { level: 'moderate', score: 25, strengths: [] },
          riskFactors: { suicideRisk: false, crisisIndicators: [], immediateActionNeeded: false },
          preferences: {
            therapyApproach: [],
            copingStrategies: [],
            contentTypes: []
          },
          lastAssessed: new Date()
        } : null,
        currentEmotionalState: emotionalState,
        recentConversations: messages.slice(-5).map(m => m.text),
        userPreferences: {
          therapyApproach: [],
          copingStrategies: [],
          contentTypes: []
        },
        riskLevel: riskLevel as any,
        lastAssessed: lastAssessed
      }

      const recs = PersonalizedRecommendationEngine.generateRecommendations(context)
      setPersonalizedRecommendations(recs)
    } catch (error) {
      console.error('Error loading personalized recommendations:', error)
    }
  }

  const loadProgressSummary = async () => {
    if (!session) return

    try {
      const summary = await ProgressTrackingService.getProgressSummary(session.userId)
      setProgressSummary(summary)
    } catch (error) {
      console.error('Error loading progress summary:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return

    const message = inputMessage.trim()
    setInputMessage('')

    try {
      const response = await sendMessage(message, emotionalState)
      
      // Track conversation for progress analysis
      if (session) {
        const analysis: ConversationAnalysis = {
          sessionId: session.id,
          timestamp: new Date(),
          messageCount: messages.length + 2, // +2 for user message and AI response
          averageSentiment: 0.5, // This would be calculated from sentiment analysis
          emotionalTone: response.emotionalTone,
          crisisIndicators: response.isCrisis ? ['crisis_detected'] : [],
          therapeuticThemes: response.assessmentContext.focusAreas,
          userEngagement: 'high'
        }

        await ProgressTrackingService.trackConversation(session.userId, session.id, analysis)
      }

      // Reload recommendations after conversation
      setTimeout(() => {
        loadPersonalizedRecommendations()
      }, 1000)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'crisis': return 'text-red-600 bg-red-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'moderate': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getEmotionalStateColor = (state: string) => {
    switch (state) {
      case 'anxious': return 'text-yellow-600 bg-yellow-50'
      case 'sad': return 'text-blue-600 bg-blue-50'
      case 'angry': return 'text-red-600 bg-red-50'
      case 'hopeful': return 'text-green-600 bg-green-50'
      case 'calm': return 'text-purple-600 bg-purple-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (!isInitialized) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Initializing personalized chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header with Assessment Context */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Personalized AI Therapy</h2>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(riskLevel)}`}>
              {riskLevel.toUpperCase()} RISK
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEmotionalStateColor(emotionalState)}`}>
              {emotionalState.toUpperCase()}
            </span>
          </div>
        </div>
        
        {hasAssessmentData && (
          <div className="text-sm text-gray-600">
            <p>Assessment Data Available • Last Assessed: {lastAssessed?.toLocaleDateString() || 'Never'}</p>
            <p>Focus Areas: {focusAreas.join(', ')}</p>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center justify-between">
            <p className="text-red-600 text-sm">{error}</p>
            <Button onClick={clearError} variant="ghost" size="sm">
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              {message.sender === 'assistant' && message.assessmentContext && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className={`px-1 py-0.5 rounded ${getEmotionalStateColor(message.emotionalTone || 'neutral')}`}>
                      {message.emotionalTone}
                    </span>
                    {message.isAffirmation && (
                      <span className="px-1 py-0.5 rounded bg-green-100 text-green-600">
                        affirming
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isSending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <LoadingSpinner size="sm" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Emotional State Selector */}
      <div className="p-4 border-t bg-gray-50">
        <div className="mb-3">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            How are you feeling right now?
          </label>
          <div className="flex gap-2 flex-wrap">
            {['neutral', 'anxious', 'sad', 'angry', 'hopeful', 'calm', 'overwhelmed'].map((state) => (
              <button
                key={state}
                onClick={() => setEmotionalState(state)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  emotionalState === state
                    ? getEmotionalStateColor(state)
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {state}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isSending}
            className="px-6"
          >
            {isSending ? <LoadingSpinner size="sm" /> : 'Send'}
          </Button>
        </div>
      </div>

      {/* Personalized Recommendations */}
      <div className="border-t bg-white">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Personalized Recommendations</h3>
            <Button
              onClick={() => setShowRecommendations(!showRecommendations)}
              variant="ghost"
              size="sm"
            >
              {showRecommendations ? 'Hide' : 'Show'} ({personalizedRecommendations.length})
            </Button>
          </div>
          
          {showRecommendations && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {personalizedRecommendations.slice(0, 5).map((rec) => (
                <Card key={rec.id} className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-900">{rec.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{rec.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          rec.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                          rec.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                          rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {rec.priority}
                        </span>
                        <span className="text-xs text-gray-500">{rec.type}</span>
                        {rec.estimatedTime && (
                          <span className="text-xs text-gray-500">{rec.estimatedTime}min</span>
                        )}
                      </div>
                    </div>
                    {rec.actionUrl && (
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Progress Summary */}
      {progressSummary && (
        <div className="border-t bg-gray-50 p-4">
          <h3 className="font-medium text-gray-900 mb-2">Progress Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Conversations:</span>
              <span className="ml-2 font-medium">{progressSummary.totalConversations}</span>
            </div>
            <div>
              <span className="text-gray-600">Avg Sentiment:</span>
              <span className="ml-2 font-medium">
                {progressSummary.averageSentiment.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Overall Trend:</span>
              <span className={`ml-2 font-medium ${
                progressSummary.recentTrends.overall === 'improving' ? 'text-green-600' :
                progressSummary.recentTrends.overall === 'declining' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {progressSummary.recentTrends.overall}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Last Assessment:</span>
              <span className="ml-2 font-medium">
                {progressSummary.lastAssessmentDate?.toLocaleDateString() || 'Never'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AssessmentEnhancedChat
