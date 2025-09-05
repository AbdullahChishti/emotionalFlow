/**
 * Assessment Results Integration
 * How assessment data flows through the platform
 */

import { AssessmentResult } from './assessments'
import { supabase } from '@/lib/supabase'

export interface UserProfile {
  id: string
  traumaHistory: {
    aceScore: number
    traumaCategories: string[]
    needsTraumaInformedCare: boolean
  }
  currentSymptoms: {
    depression: {
      level: 'normal' | 'mild' | 'moderate' | 'severe' | 'critical'
      score: number
      needsIntervention: boolean
      friendlyExplanation?: string
    }
    anxiety: {
      level: 'normal' | 'mild' | 'moderate' | 'severe' | 'critical'
      score: number
      needsIntervention: boolean
      friendlyExplanation?: string
    }
    stress: {
      level: 'normal' | 'mild' | 'moderate' | 'severe' | 'critical'
      score: number
      needsIntervention: boolean
      friendlyExplanation?: string
    }
    wellbeing: {
      level: 'normal' | 'mild' | 'moderate' | 'severe' | 'critical'
      score: number
      needsEnhancement: boolean
      friendlyExplanation?: string
    }
  }
  currentTrauma?: {
    level: 'normal' | 'mild' | 'moderate' | 'severe' | 'critical'
    score: number
    needsTraumaInformedCare: boolean
    friendlyExplanation?: string
  }
  resilience: {
    level: 'low' | 'moderate' | 'high' | 'very_high'
    score: number
    strengths: string[]
    friendlyExplanation?: string
  }
  riskFactors: {
    suicideRisk: boolean
    crisisIndicators: string[]
    immediateActionNeeded: boolean
  }
  preferences: {
    therapyApproach: string[]
    copingStrategies: string[]
    contentTypes: string[]
  }
  lastAssessed: Date
}

export interface AIExplanationRequest {
  clinicalResult: {
    assessmentId: string
    assessmentName: string
    score: number
    level: string
    severity: 'normal' | 'mild' | 'moderate' | 'severe' | 'critical'
    clinicalDescription: string
  }
  userContext?: {
    assessmentHistory?: 'first_time' | 'follow_up' | 'returning'
    primaryConcern?: string
    preferredLanguage?: 'clinical' | 'friendly' | 'simple'
  }
  tone?: 'empathetic' | 'encouraging' | 'professional' | 'casual'
}

export interface AIExplanationResponse {
  success: boolean
  explanation?: string
  clinicalResult?: any
  metadata?: any
  error?: string
}

/**
 * Generate AI-enhanced friendly explanation for assessment results
 */
export async function generateFriendlyExplanation(
  assessmentId: string,
  assessmentName: string,
  clinicalResult: AssessmentResult,
  userContext?: any
): Promise<string> {
  try {
    const requestData: AIExplanationRequest = {
      clinicalResult: {
        assessmentId,
        assessmentName,
        score: clinicalResult.score,
        level: clinicalResult.level,
        severity: clinicalResult.severity as 'normal' | 'mild' | 'moderate' | 'severe' | 'critical',
        clinicalDescription: clinicalResult.description
      },
      userContext: {
        assessmentHistory: 'first_time',
        preferredLanguage: 'friendly'
      },
      tone: 'empathetic'
    }

    const { data, error } = await supabase.functions.invoke(
      'generate-assessment-explanation',
      {
        body: requestData
      }
    )

    if (error) {
      console.error('AI explanation error:', error)
      console.log('Falling back to local explanation generation')
      return generateFallbackExplanation(assessmentName, clinicalResult)
    }

    // Check if we got a valid explanation
    if (data?.explanation && typeof data.explanation === 'string' && data.explanation.trim().length > 0) {
      console.log('✅ Successfully generated AI explanation for', assessmentName)
      return data.explanation
    } else {
      console.log('⚠️ AI service returned empty response for', assessmentName, '- using intelligent fallback')
      return generateFallbackExplanation(assessmentName, clinicalResult)
    }
  } catch (error) {
    console.error('Failed to generate AI explanation:', error)
    return generateFallbackExplanation(assessmentName, clinicalResult)
  }
}

function generateFallbackExplanation(assessmentName: string, clinicalResult: AssessmentResult): string {
  const { score, level, severity } = clinicalResult

  let explanation = `Your ${assessmentName} shows a score of ${score}, indicating ${level} symptoms. `

  switch (severity) {
    case 'normal':
      explanation += "This is great news! It suggests you're doing well in this area. Keep nurturing your mental wellness with the positive habits you already have."
      break
    case 'mild':
      explanation += "You're experiencing some normal life challenges that many people face. This is manageable with good self-care and support from friends or loved ones."
      break
    case 'moderate':
      explanation += "This indicates you're going through a significant time right now. Consider connecting with a mental health professional who can provide personalized guidance and support."
      break
    case 'severe':
      explanation += "This shows you're experiencing considerable difficulty and could really benefit from professional mental health support. Please consider reaching out to a therapist or counselor."
      break
    case 'critical':
      explanation += "This suggests you're going through an extremely challenging time. Please contact a mental health professional or crisis service right away for immediate support."
      break
    default:
      explanation += "Remember that assessment results are just one piece of your overall wellness picture. Consider discussing these results with a healthcare provider for personalized guidance."
  }

  // Add encouraging closing
  explanation += "\n\nYou're taking an important step by learning more about your mental health. Many people in similar situations find meaningful improvement with the right support and strategies."

  return explanation
}

export class AssessmentIntegrator {
  /**
   * Process assessment results immediately with local scoring only
   */
  static processResultsImmediate(results: Record<string, AssessmentResult>): UserProfile {
    const symptomData = this.extractSymptomData(results)
    const resilienceData = this.extractResilienceData(results)

    return {
      id: 'user_' + Date.now(),
      traumaHistory: this.extractTraumaData(results),
      currentSymptoms: {
        depression: {
          ...symptomData.depression,
          friendlyExplanation: '' // Will be enhanced by AI later
        },
        anxiety: {
          ...symptomData.anxiety,
          friendlyExplanation: '' // Will be enhanced by AI later
        },
        stress: {
          ...symptomData.stress,
          friendlyExplanation: '' // Will be enhanced by AI later
        },
        wellbeing: {
          ...symptomData.wellbeing,
          friendlyExplanation: '' // Will be enhanced by AI later
        }
      },
      currentTrauma: results['pcl5'] ? {
        ...this.extractCurrentTraumaData(results),
        friendlyExplanation: '' // Will be enhanced by AI later
      } : undefined,
      resilience: {
        ...resilienceData,
        friendlyExplanation: '' // Will be enhanced by AI later
      },
      riskFactors: this.assessRiskFactors(results),
      preferences: this.generatePreferences(results),
      lastAssessed: new Date()
    }
  }

  /**
   * Process assessment results and update user profile (legacy - now async with AI)
   */
  static async processResults(results: Record<string, AssessmentResult>): Promise<UserProfile> {
    // Start with immediate local results
    const userProfile = this.processResultsImmediate(results)

    try {
      // Generate AI explanations in parallel (non-blocking)
      const aiExplanations = await Promise.allSettled([
        results['phq9'] ? generateFriendlyExplanation('phq9', 'PHQ-9 Depression Assessment', results['phq9']) : Promise.resolve(''),
        results['gad7'] ? generateFriendlyExplanation('gad7', 'GAD-7 Anxiety Assessment', results['gad7']) : Promise.resolve(''),
        results['pss10'] ? generateFriendlyExplanation('pss10', 'PSS-10 Perceived Stress Scale', results['pss10']) : Promise.resolve(''),
        results['who5'] ? generateFriendlyExplanation('who5', 'WHO-5 Well-Being Index', results['who5']) : Promise.resolve(''),
        results['pcl5'] ? generateFriendlyExplanation('pcl5', 'PCL-5 PTSD Checklist', results['pcl5']) : Promise.resolve(''),
        results['cd-risc'] ? generateFriendlyExplanation('cd-risc', 'CD-RISC Resilience Scale', results['cd-risc']) : Promise.resolve('')
      ])

      // Extract successful AI explanations
      const [
        depressionExplanation,
        anxietyExplanation,
        stressExplanation,
        wellbeingExplanation,
        traumaExplanation,
        resilienceExplanation
      ] = aiExplanations.map(result =>
        result.status === 'fulfilled' ? result.value : ''
      )

      // Return enhanced profile with AI explanations
      return {
        ...userProfile,
        currentSymptoms: {
          depression: {
            ...userProfile.currentSymptoms.depression,
            friendlyExplanation: depressionExplanation
          },
          anxiety: {
            ...userProfile.currentSymptoms.anxiety,
            friendlyExplanation: anxietyExplanation
          },
          stress: {
            ...userProfile.currentSymptoms.stress,
            friendlyExplanation: stressExplanation
          },
          wellbeing: {
            ...userProfile.currentSymptoms.wellbeing,
            friendlyExplanation: wellbeingExplanation
          }
        },
        currentTrauma: userProfile.currentTrauma ? {
          ...userProfile.currentTrauma,
          friendlyExplanation: traumaExplanation
        } : undefined,
        resilience: {
          ...userProfile.resilience,
          friendlyExplanation: resilienceExplanation
        }
      }
    } catch (error) {
      console.error('Error generating AI explanations:', error)
      // Return basic profile without AI enhancements
      return userProfile
    }
  }

  /**
   * Generate AI explanations for an existing profile (for progressive enhancement)
   */
  static async enhanceProfileWithAI(
    results: Record<string, AssessmentResult>,
    userProfile: UserProfile,
    onProgress?: (assessmentId: string, explanation: string) => void
  ): Promise<UserProfile> {
    try {
      // Generate AI explanations in parallel
      const aiPromises = [
        results['phq9'] ? generateFriendlyExplanation('phq9', 'PHQ-9 Depression Assessment', results['phq9']).then(exp => {
          onProgress?.('phq9', exp)
          return exp
        }) : Promise.resolve(''),
        results['gad7'] ? generateFriendlyExplanation('gad7', 'GAD-7 Anxiety Assessment', results['gad7']).then(exp => {
          onProgress?.('gad7', exp)
          return exp
        }) : Promise.resolve(''),
        results['pss10'] ? generateFriendlyExplanation('pss10', 'PSS-10 Perceived Stress Scale', results['pss10']).then(exp => {
          onProgress?.('pss10', exp)
          return exp
        }) : Promise.resolve(''),
        results['who5'] ? generateFriendlyExplanation('who5', 'WHO-5 Well-Being Index', results['who5']).then(exp => {
          onProgress?.('who5', exp)
          return exp
        }) : Promise.resolve(''),
        results['pcl5'] ? generateFriendlyExplanation('pcl5', 'PCL-5 PTSD Checklist', results['pcl5']).then(exp => {
          onProgress?.('pcl5', exp)
          return exp
        }) : Promise.resolve(''),
        results['cd-risc'] ? generateFriendlyExplanation('cd-risc', 'CD-RISC Resilience Scale', results['cd-risc']).then(exp => {
          onProgress?.('cd-risc', exp)
          return exp
        }) : Promise.resolve('')
      ]

      const aiExplanations = await Promise.allSettled(aiPromises)

      // Extract successful AI explanations
      const [
        depressionExplanation,
        anxietyExplanation,
        stressExplanation,
        wellbeingExplanation,
        traumaExplanation,
        resilienceExplanation
      ] = aiExplanations.map(result =>
        result.status === 'fulfilled' ? result.value : ''
      )

      // Return enhanced profile
      return {
        ...userProfile,
        currentSymptoms: {
          depression: {
            ...userProfile.currentSymptoms.depression,
            friendlyExplanation: depressionExplanation
          },
          anxiety: {
            ...userProfile.currentSymptoms.anxiety,
            friendlyExplanation: anxietyExplanation
          },
          stress: {
            ...userProfile.currentSymptoms.stress,
            friendlyExplanation: stressExplanation
          },
          wellbeing: {
            ...userProfile.currentSymptoms.wellbeing,
            friendlyExplanation: wellbeingExplanation
          }
        },
        currentTrauma: userProfile.currentTrauma ? {
          ...userProfile.currentTrauma,
          friendlyExplanation: traumaExplanation
        } : undefined,
        resilience: {
          ...userProfile.resilience,
          friendlyExplanation: resilienceExplanation
        }
      }
    } catch (error) {
      console.error('Error enhancing profile with AI:', error)
      return userProfile
    }
  }

  /**
   * Extract trauma information from ACE and related assessments
   */
  static extractTraumaData(results: Record<string, AssessmentResult>) {
    const aceResult = results['ace']
    const traumaCategories: string[] = []

    if (aceResult) {
      // Extract specific trauma categories from ACE responses
      if (aceResult.score >= 4) {
        traumaCategories.push('childhood_trauma')
      }
    }

    return {
      aceScore: aceResult?.score || 0,
      traumaCategories,
      needsTraumaInformedCare: (aceResult?.score || 0) >= 4
    }
  }

  /**
   * Extract current symptom data from PHQ-9, GAD-7, etc.
   */
  static extractSymptomData(results: Record<string, AssessmentResult>) {
    const phq9 = results['phq9']
    const gad7 = results['gad7']
    const pss10 = results['pss10']
    const who5 = results['who5']

    // Map severity levels to match UserProfile interface
    const mapSeverity = (severity: string): 'normal' | 'mild' | 'moderate' | 'severe' | 'critical' => {
      switch (severity) {
        case 'minimal':
        case 'normal':
          return 'normal'
        case 'mild':
          return 'mild'
        case 'moderate':
          return 'moderate'
        case 'severe':
          return 'severe'
        case 'critical':
          return 'critical'
        default:
          return 'normal'
      }
    }

    // Map wellbeing severity (reverse scored since higher is better)
    const mapWellbeingSeverity = (severity: string): 'normal' | 'mild' | 'moderate' | 'severe' | 'critical' => {
      switch (severity) {
        case 'normal':
          return 'normal'
        case 'mild':
          return 'mild'
        case 'moderate':
          return 'moderate'
        case 'severe':
          return 'severe'
        case 'critical':
          return 'critical'
        default:
          return 'normal'
      }
    }

    return {
      depression: {
        level: phq9 ? mapSeverity(phq9.severity) : 'normal',
        score: phq9?.score || 0,
        needsIntervention: (phq9?.score || 0) >= 10
      },
      anxiety: {
        level: gad7 ? mapSeverity(gad7.severity) : 'normal',
        score: gad7?.score || 0,
        needsIntervention: (gad7?.score || 0) >= 10
      },
      stress: {
        level: pss10 ? mapSeverity(pss10.severity) : 'normal',
        score: pss10?.score || 0,
        needsIntervention: (pss10?.score || 0) >= 27
      },
      wellbeing: {
        level: who5 ? mapWellbeingSeverity(who5.severity) : 'normal',
        score: who5?.score || 0,
        needsEnhancement: (who5?.score || 25) < 13 // WHO-5 score below 13 indicates need for enhancement
      }
    }
  }

  /**
   * Extract current trauma data from PCL-5
   */
  static extractCurrentTraumaData(results: Record<string, AssessmentResult>) {
    const pcl5 = results['pcl5']

    // Map severity levels to match UserProfile interface
    const mapSeverity = (severity: string): 'normal' | 'mild' | 'moderate' | 'severe' | 'critical' => {
      switch (severity) {
        case 'minimal':
        case 'normal':
          return 'normal'
        case 'mild':
          return 'mild'
        case 'moderate':
          return 'moderate'
        case 'severe':
          return 'severe'
        case 'critical':
          return 'critical'
        default:
          return 'normal'
      }
    }

    return {
      level: pcl5 ? mapSeverity(pcl5.severity) : 'normal',
      score: pcl5?.score || 0,
      needsTraumaInformedCare: (pcl5?.score || 0) >= 34
    }
  }

  /**
   * Extract resilience and coping data
   */
  static extractResilienceData(results: Record<string, AssessmentResult>) {
    const resilience = results['cd-risc']
    const strengths: string[] = []

    if (resilience) {
      if (resilience.score >= 35) {
        strengths.push('high_resilience', 'strong_coping', 'adaptability')
      } else if (resilience.score >= 30) {
        strengths.push('good_resilience', 'developing_coping')
      }
    }

    // Map severity to UserProfile resilience level
    const mapResilienceLevel = (severity: string, score: number): 'low' | 'moderate' | 'high' | 'very_high' => {
      if (score >= 35) return 'very_high'
      if (score >= 30) return 'high'
      if (score >= 20) return 'moderate'
      return 'low'
    }

    return {
      level: resilience ? mapResilienceLevel(resilience.severity, resilience.score) : 'moderate',
      score: resilience?.score || 0,
      strengths
    }
  }

  /**
   * Assess risk factors and crisis indicators
   */
  static assessRiskFactors(results: Record<string, AssessmentResult>) {
    const phq9 = results['phq9']
    const ace = results['ace']

    const crisisIndicators: string[] = []
    let suicideRisk = false
    let immediateActionNeeded = false

    // Suicide risk from PHQ-9 question 9
    if (phq9 && phq9.score >= 10) {
      suicideRisk = true
      crisisIndicators.push('depression_symptoms')
    }

    // High trauma + current symptoms = increased risk
    if (ace && ace.score >= 6 && (phq9?.score || 0) >= 10) {
      crisisIndicators.push('complex_trauma')
      immediateActionNeeded = true
    }

    return {
      suicideRisk,
      crisisIndicators,
      immediateActionNeeded
    }
  }

  /**
   * Generate personalized preferences based on assessment results
   */
  static generatePreferences(results: Record<string, AssessmentResult>) {
    const preferences = {
      therapyApproach: [] as string[],
      copingStrategies: [] as string[],
      contentTypes: [] as string[]
    }

    const phq9 = results['phq9']
    const gad7 = results['gad7']
    const pss10 = results['pss10']
    const who5 = results['who5']
    const pcl5 = results['pcl5']
    const resilience = results['cd-risc']
    const ace = results['ace']

    // Therapy approach preferences
    if (phq9?.score >= 10) {
      preferences.therapyApproach.push('cbt', 'medication_management')
    }
    if (gad7?.score >= 10) {
      preferences.therapyApproach.push('exposure_therapy', 'mindfulness')
    }
    if (pss10?.score >= 27) {
      preferences.therapyApproach.push('stress_management', 'relaxation_training')
    }
    if (who5?.score < 13) {
      preferences.therapyApproach.push('positive_psychology', 'wellbeing_coaching')
    }
    if (pcl5?.score >= 34) {
      preferences.therapyApproach.push('trauma_focused', 'emdr', 'prolonged_exposure')
    }
    if (ace?.score >= 4) {
      preferences.therapyApproach.push('trauma_focused', 'emdr')
    }

    // Coping strategy preferences
    if (resilience?.score < 30) {
      preferences.copingStrategies.push('skill_building', 'social_support')
    }
    if (phq9?.score >= 10) {
      preferences.copingStrategies.push('activity_scheduling', 'behavioral_activation')
    }
    if (gad7?.score >= 10) {
      preferences.copingStrategies.push('relaxation_techniques', 'worry_journaling')
    }
    if (pss10?.score >= 27) {
      preferences.copingStrategies.push('stress_reduction', 'time_management', 'deep_breathing')
    }
    if (who5?.score < 13) {
      preferences.copingStrategies.push('gratitude_practice', 'positive_affirmations', 'meaningful_activities')
    }
    if (pcl5?.score >= 34) {
      preferences.copingStrategies.push('grounding_techniques', 'trauma_processing')
    }

    // Content type preferences
    if (phq9?.score >= 10) {
      preferences.contentTypes.push('depression_resources', 'mood_tracking')
    }
    if (gad7?.score >= 10) {
      preferences.contentTypes.push('anxiety_management', 'mindfulness_exercises')
    }
    if (pss10?.score >= 27) {
      preferences.contentTypes.push('stress_management', 'relaxation_audio')
    }
    if (who5?.score < 13) {
      preferences.contentTypes.push('wellbeing_exercises', 'positive_psychology', 'happiness_hacks')
    }
    if (pcl5?.score >= 34) {
      preferences.contentTypes.push('trauma_recovery', 'grounding_techniques', 'ptsd_resources')
    }
    if (ace?.score >= 4) {
      preferences.contentTypes.push('trauma_recovery', 'grounding_techniques')
    }

    return preferences
  }
}

// Integration hooks for different platform features
export const AssessmentIntegrations = {
  /**
   * Personalize AI therapy sessions
   */
  personalizeTherapy: (userProfile: UserProfile) => ({
    systemPrompt: generateTherapyPrompt(userProfile),
    focusAreas: getTherapyFocus(userProfile),
    safetyProtocols: getSafetyProtocols(userProfile)
  }),

  /**
   * Filter and recommend wellness content
   */
  recommendContent: (userProfile: UserProfile) => ({
    meditationThemes: getMeditationThemes(userProfile),
    journalPrompts: getJournalPrompts(userProfile),
    exerciseTypes: getExerciseTypes(userProfile)
  }),

  /**
   * Match with appropriate community groups
   */
  matchCommunity: (userProfile: UserProfile) => ({
    groupTypes: getSuitableGroups(userProfile),
    supportLevel: getSupportLevel(userProfile),
    peerMatching: getPeerMatching(userProfile)
  }),

  /**
   * Generate personalized wellness plan
   */
  createWellnessPlan: (userProfile: UserProfile) => ({
    dailyGoals: generateDailyGoals(userProfile),
    weeklyActivities: generateWeeklyActivities(userProfile),
    progressMilestones: generateMilestones(userProfile)
  }),

  /**
   * Crisis intervention triggers
   */
  crisisDetection: (userProfile: UserProfile) => ({
    triggerImmediate: userProfile.riskFactors.immediateActionNeeded,
    recommendedActions: getCrisisActions(userProfile),
    emergencyContacts: getEmergencyContacts(userProfile)
  })
}

// Helper functions for integration
function generateTherapyPrompt(profile: UserProfile): string {
  const prompts = []

  if (profile.traumaHistory.needsTraumaInformedCare) {
    prompts.push('trauma-informed approach')
  }
  if (profile.currentSymptoms.depression.needsIntervention) {
    prompts.push('depression-focused CBT')
  }
  if (profile.currentSymptoms.anxiety.needsIntervention) {
    prompts.push('anxiety management techniques')
  }

  return `You are a compassionate therapist using ${prompts.join(', ')} to support this user.`
}

function getTherapyFocus(profile: UserProfile): string[] {
  const focus = []

  if (profile.currentSymptoms.depression.score > 0) {
    focus.push('mood regulation', 'behavioral activation')
  }
  if (profile.currentSymptoms.anxiety.score > 0) {
    focus.push('worry management', 'relaxation skills')
  }
  if (profile.traumaHistory.aceScore > 0) {
    focus.push('safety building', 'grounding techniques')
  }

  return focus
}

function getSafetyProtocols(profile: UserProfile): string[] {
  const protocols = ['standard_safety_check']

  if (profile.riskFactors.suicideRisk) {
    protocols.push('suicide_prevention_protocol', 'immediate_crisis_resources')
  }
  if (profile.traumaHistory.aceScore >= 6) {
    protocols.push('trauma_trigger_monitoring')
  }

  return protocols
}

function getMeditationThemes(profile: UserProfile): string[] {
  const themes = ['mindfulness']

  if (profile.currentSymptoms.anxiety.score >= 10) {
    themes.push('anxiety_relief', 'body_scan')
  }
  if (profile.currentSymptoms.depression.score >= 10) {
    themes.push('self_compassion', 'loving_kindness')
  }
  if (profile.traumaHistory.aceScore >= 4) {
    themes.push('grounding', 'safe_place')
  }

  return themes
}

function getJournalPrompts(profile: UserProfile): string[] {
  const prompts = []

  if (profile.currentSymptoms.depression.score >= 10) {
    prompts.push('What activities bring you joy?', 'What are your strengths?')
  }
  if (profile.currentSymptoms.anxiety.score >= 10) {
    prompts.push('What triggers your anxiety?', 'What coping strategies work for you?')
  }

  return prompts
}

function getExerciseTypes(profile: UserProfile): string[] {
  const exercises = ['walking', 'yoga']

  if (profile.currentSymptoms.depression.score >= 10) {
    exercises.push('dance', 'group_fitness')
  }
  if (profile.currentSymptoms.anxiety.score >= 10) {
    exercises.push('tai_chi', 'swimming')
  }

  return exercises
}

function getSuitableGroups(profile: UserProfile): string[] {
  const groups = []

  if (profile.currentSymptoms.depression.score >= 10) {
    groups.push('depression_support')
  }
  if (profile.currentSymptoms.anxiety.score >= 10) {
    groups.push('anxiety_support')
  }
  if (profile.traumaHistory.aceScore >= 4) {
    groups.push('trauma_survivors')
  }

  return groups
}

function getSupportLevel(profile: UserProfile): string {
  if (profile.riskFactors.immediateActionNeeded) return 'crisis_support'
  if (profile.currentSymptoms.depression.score >= 15 || profile.currentSymptoms.anxiety.score >= 15) {
    return 'intensive_support'
  }
  return 'general_support'
}

function getPeerMatching(profile: UserProfile): object {
  return {
    similarExperiences: profile.traumaHistory.traumaCategories,
    similarSymptoms: {
      depression: profile.currentSymptoms.depression.level,
      anxiety: profile.currentSymptoms.anxiety.level
    },
    resilienceLevel: profile.resilience.level
  }
}

function generateDailyGoals(profile: UserProfile): string[] {
  const goals = ['practice_self_care']

  if (profile.currentSymptoms.depression.score >= 10) {
    goals.push('one_pleasant_activity', 'social_connection')
  }
  if (profile.currentSymptoms.anxiety.score >= 10) {
    goals.push('practice_relaxation', 'limit_worry_time')
  }

  return goals
}

function generateWeeklyActivities(profile: UserProfile): string[] {
  const activities = ['mindfulness_practice']

  if (profile.resilience.score < 30) {
    activities.push('skill_building_workshop')
  }
  if (profile.traumaHistory.aceScore >= 4) {
    activities.push('trauma_education_session')
  }

  return activities
}

function generateMilestones(profile: UserProfile): object[] {
  return [
    {
      type: 'assessment_completion',
      completed: true,
      date: profile.lastAssessed
    },
    {
      type: 'resilience_building',
      target: profile.resilience.score < 30 ? 35 : profile.resilience.score + 5,
      current: profile.resilience.score
    },
    {
      type: 'symptom_reduction',
      target: Math.max(profile.currentSymptoms.depression.score, profile.currentSymptoms.anxiety.score) * 0.7,
      current: Math.max(profile.currentSymptoms.depression.score, profile.currentSymptoms.anxiety.score)
    }
  ]
}

function getCrisisActions(profile: UserProfile): string[] {
  const actions = []

  if (profile.riskFactors.suicideRisk) {
    actions.push('immediate_professional_contact', 'safety_plan_creation', 'emergency_resources')
  }
  if (profile.traumaHistory.aceScore >= 6) {
    actions.push('trauma_specialist_referral')
  }

  return actions
}

function getEmergencyContacts(profile: UserProfile): string[] {
  const contacts = ['national_suicide_hotline']

  if (profile.riskFactors.suicideRisk) {
    contacts.push('emergency_services', 'crisis_text_line')
  }

  return contacts
}

export default AssessmentIntegrator
