/**
 * Chat Personalization Service
 * Handles client-side integration with assessment-enhanced chat AI
 */

import { supabase } from './supabase'

export interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'assistant'
  timestamp: Date
  emotionalTone?: string
  isAffirmation?: boolean
  assessmentContext?: {
    hasAssessmentData: boolean
    riskLevel: string
    focusAreas: string[]
    recommendations: string[]
    lastAssessed: string | null
  }
}

export interface ChatSession {
  id: string
  userId: string
  messages: ChatMessage[]
  emotionalState: string
  assessmentContext: {
    hasAssessmentData: boolean
    riskLevel: string
    focusAreas: string[]
    recommendations: string[]
    lastAssessed: Date | null
  }
  createdAt: Date
  updatedAt: Date
}

export interface ChatResponse {
  response: string
  success: boolean
  isCrisis: boolean
  emotionalTone: string
  isAffirmation: boolean
  assessmentContext: {
    hasAssessmentData: boolean
    riskLevel: string
    focusAreas: string[]
    recommendations: string[]
    lastAssessed: string | null
  }
  personalizedResources?: string[]
  error?: string
}

export class ChatPersonalizationService {
  private static currentSession: ChatSession | null = null

  /**
   * Initialize a new chat session with assessment context
   */
  static async initializeSession(userId: string, emotionalState: string = 'neutral'): Promise<ChatSession> {
    const sessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Get initial assessment context
    const assessmentContext = await this.getAssessmentContext(userId)
    
    const session: ChatSession = {
      id: sessionId,
      userId,
      messages: [],
      emotionalState,
      assessmentContext,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.currentSession = session
    return session
  }

  /**
   * Send a message to the assessment-enhanced chat AI
   */
  static async sendMessage(
    message: string,
    emotionalState?: string
  ): Promise<ChatResponse> {
    if (!this.currentSession) {
      throw new Error('No active chat session. Please initialize a session first.')
    }

    try {
      // Update emotional state if provided
      if (emotionalState) {
        this.currentSession.emotionalState = emotionalState
      }

      // Add user message to session
      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}_user`,
        text: message,
        sender: 'user',
        timestamp: new Date()
      }
      this.currentSession.messages.push(userMessage)

      // Prepare conversation history for API
      const conversationHistory = this.currentSession.messages
        .slice(-5) // Last 5 messages for context
        .map(msg => ({
          sender: msg.sender,
          text: msg.text,
          timestamp: msg.timestamp.toISOString()
        }))

      // Call the enhanced chat AI function
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: message,
          conversationHistory: conversationHistory,
          emotionalState: this.currentSession.emotionalState,
          sessionId: this.currentSession.id
        }
      })

      if (error) {
        console.error('Chat AI function error:', error)
        throw new Error(error.message || 'Failed to get AI response')
      }

      // Add AI response to session
      const aiMessage: ChatMessage = {
        id: `msg_${Date.now()}_ai`,
        text: data.response,
        sender: 'assistant',
        timestamp: new Date(),
        emotionalTone: data.emotionalTone,
        isAffirmation: data.isAffirmation,
        assessmentContext: data.assessmentContext
      }
      this.currentSession.messages.push(aiMessage)
      this.currentSession.updatedAt = new Date()

      // Update session assessment context if provided
      if (data.assessmentContext) {
        this.currentSession.assessmentContext = {
          ...data.assessmentContext,
          lastAssessed: data.assessmentContext.lastAssessed ? new Date(data.assessmentContext.lastAssessed) : null
        }
      }

      return {
        response: data.response,
        success: data.success,
        isCrisis: data.isCrisis,
        emotionalTone: data.emotionalTone,
        isAffirmation: data.isAffirmation,
        assessmentContext: data.assessmentContext,
        personalizedResources: data.personalizedResources
      }

    } catch (error) {
      console.error('Error in sendMessage:', error)
      return {
        response: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        success: false,
        isCrisis: false,
        emotionalTone: 'neutral',
        isAffirmation: false,
        assessmentContext: this.currentSession.assessmentContext,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get current session
   */
  static getCurrentSession(): ChatSession | null {
    return this.currentSession
  }

  /**
   * End current session
   */
  static endSession(): void {
    this.currentSession = null
  }

  /**
   * Get assessment context for user
   */
  private static async getAssessmentContext(userId: string): Promise<ChatSession['assessmentContext']> {
    try {
      // Get latest assessment results
      const { data: assessmentResults, error: resultsError } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('user_id', userId)
        .order('taken_at', { ascending: false })

      if (resultsError) {
        console.error('Error fetching assessment results:', resultsError)
        return this.getDefaultAssessmentContext()
      }

      // Get user assessment profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_assessment_profiles')
        .select('*')
        .eq('user_id', userId)
        .order('last_assessed', { ascending: false })
        .limit(1)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching user profile:', profileError)
      }

      // Process assessment data
      if (assessmentResults && assessmentResults.length > 0) {
        const latestAssessments = this.processLatestAssessments(assessmentResults)
        const riskLevel = this.assessRiskLevel(latestAssessments, profileData?.profile_data)
        const personalizedApproach = this.generatePersonalizedApproach(latestAssessments, profileData?.profile_data)

        return {
          hasAssessmentData: true,
          riskLevel,
          focusAreas: personalizedApproach.focusAreas,
          recommendations: personalizedApproach.recommendations,
          lastAssessed: profileData?.last_assessed ? new Date(profileData.last_assessed) : null
        }
      }

      return this.getDefaultAssessmentContext()
    } catch (error) {
      console.error('Error getting assessment context:', error)
      return this.getDefaultAssessmentContext()
    }
  }

  /**
   * Process latest assessment results
   */
  private static processLatestAssessments(results: any[]): any {
    const assessments: any = {}

    // Group by assessment type and get most recent
    const grouped = results.reduce((acc, result) => {
      if (!acc[result.assessment_id] || new Date(result.taken_at) > new Date(acc[result.assessment_id].taken_at)) {
        acc[result.assessment_id] = result
      }
      return acc
    }, {} as Record<string, any>)

    // Map to our expected format
    if (grouped.phq9) assessments.phq9 = grouped.phq9
    if (grouped.gad7) assessments.gad7 = grouped.gad7
    if (grouped.ace) assessments.ace = grouped.ace
    if (grouped['cd-risc']) assessments.cdRisc = grouped['cd-risc']

    return assessments
  }

  /**
   * Assess risk level based on assessment data
   */
  private static assessRiskLevel(assessments: any, userProfile: any): string {
    const phq9 = assessments.phq9
    const gad7 = assessments.gad7
    const ace = assessments.ace

    // Crisis indicators
    if (phq9?.score >= 15 || gad7?.score >= 15) {
      return 'crisis'
    }

    // High risk indicators
    if (
      (phq9?.score >= 10 && ace?.score >= 6) ||
      (phq9?.score >= 10 && phq9?.result_data?.suicidal_ideation) ||
      (ace?.score >= 6 && (phq9?.score >= 5 || gad7?.score >= 5))
    ) {
      return 'high'
    }

    // Moderate risk indicators
    if (
      phq9?.score >= 10 ||
      gad7?.score >= 10 ||
      ace?.score >= 4 ||
      (phq9?.score >= 5 && gad7?.score >= 5)
    ) {
      return 'moderate'
    }

    return 'low'
  }

  /**
   * Generate personalized approach based on assessment data
   */
  private static generatePersonalizedApproach(assessments: any, userProfile: any): any {
    const phq9 = assessments.phq9
    const gad7 = assessments.gad7
    const ace = assessments.ace
    const cdRisc = assessments.cdRisc

    const focusAreas: string[] = []
    const recommendations: string[] = []

    // Depression-based personalization
    if (phq9?.score >= 10) {
      focusAreas.push('mood_regulation', 'activity_scheduling', 'cognitive_restructuring')
      recommendations.push('depression_resources', 'mood_tracking', 'behavioral_activation')
      
      if (phq9.score >= 15) {
        recommendations.push('immediate_professional_help')
      }
    } else if (phq9?.score >= 5) {
      focusAreas.push('mood_monitoring', 'self_care')
      recommendations.push('mood_tracking', 'stress_management')
    }

    // Anxiety-based personalization
    if (gad7?.score >= 10) {
      focusAreas.push('worry_management', 'relaxation_skills', 'exposure_techniques')
      recommendations.push('anxiety_resources', 'relaxation_techniques', 'mindfulness_exercises')
      
      if (gad7.score >= 15) {
        recommendations.push('immediate_professional_help')
      }
    } else if (gad7?.score >= 5) {
      focusAreas.push('anxiety_monitoring', 'relaxation_skills')
      recommendations.push('stress_management', 'breathing_exercises')
    }

    // Trauma-based personalization
    if (ace?.score >= 4) {
      focusAreas.push('safety_building', 'grounding_techniques', 'trauma_processing')
      recommendations.push('trauma_resources', 'grounding_techniques', 'trauma_informed_therapy')
      
      if (ace.score >= 6) {
        recommendations.push('trauma_specialist_referral')
      }
    }

    // Resilience-based personalization
    if (cdRisc?.score < 30) {
      focusAreas.push('coping_skill_development', 'social_support', 'resilience_building')
      recommendations.push('resilience_building', 'social_connection', 'coping_skills')
    } else if (cdRisc?.score >= 35) {
      focusAreas.push('strength_utilization', 'helping_others', 'leadership')
      recommendations.push('peer_support', 'mentoring_opportunities')
    }

    // Default recommendations if no specific conditions
    if (focusAreas.length === 0) {
      focusAreas.push('general_wellness', 'preventive_care')
      recommendations.push('general_self_care', 'wellness_resources')
    }

    return {
      focusAreas,
      recommendations
    }
  }

  /**
   * Get default assessment context for users without assessments
   */
  private static getDefaultAssessmentContext(): ChatSession['assessmentContext'] {
    return {
      hasAssessmentData: false,
      riskLevel: 'low',
      focusAreas: ['general_wellness', 'preventive_care'],
      recommendations: ['general_self_care', 'wellness_resources'],
      lastAssessed: null
    }
  }

  /**
   * Get personalized recommendations based on current assessment context
   */
  static getPersonalizedRecommendations(): string[] {
    if (!this.currentSession) {
      return ['general_self_care', 'wellness_resources']
    }
    return this.currentSession.assessmentContext.recommendations
  }

  /**
   * Get focus areas based on current assessment context
   */
  static getFocusAreas(): string[] {
    if (!this.currentSession) {
      return ['general_wellness', 'preventive_care']
    }
    return this.currentSession.assessmentContext.focusAreas
  }

  /**
   * Get current risk level
   */
  static getCurrentRiskLevel(): string {
    if (!this.currentSession) {
      return 'low'
    }
    return this.currentSession.assessmentContext.riskLevel
  }

  /**
   * Check if user has assessment data
   */
  static hasAssessmentData(): boolean {
    if (!this.currentSession) {
      return false
    }
    return this.currentSession.assessmentContext.hasAssessmentData
  }
}

export default ChatPersonalizationService
