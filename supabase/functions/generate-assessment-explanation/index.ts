/**
 * Supabase Edge Function: Generate Friendly Assessment Explanations
 * Takes clinical assessment results and generates warm, user-friendly explanations
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders, handleCorsPreflight } from '../_shared/cors.ts'

interface AssessmentResult {
  assessmentId: string
  assessmentName: string
  score: number
  level: string
  severity: 'normal' | 'mild' | 'moderate' | 'severe' | 'critical'
  clinicalDescription: string
}

interface UserContext {
  assessmentHistory?: 'first_time' | 'follow_up' | 'returning'
  primaryConcern?: string
  preferredLanguage?: 'clinical' | 'friendly' | 'simple'
  culturalContext?: string
}

interface ExplanationRequest {
  clinicalResult: AssessmentResult
  userContext?: UserContext
  tone?: 'empathetic' | 'encouraging' | 'professional' | 'casual'
}

Deno.serve(async (req) => {
  // CORS preflight
  const preflight = handleCorsPreflight(req)
  if (preflight) return preflight

  try {
    const cors = getCorsHeaders(req)

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    // Require authenticated Supabase JWT
    const authHeader = req.headers.get('Authorization') || ''
    if (!authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment')
      return new Response(JSON.stringify({ error: 'Server misconfiguration' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: authHeader } } })
    const { data: authData } = await supabase.auth.getUser()
    if (!authData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    const { clinicalResult, userContext, tone = 'empathetic' }: ExplanationRequest = await req.json()

    // Generate AI-friendly explanation
    const explanation = await generateFriendlyExplanation(clinicalResult, userContext, tone)

    return new Response(
      JSON.stringify({
        success: true,
        explanation,
        clinicalResult, // Include original for reference
        metadata: {
          generatedAt: new Date().toISOString(),
          tone,
          assessmentType: clinicalResult.assessmentId
        }
      }),
      {
        headers: { ...cors, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error generating assessment explanation:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to generate explanation',
        fallback: generateFallbackExplanation(clinicalResult)
      }),
      {
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function generateFriendlyExplanation(
  clinicalResult: AssessmentResult,
  userContext?: UserContext,
  tone: string = 'empathetic'
): Promise<string> {
  const prompt = buildExplanationPrompt(clinicalResult, userContext, tone)

  try {
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a compassionate mental health assistant who explains assessment results in warm, supportive, and easy-to-understand language. Your goal is to help users feel understood and hopeful while maintaining clinical accuracy.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    })

    const data = await openaiResponse.json()

    if (data.choices && data.choices[0]) {
      return data.choices[0].message.content.trim()
    }

    // Fallback to structured response
    return generateStructuredExplanation(clinicalResult, userContext, tone)
  } catch (error) {
    console.error('OpenAI API error:', error)
    return generateStructuredExplanation(clinicalResult, userContext, tone)
  }
}

function buildExplanationPrompt(
  clinicalResult: AssessmentResult,
  userContext?: UserContext,
  tone: string
): string {
  const contextInfo = userContext ? `
User Context:
- Assessment History: ${userContext.assessmentHistory || 'unknown'}
- Primary Concern: ${userContext.primaryConcern || 'general mental health'}
- Preferred Style: ${userContext.preferredLanguage || 'friendly'}
- Cultural Context: ${userContext.culturalContext || 'general'}` : ''

  return `
Please explain this clinical assessment result in a warm, supportive, and easy-to-understand way:

CLINICAL RESULT:
- Assessment: ${clinicalResult.assessmentName}
- Score: ${clinicalResult.score}
- Level: ${clinicalResult.level}
- Severity: ${clinicalResult.severity}
- Clinical Description: ${clinicalResult.clinicalDescription}${contextInfo}

INSTRUCTIONS:
- Use ${tone} tone throughout
- Explain what the score means in everyday language
- Focus on hope, support, and next steps
- Keep it concise (100-150 words)
- Avoid medical jargon or explain it simply
- Emphasize that help is available and recovery is possible
- Include encouragement and validation
- End with actionable suggestions

Make the user feel understood, not judged. Focus on their strength and potential for improvement.`
}

function generateStructuredExplanation(
  clinicalResult: AssessmentResult,
  userContext?: UserContext,
  tone: string = 'empathetic'
): string {
  const { assessmentName, score, level, severity, clinicalDescription } = clinicalResult

  let explanation = ''

  // Opening based on severity
  if (severity === 'normal') {
    explanation = `Great news! Your ${assessmentName} results show you're doing well. `
  } else if (severity === 'mild') {
    explanation = `Your ${assessmentName} results suggest you're experiencing some challenges, but they're manageable. `
  } else if (severity === 'moderate') {
    explanation = `Your ${assessmentName} results indicate you're going through a significant time right now. `
  } else {
    explanation = `Your ${assessmentName} results show you're experiencing considerable difficulty, and that's completely valid. `
  }

  // Score explanation
  explanation += `A score of ${score} falls in the ${level} range, which means ${getScoreExplanation(severity)}. `

  // Hope and support
  explanation += `The important thing to know is that you're not alone, and there are many effective ways to feel better. `

  // Next steps
  explanation += getNextStepsSuggestion(severity, assessmentName)

  return explanation
}

function getScoreExplanation(severity: string): string {
  switch (severity) {
    case 'normal':
      return "you're in a good place and maintaining your mental wellness"
    case 'mild':
      return "you're dealing with some normal life challenges that many people face"
    case 'moderate':
      return "life has been quite challenging lately, and that's taking its toll"
    case 'severe':
      return "you're carrying a heavy load and could really benefit from additional support"
    case 'critical':
      return "you're going through an extremely difficult time and need immediate care"
    default:
      return "you're working through some important challenges"
  }
}

function getNextStepsSuggestion(severity: string, assessmentName: string): string {
  const suggestions = {
    normal: "Keep up the great work with your self-care routines, and consider regular check-ins to maintain your wellness.",
    mild: "Consider talking to a trusted friend or counselor about what's been on your mind. Small changes in daily habits can make a big difference.",
    moderate: "I recommend connecting with a mental health professional who can provide personalized support and guidance.",
    severe: "Please reach out to a mental health professional or counselor as soon as possible. There are effective treatments available.",
    critical: "This is important - please contact a mental health professional or crisis service right away for immediate support."
  }

  return suggestions[severity as keyof typeof suggestions] || suggestions.moderate
}

function generateFallbackExplanation(clinicalResult: AssessmentResult): string {
  return `Your ${clinicalResult.assessmentName} assessment shows a score of ${clinicalResult.score}, which indicates ${clinicalResult.level} symptoms. While this suggests some challenges, remember that assessment results are just one piece of your wellness picture. Many people in similar situations find meaningful improvement with the right support and strategies. Consider discussing these results with a healthcare provider who can offer personalized guidance.`
}
