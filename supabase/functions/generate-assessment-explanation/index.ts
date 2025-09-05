/**
 * Supabase Edge Function: Generate Friendly Assessment Explanations
 * Takes clinical assessment results and generates warm, user-friendly explanations
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders, handleCorsPreflight } from '../_shared/cors.ts'

interface AssessmentData {
  assessmentName: string
  score: number
  maxScore: number
  responses: Record<string, number | string>
  category: string
}

interface UserProfile {
  display_name?: string
  preferred_mode?: string
  emotional_capacity?: string
  is_anonymous?: boolean
}

interface AIExplanation {
  summary: string
  whatItMeans: string
  manifestations: string[]
  unconsciousManifestations: string[]
  recommendations: string[]
  nextSteps: string
  supportiveMessage: string
}

interface ExplanationRequest {
  assessmentData: AssessmentData
  userProfile?: UserProfile
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

    const { assessmentData, userProfile }: ExplanationRequest = await req.json()

    // Log what we received from the client
    console.log('Edge Function: 📥 RECEIVED FROM CLIENT:')
    console.log('Edge Function: Assessment Data:', {
      assessmentName: assessmentData.assessmentName,
      score: assessmentData.score,
      maxScore: assessmentData.maxScore,
      category: assessmentData.category,
      responsesCount: Object.keys(assessmentData.responses).length,
      responsesSample: Object.entries(assessmentData.responses).slice(0, 3) // First 3 responses
    })
    console.log('Edge Function: User Profile:', userProfile ? {
      display_name: userProfile.display_name,
      preferred_mode: userProfile.preferred_mode,
      emotional_capacity: userProfile.emotional_capacity,
      is_anonymous: userProfile.is_anonymous
    } : 'No user profile')

    // Generate AI-friendly explanation
    console.log('Edge Function: Starting AI explanation generation')
    const explanation = await generateAIAssessmentExplanation(assessmentData, userProfile)

    console.log('Edge Function: Generated explanation:', explanation)
    console.log('Edge Function: Explanation keys:', Object.keys(explanation))
    console.log('Edge Function: Manifestations length:', explanation.manifestations?.length || 0)
    console.log('Edge Function: Recommendations length:', explanation.recommendations?.length || 0)

    return new Response(
      JSON.stringify({
        success: true,
        explanation,
        metadata: {
          generatedAt: new Date().toISOString(),
          assessmentType: assessmentData.category,
          assessmentName: assessmentData.assessmentName
        }
      }),
      {
        headers: { ...cors, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error generating assessment explanation:', error)

    const fallbackExplanation = generateFallbackExplanation(assessmentData)
    console.log('Edge Function: Using fallback explanation:', fallbackExplanation)

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to generate explanation',
        explanation: fallbackExplanation,
        metadata: {
          generatedAt: new Date().toISOString(),
          assessmentType: assessmentData.category,
          assessmentName: assessmentData.assessmentName,
          fallback: true
        }
      }),
      {
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        status: 200, // Return 200 for fallback
      }
    )
  }
})

async function generateAIAssessmentExplanation(
  assessmentData: AssessmentData,
  userProfile?: UserProfile
): Promise<AIExplanation> {
  const prompt = buildAssessmentPrompt(assessmentData, userProfile)

  console.log('Edge Function: 🤖 PROMPT BEING SENT TO OPENAI:')
  console.log('Edge Function: Prompt length:', prompt.length)
  console.log('Edge Function: Prompt preview (first 500 chars):', prompt.substring(0, 500) + '...')

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
            content: `You are a friendly, down-to-earth mental health buddy who talks like a caring friend would. You explain assessment results in a casual, conversational way that feels like you're chatting over coffee. Use everyday language, throw in some encouraging phrases, and make the user feel like they're talking to someone who really gets it.

Keep it real and relatable - no medical jargon unless you explain it simply. Be warm, supportive, and genuinely encouraging. Think of yourself as that friend who's always there to listen and give practical advice.

Always respond with a JSON object containing: summary, whatItMeans, unconsciousManifestations (array), recommendations (array), nextSteps, and supportiveMessage.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    })

    const data = await openaiResponse.json()

    console.log('Edge Function: OpenAI response status:', openaiResponse.status)
    console.log('Edge Function: OpenAI response data:', data)

    if (data.choices && data.choices[0]) {
      try {
        const content = data.choices[0].message.content
        console.log('Edge Function: OpenAI content:', content)
        const parsed = JSON.parse(content)
        console.log('Edge Function: Parsed response:', parsed)

        const result = {
          summary: parsed.summary || '',
          whatItMeans: parsed.whatItMeans || '',
          manifestations: Array.isArray(parsed.manifestations) ? parsed.manifestations : [],
          unconsciousManifestations: Array.isArray(parsed.unconsciousManifestations) ? parsed.unconsciousManifestations : [],
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
          nextSteps: parsed.nextSteps || '',
          supportiveMessage: parsed.supportiveMessage || ''
        }

        console.log('Edge Function: Final result structure:', {
          summary: result.summary?.length || 0,
          whatItMeans: result.whatItMeans?.length || 0,
          manifestations: result.manifestations?.length || 0,
          recommendations: result.recommendations?.length || 0
        })

        return result
      } catch (parseError) {
        console.error('Edge Function: Failed to parse OpenAI response:', parseError)
        return generateStructuredExplanation(assessmentData, userProfile)
      }
    }

    // Fallback to structured response
    return generateStructuredExplanation(assessmentData, userProfile)
  } catch (error) {
    console.error('OpenAI API error:', error)
    return generateStructuredExplanation(assessmentData, userProfile)
  }
}

function buildAssessmentPrompt(
  assessmentData: AssessmentData,
  userProfile?: UserProfile
): string {
  const { assessmentName, score, maxScore, responses, category } = assessmentData
  const percentage = Math.round((score / maxScore) * 100)
  
  const userContext = userProfile ? `
User Context:
- Name: ${userProfile.display_name || 'Anonymous'}
- Preferred Mode: ${userProfile.preferred_mode || 'general'}
- Emotional Capacity: ${userProfile.emotional_capacity || 'moderate'}` : ''

  return `
Please analyze this assessment result and provide a warm, supportive explanation in JSON format. Pay special attention to how these symptoms might be unconsciously manifesting in the person's daily life.

ASSESSMENT DATA:
- Assessment: ${assessmentName}
- Category: ${category}
- Score: ${score} out of ${maxScore} (${percentage}%)
- Responses: ${JSON.stringify(responses)}${userContext}

IMPORTANT: For unconscious manifestations, think about:
- What behaviors might they be doing without realizing it's related to their mental health?
- How might these symptoms be affecting their relationships, work, or daily routines?
- What patterns might feel "normal" to them but could actually be symptoms?

REQUIRED JSON RESPONSE FORMAT:
{
  "summary": "Brief overview of what the score means",
  "whatItMeans": "Detailed explanation in everyday language",
  "manifestations": ["How symptom 1 shows up in daily life", "How symptom 2 affects relationships", "How symptom 3 impacts work/school"],
  "unconsciousManifestations": ["Behavior pattern 1", "Behavior pattern 2", "Behavior pattern 3"],
  "recommendations": ["Actionable suggestion 1", "Actionable suggestion 2", "Actionable suggestion 3"],
  "nextSteps": "What the user should do next",
  "supportiveMessage": "Encouraging and validating message"
}

⚠️ CRITICAL: You MUST include ALL fields, especially manifestations and unconsciousManifestations. Do not skip any field.

EXAMPLES OF MANIFESTATIONS (how symptoms show up in daily life):
- Depression: "Difficulty getting out of bed in the morning", "Loss of interest in hobbies you used to enjoy", "Avoiding social gatherings with friends", "Changes in appetite affecting your eating habits"
- Anxiety: "Constant worry about work deadlines affecting sleep", "Avoiding driving on highways due to fear", "Physical tension causing headaches or muscle pain", "Difficulty making decisions due to overthinking"
- Trauma: "Feeling triggered by certain sounds or situations", "Difficulty trusting new people in relationships", "Hypervigilance in public spaces", "Emotional numbness during stressful situations"

EXAMPLES OF UNCONSCIOUS MANIFESTATIONS:
- Depression: "You might be avoiding social situations without realizing it", "You could be more irritable with loved ones than usual"
- Anxiety: "You might be overthinking decisions without realizing it", "You could be experiencing physical tension in your body"
- Trauma: "You might be avoiding intimacy without understanding why", "You could be people-pleasing to feel safe", "You might be hypervigilant in social situations", "You could be experiencing trust issues that affect relationships"
- ACE/Childhood Trauma: "You might be avoiding certain triggers without realizing why", "You could be experiencing trust issues that affect relationships", "You might be people-pleasing to feel safe", "You could be experiencing hypervigilance in social situations"

INSTRUCTIONS:
- Talk like a caring friend would - casual, warm, and real
- Use everyday language and relatable examples
- Keep it conversational, like you're chatting over coffee
- Include encouraging phrases and positive vibes
- Make the user feel like they're talking to someone who really gets it

SPECIFICALLY FOR MANIFESTATIONS:
- Think about how the specific symptoms from their assessment might show up in their daily life
- Consider their actual responses and how those symptoms would manifest in real situations
- Focus on concrete, observable ways their mental health affects their day-to-day experiences
- Include how symptoms impact work, relationships, self-care, and daily routines
- Make it personal and relatable to their specific situation

SPECIFICALLY FOR UNCONSCIOUS MANIFESTATIONS:
- Think about how these symptoms might be showing up in their daily life without them realizing it
- Consider behaviors like: avoiding social situations, people-pleasing, procrastination, irritability, isolation, etc.
- Focus on patterns that feel automatic or "just how they are" but might actually be symptoms
- Give them "aha moments" about behaviors they might not have connected to their mental health

- Include 3-4 specific, actionable recommendations
- Keep each section friendly and supportive
- Avoid medical jargon - explain things simply if needed
- Consider the user's emotional capacity and preferred mode

Think of yourself as that supportive friend who's always there to listen and give practical advice. Make the user feel understood, supported, and hopeful about their journey.

VALIDATION: Before responding, ensure your JSON includes ALL required fields:
- summary ✓
- whatItMeans ✓
- manifestations ✓ (3-4 specific ways symptoms show up in daily life)
- unconsciousManifestations ✓ (3-4 specific patterns)
- recommendations ✓ (3-4 actionable suggestions)
- nextSteps ✓
- supportMessage ✓

If any field is missing, regenerate the response.`
}

function generateStructuredExplanation(
  assessmentData: AssessmentData,
  userProfile?: UserProfile
): AIExplanation {
  const { assessmentName, score, maxScore, category } = assessmentData
  const percentage = Math.round((score / maxScore) * 100)
  
  let summary = ''
  let whatItMeans = ''
  let manifestations: string[] = []
  let unconsciousManifestations: string[] = []
  let recommendations: string[] = []
  let nextSteps = ''
  let supportiveMessage = ''

  if (category === 'depression' || assessmentName.includes('PHQ-9')) {
    if (score <= 4) {
      summary = 'Hey, great news! Your assessment shows you\'re doing pretty well overall.'
      whatItMeans = 'This is awesome! You\'re experiencing the normal ups and downs that everyone goes through - totally normal stuff. Think of it like having a few cloudy days mixed in with the sunny ones.'
      manifestations = [
        'Normal mood fluctuations throughout the day',
        'Healthy sleep and appetite patterns',
        'Good social engagement with friends and family',
        'Effective daily functioning at work or school'
      ]
      unconsciousManifestations = [
        'You might be more resilient than you realize',
        'Your natural coping mechanisms are working well',
        'You\'re likely maintaining healthy boundaries naturally'
      ]
      recommendations = [
        'Keep doing what you\'re doing - you\'re on the right track!',
        'Stay connected with your people - friends and family are gold',
        'Keep up those self-care habits that are working for you'
      ]
      nextSteps = 'Just keep an eye on your mood and reach out if things start feeling off. You\'ve got this!'
      supportiveMessage = 'You\'re doing really well! Remember, it\'s totally normal to have good days and not-so-great days. That\'s just life being life.'
    } else if (score <= 9) {
      summary = 'So, your assessment shows you\'re going through a bit of a rough patch.'
      whatItMeans = 'Look, it sounds like you\'re dealing with some low mood stuff, but honestly? It\'s totally manageable and super common when life gets stressful. Think of it like having a few bad weather days - they pass.'
      manifestations = [
        'Occasional difficulty getting motivated to start the day',
        'Some loss of interest in activities you usually enjoy',
        'Mild changes in sleep patterns or appetite',
        'Occasional social withdrawal or avoiding plans'
      ]
      unconsciousManifestations = [
        'You might be avoiding social situations without realizing it',
        'You could be more irritable with loved ones than usual',
        'You might be procrastinating more than you typically do'
      ]
      recommendations = [
        'Try to keep up with sleep and exercise - even a little bit helps',
        'Talk to someone you trust about how you\'re feeling - bottling it up never helps',
        'Find some simple things that boost your mood - whatever works for you'
      ]
      nextSteps = 'Keep an eye on how you\'re feeling, and if this stuff sticks around, maybe chat with a mental health pro. No shame in that game!'
      supportiveMessage = 'Hey, it takes guts to admit when you\'re not feeling great. These feelings won\'t last forever - you\'re stronger than you think.'
    } else {
      summary = 'Your assessment shows moderate to severe symptoms of depression.'
      whatItMeans = 'You\'re experiencing significant emotional distress that deserves professional attention and support.'
      manifestations = [
        'Difficulty getting out of bed or completing basic daily tasks',
        'Significant loss of interest in previously enjoyable activities',
        'Major changes in sleep patterns affecting daily functioning',
        'Noticeable changes in appetite leading to weight changes',
        'Difficulty concentrating at work or school',
        'Social isolation and avoiding friends and family'
      ]
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
    manifestations,
    unconsciousManifestations,
    recommendations,
    nextSteps,
    supportiveMessage
  }
}

function generateFallbackExplanation(assessmentData: AssessmentData): AIExplanation {
  return generateStructuredExplanation(assessmentData)
}
