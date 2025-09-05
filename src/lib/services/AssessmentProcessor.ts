/**
 * Assessment Processor
 * Handles assessment result processing and scoring logic
 */

import { AssessmentResult } from '@/data/assessments'
import { UserProfile } from '@/data/assessment-integration'

export class AssessmentProcessor {
  /**
   * Extract symptom data from assessment results
   */
  static extractSymptomData(results: Record<string, AssessmentResult>) {
    const phq9 = results['phq9']
    const gad7 = results['gad7']
    const pss10 = results['pss10']
    const who5 = results['who5']

    // Map severity levels to UserProfile interface
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
   * Extract trauma data from ACE assessment
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
    if (this.extractResilienceData(results).score < 30) {
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

  /**
   * Process assessment results and create comprehensive user profile
   */
  static processResultsImmediate(results: Record<string, AssessmentResult>): Omit<UserProfile, 'id'> {
    return {
      traumaHistory: this.extractTraumaData(results),
      currentSymptoms: this.extractSymptomData(results),
      currentTrauma: results['pcl5'] ? this.extractCurrentTraumaData(results) : undefined,
      resilience: this.extractResilienceData(results),
      riskFactors: this.assessRiskFactors(results),
      preferences: this.generatePreferences(results),
      lastAssessed: new Date()
    }
  }

  /**
   * Validate assessment results
   */
  static validateAssessmentResult(result: AssessmentResult): boolean {
    // Check for required fields
    if (!result.score || typeof result.score !== 'number') return false
    if (!result.level || typeof result.level !== 'string') return false
    if (!result.severity || typeof result.severity !== 'string') return false
    if (!result.description || typeof result.description !== 'string') return false

    // Check for valid severity levels
    const validSeverities = ['normal', 'mild', 'moderate', 'severe', 'critical']
    if (!validSeverities.includes(result.severity)) return false

    return true
  }

  /**
   * Calculate assessment completion percentage
   */
  static calculateCompletionPercentage(results: Record<string, AssessmentResult>): number {
    const totalAssessments = 6 // phq9, gad7, pss10, who5, ace, cd-risc
    const completedAssessments = Object.keys(results).length
    return Math.round((completedAssessments / totalAssessments) * 100)
  }
}

export default AssessmentProcessor
