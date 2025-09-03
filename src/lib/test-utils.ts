/**
 * Test Utilities for Assessment-Enhanced Chat
 * Helper functions for testing and validation
 */

import { supabase } from './supabase'
import { AssessmentChatService } from './assessment-chat-service'
import { PersonalizedRecommendationEngine } from './personalized-recommendations'
import { ProgressTrackingService } from './progress-tracking'

export interface TestUser {
  id: string
  email: string
  assessmentData: {
    phq9?: { score: number; level: string; severity: string }
    gad7?: { score: number; level: string; severity: string }
    ace?: { score: number; level: string; severity: string }
    cdRisc?: { score: number; level: string; severity: string }
  }
  expectedRiskLevel: 'low' | 'moderate' | 'high' | 'crisis'
  expectedApproach: string[]
}

export const TEST_USERS: TestUser[] = [
  {
    id: 'test-user-1',
    email: 'test1@example.com',
    assessmentData: {
      phq9: { score: 3, level: 'Minimal depression', severity: 'normal' },
      gad7: { score: 2, level: 'Minimal anxiety', severity: 'normal' },
      ace: { score: 1, level: 'Low ACEs', severity: 'mild' },
      cdRisc: { score: 32, level: 'High resilience', severity: 'mild' }
    },
    expectedRiskLevel: 'low',
    expectedApproach: ['general_support', 'wellness_focus']
  },
  {
    id: 'test-user-2',
    email: 'test2@example.com',
    assessmentData: {
      phq9: { score: 12, level: 'Moderate depression', severity: 'moderate' },
      gad7: { score: 8, level: 'Mild anxiety', severity: 'mild' },
      ace: { score: 3, level: 'Low ACEs', severity: 'mild' },
      cdRisc: { score: 25, level: 'Moderate resilience', severity: 'moderate' }
    },
    expectedRiskLevel: 'moderate',
    expectedApproach: ['cbt_approach', 'anxiety_management']
  },
  {
    id: 'test-user-3',
    email: 'test3@example.com',
    assessmentData: {
      phq9: { score: 18, level: 'Severe depression', severity: 'critical' },
      gad7: { score: 15, level: 'Severe anxiety', severity: 'severe' },
      ace: { score: 7, level: 'High ACEs', severity: 'severe' },
      cdRisc: { score: 18, level: 'Low resilience', severity: 'severe' }
    },
    expectedRiskLevel: 'crisis',
    expectedApproach: ['trauma_informed_care', 'crisis_protocol']
  }
]

export class TestUtils {
  /**
   * Create test assessment data for a user
   */
  static async createTestAssessmentData(userId: string, assessmentData: TestUser['assessmentData']): Promise<void> {
    const assessments = [
      { id: 'phq9', title: 'PHQ-9 Depression Assessment' },
      { id: 'gad7', title: 'GAD-7 Anxiety Assessment' },
      { id: 'ace', title: 'ACE Questionnaire' },
      { id: 'cd-risc', title: 'CD-RISC Resilience Scale' }
    ]

    for (const assessment of assessments) {
      const data = assessmentData[assessment.id as keyof typeof assessmentData]
      if (data) {
        await supabase
          .from('assessment_results')
          .insert({
            user_id: userId,
            assessment_id: assessment.id,
            assessment_title: assessment.title,
            score: data.score,
            level: data.level,
            severity: data.severity,
            responses: {},
            result_data: { score: data.score, level: data.level, severity: data.severity }
          })
      }
    }

    // Create user assessment profile
    const userProfile = {
      id: userId,
      traumaHistory: {
        aceScore: assessmentData.ace?.score || 0,
        traumaCategories: assessmentData.ace?.score >= 4 ? ['childhood_trauma'] : [],
        needsTraumaInformedCare: (assessmentData.ace?.score || 0) >= 4
      },
      currentSymptoms: {
        depression: {
          level: assessmentData.phq9?.severity || 'normal',
          score: assessmentData.phq9?.score || 0,
          needsIntervention: (assessmentData.phq9?.score || 0) >= 10
        },
        anxiety: {
          level: assessmentData.gad7?.severity || 'normal',
          score: assessmentData.gad7?.score || 0,
          needsIntervention: (assessmentData.gad7?.score || 0) >= 10
        },
        stress: Math.max(assessmentData.phq9?.score || 0, assessmentData.gad7?.score || 0)
      },
      resilience: {
        level: assessmentData.cdRisc?.score < 20 ? 'low' :
               assessmentData.cdRisc?.score < 30 ? 'moderate' :
               assessmentData.cdRisc?.score < 35 ? 'high' : 'very_high',
        score: assessmentData.cdRisc?.score || 25,
        strengths: []
      },
      riskFactors: {
        suicideRisk: (assessmentData.phq9?.score || 0) >= 15,
        crisisIndicators: [],
        immediateActionNeeded: (assessmentData.phq9?.score || 0) >= 15 || (assessmentData.gad7?.score || 0) >= 15
      },
      preferences: {
        therapyApproach: [],
        copingStrategies: [],
        contentTypes: []
      },
      lastAssessed: new Date()
    }

    await supabase
      .from('user_assessment_profiles')
      .insert({
        user_id: userId,
        profile_data: userProfile,
        personalization_data: {
          therapy: [],
          content: [],
          community: [],
          wellness: [],
          crisis: []
        }
      })
  }

  /**
   * Clean up test data for a user
   */
  static async cleanupTestData(userId: string): Promise<void> {
    await supabase.from('assessment_results').delete().eq('user_id', userId)
    await supabase.from('user_assessment_profiles').delete().eq('user_id', userId)
    await supabase.from('conversation_progress').delete().eq('user_id', userId)
    await supabase.from('recommendation_tracking').delete().eq('user_id', userId)
    await supabase.from('progress_insights').delete().eq('user_id', userId)
  }

  /**
   * Test assessment context retrieval
   */
  static async testAssessmentContext(userId: string): Promise<{
    success: boolean
    context: any
    error?: string
  }> {
    try {
      const context = await AssessmentChatService.getUserAssessmentContext(userId)
      return { success: true, context }
    } catch (error) {
      return { success: false, context: null, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Test personalized recommendations
   */
  static async testPersonalizedRecommendations(userId: string): Promise<{
    success: boolean
    recommendations: any[]
    error?: string
  }> {
    try {
      const context = await AssessmentChatService.getUserAssessmentContext(userId)
      const recommendations = PersonalizedRecommendationEngine.generateRecommendations({
        userProfile: context.userProfile,
        currentEmotionalState: 'neutral',
        recentConversations: [],
        userPreferences: { therapyApproach: [], copingStrategies: [], contentTypes: [] },
        riskLevel: context.riskLevel,
        lastAssessed: context.lastAssessed
      })
      return { success: true, recommendations }
    } catch (error) {
      return { success: false, recommendations: [], error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Test progress tracking
   */
  static async testProgressTracking(userId: string): Promise<{
    success: boolean
    summary: any
    error?: string
  }> {
    try {
      const summary = await ProgressTrackingService.getProgressSummary(userId)
      return { success: true, summary }
    } catch (error) {
      return { success: false, summary: null, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Run comprehensive test suite
   */
  static async runTestSuite(userId: string): Promise<{
    assessmentContext: any
    recommendations: any
    progressTracking: any
    overallSuccess: boolean
  }> {
    const results = {
      assessmentContext: await this.testAssessmentContext(userId),
      recommendations: await this.testPersonalizedRecommendations(userId),
      progressTracking: await this.testProgressTracking(userId),
      overallSuccess: false
    }

    results.overallSuccess = results.assessmentContext.success && 
                           results.recommendations.success && 
                           results.progressTracking.success

    return results
  }

  /**
   * Validate risk level calculation
   */
  static validateRiskLevel(assessmentData: TestUser['assessmentData'], expectedRiskLevel: string): boolean {
    const phq9 = assessmentData.phq9?.score || 0
    const gad7 = assessmentData.gad7?.score || 0
    const ace = assessmentData.ace?.score || 0

    let calculatedRiskLevel = 'low'

    // Crisis indicators
    if (phq9 >= 15 || gad7 >= 15) {
      calculatedRiskLevel = 'crisis'
    }
    // High risk indicators
    else if (
      (phq9 >= 10 && ace >= 6) ||
      (phq9 >= 10 && phq9 >= 15) ||
      (ace >= 6 && (phq9 >= 5 || gad7 >= 5))
    ) {
      calculatedRiskLevel = 'high'
    }
    // Moderate risk indicators
    else if (
      phq9 >= 10 ||
      gad7 >= 10 ||
      ace >= 4 ||
      (phq9 >= 5 && gad7 >= 5)
    ) {
      calculatedRiskLevel = 'moderate'
    }

    return calculatedRiskLevel === expectedRiskLevel
  }

  /**
   * Generate test messages for different scenarios
   */
  static getTestMessages(): Array<{
    message: string
    emotionalState: string
    expectedCrisis: boolean
    description: string
  }> {
    return [
      {
        message: "I'm feeling a bit anxious today",
        emotionalState: "anxious",
        expectedCrisis: false,
        description: "Mild anxiety support"
      },
      {
        message: "I've been feeling really down lately",
        emotionalState: "sad",
        expectedCrisis: false,
        description: "Depression support"
      },
      {
        message: "I'm having trouble sleeping",
        emotionalState: "anxious",
        expectedCrisis: false,
        description: "Sleep issues"
      },
      {
        message: "I feel overwhelmed with everything",
        emotionalState: "overwhelmed",
        expectedCrisis: false,
        description: "Overwhelm support"
      },
      {
        message: "I'm having thoughts of hurting myself",
        emotionalState: "sad",
        expectedCrisis: true,
        description: "Crisis detection"
      },
      {
        message: "I want to end it all",
        emotionalState: "sad",
        expectedCrisis: true,
        description: "Suicide prevention"
      },
      {
        message: "I can't go on like this anymore",
        emotionalState: "sad",
        expectedCrisis: true,
        description: "Crisis intervention"
      }
    ]
  }

  /**
   * Mock chat AI response for testing
   */
  static createMockChatResponse(message: string, isCrisis: boolean = false): any {
    return {
      response: isCrisis 
        ? "I'm concerned about your safety. Please contact emergency services (911) or a crisis hotline immediately."
        : "I hear that you're going through a difficult time. I'm here to listen and support you.",
      success: true,
      isCrisis,
      emotionalTone: isCrisis ? 'concerned' : 'empathetic',
      isAffirmation: !isCrisis,
      assessmentContext: {
        hasAssessmentData: true,
        riskLevel: 'moderate',
        focusAreas: ['anxiety_management', 'support'],
        recommendations: ['professional_help', 'self_care'],
        lastAssessed: new Date().toISOString()
      }
    }
  }
}

export default TestUtils
