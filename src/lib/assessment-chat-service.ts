/**
 * Assessment Chat Service
 * Handles retrieval and processing of user assessment data for chat personalization
 */

import { supabase } from './supabase'
import { UserProfile } from '@/data/assessment-integration'

export interface AssessmentChatContext {
  userProfile: UserProfile | null
  latestAssessments: {
    phq9?: any
    gad7?: any
    ace?: any
    cdRisc?: any
  }
  riskLevel: 'low' | 'moderate' | 'high' | 'crisis'
  personalizedApproach: {
    therapyStyle: string[]
    focusAreas: string[]
    safetyProtocols: string[]
    recommendations: string[]
  }
  lastAssessed: Date | null
}

export interface ChatPersonalizationData {
  systemPrompt: string
  conversationStyle: string
  safetyLevel: 'standard' | 'enhanced' | 'crisis'
  focusAreas: string[]
  recommendations: string[]
  crisisResources: string[]
}

export class AssessmentChatService {
  /**
   * Get user's assessment context for chat personalization
   */
  static async getUserAssessmentContext(userId: string): Promise<AssessmentChatContext> {
    try {
      // Get latest user assessment profile
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

      // Get latest individual assessment results
      const { data: assessmentResults, error: resultsError } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('user_id', userId)
        .order('taken_at', { ascending: false })

      if (resultsError) {
        console.error('Error fetching assessment results:', resultsError)
      }

      // Process assessment data
      const latestAssessments = this.processLatestAssessments(assessmentResults || [])
      const userProfile = profileData?.profile_data || null
      const riskLevel = this.assessRiskLevel(latestAssessments, userProfile)
      const personalizedApproach = this.generatePersonalizedApproach(latestAssessments, userProfile)

      return {
        userProfile,
        latestAssessments,
        riskLevel,
        personalizedApproach,
        lastAssessed: profileData?.last_assessed ? new Date(profileData.last_assessed) : null
      }
    } catch (error) {
      console.error('Error in getUserAssessmentContext:', error)
      return {
        userProfile: null,
        latestAssessments: {},
        riskLevel: 'low',
        personalizedApproach: {
          therapyStyle: ['general_support'],
          focusAreas: ['general_wellness'],
          safetyProtocols: ['standard_safety_check'],
          recommendations: ['general_self_care']
        },
        lastAssessed: null
      }
    }
  }

  /**
   * Process latest assessment results into structured format
   */
  private static processLatestAssessments(results: any[]): AssessmentChatContext['latestAssessments'] {
    const assessments: AssessmentChatContext['latestAssessments'] = {}

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
   * Assess overall risk level based on assessment data
   */
  private static assessRiskLevel(
    assessments: AssessmentChatContext['latestAssessments'],
    userProfile: any
  ): AssessmentChatContext['riskLevel'] {
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
  private static generatePersonalizedApproach(
    assessments: AssessmentChatContext['latestAssessments'],
    userProfile: any
  ): AssessmentChatContext['personalizedApproach'] {
    const phq9 = assessments.phq9
    const gad7 = assessments.gad7
    const ace = assessments.ace
    const cdRisc = assessments.cdRisc

    const therapyStyle: string[] = []
    const focusAreas: string[] = []
    const safetyProtocols: string[] = ['standard_safety_check']
    const recommendations: string[] = []

    // Depression-based personalization
    if (phq9?.score >= 10) {
      therapyStyle.push('cbt_approach', 'behavioral_activation')
      focusAreas.push('mood_regulation', 'activity_scheduling', 'cognitive_restructuring')
      recommendations.push('depression_resources', 'mood_tracking', 'behavioral_activation')
      
      if (phq9.score >= 15) {
        safetyProtocols.push('depression_crisis_protocol', 'suicide_prevention')
        recommendations.push('immediate_professional_help')
      }
    } else if (phq9?.score >= 5) {
      therapyStyle.push('supportive_listening', 'preventive_care')
      focusAreas.push('mood_monitoring', 'self_care')
      recommendations.push('mood_tracking', 'stress_management')
    }

    // Anxiety-based personalization
    if (gad7?.score >= 10) {
      therapyStyle.push('anxiety_management', 'mindfulness_approach')
      focusAreas.push('worry_management', 'relaxation_skills', 'exposure_techniques')
      recommendations.push('anxiety_resources', 'relaxation_techniques', 'mindfulness_exercises')
      
      if (gad7.score >= 15) {
        safetyProtocols.push('anxiety_crisis_protocol')
        recommendations.push('immediate_professional_help')
      }
    } else if (gad7?.score >= 5) {
      therapyStyle.push('stress_management', 'preventive_care')
      focusAreas.push('anxiety_monitoring', 'relaxation_skills')
      recommendations.push('stress_management', 'breathing_exercises')
    }

    // Trauma-based personalization
    if (ace?.score >= 4) {
      therapyStyle.push('trauma_informed_care', 'safety_first_approach')
      focusAreas.push('safety_building', 'grounding_techniques', 'trauma_processing')
      recommendations.push('trauma_resources', 'grounding_techniques', 'trauma_informed_therapy')
      
      if (ace.score >= 6) {
        safetyProtocols.push('trauma_trigger_monitoring', 'complex_trauma_protocol')
        recommendations.push('trauma_specialist_referral')
      }
    }

    // Resilience-based personalization
    if (cdRisc?.score < 30) {
      therapyStyle.push('skill_building', 'support_network_building')
      focusAreas.push('coping_skill_development', 'social_support', 'resilience_building')
      recommendations.push('resilience_building', 'social_connection', 'coping_skills')
    } else if (cdRisc?.score >= 35) {
      therapyStyle.push('strength_based_approach', 'peer_support')
      focusAreas.push('strength_utilization', 'helping_others', 'leadership')
      recommendations.push('peer_support', 'mentoring_opportunities')
    }

    // Default recommendations if no specific conditions
    if (therapyStyle.length === 0) {
      therapyStyle.push('general_support', 'wellness_focus')
      focusAreas.push('general_wellness', 'preventive_care')
      recommendations.push('general_self_care', 'wellness_resources')
    }

    return {
      therapyStyle,
      focusAreas,
      safetyProtocols,
      recommendations
    }
  }

  /**
   * Generate personalized chat data for AI system prompt
   */
  static async generatePersonalizedChatData(userId: string): Promise<ChatPersonalizationData> {
    const context = await this.getUserAssessmentContext(userId)
    
    return {
      systemPrompt: this.generateSystemPrompt(context),
      conversationStyle: this.determineConversationStyle(context),
      safetyLevel: this.determineSafetyLevel(context.riskLevel),
      focusAreas: context.personalizedApproach.focusAreas,
      recommendations: context.personalizedApproach.recommendations,
      crisisResources: this.getCrisisResources(context.riskLevel, context.personalizedApproach.safetyProtocols)
    }
  }

  /**
   * Generate personalized system prompt based on assessment context
   */
  private static generateSystemPrompt(context: AssessmentChatContext): string {
    const { userProfile, latestAssessments, riskLevel, personalizedApproach } = context
    
    let prompt = `# Personalized AI Therapy Assistant

## User Assessment Profile
`

    // Add assessment-specific context
    if (latestAssessments.phq9) {
      const phq9 = latestAssessments.phq9
      prompt += `- Depression (PHQ-9): Score ${phq9.score} (${phq9.level}) - ${phq9.severity} severity\n`
    }

    if (latestAssessments.gad7) {
      const gad7 = latestAssessments.gad7
      prompt += `- Anxiety (GAD-7): Score ${gad7.score} (${gad7.level}) - ${gad7.severity} severity\n`
    }

    if (latestAssessments.ace) {
      const ace = latestAssessments.ace
      prompt += `- Trauma History (ACE): Score ${ace.score} (${ace.level}) - ${ace.severity} severity\n`
    }

    if (latestAssessments.cdRisc) {
      const cdRisc = latestAssessments.cdRisc
      prompt += `- Resilience (CD-RISC): Score ${cdRisc.score} (${cdRisc.level}) - ${cdRisc.severity} severity\n`
    }

    prompt += `- Overall Risk Level: ${riskLevel.toUpperCase()}\n`
    prompt += `- Last Assessed: ${context.lastAssessed ? context.lastAssessed.toLocaleDateString() : 'No recent assessments'}\n\n`

    // Add personalized approach
    prompt += `## Personalized Approach
- Therapy Style: ${personalizedApproach.therapyStyle.join(', ')}
- Focus Areas: ${personalizedApproach.focusAreas.join(', ')}
- Safety Protocols: ${personalizedApproach.safetyProtocols.join(', ')}\n\n`

    // Add risk-specific guidelines
    if (riskLevel === 'crisis') {
      prompt += `## CRISIS PROTOCOL - HIGHEST PRIORITY
- User is in crisis state - prioritize safety above all else
- Immediately assess for immediate danger
- Provide crisis resources and emergency contacts
- Strongly encourage immediate professional help
- Use gentle, non-triggering language
- Focus on immediate safety and stabilization\n\n`
    } else if (riskLevel === 'high') {
      prompt += `## HIGH RISK PROTOCOL
- User has significant mental health challenges
- Monitor for crisis indicators throughout conversation
- Provide enhanced safety resources
- Encourage professional support
- Use trauma-informed approach if applicable
- Focus on coping strategies and support building\n\n`
    } else if (riskLevel === 'moderate') {
      prompt += `## MODERATE RISK PROTOCOL
- User has some mental health challenges
- Provide supportive guidance and resources
- Encourage self-care and professional support when appropriate
- Use appropriate therapeutic techniques
- Focus on skill building and wellness\n\n`
    } else {
      prompt += `## LOW RISK PROTOCOL
- User appears to be managing well
- Focus on prevention and wellness
- Provide general support and resources
- Encourage continued healthy habits
- Focus on growth and development\n\n`
    }

    // Add specific therapeutic approaches
    if (personalizedApproach.therapyStyle.includes('trauma_informed_care')) {
      prompt += `## Trauma-Informed Care Guidelines
- Use trauma-informed language and approach
- Prioritize safety and choice
- Avoid triggering content or language
- Focus on grounding and stabilization techniques
- Be aware of trauma responses and triggers
- Encourage professional trauma-informed therapy\n\n`
    }

    if (personalizedApproach.therapyStyle.includes('cbt_approach')) {
      prompt += `## Cognitive Behavioral Therapy Approach
- Help identify and challenge negative thought patterns
- Focus on behavioral activation and activity scheduling
- Use cognitive restructuring techniques
- Encourage mood tracking and monitoring
- Focus on practical coping strategies\n\n`
    }

    if (personalizedApproach.therapyStyle.includes('anxiety_management')) {
      prompt += `## Anxiety Management Approach
- Focus on worry management and relaxation techniques
- Use exposure and response prevention concepts
- Encourage mindfulness and grounding exercises
- Help identify anxiety triggers and patterns
- Focus on building anxiety coping skills\n\n`
    }

    prompt += `## Response Guidelines
- Keep responses conversational and empathetic
- Adapt language to user's risk level and needs
- Use appropriate therapeutic techniques based on assessment data
- Provide relevant resources and recommendations
- Maintain professional boundaries while being supportive
- End with appropriate questions or gentle guidance

Remember: This user has specific mental health needs based on their assessment results. Tailor your approach accordingly while maintaining therapeutic boundaries.`

    return prompt
  }

  /**
   * Determine conversation style based on assessment context
   */
  private static determineConversationStyle(context: AssessmentChatContext): string {
    const { riskLevel, personalizedApproach } = context

    if (riskLevel === 'crisis') {
      return 'gentle_crisis_support'
    } else if (riskLevel === 'high') {
      return 'supportive_therapeutic'
    } else if (personalizedApproach.therapyStyle.includes('trauma_informed_care')) {
      return 'trauma_informed'
    } else if (personalizedApproach.therapyStyle.includes('cbt_approach')) {
      return 'cbt_structured'
    } else if (personalizedApproach.therapyStyle.includes('anxiety_management')) {
      return 'calming_supportive'
    } else {
      return 'general_supportive'
    }
  }

  /**
   * Determine safety level based on risk assessment
   */
  private static determineSafetyLevel(riskLevel: AssessmentChatContext['riskLevel']): ChatPersonalizationData['safetyLevel'] {
    switch (riskLevel) {
      case 'crisis':
        return 'crisis'
      case 'high':
        return 'enhanced'
      default:
        return 'standard'
    }
  }

  /**
   * Get crisis resources based on risk level and safety protocols
   */
  private static getCrisisResources(
    riskLevel: AssessmentChatContext['riskLevel'],
    safetyProtocols: string[]
  ): string[] {
    const resources = []

    if (riskLevel === 'crisis' || safetyProtocols.includes('suicide_prevention')) {
      resources.push(
        'National Suicide Prevention Lifeline: 988',
        'Crisis Text Line: Text HOME to 741741',
        'Emergency Services: 911'
      )
    }

    if (safetyProtocols.includes('trauma_trigger_monitoring') || safetyProtocols.includes('complex_trauma_protocol')) {
      resources.push(
        'RAINN National Sexual Assault Hotline: 1-800-656-4673',
        'National Domestic Violence Hotline: 1-800-799-7233'
      )
    }

    if (riskLevel === 'high' || riskLevel === 'moderate') {
      resources.push(
        'SAMHSA National Helpline: 1-800-662-4357',
        'Psychology Today Therapist Finder',
        'BetterHelp Online Therapy'
      )
    }

    return resources
  }
}

export default AssessmentChatService
