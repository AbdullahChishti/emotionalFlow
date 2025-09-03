/**
 * Personalized Recommendation Engine
 * Generates tailored recommendations based on assessment data and user context
 */

import { UserProfile } from '@/data/assessment-integration'

export interface PersonalizedRecommendation {
  id: string
  type: 'therapy' | 'content' | 'activity' | 'resource' | 'community' | 'crisis'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  tags: string[]
  actionUrl?: string
  estimatedTime?: number // in minutes
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  evidence?: string
  contraindications?: string[]
}

export interface RecommendationContext {
  userProfile: UserProfile | null
  currentEmotionalState: string
  recentConversations: string[]
  userPreferences: {
    therapyApproach: string[]
    copingStrategies: string[]
    contentTypes: string[]
  }
  riskLevel: 'low' | 'moderate' | 'high' | 'crisis'
  lastAssessed: Date | null
}

export class PersonalizedRecommendationEngine {
  /**
   * Generate personalized recommendations based on user context
   */
  static generateRecommendations(context: RecommendationContext): PersonalizedRecommendation[] {
    const recommendations: PersonalizedRecommendation[] = []

    // Add crisis recommendations if needed
    if (context.riskLevel === 'crisis') {
      recommendations.push(...this.getCrisisRecommendations())
    }

    // Add therapy approach recommendations
    recommendations.push(...this.getTherapyRecommendations(context))

    // Add content recommendations
    recommendations.push(...this.getContentRecommendations(context))

    // Add activity recommendations
    recommendations.push(...this.getActivityRecommendations(context))

    // Add resource recommendations
    recommendations.push(...this.getResourceRecommendations(context))

    // Add community recommendations
    recommendations.push(...this.getCommunityRecommendations(context))

    // Sort by priority and relevance
    return this.prioritizeRecommendations(recommendations, context)
  }

  /**
   * Get crisis-specific recommendations
   */
  private static getCrisisRecommendations(): PersonalizedRecommendation[] {
    return [
      {
        id: 'crisis_emergency',
        type: 'crisis',
        title: 'Emergency Crisis Support',
        description: 'If you\'re in immediate danger, please contact emergency services (911) or a crisis hotline immediately.',
        priority: 'urgent',
        category: 'crisis_support',
        tags: ['emergency', 'crisis', 'immediate_help'],
        actionUrl: 'tel:911'
      },
      {
        id: 'crisis_suicide_hotline',
        type: 'crisis',
        title: 'National Suicide Prevention Lifeline',
        description: '24/7 crisis support for anyone in emotional distress or suicidal crisis.',
        priority: 'urgent',
        category: 'crisis_support',
        tags: ['suicide_prevention', 'crisis', '24_7'],
        actionUrl: 'tel:988'
      },
      {
        id: 'crisis_text_line',
        type: 'crisis',
        title: 'Crisis Text Line',
        description: 'Text HOME to 741741 for 24/7 crisis support via text message.',
        priority: 'urgent',
        category: 'crisis_support',
        tags: ['crisis', 'text_support', '24_7'],
        actionUrl: 'sms:741741&body=HOME'
      }
    ]
  }

  /**
   * Get therapy approach recommendations
   */
  private static getTherapyRecommendations(context: RecommendationContext): PersonalizedRecommendation[] {
    const recommendations: PersonalizedRecommendation[] = []
    const { userProfile, riskLevel } = context

    if (!userProfile) return recommendations

    // Depression-focused therapy recommendations
    if (userProfile.currentSymptoms.depression.needsIntervention) {
      if (userProfile.currentSymptoms.depression.score >= 15) {
        recommendations.push({
          id: 'therapy_immediate_depression',
          type: 'therapy',
          title: 'Immediate Professional Help for Depression',
          description: 'Your depression symptoms are severe. Please seek immediate professional help from a mental health provider.',
          priority: 'urgent',
          category: 'therapy',
          tags: ['depression', 'professional_help', 'urgent'],
          evidence: 'PHQ-9 score indicates severe depression requiring immediate intervention'
        })
      } else {
        recommendations.push({
          id: 'therapy_cbt_depression',
          type: 'therapy',
          title: 'Cognitive Behavioral Therapy (CBT)',
          description: 'CBT is highly effective for depression. It helps identify and change negative thought patterns.',
          priority: 'high',
          category: 'therapy',
          tags: ['cbt', 'depression', 'evidence_based'],
          evidence: 'CBT has strong evidence for treating depression',
          estimatedTime: 50
        })
      }
    }

    // Anxiety-focused therapy recommendations
    if (userProfile.currentSymptoms.anxiety.needsIntervention) {
      if (userProfile.currentSymptoms.anxiety.score >= 15) {
        recommendations.push({
          id: 'therapy_immediate_anxiety',
          type: 'therapy',
          title: 'Immediate Professional Help for Anxiety',
          description: 'Your anxiety symptoms are severe. Please seek immediate professional help from a mental health provider.',
          priority: 'urgent',
          category: 'therapy',
          tags: ['anxiety', 'professional_help', 'urgent'],
          evidence: 'GAD-7 score indicates severe anxiety requiring immediate intervention'
        })
      } else {
        recommendations.push({
          id: 'therapy_exposure_anxiety',
          type: 'therapy',
          title: 'Exposure Therapy for Anxiety',
          description: 'Gradual exposure to anxiety-provoking situations can help reduce anxiety over time.',
          priority: 'high',
          category: 'therapy',
          tags: ['exposure_therapy', 'anxiety', 'evidence_based'],
          evidence: 'Exposure therapy is effective for anxiety disorders',
          estimatedTime: 45
        })
      }
    }

    // Trauma-informed therapy recommendations
    if (userProfile.traumaHistory.needsTraumaInformedCare) {
      recommendations.push({
        id: 'therapy_trauma_informed',
        type: 'therapy',
        title: 'Trauma-Informed Therapy',
        description: 'Specialized therapy approaches that are sensitive to trauma history and promote healing.',
        priority: 'high',
        category: 'therapy',
        tags: ['trauma_informed', 'trauma', 'specialized'],
        evidence: 'Trauma-informed care is essential for individuals with trauma history',
        estimatedTime: 60
      })

      if (userProfile.traumaHistory.aceScore >= 6) {
        recommendations.push({
          id: 'therapy_emdr',
          type: 'therapy',
          title: 'EMDR (Eye Movement Desensitization and Reprocessing)',
          description: 'EMDR is particularly effective for processing traumatic memories and reducing their impact.',
          priority: 'high',
          category: 'therapy',
          tags: ['emdr', 'trauma', 'specialized'],
          evidence: 'EMDR has strong evidence for treating trauma-related conditions',
          estimatedTime: 90
        })
      }
    }

    // Resilience-building recommendations
    if (userProfile.resilience.level === 'low' || userProfile.resilience.level === 'moderate') {
      recommendations.push({
        id: 'therapy_resilience_building',
        type: 'therapy',
        title: 'Resilience Building Therapy',
        description: 'Work with a therapist to develop coping skills and build resilience to stress.',
        priority: 'medium',
        category: 'therapy',
        tags: ['resilience', 'coping_skills', 'skill_building'],
        evidence: 'Resilience can be developed through targeted interventions',
        estimatedTime: 50
      })
    }

    return recommendations
  }

  /**
   * Get content recommendations
   */
  private static getContentRecommendations(context: RecommendationContext): PersonalizedRecommendation[] {
    const recommendations: PersonalizedRecommendation[] = []
    const { userProfile, currentEmotionalState } = context

    if (!userProfile) return recommendations

    // Depression content
    if (userProfile.currentSymptoms.depression.score >= 5) {
      recommendations.push({
        id: 'content_depression_workbook',
        type: 'content',
        title: 'Depression Self-Help Workbook',
        description: 'Evidence-based exercises and activities to help manage depression symptoms.',
        priority: 'medium',
        category: 'content',
        tags: ['depression', 'self_help', 'workbook'],
        estimatedTime: 30,
        difficulty: 'beginner'
      })

      recommendations.push({
        id: 'content_mood_tracking',
        type: 'content',
        title: 'Daily Mood Tracking',
        description: 'Track your mood patterns to identify triggers and monitor progress.',
        priority: 'medium',
        category: 'content',
        tags: ['mood_tracking', 'monitoring', 'self_awareness'],
        estimatedTime: 5,
        difficulty: 'beginner'
      })
    }

    // Anxiety content
    if (userProfile.currentSymptoms.anxiety.score >= 5) {
      recommendations.push({
        id: 'content_anxiety_management',
        type: 'content',
        title: 'Anxiety Management Techniques',
        description: 'Learn practical techniques to manage anxiety and worry.',
        priority: 'medium',
        category: 'content',
        tags: ['anxiety', 'management', 'techniques'],
        estimatedTime: 20,
        difficulty: 'beginner'
      })

      recommendations.push({
        id: 'content_mindfulness_anxiety',
        type: 'content',
        title: 'Mindfulness for Anxiety',
        description: 'Mindfulness exercises specifically designed to reduce anxiety.',
        priority: 'medium',
        category: 'content',
        tags: ['mindfulness', 'anxiety', 'meditation'],
        estimatedTime: 15,
        difficulty: 'beginner'
      })
    }

    // Trauma content
    if (userProfile.traumaHistory.needsTraumaInformedCare) {
      recommendations.push({
        id: 'content_grounding_techniques',
        type: 'content',
        title: 'Grounding Techniques',
        description: 'Learn grounding exercises to help manage trauma-related distress.',
        priority: 'high',
        category: 'content',
        tags: ['grounding', 'trauma', 'coping'],
        estimatedTime: 10,
        difficulty: 'beginner'
      })

      recommendations.push({
        id: 'content_trauma_education',
        type: 'content',
        title: 'Understanding Trauma and Recovery',
        description: 'Educational content about trauma and the recovery process.',
        priority: 'medium',
        category: 'content',
        tags: ['trauma_education', 'recovery', 'understanding'],
        estimatedTime: 25,
        difficulty: 'beginner'
      })
    }

    // Resilience content
    if (userProfile.resilience.level === 'low' || userProfile.resilience.level === 'moderate') {
      recommendations.push({
        id: 'content_resilience_building',
        type: 'content',
        title: 'Building Resilience Skills',
        description: 'Learn practical skills to build resilience and cope with stress.',
        priority: 'medium',
        category: 'content',
        tags: ['resilience', 'coping_skills', 'stress_management'],
        estimatedTime: 20,
        difficulty: 'beginner'
      })
    }

    // Emotional state specific content
    if (currentEmotionalState === 'anxious') {
      recommendations.push({
        id: 'content_calming_exercises',
        type: 'content',
        title: 'Immediate Calming Exercises',
        description: 'Quick exercises to help calm anxiety in the moment.',
        priority: 'high',
        category: 'content',
        tags: ['calming', 'anxiety', 'immediate'],
        estimatedTime: 5,
        difficulty: 'beginner'
      })
    }

    return recommendations
  }

  /**
   * Get activity recommendations
   */
  private static getActivityRecommendations(context: RecommendationContext): PersonalizedRecommendation[] {
    const recommendations: PersonalizedRecommendation[] = []
    const { userProfile, currentEmotionalState } = context

    if (!userProfile) return recommendations

    // Depression activities
    if (userProfile.currentSymptoms.depression.score >= 5) {
      recommendations.push({
        id: 'activity_behavioral_activation',
        type: 'activity',
        title: 'Behavioral Activation',
        description: 'Engage in pleasant activities to improve mood and energy levels.',
        priority: 'high',
        category: 'activity',
        tags: ['behavioral_activation', 'depression', 'mood'],
        estimatedTime: 30,
        difficulty: 'beginner'
      })

      recommendations.push({
        id: 'activity_exercise_depression',
        type: 'activity',
        title: 'Exercise for Depression',
        description: 'Regular physical activity can significantly improve depression symptoms.',
        priority: 'medium',
        category: 'activity',
        tags: ['exercise', 'depression', 'physical_activity'],
        estimatedTime: 30,
        difficulty: 'beginner'
      })
    }

    // Anxiety activities
    if (userProfile.currentSymptoms.anxiety.score >= 5) {
      recommendations.push({
        id: 'activity_breathing_exercises',
        type: 'activity',
        title: 'Breathing Exercises',
        description: 'Practice deep breathing techniques to reduce anxiety.',
        priority: 'high',
        category: 'activity',
        tags: ['breathing', 'anxiety', 'relaxation'],
        estimatedTime: 10,
        difficulty: 'beginner'
      })

      recommendations.push({
        id: 'activity_progressive_relaxation',
        type: 'activity',
        title: 'Progressive Muscle Relaxation',
        description: 'Systematically tense and relax muscle groups to reduce physical tension.',
        priority: 'medium',
        category: 'activity',
        tags: ['relaxation', 'anxiety', 'muscle_tension'],
        estimatedTime: 20,
        difficulty: 'beginner'
      })
    }

    // Trauma activities
    if (userProfile.traumaHistory.needsTraumaInformedCare) {
      recommendations.push({
        id: 'activity_safe_place_visualization',
        type: 'activity',
        title: 'Safe Place Visualization',
        description: 'Create and practice accessing a mental safe place for grounding.',
        priority: 'high',
        category: 'activity',
        tags: ['safe_place', 'trauma', 'visualization'],
        estimatedTime: 15,
        difficulty: 'beginner'
      })
    }

    // Resilience activities
    if (userProfile.resilience.level === 'low' || userProfile.resilience.level === 'moderate') {
      recommendations.push({
        id: 'activity_gratitude_practice',
        type: 'activity',
        title: 'Gratitude Practice',
        description: 'Regular gratitude practice can build resilience and improve well-being.',
        priority: 'medium',
        category: 'activity',
        tags: ['gratitude', 'resilience', 'wellbeing'],
        estimatedTime: 10,
        difficulty: 'beginner'
      })
    }

    return recommendations
  }

  /**
   * Get resource recommendations
   */
  private static getResourceRecommendations(context: RecommendationContext): PersonalizedRecommendation[] {
    const recommendations: PersonalizedRecommendation[] = []
    const { userProfile, riskLevel } = context

    if (!userProfile) return recommendations

    // Professional resources
    if (riskLevel === 'high' || riskLevel === 'crisis') {
      recommendations.push({
        id: 'resource_mental_health_provider',
        type: 'resource',
        title: 'Find a Mental Health Provider',
        description: 'Connect with licensed mental health professionals in your area.',
        priority: 'urgent',
        category: 'resource',
        tags: ['professional_help', 'therapist', 'mental_health'],
        actionUrl: 'https://www.psychologytoday.com/us/therapists'
      })
    }

    // Assessment-specific resources
    if (userProfile.currentSymptoms.depression.needsIntervention) {
      recommendations.push({
        id: 'resource_depression_support',
        type: 'resource',
        title: 'Depression Support Resources',
        description: 'Comprehensive resources for understanding and managing depression.',
        priority: 'medium',
        category: 'resource',
        tags: ['depression', 'support', 'resources']
      })
    }

    if (userProfile.currentSymptoms.anxiety.needsIntervention) {
      recommendations.push({
        id: 'resource_anxiety_support',
        type: 'resource',
        title: 'Anxiety Support Resources',
        description: 'Comprehensive resources for understanding and managing anxiety.',
        priority: 'medium',
        category: 'resource',
        tags: ['anxiety', 'support', 'resources']
      })
    }

    if (userProfile.traumaHistory.needsTraumaInformedCare) {
      recommendations.push({
        id: 'resource_trauma_support',
        type: 'resource',
        title: 'Trauma Support Resources',
        description: 'Specialized resources for trauma survivors and their support networks.',
        priority: 'medium',
        category: 'resource',
        tags: ['trauma', 'support', 'resources']
      })
    }

    return recommendations
  }

  /**
   * Get community recommendations
   */
  private static getCommunityRecommendations(context: RecommendationContext): PersonalizedRecommendation[] {
    const recommendations: PersonalizedRecommendation[] = []
    const { userProfile } = context

    if (!userProfile) return recommendations

    // Depression community
    if (userProfile.currentSymptoms.depression.score >= 10) {
      recommendations.push({
        id: 'community_depression_support',
        type: 'community',
        title: 'Depression Support Group',
        description: 'Connect with others who understand what you\'re going through.',
        priority: 'medium',
        category: 'community',
        tags: ['depression', 'support_group', 'peer_support']
      })
    }

    // Anxiety community
    if (userProfile.currentSymptoms.anxiety.score >= 10) {
      recommendations.push({
        id: 'community_anxiety_support',
        type: 'community',
        title: 'Anxiety Support Group',
        description: 'Join a community of people managing anxiety together.',
        priority: 'medium',
        category: 'community',
        tags: ['anxiety', 'support_group', 'peer_support']
      })
    }

    // Trauma community
    if (userProfile.traumaHistory.needsTraumaInformedCare) {
      recommendations.push({
        id: 'community_trauma_survivors',
        type: 'community',
        title: 'Trauma Survivors Support Group',
        description: 'Connect with other trauma survivors in a safe, supportive environment.',
        priority: 'medium',
        category: 'community',
        tags: ['trauma', 'survivors', 'support_group']
      })
    }

    // Resilience community
    if (userProfile.resilience.level === 'high' || userProfile.resilience.level === 'very_high') {
      recommendations.push({
        id: 'community_peer_mentoring',
        type: 'community',
        title: 'Peer Mentoring Program',
        description: 'Share your resilience and coping strategies with others who are struggling.',
        priority: 'low',
        category: 'community',
        tags: ['mentoring', 'peer_support', 'helping_others']
      })
    }

    return recommendations
  }

  /**
   * Prioritize recommendations based on context
   */
  private static prioritizeRecommendations(
    recommendations: PersonalizedRecommendation[],
    context: RecommendationContext
  ): PersonalizedRecommendation[] {
    return recommendations.sort((a, b) => {
      // Priority order: urgent > high > medium > low
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
      const aPriority = priorityOrder[a.priority]
      const bPriority = priorityOrder[b.priority]

      if (aPriority !== bPriority) {
        return bPriority - aPriority
      }

      // If same priority, sort by relevance to current emotional state
      const emotionalStateRelevance = this.getEmotionalStateRelevance(a, context.currentEmotionalState) -
                                     this.getEmotionalStateRelevance(b, context.currentEmotionalState)

      return emotionalStateRelevance
    })
  }

  /**
   * Get relevance score for emotional state
   */
  private static getEmotionalStateRelevance(recommendation: PersonalizedRecommendation, emotionalState: string): number {
    const emotionalStateTags: Record<string, string[]> = {
      anxious: ['anxiety', 'calming', 'relaxation', 'breathing'],
      sad: ['depression', 'mood', 'behavioral_activation'],
      overwhelmed: ['stress_management', 'coping', 'resilience'],
      angry: ['anger_management', 'relaxation', 'coping'],
      calm: ['wellness', 'prevention', 'growth']
    }

    const relevantTags = emotionalStateTags[emotionalState] || []
    const relevanceScore = relevantTags.reduce((score, tag) => {
      return score + (recommendation.tags.includes(tag) ? 1 : 0)
    }, 0)

    return relevanceScore
  }
}

export default PersonalizedRecommendationEngine
