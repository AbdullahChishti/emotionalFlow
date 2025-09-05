/**
 * Chat Service
 * Handles chat operations and conversation management
 */

import { supabase } from '../supabase'
import { AssessmentManager, AssessmentContext } from './AssessmentManager'
import { Database } from '@/types/database'

type ConversationProgressRow = Database['public']['Tables']['conversation_progress']['Row']

export interface ConversationAnalysis {
  sessionId: string
  timestamp: Date
  messageCount: number
  averageSentiment: number // -1 to 1 scale
  emotionalTone: string
  crisisIndicators: string[]
  therapeuticThemes: string[]
  userEngagement: 'low' | 'medium' | 'high'
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sentiment?: number
  themes?: string[]
}

export interface ChatSession {
  id: string
  userId: string
  startedAt: Date
  lastActivity: Date
  messageCount: number
  assessmentContext: AssessmentContext
}

export class ChatService {
  /**
   * Get personalized chat context for a user
   */
  static async getChatContext(userId: string): Promise<AssessmentContext> {
    return await AssessmentManager.getAssessmentContext(userId)
  }

  /**
   * Track conversation progress and analytics
   */
  static async trackConversation(
    userId: string,
    sessionId: string,
    analysis: ConversationAnalysis
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversation_progress')
        .insert({
          user_id: userId,
          session_id: sessionId,
          timestamp: analysis.timestamp.toISOString(),
          message_count: analysis.messageCount,
          average_sentiment: analysis.averageSentiment,
          emotional_tone: analysis.emotionalTone,
          crisis_indicators: analysis.crisisIndicators,
          therapeutic_themes: analysis.therapeuticThemes,
          user_engagement: analysis.userEngagement
        })

      if (error) {
        console.error('Error tracking conversation:', error)
      } else {
        console.log('✅ Conversation progress tracked successfully')
      }
    } catch (error) {
      console.error('Error in trackConversation:', error)
    }
  }

  /**
   * Analyze message sentiment and extract themes
   */
  static analyzeMessage(message: string): {
    sentiment: number
    themes: string[]
    crisisIndicators: string[]
    emotionalTone: string
  } {
    // Simple keyword-based analysis (in production, this would use AI/ML)
    const lowerMessage = message.toLowerCase()

    // Sentiment analysis
    let sentiment = 0
    const positiveWords = ['good', 'great', 'happy', 'better', 'improving', 'thank', 'grateful']
    const negativeWords = ['bad', 'sad', 'angry', 'worried', 'anxious', 'stressed', 'depressed', 'scared']

    positiveWords.forEach(word => {
      if (lowerMessage.includes(word)) sentiment += 0.2
    })
    negativeWords.forEach(word => {
      if (lowerMessage.includes(word)) sentiment -= 0.2
    })

    sentiment = Math.max(-1, Math.min(1, sentiment))

    // Theme extraction
    const themes: string[] = []
    const themeKeywords = {
      anxiety: ['anxious', 'worry', 'panic', 'nervous', 'fear'],
      depression: ['sad', 'depressed', 'hopeless', 'unmotivated', 'tired'],
      trauma: ['trauma', 'ptsd', 'flashback', 'trigger', 'past'],
      stress: ['stress', 'overwhelmed', 'pressure', 'tension'],
      relationships: ['relationship', 'friend', 'family', 'partner', 'lonely'],
      work: ['work', 'job', 'career', 'boss', 'colleague'],
      sleep: ['sleep', 'insomnia', 'tired', 'rest'],
      self_esteem: ['worthless', 'failure', 'confident', 'self-esteem']
    }

    Object.entries(themeKeywords).forEach(([theme, keywords]) => {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        themes.push(theme)
      }
    })

    // Crisis indicators
    const crisisIndicators: string[] = []
    const crisisKeywords = [
      'suicide', 'kill myself', 'end it all', 'not worth living',
      'harm myself', 'die', 'death', 'dead'
    ]

    crisisKeywords.forEach(keyword => {
      if (lowerMessage.includes(keyword)) {
        crisisIndicators.push('suicide_mention')
      }
    })

    // Emotional tone
    let emotionalTone = 'neutral'
    if (sentiment > 0.3) emotionalTone = 'positive'
    else if (sentiment < -0.3) emotionalTone = 'negative'
    else if (themes.includes('anxiety') || themes.includes('stress')) emotionalTone = 'anxious'
    else if (themes.includes('depression')) emotionalTone = 'depressed'

    return {
      sentiment,
      themes,
      crisisIndicators,
      emotionalTone
    }
  }

  /**
   * Generate personalized response based on assessment context
   */
  static generatePersonalizedResponse(
    userMessage: string,
    assessmentContext: AssessmentContext
  ): {
    response: string
    therapeuticThemes: string[]
    safetyProtocols: string[]
    followUpSuggestions: string[]
  } {
    const analysis = this.analyzeMessage(userMessage)
    const { userProfile, riskLevel, personalizedApproach } = assessmentContext

    let response = ''
    const therapeuticThemes: string[] = []
    const safetyProtocols: string[] = []
    const followUpSuggestions: string[] = []

    // Handle crisis situations first
    if (analysis.crisisIndicators.length > 0 || riskLevel === 'high') {
      response = this.generateCrisisResponse()
      safetyProtocols.push('immediate_crisis_support', 'emergency_resources')
      therapeuticThemes.push('crisis_intervention')
      followUpSuggestions.push('contact_professional_help', 'safety_plan')
      return { response, therapeuticThemes, safetyProtocols, followUpSuggestions }
    }

    // Generate response based on assessment context
    if (userProfile?.currentSymptoms.depression.needsIntervention && analysis.themes.includes('depression')) {
      response = this.generateDepressionResponse(userMessage, analysis.sentiment)
      therapeuticThemes.push('depression_support', 'mood_regulation')
      followUpSuggestions.push('mood_tracking', 'behavioral_activation')
    } else if (userProfile?.currentSymptoms.anxiety.needsIntervention && analysis.themes.includes('anxiety')) {
      response = this.generateAnxietyResponse(userMessage, analysis.sentiment)
      therapeuticThemes.push('anxiety_management', 'relaxation_techniques')
      followUpSuggestions.push('breathing_exercises', 'worry_journaling')
    } else if (userProfile?.traumaHistory.needsTraumaInformedCare && analysis.themes.includes('trauma')) {
      response = this.generateTraumaResponse(userMessage, analysis.sentiment)
      therapeuticThemes.push('trauma_informed_care', 'grounding_techniques')
      safetyProtocols.push('trauma_trigger_monitoring')
    } else {
      response = this.generateGeneralResponse(userMessage, analysis.sentiment)
      therapeuticThemes.push('general_support', 'active_listening')
    }

    // Add safety protocols based on risk level
    if (riskLevel === 'medium') {
      safetyProtocols.push('regular_checkins')
    }

    return { response, therapeuticThemes, safetyProtocols, followUpSuggestions }
  }

  /**
   * Generate crisis response
   */
  private static generateCrisisResponse(): string {
    return `I'm really concerned about what you're sharing, and I want you to know that you're not alone. If you're having thoughts of harming yourself or others, please reach out immediately to emergency services or a crisis hotline.

In the US: Call or text 988 (Suicide & Crisis Lifeline)
Internationally: Find local emergency services

I'm here to support you, but for immediate safety concerns, professional crisis intervention is crucial. Would you like me to help you find additional resources or connect you with support services?`
  }

  /**
   * Generate depression-focused response
   */
  private static generateDepressionResponse(message: string, sentiment: number): string {
    if (sentiment < -0.3) {
      return `I can hear how difficult things are feeling right now, and I'm here with you. Depression can make everything feel heavier and more challenging. Based on what you've shared with me about your experiences, I want to acknowledge how brave you are for reaching out.

Sometimes when we're feeling this way, small steps can make a big difference. Would you be open to trying a gentle activity together, like a simple breathing exercise or reflecting on one small thing you're grateful for today?

Remember, these feelings don't define you, and there are effective ways to work through them. You're taking an important step by connecting with support.`
    } else {
      return `It's good to hear from you, and I appreciate you sharing how you're feeling. Even on difficult days, reaching out for support shows real strength. Based on our conversation and your assessment results, I can see you've been working through some challenging experiences.

How are you taking care of yourself today? Sometimes focusing on small, manageable activities can help create some momentum. I'm here to support you however feels most helpful right now.`
    }
  }

  /**
   * Generate anxiety-focused response
   */
  private static generateAnxietyResponse(message: string, sentiment: number): string {
    if (sentiment < -0.3) {
      return `I can sense the anxiety and worry in what you're sharing, and I want you to know that anxiety can feel overwhelming, but there are ways to work with it. Based on our conversation and your assessment results, I understand you've been dealing with significant anxiety symptoms.

Let's try a simple grounding technique together. Can you name 5 things you can see around you right now? This can help bring us back to the present moment when anxiety feels intense.

You're not alone in this, and there are effective strategies that can help. Would you like to explore some anxiety management techniques that have helped others in similar situations?`
    } else {
      return `Thank you for sharing what's on your mind. I can hear that anxiety has been a significant part of your experience, and it's understandable that it comes up in different ways. Based on what you've told me and your assessment results, I can see you've been working hard to manage these feelings.

What coping strategies have you found helpful in the past? Sometimes connecting with our existing strengths can be really powerful. I'm here to support you and explore additional tools if they'd be helpful.`
    }
  }

  /**
   * Generate trauma-informed response
   */
  private static generateTraumaResponse(message: string, sentiment: number): string {
    return `I hear you, and I want to acknowledge the courage it takes to share experiences related to trauma. Based on our conversation and your assessment results, I can see you've been through significant experiences that have impacted you deeply.

Your feelings and reactions make complete sense given what you've been through. There's no "right" way to respond to trauma, and healing happens at your own pace. Would you like to explore some grounding techniques that can help when memories or triggers arise? Or would you prefer to talk about what feels most supportive for you right now?

Remember, you're not alone, and there are trauma-informed approaches that can be very helpful. I'm here to support you however feels right for you.`
  }

  /**
   * Generate general supportive response
   */
  private static generateGeneralResponse(message: string, sentiment: number): string {
    if (sentiment > 0.3) {
      return `I'm glad to hear from you, and it's wonderful to sense the positive energy in your message. Based on our conversation and your assessment results, I can see you've been working through some important things. How are you feeling about the progress you've made?

It's great that you're reaching out for support - that shows real self-awareness and care for your wellbeing. What would be most helpful for you right now? I'm here to listen, explore options together, or just be present with whatever you're experiencing.`
    } else if (sentiment < -0.3) {
      return `Thank you for reaching out and sharing what's been going on for you. I can hear that things have been challenging, and I appreciate you trusting me with how you're feeling. Based on our conversation and your assessment results, I understand you've been navigating some difficult experiences.

It's okay to have hard days, and it's meaningful that you're connecting for support. What would be most helpful for you in this moment? I'm here to listen, validate your experiences, and explore what might support you moving forward.`
    } else {
      return `Thank you for reaching out - I appreciate you taking the time to connect. Based on our conversation and your assessment results, I can see you've been reflecting on some important aspects of your wellbeing. How are things going for you overall right now?

I'm here to support you however feels most helpful - whether that's exploring specific concerns, celebrating progress, or just having someone to talk things through with. What would you like to focus on today?`
    }
  }

  /**
   * Get conversation history for a user
   */
  static async getConversationHistory(
    userId: string,
    limit: number = 50
  ): Promise<ConversationProgressRow[]> {
    try {
      const { data, error } = await supabase
        .from('conversation_progress')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching conversation history:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getConversationHistory:', error)
      return []
    }
  }

  /**
   * Generate therapy session summary
   */
  static async generateSessionSummary(
    userId: string,
    sessionId: string
  ): Promise<{
    summary: string
    keyThemes: string[]
    progressIndicators: string[]
    recommendations: string[]
  }> {
    try {
      const history = await this.getConversationHistory(userId, 20)
      const sessionData = history.filter(h => h.session_id === sessionId)

      // Analyze session data
      const avgSentiment = sessionData.reduce((sum, h) => sum + (h.average_sentiment || 0), 0) / sessionData.length
      const allThemes = sessionData.flatMap(h => h.therapeutic_themes || [])
      const themeCounts = allThemes.reduce((acc, theme) => {
        acc[theme] = (acc[theme] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const keyThemes = Object.entries(themeCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([theme]) => theme)

      // Generate summary
      let summary = ''
      if (avgSentiment > 0.2) {
        summary = 'This session showed generally positive engagement with some encouraging progress.'
      } else if (avgSentiment < -0.2) {
        summary = 'This session involved working through some challenging emotions and difficult experiences.'
      } else {
        summary = 'This session focused on processing current experiences and exploring coping strategies.'
      }

      const progressIndicators = []
      if (avgSentiment > avgSentiment * 0.1) progressIndicators.push('increased_engagement')
      if (keyThemes.length > 0) progressIndicators.push('theme_exploration')
      if (sessionData.length > 5) progressIndicators.push('consistent_participation')

      const recommendations = []
      if (keyThemes.includes('anxiety')) recommendations.push('practice_relaxation_techniques')
      if (keyThemes.includes('depression')) recommendations.push('consider_behavioral_activation')
      if (keyThemes.includes('trauma')) recommendations.push('explore_grounding_exercises')
      recommendations.push('continue_therapy_sessions')

      return {
        summary,
        keyThemes,
        progressIndicators,
        recommendations
      }
    } catch (error) {
      console.error('Error generating session summary:', error)
      return {
        summary: 'Session summary could not be generated due to technical issues.',
        keyThemes: [],
        progressIndicators: [],
        recommendations: ['continue_therapy_sessions']
      }
    }
  }
}

export default ChatService
