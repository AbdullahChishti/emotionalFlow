/**
 * Supabase Edge Function: Overall Assessment Analysis
 * Generates a comprehensive overview by combining all assessment results
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders, handleCorsPreflight } from '../_shared/cors.ts'

interface OverallAssessmentData {
  userId: string
  allAssessments: Record<string, any>
  assessmentCount: number
  dateRange: { earliest: string; latest: string }
  summary: {
    totalScore: number
    averageScore: number
    highestRiskArea: string
    overallRiskLevel: 'low' | 'moderate' | 'high' | 'critical'
  }
}

interface OverallAnalysisResponse {
  summary: string
  keyInsights: string[]
  overallRecommendations: string[]
  riskAssessment: string
  nextSteps: string
  areasOfConcern: string[]
  strengths: string[]
  manifestations?: string[]
  unconsciousManifestations?: string[]
  supportiveMessage?: string
}

interface RequestBody {
  overallData: OverallAssessmentData
}

Deno.serve(async (req) => {
  // CORS preflight
  const preflight = handleCorsPreflight(req)
  if (preflight) return preflight

  const cors = getCorsHeaders(req)

  try {
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

    // Validate auth
    const supabase = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: authHeader } } })
    const { data: authData } = await supabase.auth.getUser()
    if (!authData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    const { overallData }: RequestBody = await req.json()

    // Log inbound payload summary (no sensitive content)
    try {
      console.log('[Edge:overall] 📥 RECEIVED:', {
        userId: overallData?.userId,
        count: overallData?.assessmentCount,
        keys: Object.keys(overallData?.allAssessments || {}),
        risk: overallData?.summary?.overallRiskLevel,
        highest: overallData?.summary?.highestRiskArea
      })
    } catch (_) {}
    if (!overallData || !overallData.allAssessments) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    const prompt = buildOverallPrompt(overallData)

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      console.warn('OPENAI_API_KEY missing; returning deterministic fallback analysis')
      const fallback = generateFallbackAnalysis(overallData)
      return new Response(JSON.stringify({ success: true, analysis: fallback, fallback: true }), { headers: { ...cors, 'Content-Type': 'application/json' }, status: 200 })
    }

    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI trained to identify potential impacts of mental health challenges on daily life. Your role is to help users understand how their mental health might be affecting their day-to-day experiences.

CORE PRINCIPLES:
- Focus on potential manifestations and impacts, not advice or solutions
- Use "you might be" or "you may find" language to acknowledge individual differences
- Be specific about daily life situations and experiences
- Describe observable impacts rather than clinical symptoms
- Stay grounded in everyday experiences people can relate to
- Never diagnose or make absolute statements
- Be honest but sensitive about difficult topics
- Focus on understanding, not fixing

IMPACT AREAS TO CONSIDER:
- Daily routines and activities
- Work or study performance
- Relationships and social interactions
- Self-perception and confidence
- Energy and motivation levels
- Decision-making and planning
- Enjoyment of activities
- Sleep and rest patterns
- Physical sensations
- Future outlook

FORMAT GUIDELINES:
- Each impact should be a single, clear statement
- Start with "You might be" or "You may find"
- Focus on the experience, not the solution
- Be specific and relatable
- Avoid clinical terminology
- Keep statements concise and clear

Example impacts:
- "You might be finding it harder to enjoy activities you used to love"
- "You may notice yourself avoiding social gatherings more than usual"
- "You might be experiencing more difficulty making everyday decisions"
- "You may find yourself feeling overwhelmed by tasks that used to feel manageable"

Always output valid JSON with the required fields, focusing on manifestations and impacts rather than advice or recommendations.`
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        response_format: { type: 'json_object' }
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    // Check if the request was aborted
    if (controller.signal.aborted) {
      console.warn('[Edge:overall] Request timed out, using fallback analysis')
      const fallback = generateFallbackAnalysis(overallData)
      return new Response(JSON.stringify({ success: true, analysis: fallback, fallback: true, timeout: true }), { headers: { ...cors, 'Content-Type': 'application/json' }, status: 200 })
    }

    // Check response status
    if (!openaiResponse.ok) {
      console.error('[Edge:overall] OpenAI API error:', openaiResponse.status, openaiResponse.statusText)
      const fallback = generateFallbackAnalysis(overallData)
      return new Response(JSON.stringify({ success: true, analysis: fallback, fallback: true, apiError: true }), { headers: { ...cors, 'Content-Type': 'application/json' }, status: 200 })
    }

    let data: any
    try {
      data = await openaiResponse.json()
      console.log('[Edge:overall] 🧠 OpenAI status:', openaiResponse.status)
      console.log('[Edge:overall] 🧠 OpenAI keys:', data ? Object.keys(data) : null)
    } catch (parseError) {
      console.error('[Edge:overall] Failed to parse OpenAI response:', parseError)
      const fallback = generateFallbackAnalysis(overallData)
      return new Response(JSON.stringify({ success: true, analysis: fallback, fallback: true, parseError: true }), { headers: { ...cors, 'Content-Type': 'application/json' }, status: 200 })
    }

    let analysis: OverallAnalysisResponse | null = null

    try {
      const content = data?.choices?.[0]?.message?.content
      if (typeof content === 'string') {
        analysis = JSON.parse(content)
        console.log('[Edge:overall] ✅ Successfully parsed AI response')
      } else {
        console.warn('[Edge:overall] No content in OpenAI response')
      }
    } catch (e) {
      console.error('[Edge:overall] Failed to parse OpenAI JSON content:', e)
    }

    if (!analysis) {
      console.warn('[Edge:overall] Using fallback analysis due to parsing issues')
      analysis = generateFallbackAnalysis(overallData)
    }

    try {
      console.log('[Edge:overall] ✅ ANALYSIS SUMMARY:', {
        summaryLen: analysis?.summary?.length || 0,
        recs: analysis?.overallRecommendations?.length || 0,
        risk: analysis?.riskAssessment
      })
    } catch (_) {}

    return new Response(
      JSON.stringify({ success: true, analysis, metadata: { generatedAt: new Date().toISOString() } }),
      { headers: { ...cors, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('overall-assessment-analysis error:', error)
    const body = await req.text().catch(() => '')
    console.error('Request body (for debugging):', body?.slice(0, 500))

    return new Response(
      JSON.stringify({ success: false, error: 'Failed to generate overall analysis' }),
      { headers: { ...cors, 'Content-Type': 'application/json' }, status: 200 }
    )
  }
})

function buildOverallPrompt(data: OverallAssessmentData): string {
  const { assessmentCount, dateRange, summary, allAssessments } = data

  let details = Object.entries(allAssessments).map(([id, a]) => (
    `- ${a.assessment?.title || id.toUpperCase()}: score ${a.score}, level ${a.level}, severity ${a.severity}`
  )).join('\n')

  return `
I need you to help someone understand their mental health patterns in a warm, human way. They've completed ${assessmentCount} assessments between ${new Date(dateRange.earliest).toLocaleDateString()} and ${new Date(dateRange.latest).toLocaleDateString()}.

Their overall pattern shows: ${summary.overallRiskLevel} level concerns, with ${summary.highestRiskArea} being their main area of focus.

Here's what their assessments show:
${details}

Please help them understand this in a way that feels like talking to a caring, experienced friend who really gets it. Focus on what this means for their daily life, what they're doing well, and practical steps they can take.

IMPORTANT: Write as if you're speaking directly to them, using "you" language. Be warm, encouraging, and specific about what you're noticing in their patterns.

REQUIRED JSON FIELDS:
{
  "summary": "A warm, personal 2-3 sentence summary that speaks directly to them about what you're seeing in their patterns. Be encouraging but honest. Example: 'You seem to be going through a really challenging time right now, and I can see how this is affecting different areas of your life. The good news is that you're taking important steps by completing these assessments and seeking to understand what's happening.'",
  "keyInsights": ["Specific, personal insights about their patterns - what you're noticing about how they're doing", "Another insight about their strengths or challenges", "A third insight about their situation"],
  "overallRecommendations": ["Practical, specific action they can take this week", "Another concrete step they can try", "A third helpful suggestion"],
  "riskAssessment": "A gentle, honest assessment of their current situation (low|moderate|high|critical) with a brief, caring explanation",
  "nextSteps": "Specific, encouraging next steps they can take - be concrete and supportive",
  "areasOfConcern": ["Specific areas where they might need extra support", "Another area to focus on"],
  "strengths": ["Something positive you notice about them", "Another strength or positive pattern"],
  "manifestations": ["How their current patterns show up in their daily life - be specific and relatable", "Another way this affects their day-to-day", "A third manifestation"],
  "unconsciousManifestations": ["Patterns they might not realize they're doing", "Another unconscious pattern", "A third pattern they might not notice"],
  "supportiveMessage": "A warm, encouraging message that validates their experience and gives them hope. Make it personal and supportive."
}

WRITING STYLE:
- Write as if you're talking directly to them
- Use "you" language throughout
- Be warm and understanding
- Avoid clinical terms - use everyday language
- Be specific about what you're noticing
- Focus on their strengths as well as challenges
- End on an encouraging, hopeful note
- Make it feel personal and caring
`
}

function generateFallbackAnalysis(data: OverallAssessmentData): OverallAnalysisResponse {
  const level = data.summary.overallRiskLevel
  const highestArea = data.summary.highestRiskArea
  
  let baseSummary = ''
  let recs: string[] = []
  let riskAssessment = ''
  let nextSteps = ''
  let areasOfConcern: string[] = []
  let strengths: string[] = []
  let manifestations: string[] = []
  let unconsciousManifestations: string[] = []
  let supportiveMessage = ''

  if (level === 'high' || level === 'critical') {
    baseSummary = `You seem to be going through a really challenging time right now, and I can see how this is affecting different areas of your life. The good news is that you're taking important steps by completing these assessments and seeking to understand what's happening.`
    recs = [
      'Consider reaching out to a mental health professional who can provide personalized support',
      'Share these results with someone you trust - you don\'t have to face this alone',
      'Try simple grounding exercises like deep breathing or the 5-4-3-2-1 technique daily'
    ]
    riskAssessment = 'high - You\'re experiencing significant stress that would benefit from professional support'
    nextSteps = 'I\'d really encourage you to reach out to a therapist or counselor who can help you work through what you\'re experiencing'
    areasOfConcern = [highestArea, 'Overall stress management']
    strengths = ['You\'re being proactive about your mental health', 'You have the courage to seek help and understanding']
    manifestations = [
      'You might notice your energy levels are lower than usual',
      'Sleep patterns may be disrupted or you might feel restless',
      'Concentration at work or school might feel more difficult'
    ]
    unconsciousManifestations = [
      'You might be avoiding social activities without realizing why',
      'You could be more irritable with loved ones than usual',
      'You might be pushing yourself harder to compensate for how you\'re feeling'
    ]
    supportiveMessage = 'What you\'re going through is real and valid, and it takes real strength to acknowledge it and seek help. You\'re not alone in this, and with the right support, things can get better.'
  } else if (level === 'moderate') {
    baseSummary = `I can see that you're dealing with some stress and challenges that are affecting your daily life. You're doing a great job by taking these assessments and being aware of what's happening.`
    recs = [
      'Try to maintain a regular sleep schedule and eat nourishing meals',
      'Take 5-10 minutes each day for something that helps you relax',
      'Consider talking to a counselor or therapist for some extra support'
    ]
    riskAssessment = 'moderate - You\'re experiencing some stress that could benefit from attention and support'
    nextSteps = 'Focus on building some consistent self-care habits and consider reaching out for professional support'
    areasOfConcern = [highestArea, 'Stress management']
    strengths = ['You\'re self-aware and taking steps to understand your mental health', 'You\'re being proactive about your wellbeing']
    manifestations = [
      'You might feel more tired or drained than usual',
      'Some days might feel harder to get through than others',
      'Your usual routines might feel a bit more challenging'
    ]
    unconsciousManifestations = [
      'You might be more critical of yourself than usual',
      'You could be withdrawing from activities you usually enjoy',
      'You might be feeling more sensitive to stress than before'
    ]
    supportiveMessage = 'It\'s completely normal to go through challenging periods, and you\'re handling this with grace and self-awareness. Small, consistent steps toward self-care can make a real difference.'
  } else {
    baseSummary = `You're doing really well overall, and I can see that you have good awareness of your mental health. It\'s wonderful that you\'re taking these assessments to stay connected with your wellbeing.`
    recs = [
      'Keep up the routines that are working well for you',
      'Try to do one small thing each day that brings you joy',
      'Stay connected with friends and family who support you'
    ]
    riskAssessment = 'low - You\'re managing well and have good awareness of your mental health'
    nextSteps = 'Continue the positive habits you\'ve established and keep checking in with yourself regularly'
    areasOfConcern = ['Maintaining current positive patterns']
    strengths = ['You have good self-awareness and mental health habits', 'You\'re proactive about your wellbeing']
    manifestations = [
      'You generally feel stable and able to handle daily challenges',
      'Your mood and energy levels are fairly consistent',
      'You\'re able to maintain your usual activities and relationships'
    ]
    unconsciousManifestations = [
      'You naturally take care of yourself without having to think about it',
      'You\'re good at recognizing when you need a break',
      'You have healthy ways of coping with stress'
    ]
    supportiveMessage = 'You\'re doing a fantastic job taking care of your mental health. Keep up the great work, and remember that it\'s always okay to reach out for support when you need it.'
  }

  return {
    summary: baseSummary,
    keyInsights: [
      `You've completed ${data.assessmentCount} assessments, which shows real commitment to understanding your mental health`,
      `Your main area of focus right now is ${highestArea}`,
      `You've been tracking your mental health over ${Math.ceil((new Date(data.dateRange.latest).getTime() - new Date(data.dateRange.earliest).getTime()) / (1000 * 60 * 60 * 24))} days`
    ],
    overallRecommendations: recs,
    riskAssessment: riskAssessment,
    nextSteps: nextSteps,
    areasOfConcern: areasOfConcern,
    strengths: strengths,
    manifestations: manifestations,
    unconsciousManifestations: unconsciousManifestations,
    supportiveMessage: supportiveMessage
  }
}
