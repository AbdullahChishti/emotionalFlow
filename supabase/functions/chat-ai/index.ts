import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import OpenAI from "https://esm.sh/openai@4"

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
  try {
    // Handle CORS
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        }
      })
    }

    const { message, conversationHistory = [] } = await req.json()

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
          headers: {
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    // Crisis detection - highest priority
    if (detectCrisis(message)) {
      return new Response(
        JSON.stringify({
          response: "I'm concerned about your safety. Please contact emergency services (911) or a crisis hotline immediately. You can also reach the National Suicide Prevention Lifeline at 988. If you're in immediate danger, please seek help right now.",
          isCrisis: true
        }),
        {
          headers: {
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    // Prepare conversation history for OpenAI
    const messages = [
      { role: 'system', content: THERAPY_SYSTEM_PROMPT },
      ...conversationHistory.slice(-3).map((msg: any) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: message }
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

      return new Response(
        JSON.stringify({
          response: aiResponse,
          usage: response.usage,
          isCrisis: false,
          success: true
        }),
        {
          headers: {
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': '*'
          }
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
          error: openaiError.message,
          errorType: errorType,
          fallback: true
        }),
        {
          status: 200, // Return 200 for graceful degradation
          headers: {
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': '*'
          }
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
        headers: {
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  }
})
