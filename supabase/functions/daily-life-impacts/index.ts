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
  manifestations: string[]  // Observable impacts on daily life
  unconsciousManifestations: string[]  // Subtle impacts user might not notice
  riskLevel: 'low' | 'moderate' | 'high' | 'critical'
  confidenceLevel: number
}

interface RequestBody {
  assessmentData: AssessmentData
}

Deno.serve(async (req) => {
  // CORS preflight
  const preflight = handleCorsPreflight(req)
  if (preflight) return preflight

  const cors = getCorsHeaders(req)

  try {
    console.log('[Edge:impacts] 🚀 Function started')
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    // Get request data
    const body: RequestBody = await req.json()
    const { assessmentData } = body

    console.log('[Edge:impacts] 📨 Received request:', {
      hasAssessmentData: !!assessmentData,
      userId: assessmentData?.userId,
      hasAllAssessments: !!assessmentData?.allAssessments,
      allAssessmentsCount: assessmentData?.allAssessments ? Object.keys(assessmentData.allAssessments).length : 0,
      assessmentDataKeys: assessmentData ? Object.keys(assessmentData) : []
    })

    if (!assessmentData?.userId || !assessmentData?.allAssessments) {
      console.error('[Edge:impacts] ❌ Invalid request data:', {
        hasUserId: !!assessmentData?.userId,
        hasAllAssessments: !!assessmentData?.allAssessments,
        assessmentData
      })
      return new Response(JSON.stringify({ 
        error: 'Invalid request data',
        details: 'Missing userId or allAssessments',
        received: {
          hasUserId: !!assessmentData?.userId,
          hasAllAssessments: !!assessmentData?.allAssessments
        }
      }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    // Get OpenAI key from environment
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      console.error('[Edge:impacts] OpenAI API key not found')
      return new Response(
        JSON.stringify({ 
          error: 'Configuration error',
          message: 'OpenAI API key not found',
          code: 'OPENAI_KEY_MISSING'
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
            content: "You are an AI trained to identify potential impacts of mental health challenges on daily life. Your role is to help users understand how their mental health might be affecting their day-to-day experiences.\n\nCORE PRINCIPLES:\n- Focus on potential manifestations and impacts, not advice or solutions\n- Use \"you might be\" or \"you may find\" language to acknowledge individual differences\n- Be specific about daily life situations and experiences\n- Describe observable impacts rather than clinical symptoms\n- Stay grounded in everyday experiences people can relate to\n- Never diagnose or make absolute statements\n- Be honest but sensitive about difficult topics\n- Focus on understanding, not fixing\n\nIMPACT AREAS TO CONSIDER:\n- Daily routines and activities\n- Work or study performance\n- Relationships and social interactions\n- Self-perception and confidence\n- Energy and motivation levels\n- Decision-making and planning\n- Enjoyment of activities\n- Sleep and rest patterns\n- Physical sensations\n- Future outlook\n\nFORMAT GUIDELINES:\n- Each impact should be a single, clear statement\n- Start with \"You might be\" or \"You may find\"\n- Focus on the experience, not the solution\n- Be specific and relatable\n- Avoid clinical terminology\n- Keep statements concise and clear\n\nExample impacts:\n- \"You might be finding it harder to enjoy activities you used to love\"\n- \"You may notice yourself avoiding social gatherings more than usual\"\n- \"You might be experiencing more difficulty making everyday decisions\"\n- \"You may find yourself feeling overwhelmed by tasks that used to feel manageable\"\n\nOutput a JSON object with:\n- manifestations: Array of observable daily life impacts (3-5 items)\n- unconsciousManifestations: Array of subtle impacts (2-3 items)\n- riskLevel: Overall risk assessment (\"low\", \"moderate\", \"high\", \"critical\")\n- confidenceLevel: Number between 0-1 indicating confidence in analysis"
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
      const data = await openaiResponse.json()
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
      const impacts: LifeImpactsResponse = JSON.parse(content)
      
      if (!Array.isArray(impacts.manifestations) || !Array.isArray(impacts.unconsciousManifestations)) {
        console.error('[Edge:impacts] Invalid response format:', impacts)
        return new Response(
          JSON.stringify({ 
            error: 'Invalid response format',
            message: 'AI response did not match expected format',
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
    console.error('[Edge:impacts] Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'INTERNAL_ERROR'
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

  let prompt = "Please analyze the following assessment data to identify potential impacts on the person's daily life:\n\n" +
    "Assessment Overview:\n" +
    `- Time period: ${new Date(dateRange.earliest).toLocaleDateString()} to ${new Date(dateRange.latest).toLocaleDateString()}\n` +
    `- Overall risk level: ${summary.overallRiskLevel}\n` +
    `- Highest risk area: ${summary.highestRiskArea}\n\n` +
    "Assessment Details:\n"

  // Add each assessment's details
  Object.entries(allAssessments).forEach(([id, data]) => {
    prompt += `${data.assessment.title}:\n` +
      `- Score: ${data.score}\n` +
      `- Level: ${data.level}\n` +
      `- Severity: ${data.severity}\n` +
      `- Date: ${new Date(data.takenAt).toLocaleDateString()}\n\n`
  })

  prompt += "Based on this assessment data, identify:\n" +
    "1. Observable impacts on daily life (manifestations)\n" +
    "2. Subtle impacts the person might not notice (unconsciousManifestations)\n" +
    "3. Overall risk level\n" +
    "4. Your confidence in this analysis (0-1)\n\n" +
    'Focus on how these mental health patterns might be affecting their day-to-day experiences. Use "you might be" or "you may find" language.'

  return prompt
}
