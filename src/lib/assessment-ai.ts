import { supabase } from './supabase'

export interface AssessmentData {
  assessmentName: string
  score: number
  maxScore: number
  responses: Record<string, number | string>
  category: string
}

export interface AIExplanation {
  summary: string
  whatItMeans: string
  manifestations: string[]
  unconsciousManifestations: string[]
  recommendations: string[]
  nextSteps: string
  supportiveMessage: string
}

export async function getAIAssessmentExplanation(
  assessmentData: AssessmentData,
  userProfile?: any
): Promise<AIExplanation> {
  try {
    // Log what we're sending to the AI
    console.log('[AI] 🚀 SENDING TO EDGE FUNCTION:')
    console.log('[AI] Assessment Data:', {
      assessmentName: assessmentData.assessmentName,
      score: assessmentData.score,
      maxScore: assessmentData.maxScore,
      category: assessmentData.category,
      responsesKeys: Object.keys(assessmentData.responses),
      responsesSample: Object.entries(assessmentData.responses).slice(0, 3) // First 3 responses
    })
    console.log('[AI] User Profile:', userProfile ? {
      display_name: userProfile.display_name,
      preferred_mode: userProfile.preferred_mode,
      emotional_capacity: userProfile.emotional_capacity,
      is_anonymous: userProfile.is_anonymous
    } : 'No user profile')

    // Call the Supabase Edge Function with a timeout to prevent hangs
    const TIMEOUT_MS = 8000
    const invokePromise = supabase.functions.invoke('generate-assessment-explanation', {
      body: {
        assessmentData,
        userProfile
      }
    })

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI explanation timeout')), TIMEOUT_MS)
    )

    const { data, error } = await Promise.race([invokePromise, timeoutPromise]) as {
      data: any
      error: any
    }

    if (error) {
      throw error
    }

    // Log exactly what we received from the Edge Function (ChatGPT-backed)
    console.log('[AI] Raw response from edge function:', data)
    console.log('[AI] Response type:', typeof data)
    console.log('[AI] Response keys:', data ? Object.keys(data) : 'null')

    // Handle both success and fallback response structures
    let explanation: AIExplanation

    if (data?.explanation) {
      // Success response with explanation
      explanation = data.explanation
      console.log('[AI] Using explanation from response')
    } else if (data?.fallback) {
      // Fallback response
      explanation = data.fallback
      console.log('[AI] Using fallback explanation')
    } else {
      // Direct response (legacy)
      explanation = data as AIExplanation
      console.log('[AI] Using direct response')
    }

    console.log('[AI] Final explanation:', {
      summary: explanation?.summary?.length || 0,
      recommendations: explanation?.recommendations?.length || 0,
      manifestations: explanation?.manifestations?.length || 0,
      nextSteps: explanation?.nextSteps?.length || 0
    })

    return explanation as AIExplanation
  } catch (error) {
    console.error('Error getting AI explanation:', error)

    // Fallback to a basic explanation
    const fallback = generateFallbackExplanation(assessmentData)
    console.warn('[AI] Using fallback explanation (edge function failed). Fallback payload:', fallback)
    return fallback
  }
}

function generateFallbackExplanation(assessmentData: AssessmentData): AIExplanation {
  const { assessmentName, score, maxScore, category } = assessmentData
  const percentage = Math.round((score / maxScore) * 100)
  
  let summary = ''
  let whatItMeans = ''
  let unconsciousManifestations: string[] = []
  let recommendations: string[] = []
  let nextSteps = ''
  let supportiveMessage = ''

  if (category === 'depression' || assessmentName.includes('PHQ-9')) {
    if (score <= 4) {
      summary = 'Your assessment shows minimal symptoms of depression.'
      whatItMeans = 'This is great news! You\'re experiencing normal mood fluctuations that everyone goes through.'
      unconsciousManifestations = [
        'You might be more resilient than you realize',
        'Your natural coping mechanisms are working well',
        'You\'re likely maintaining healthy boundaries naturally'
      ]
      recommendations = [
        'Continue your current healthy habits',
        'Stay connected with friends and family',
        'Practice regular self-care activities'
      ]
      nextSteps = 'Keep monitoring your mood and reach out if you notice any changes.'
      supportiveMessage = 'You\'re doing well! Remember, it\'s okay to have ups and downs - that\'s part of being human.'
    } else if (score <= 9) {
      summary = 'Your assessment shows mild symptoms of depression.'
      whatItMeans = 'You may be experiencing some low mood, but it\'s manageable and common during stressful times.'
      unconsciousManifestations = [
        'You might be avoiding social situations without realizing it',
        'You could be more irritable with loved ones than usual',
        'You might be procrastinating more than you typically do'
      ]
      recommendations = [
        'Try to maintain regular sleep and exercise',
        'Talk to someone you trust about how you\'re feeling',
        'Consider simple mood-boosting activities'
      ]
      nextSteps = 'Monitor these symptoms and consider talking to a mental health professional if they persist.'
      supportiveMessage = 'It\'s brave to acknowledge when you\'re not feeling your best. These feelings won\'t last forever.'
    } else {
      summary = 'Your assessment shows moderate to severe symptoms of depression.'
      whatItMeans = 'You\'re experiencing significant emotional distress that deserves professional attention and support.'
      unconsciousManifestations = [
        'You might be isolating yourself from friends and family',
        'You could be neglecting basic self-care without noticing',
        'You might be experiencing negative thought patterns that feel automatic'
      ]
      recommendations = [
        'Please reach out to a mental health professional',
        'Talk to your doctor about how you\'re feeling',
        'Consider reaching out to a crisis helpline if needed'
      ]
      nextSteps = 'Professional help can make a real difference. You don\'t have to face this alone.'
      supportiveMessage = 'Your feelings are valid and important. Getting help is a sign of strength, not weakness.'
    }
  } else if (category === 'anxiety' || assessmentName.includes('GAD-7')) {
    if (score <= 4) {
      summary = 'Your assessment shows minimal symptoms of anxiety.'
      whatItMeans = 'You\'re managing stress well and experiencing normal levels of worry.'
      unconsciousManifestations = [
        'You\'re likely maintaining healthy stress boundaries',
        'Your natural relaxation responses are working well',
        'You probably have good emotional regulation skills'
      ]
      recommendations = [
        'Continue your current stress management techniques',
        'Maintain healthy boundaries and self-care routines',
        'Practice mindfulness or relaxation exercises'
      ]
      nextSteps = 'Keep up your good work in managing stress and anxiety.'
      supportiveMessage = 'You\'re handling life\'s challenges with resilience and balance.'
    } else if (score <= 9) {
      summary = 'Your assessment shows mild symptoms of anxiety.'
      whatItMeans = 'You may be experiencing some worry and stress, but it\'s manageable.'
      unconsciousManifestations = [
        'You might be overthinking decisions without realizing it',
        'You could be experiencing physical tension in your body',
        'You might be avoiding certain situations due to worry'
      ]
      recommendations = [
        'Practice deep breathing exercises',
        'Try to identify and address sources of stress',
        'Maintain regular sleep and exercise routines'
      ]
      nextSteps = 'Consider learning more about anxiety management techniques.'
      supportiveMessage = 'Anxiety is a normal response to stress. You\'re not alone in feeling this way.'
    } else {
      summary = 'Your assessment shows moderate to severe symptoms of anxiety.'
      whatItMeans = 'Your anxiety is significantly impacting your daily life and deserves professional attention.'
      unconsciousManifestations = [
        'You might be experiencing panic attacks or intense worry',
        'You could be avoiding social situations due to anxiety',
        'You might be experiencing physical symptoms like rapid heartbeat or sweating'
      ]
      recommendations = [
        'Please consider talking to a mental health professional',
        'Learn about anxiety management techniques',
        'Practice grounding exercises when feeling overwhelmed'
      ]
      nextSteps = 'Professional help can teach you effective strategies to manage anxiety.'
      supportiveMessage = 'Anxiety can feel overwhelming, but there are proven ways to manage it. You deserve support.'
    }
  } else {
    // Generic fallback for other assessments
    summary = `Your ${assessmentName} score is ${score} out of ${maxScore}.`
    whatItMeans = 'This assessment helps identify areas where you might benefit from additional support or resources.'
    unconsciousManifestations = [
      'You might be experiencing patterns you haven\'t noticed yet',
      'Your behaviors could be influenced by underlying factors',
      'You might be coping in ways that aren\'t serving you well'
    ]
    recommendations = [
      'Reflect on the areas highlighted in your results',
      'Consider what support might be helpful',
      'Talk to a professional if you have concerns'
    ]
    nextSteps = 'Use these results as a starting point for understanding your needs.'
    supportiveMessage = 'Self-awareness is the first step toward positive change. You\'re already making progress.'
  }

  return {
    summary,
    whatItMeans,
    unconsciousManifestations,
    recommendations,
    nextSteps,
    supportiveMessage
  }
}
