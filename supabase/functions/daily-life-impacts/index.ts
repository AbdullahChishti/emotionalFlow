/**
 * Supabase Edge Function: Daily Life Impacts
 * Analyzes assessment data to identify potential impacts on daily life
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders, handleCorsPreflight } from '../_shared/cors.ts'

interface AssessmentData {
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

interface LifeImpactsResponse {
  personalizedSummary: string
  patternsAndTriggers: string
  psychologicalFramework: string
  strengthsAndProtectiveFactors: string
  actionableSteps: string
  severityGuidance: string
  trendAnalysis: string
  personalizedRoadmap: string
  manifestations: string[]  // Observable impacts on daily life
  unconsciousManifestations: string[]  // Subtle impacts user might not notice
  riskLevel: 'low' | 'moderate' | 'high' | 'critical'
  confidenceLevel: number
}

interface RequestBody {
  assessmentData: AssessmentData
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req)

  // CORS preflight
  const preflight = handleCorsPreflight(req)
  if (preflight) return preflight

  try {

  // Health check endpoint (no auth required)
  if (req.method === 'GET') {
    console.log('[Edge:impacts] 🏥 Health check requested')
    return new Response(
      JSON.stringify({
        status: 'healthy',
        service: 'daily-life-impacts',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        openaiConfigured: !!Deno.env.get('OPENAI_API_KEY')
      }),
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          'Content-Type': 'application/json'
        },
        status: 200
      }
    )
  }

  console.log('[Edge:impacts] 🚀 Function started')
  if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        error: 'Method not allowed',
        message: 'This endpoint only accepts POST requests',
        method: req.method,
        allowedMethods: ['POST']
      }), { status: 405, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    // Get request data with better error handling
    let body: RequestBody
    try {
      body = await req.json()
    } catch (parseError) {
      console.error('[Edge:impacts] JSON parse error:', parseError)
      return new Response(JSON.stringify({
        error: 'Invalid JSON',
        message: 'Request body contains invalid JSON',
        code: 'JSON_PARSE_ERROR'
      }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' }
      })
    }

    const { assessmentData } = body

    console.log('[Edge:impacts] 📨 Received request:', {
      hasAssessmentData: !!assessmentData,
      userId: assessmentData?.userId,
      hasAllAssessments: !!assessmentData?.allAssessments,
      allAssessmentsCount: assessmentData?.allAssessments ? Object.keys(assessmentData.allAssessments).length : 0,
      assessmentDataKeys: assessmentData ? Object.keys(assessmentData) : [],
      assessmentTypes: assessmentData?.allAssessments ? Object.keys(assessmentData.allAssessments) : [],
      requestBodySize: JSON.stringify(body).length
    })

    // Log the raw request body for debugging
    console.log('[Edge:impacts] 📄 Raw request body:', JSON.stringify(body, null, 2))

    // Detailed logging of assessment data structure
    if (assessmentData?.allAssessments) {
      console.log('[Edge:impacts] 📊 Assessment data details:')
      Object.entries(assessmentData.allAssessments).forEach(([type, assessments]) => {
        console.log(`  ${type}: ${Array.isArray(assessments) ? assessments.length : 'not array'} assessments`)
        if (Array.isArray(assessments) && assessments.length > 0) {
          console.log(`    First assessment:`, {
            hasScore: 'score' in assessments[0],
            hasLevel: 'level' in assessments[0],
            hasSeverity: 'severity' in assessments[0],
            hasTakenAt: 'takenAt' in assessments[0],
            hasAssessment: 'assessment' in assessments[0],
            assessmentTitle: assessments[0].assessment?.title
          })
        }
      })
    }

    // Comprehensive request validation
    if (!assessmentData) {
      console.error('[Edge:impacts] ❌ No assessment data provided')
      return new Response(JSON.stringify({
        error: 'Invalid request data',
        message: 'assessmentData is required',
        received: null
      }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    if (!assessmentData.userId || typeof assessmentData.userId !== 'string' || assessmentData.userId.trim() === '') {
      console.error('[Edge:impacts] ❌ Invalid or missing userId:', assessmentData.userId)
      return new Response(JSON.stringify({
        error: 'Invalid request data',
        message: 'Valid userId is required',
        received: {
          userId: assessmentData.userId,
          userIdType: typeof assessmentData.userId
        }
      }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    if (!assessmentData.allAssessments || typeof assessmentData.allAssessments !== 'object') {
      console.error('[Edge:impacts] ❌ Invalid or missing allAssessments:', assessmentData.allAssessments)
      return new Response(JSON.stringify({
        error: 'Invalid request data',
        message: 'Valid allAssessments object is required',
        received: {
          allAssessments: assessmentData.allAssessments,
          allAssessmentsType: typeof assessmentData.allAssessments
        }
      }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    // Get OpenAI key from environment with validation
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey || openaiKey.trim() === '') {
      console.error('[Edge:impacts] OpenAI API key not found or empty')
      return new Response(
        JSON.stringify({
          error: 'Configuration error',
          message: 'OpenAI API key is not configured',
          code: 'OPENAI_KEY_MISSING',
          details: {
            hasKey: !!openaiKey,
            keyLength: openaiKey?.length || 0
          }
        }),
        {
          status: 500,
          headers: {
            ...cors,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          }
        }
      )
    }

    // Setup timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    // Build prompt
    const prompt = buildAnalysisPrompt(assessmentData)
    console.log('[Edge:impacts] 🤖 Generated prompt length:', prompt.length)
    console.log('[Edge:impacts] 📝 FULL PROMPT being sent to AI:', prompt)

    console.log('[Edge:impacts] 🚀 Calling OpenAI API...')
    // Call OpenAI
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
            content: "You are an expert mental health insights analyst. Your task is to provide deeply personalized, clinically-informed insights based on assessment data. You must create comprehensive, actionable analysis that helps users understand their mental health patterns and provides clear guidance.\n\n## ANALYSIS FRAMEWORK:\n\n### 1. PERSONALIZED SUMMARY (Plain Language)\nTranslate raw scores into compassionate, human-friendly reflections that validate experiences and normalize feelings.\n\n### 2. PATTERNS & TRIGGERS\nIdentify connections across different assessments and time periods. Look for:\n- Symptom clusters that occur together\n- Environmental or situational triggers\n- Temporal patterns (time of day, day of week)\n- Interrelationships between different mental health domains\n\n### 3. PSYCHOLOGICAL MODELS\nPlace findings in context using established frameworks:\n- **CBT Model**: Thoughts → Feelings → Behaviors\n- **Stress-Vulnerability Model**: How stress interacts with personal vulnerabilities\n- **Stages of Change Model**: Pre-contemplation, contemplation, preparation, action, maintenance\n\n### 4. STRENGTHS & PROTECTIVE FACTORS\nHighlight resilience and positive indicators:\n- Coping strategies that are working\n- Support systems and relationships\n- Personal strengths and resources\n- Protective factors that buffer against symptoms\n\n### 5. ACTIONABLE SELF-HELP STEPS\nProvide evidence-based, tailored coping strategies:\n- Mindfulness for rumination\n- Behavioral activation for low motivation\n- Sleep hygiene for insomnia\n- Social skills building for isolation\n- Stress management techniques\n\n### 6. SEVERITY GUIDANCE & ESCALATION\nClear, compassionate guidance on when and how to seek help:\n- Thresholds for professional consultation\n- Crisis intervention information\n- Treatment options based on symptom profile\n- Urgency levels for different concerns\n\n### 7. VISUAL/PATTERN INSIGHTS\nDescribe trends and changes over time:\n- Symptom trajectories\n- Improvement areas\n- Worsening patterns\n- Stable vs. fluctuating symptoms\n\n### 8. PERSONALIZED ROADMAP\nCreate a 3-5 step action plan that:\n- Builds sequentially on user's current situation\n- Addresses most impactful symptoms first\n- Incorporates user's identified strengths\n- Provides measurable goals\n\n## OUTPUT FORMAT:\nYou MUST return a valid JSON object with this exact structure:\n\n{\n  \"personalizedSummary\": \"string - compassionate, human-friendly reflection of overall mental health picture\",\n  \"patternsAndTriggers\": \"string - detailed analysis of symptom patterns and triggers across assessments\",\n  \"psychologicalFramework\": \"string - explanation using CBT, stress-vulnerability, or stages of change models\",\n  \"strengthsAndProtectiveFactors\": \"string - focus on resilience and positive aspects\",\n  \"actionableSteps\": \"string - 3-5 specific, evidence-based coping strategies\",\n  \"severityGuidance\": \"string - clear guidance on when to seek professional help\",\n  \"trendAnalysis\": \"string - description of changes over time and key patterns\",\n  \"personalizedRoadmap\": \"string - 3-5 step sequential action plan\",\n  \"manifestations\": [\"array of 3-5 observable daily life impacts\"],\n  \"unconsciousManifestations\": [\"array of 2-3 subtle impacts\"],\n  \"riskLevel\": \"low|moderate|high|critical\",\n  \"confidenceLevel\": \"number 0-1\"\n}\n\n## REQUIREMENTS:\n- Be specific and concrete, not vague\n- Use empathetic, validating language\n- Ground recommendations in the assessment data\n- Avoid medical advice or diagnosis\n- Focus on patterns and trends from the data\n- Provide hope and agency\n- Make recommendations actionable and realistic\n- Consider cultural and individual context\n\n## EXAMPLE STRUCTURE:\nThe analysis should read like a comprehensive mental health report written by an experienced therapist, providing both understanding and practical next steps."
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

    // Check if request was aborted
    if (controller.signal.aborted) {
      console.warn('[Edge:impacts] Request timed out')
      return new Response(
        JSON.stringify({ 
          error: 'Request timeout',
          message: 'The request took too long to process',
          code: 'TIMEOUT'
        }), 
        { 
          status: 408, 
          headers: { 
            ...cors, 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          } 
        }
      )
    }

    // Check response status
    if (!openaiResponse.ok) {
      let errorDetails = ''
      try {
        const errorBody = await openaiResponse.text()
        errorDetails = errorBody
        console.error('[Edge:impacts] OpenAI API error body:', errorBody)
      } catch (e) {
        console.error('[Edge:impacts] Could not read error body:', e)
      }
      
      console.error('[Edge:impacts] OpenAI API error:', {
        status: openaiResponse.status,
        statusText: openaiResponse.statusText,
        headers: Object.fromEntries(openaiResponse.headers.entries()),
        errorDetails
      })
      return new Response(
        JSON.stringify({ 
          error: 'AI service error',
          message: `OpenAI API returned ${openaiResponse.status}: ${openaiResponse.statusText}`,
          details: errorDetails,
          code: 'OPENAI_ERROR'
        }), 
        { 
          status: 502, 
          headers: { 
            ...cors, 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          } 
        }
      )
    }

    try {
      // Parse response
      console.log('[Edge:impacts] 📥 OpenAI response status:', openaiResponse.status)
      const data = await openaiResponse.json()
      console.log('[Edge:impacts] 📊 OpenAI response data:', {
        hasChoices: !!data?.choices,
        choicesCount: data?.choices?.length || 0,
        hasContent: !!data?.choices?.[0]?.message?.content,
        contentLength: data?.choices?.[0]?.message?.content?.length || 0
      })

      const content = data?.choices?.[0]?.message?.content

      if (!content) {
        console.error('[Edge:impacts] Empty response from OpenAI')
        return new Response(
          JSON.stringify({
            error: 'Invalid AI response',
            message: 'OpenAI returned an empty response',
            code: 'EMPTY_RESPONSE'
          }),
          {
            status: 502,
            headers: {
              ...cors,
              'Content-Type': 'application/json',
              'Cache-Control': 'no-store'
            }
          }
        )
      }

      // Parse and validate the content
      console.log('[Edge:impacts] 📄 Raw AI content before parsing:', content)

      const impacts: LifeImpactsResponse = JSON.parse(content)
      console.log('[Edge:impacts] 🔍 Parsed AI response:', impacts)

      if (!Array.isArray(impacts.manifestations) || !Array.isArray(impacts.unconsciousManifestations)) {
        console.error('[Edge:impacts] Invalid response format:', impacts)
        console.error('[Edge:impacts] Manifestations type:', typeof impacts.manifestations, 'Unconscious type:', typeof impacts.unconsciousManifestations)
        return new Response(
          JSON.stringify({
            error: 'Invalid response format',
            message: 'AI response did not match expected format',
            rawContent: content,
            parsedResponse: impacts,
            code: 'INVALID_FORMAT'
          }),
          {
            status: 502,
            headers: {
              ...cors,
              'Content-Type': 'application/json',
              'Cache-Control': 'no-store'
            }
          }
        )
      }

      console.log('[Edge:impacts] ✅ Response validation passed:', {
        manifestationsCount: impacts.manifestations.length,
        unconsciousManifestationsCount: impacts.unconsciousManifestations.length,
        riskLevel: impacts.riskLevel,
        confidenceLevel: impacts.confidenceLevel
      })

      // Return successful response
      return new Response(
        JSON.stringify({ 
          success: true, 
          impacts,
          metadata: { 
            generatedAt: new Date().toISOString(),
            assessmentCount: assessmentData.assessmentCount,
            model: 'gpt-4'
          }
        }),
        { 
          headers: { 
            ...cors, 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          }, 
          status: 200 
        }
      )

    } catch (error) {
      console.error('[Edge:impacts] Failed to process AI response:', error)
      return new Response(
        JSON.stringify({
          error: 'Processing error',
          message: error instanceof Error ? error.message : 'Failed to process AI response',
          code: 'PROCESSING_ERROR'
        }),
        {
          status: 502,
          headers: {
            ...cors,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          }
        }
      )
    }

  } catch (error) {
    console.error('[Edge:impacts] Unexpected error:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error,
      constructor: error?.constructor?.name
    })

    // Return detailed error for debugging - NEVER return empty object
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
        debug: {
          errorType: typeof error,
          hasStack: error instanceof Error && !!error.stack,
          timestamp: new Date().toISOString()
        }
      }),
      {
        status: 500,
        headers: {
          ...cors,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }
      }
    )
  }
})

function buildAnalysisPrompt(assessmentData: AssessmentData): string {
  const { allAssessments, dateRange, summary } = assessmentData

  console.log('[Edge:impacts] 📊 Building prompt with data:', {
    assessmentTypes: Object.keys(allAssessments),
    totalAssessmentTypes: Object.keys(allAssessments).length,
    dateRange,
    summary,
    sampleAssessmentData: Object.entries(allAssessments).slice(0, 1).map(([type, assessments]) => ({
      type,
      count: assessments.length,
      firstItem: assessments[0]
    }))
  })

  let prompt = "Please analyze the following assessment data to identify potential impacts on the person's daily life:\n\n" +
    "Assessment Overview:\n" +
    `- Time period: ${new Date(dateRange.earliest).toLocaleDateString()} to ${new Date(dateRange.latest).toLocaleDateString()}\n` +
    `- Overall risk level: ${summary.overallRiskLevel}\n` +
    `- Highest risk area: ${summary.highestRiskArea}\n\n` +
    "Assessment Details:\n"

  // Add each assessment's details - allAssessments is Record<string, any[]> so data is an array
  Object.entries(allAssessments).forEach(([assessmentId, assessments]) => {
    console.log(`[Edge:impacts] 🔍 Processing assessment type: ${assessmentId}, count: ${assessments.length}`)

    if (Array.isArray(assessments) && assessments.length > 0) {
      // Use the first assessment to get the title, or fall back to formatted ID
      const assessmentTitle = assessments[0]?.assessment?.title ||
                              assessmentId.toUpperCase().replace(/[_-]/g, ' ')

      console.log(`[Edge:impacts] 📋 Assessment title: "${assessmentTitle}" from data:`, assessments[0])

      prompt += `${assessmentTitle}:\n`
      prompt += `- Number of assessments: ${assessments.length}\n`

      // Show summary stats for this assessment type
      const scores = assessments.map(a => a.score).filter(s => typeof s === 'number')
      const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 'N/A'
      const severities = assessments.map(a => a.severity).filter(s => s)

      prompt += `- Average score: ${avgScore}\n`
      prompt += `- Severity levels: ${severities.join(', ') || 'unknown'}\n`

      // Show most recent assessment details
      const mostRecent = assessments.sort((a, b) =>
        new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime()
      )[0]

      if (mostRecent) {
        prompt += `- Most recent: Score ${mostRecent.score}, Level: ${mostRecent.level}, Severity: ${mostRecent.severity}\n`
        prompt += `- Date: ${new Date(mostRecent.takenAt).toLocaleDateString()}\n`
      }

      prompt += '\n'
    } else {
      console.log(`[Edge:impacts] ⚠️ Skipping ${assessmentId}: not an array or empty`)
    }
  })

  prompt += "Based on this assessment data, identify:\n" +
    "1. Observable impacts on daily life (manifestations)\n" +
    "2. Subtle impacts the person might not notice (unconsciousManifestations)\n" +
    "3. Overall risk level\n" +
    "4. Your confidence in this analysis (0-1)\n\n" +
    'Focus on how these mental health patterns might be affecting their day-to-day experiences. Use "you might be" or "you may find" language.'

  return prompt
}
