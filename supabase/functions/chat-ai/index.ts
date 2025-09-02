import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import OpenAI from "https://esm.sh/openai@4"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders, handleCorsPreflight } from "../_shared/cors.ts"

// Initialize OpenAI with error handling
let openai: OpenAI | null = null
try {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (apiKey && apiKey.startsWith('sk-')) {
    openai = new OpenAI({
      apiKey: apiKey
    })
    console.log('OpenAI initialized successfully')
  } else {
    console.error('Invalid or missing OpenAI API key')
  }
} catch (error) {
  console.error('Failed to initialize OpenAI:', error)
}

// Therapy-specific system prompt
const THERAPY_SYSTEM_PROMPT = `# AI Therapy Assistant

## Core Principles
- Be empathetic, non-judgmental, and supportive
- Use active listening techniques
- Ask open-ended questions to encourage deeper sharing
- Validate feelings without minimizing them
- Recognize therapeutic boundaries
- Maintain professional, compassionate tone

## Therapeutic Techniques
1. **Active Listening**: Reflect back what you hear
2. **Validation**: Acknowledge emotions as valid and understandable
3. **Gentle Exploration**: Ask about feelings and experiences without pressure
4. **Crisis Recognition**: Identify when professional help is needed
5. **Supportive Guidance**: Offer coping strategies when appropriate

## Response Guidelines
- Keep responses conversational (2-4 sentences typically)
- End with an open-ended question when appropriate to continue dialogue
- Use "I" statements to show empathy (e.g., "I hear that...", "I understand...")
- Avoid giving medical advice, diagnoses, or prescribing medication
- Always prioritize user safety and well-being
- Be patient and allow for silence/processing time

## Crisis Protocol
If user mentions or shows signs of:
- Self-harm, suicide, or serious mental health crisis
- Immediate danger to themselves or others
- Severe distress requiring immediate professional intervention

Respond immediately: "I'm concerned about your safety. Please contact emergency services (911) or a crisis hotline immediately. You can also reach the National Suicide Prevention Lifeline at 988."

## Response Style Examples
User: "I'm feeling really anxious"
Assistant: "I hear that you're feeling anxious right now, and that sounds really uncomfortable. Anxiety can be overwhelming. Can you tell me more about what's triggering these feelings?"

User: "I can't sleep at night"
Assistant: "Sleep difficulties can be really challenging and affect everything else. I notice this has been weighing on you. What thoughts tend to keep you awake at night?"

User: "Everything feels hopeless"
Assistant: "It sounds like you're in a really difficult place right now, feeling hopeless. That must be incredibly painful to carry. While I can't change your circumstances, I'm here to listen and support you. What feels most hopeless to you right now?"

## Boundaries
- Do not provide medical diagnoses
- Do not recommend specific medications
- Do not give legal advice
- Do not act as a substitute for professional therapy
- Always encourage professional help when appropriate

Remember: Your role is to provide supportive listening and gentle guidance, not professional therapy.`

// Crisis detection keywords
const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end it all',
  'self-harm', 'cutting', 'overdose',
  'emergency', 'crisis', 'help me',
  'want to die', 'better off dead',
  'can\'t go on', 'tired of living'
]

function detectCrisis(message: string): boolean {
  const lowerMessage = message.toLowerCase()
  return CRISIS_KEYWORDS.some(keyword => lowerMessage.includes(keyword))
}

serve(async (req) => {
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

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const { data: authData } = await supabase.auth.getUser()
    if (!authData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    const {
      message,
      conversationHistory = [],
      emotionalState = 'neutral',
      sessionId
    } = await req.json()

    // Basic input validation & limits
    if (typeof message !== 'string' || message.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid message' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
    }
    const safeMessage = message.slice(0, 2000)
    const history = Array.isArray(conversationHistory) ? conversationHistory.slice(-3) : []

    // Check if OpenAI is available
    if (!openai) {
      console.error('OpenAI not available - returning fallback response')
      return new Response(
        JSON.stringify({
          response: "I'm sorry, I'm having trouble connecting to my AI service right now. Please try again in a moment. If you're in crisis, please contact emergency services (911) or a crisis hotline.",
          fallback: true,
          error: "OpenAI not initialized"
        }),
        {
          headers: { ...cors, "Content-Type": "application/json" }
        }
      )
    }

    // Crisis detection - highest priority
    if (detectCrisis(safeMessage)) {
      return new Response(
        JSON.stringify({
          response: "I'm concerned about your safety. Please contact emergency services (911) or a crisis hotline immediately. You can also reach the National Suicide Prevention Lifeline at 988. If you're in immediate danger, please seek help right now.",
          isCrisis: true
        }),
        {
          headers: { ...cors, "Content-Type": "application/json" }
        }
      )
    }

    // Prepare conversation history for OpenAI
    // Enhanced system prompt with emotional context
    const enhancedSystemPrompt = `${THERAPY_SYSTEM_PROMPT}

## Current Session Context
- User's current emotional state: ${emotionalState}
- Session ID: ${sessionId || 'unknown'}
- Conversation context: ${conversationHistory.length} previous messages

## Emotional State Guidelines
${emotionalState === 'anxious' ? '- User appears anxious - focus on calming techniques and gentle reassurance' : ''}
${emotionalState === 'overwhelmed' ? '- User feels overwhelmed - help break down concerns into manageable pieces' : ''}
${emotionalState === 'sad' ? '- User is experiencing sadness - validate feelings and offer gentle support' : ''}
${emotionalState === 'angry' ? '- User expresses anger - help process emotions without judgment' : ''}
${emotionalState === 'hopeful' ? '- User shows hope - nurture positive feelings and build on strengths' : ''}
${emotionalState === 'calm' ? '- User is calm - maintain supportive, present-focused dialogue' : ''}

Adapt your response style to match the user's current emotional state while maintaining therapeutic boundaries.`

      const messages = [
        { role: 'system', content: enhancedSystemPrompt },
      ...history.map((msg: any) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: safeMessage }
      ]

    // Call OpenAI API with timeout and error handling
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 25000) // 25 second timeout

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 300,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      })

      clearTimeout(timeoutId)
      const aiResponse = response.choices[0].message.content

      // Analyze response for emotional metadata
      const responseLower = aiResponse?.toLowerCase() || ''
      const isAffirmation = /\b(you're|you're|you are|that's|it's|i hear|i understand|i can see|it's okay|that's understandable|you're not alone|you're doing|you're making|you're taking)\b/i.test(responseLower)
      const emotionalTone = responseLower.includes('calm') || responseLower.includes('breathe') || responseLower.includes('relax') ? 'calming' :
                           responseLower.includes('support') || responseLower.includes('help') || responseLower.includes('together') ? 'supportive' :
                           responseLower.includes('hope') || responseLower.includes('better') || responseLower.includes('progress') ? 'encouraging' :
                           responseLower.includes('hear') || responseLower.includes('understand') || responseLower.includes('feel') ? 'empathetic' : 'empathetic'

      return new Response(
        JSON.stringify({
          response: aiResponse,
          usage: response.usage,
          isCrisis: false,
          success: true,
          emotionalTone,
          isAffirmation,
          emotionalState: emotionalState,
          sessionId
        }),
        {
          headers: { ...cors, "Content-Type": "application/json" }
        }
      )

    } catch (openaiError) {
      console.error('OpenAI API Error:', openaiError)

      // Provide specific error messages based on error type
      let errorMessage = "I'm sorry, I'm having trouble responding right now."
      let errorType = "unknown"

      if (openaiError.message?.includes('rate limit')) {
        errorMessage += " It seems I'm receiving too many requests. Please try again in a minute."
        errorType = "rate_limit"
      } else if (openaiError.message?.includes('billing') || openaiError.message?.includes('insufficient_quota')) {
        errorMessage += " There might be an issue with my service billing. Please try again later."
        errorType = "billing"
      } else if (openaiError.message?.includes('model') || openaiError.message?.includes('not_found')) {
        errorMessage += " My AI model is temporarily unavailable. Please try again."
        errorType = "model_unavailable"
      } else if (openaiError.message?.includes('authentication') || openaiError.message?.includes('api key')) {
        errorMessage += " There seems to be an authentication issue. Please contact support."
        errorType = "auth_error"
      } else if (openaiError.name === 'AbortError') {
        errorMessage += " The request took too long. Please try again."
        errorType = "timeout"
      }

      return new Response(
        JSON.stringify({
          response: errorMessage + " If you're in crisis, please contact emergency services (911) or a crisis hotline.",
          error: typeof openaiError?.message === 'string' ? openaiError.message : 'openai_error',
          errorType: errorType,
          fallback: true
        }),
        {
          status: 200, // Return 200 for graceful degradation
          headers: { ...cors, "Content-Type": "application/json" }
        }
      )
    }

  } catch (error) {
    console.error('Error in therapy AI function:', error)

    // Return a safe fallback response
    return new Response(
      JSON.stringify({
        response: "I'm sorry, I'm having trouble responding right now. Please try again in a moment. If you're in crisis, please contact emergency services or a crisis hotline.",
        error: true
      }),
      {
        status: 500,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" }
      }
    )
  }
})
