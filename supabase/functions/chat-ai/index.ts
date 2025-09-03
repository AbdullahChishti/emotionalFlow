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
- Be transparent about using assessment data for personalization
- Acknowledge when insights from assessments inform your responses

## Crisis Protocol
ONLY trigger crisis response if user explicitly mentions:
- Self-harm, suicide, or serious mental health crisis
- Immediate danger to themselves or others
- Severe distress requiring immediate professional intervention

For high assessment scores without crisis language:
- Provide supportive, personalized responses
- Use assessment data to inform therapeutic approach
- Monitor for crisis indicators but don't block normal conversation
- Encourage professional help when appropriate

## Response Style Examples
User: "I'm feeling really anxious"
Assistant: "I hear that you're feeling anxious right now, and that sounds really uncomfortable. Anxiety can be overwhelming. Can you tell me more about what's triggering these feelings?"

User: "I can't sleep at night"
Assistant: "Sleep difficulties can be really challenging and affect everything else. I notice this has been weighing on you. What thoughts tend to keep you awake at night?"

User: "Everything feels hopeless"
Assistant: "It sounds like you're in a really difficult place right now, feeling hopeless. That must be incredibly painful to carry. While I can't change your circumstances, I'm here to listen and support you. What feels most hopeless to you right now?"

User: "What do you think is wrong with me?"
Assistant: "I can't provide a diagnosis, but I can share that I have access to your recent assessment data, which helps me understand your mental health patterns and provide more personalized support. Based on what you've shared about your experiences, I can see you're dealing with some significant challenges. Can you tell me more about what specific symptoms or feelings have been most concerning to you lately?"

User: "I'm feeling really anxious"
Assistant: "I hear that you're feeling anxious right now, and I can see from your assessment data that anxiety has been a pattern for you. This helps me understand that you might benefit from some specific anxiety management techniques. What's triggering these anxious feelings today?"

User: "What do you think is wrong with me?" (when no assessment data available)
Assistant: "I don't have access to your assessments or any personal information. My role is to provide support based on our conversation. If you'd like to share how you're feeling or discuss specific concerns, I'm here to listen and support you. What's been on your mind lately?"

User: "I'm feeling really anxious" (high-risk user with assessment data)
Assistant: "I hear that you're feeling anxious right now, and I can see from your assessment data that anxiety has been a significant challenge for you. This helps me understand that you might benefit from some specific anxiety management techniques. What's triggering these anxious feelings today?"

User: "How are you today?" (high-risk user, normal conversation)
Assistant: "I'm here to support you today. I can see from your assessment data that you've been dealing with some significant challenges, and I want you to know that I'm here to listen and help however I can. How are you feeling right now?"

User: "I'm feeling really down" (user with PHQ-9 score 18)
Assistant: "I hear that you're feeling really down right now, and I can see from your assessment data that depression has been a significant challenge for you. That must be really difficult to carry. Can you tell me more about what's been contributing to these feelings lately?"

## Assessment Data Transparency
When you have access to user assessment data, be transparent about it:
- Acknowledge that you're using their assessment insights to personalize responses
- Reference general patterns from their assessments (e.g., "Based on what you've shared about your anxiety patterns...")
- Explain how their assessment data helps you provide better support
- Never share specific scores or clinical details directly
- Use assessment insights to guide conversation topics and coping strategies

When you do NOT have access to assessment data:
- Be honest that you don't have access to their assessment data
- Explain that you can still provide support based on what they share in conversation
- Encourage them to complete assessments if they want more personalized support
- Focus on active listening and general therapeutic techniques

## Boundaries
- Do not provide medical diagnoses
- Do not recommend specific medications
- Do not give legal advice
- Do not act as a substitute for professional therapy
- Always encourage professional help when appropriate
- Do not share specific assessment scores or clinical details

Remember: Your role is to provide supportive listening and gentle guidance, not professional therapy.`

// Crisis detection keywords - more specific to avoid false positives
const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end it all',
  'self-harm', 'cutting', 'overdose',
  'want to die', 'better off dead',
  'can\'t go on', 'tired of living',
  'hurt myself', 'harm myself',
  'not worth living', 'end my life'
]

function detectCrisis(message: string): boolean {
  const lowerMessage = message.toLowerCase()
  return CRISIS_KEYWORDS.some(keyword => lowerMessage.includes(keyword))
}

// Assessment data processing functions
function processLatestAssessments(results: any[]): any {
  const assessments: any = {}

  // Group by assessment type and get most recent
  const grouped = results.reduce((acc, result) => {
    if (!acc[result.assessment_id] || new Date(result.taken_at) > new Date(acc[result.assessment_id].taken_at)) {
      acc[result.assessment_id] = result
    }
    return acc
  }, {} as Record<string, any>)

  // Map to our expected format
  if (grouped.phq9) assessments.phq9 = grouped.phq9
  if (grouped.gad7) assessments.gad7 = grouped.gad7
  if (grouped.ace) assessments.ace = grouped.ace
  if (grouped['cd-risc']) assessments.cdRisc = grouped['cd-risc']

  return assessments
}

function assessRiskLevel(assessments: any, userProfile: any): string {
  const phq9 = assessments.phq9
  const gad7 = assessments.gad7
  const ace = assessments.ace

  // Crisis indicators - only for explicit crisis language or immediate risk
  // Removed score-based crisis detection to prevent false positives
  if (phq9?.result_data?.immediate_risk === true) {
    return 'crisis';
  }

  // High risk indicators - more conservative thresholds
  if (
    (phq9?.score >= 25) || // Very severe depression
    (phq9?.result_data?.suicidal_ideation && phq9?.score >= 25) || // Suicidal ideation with very severe depression
    (gad7?.score >= 20) // Very severe anxiety
  ) {
    return 'high';
  }

  // Moderate risk indicators - adjusted thresholds
  if (
    (phq9?.score >= 20) ||
    (gad7?.score >= 15) ||
    (ace?.score >= 6) ||
    (phq9?.score >= 15 && gad7?.score >= 10)
  ) {
    return 'moderate';
  }

  // Low risk - default
  return 'low';
}

function generatePersonalizedApproach(assessments: any, userProfile: any): any {
  const phq9 = assessments.phq9
  const gad7 = assessments.gad7
  const ace = assessments.ace
  const cdRisc = assessments.cdRisc

  const therapyStyle: string[] = []
  const focusAreas: string[] = []
  const safetyProtocols: string[] = ['standard_safety_check']
  const recommendations: string[] = []

  // Depression-based personalization
  if (phq9?.score >= 10) {
    therapyStyle.push('cbt_approach', 'behavioral_activation')
    focusAreas.push('mood_regulation', 'activity_scheduling', 'cognitive_restructuring')
    recommendations.push('depression_resources', 'mood_tracking', 'behavioral_activation')
    
    if (phq9.score >= 25) {
      safetyProtocols.push('depression_crisis_protocol', 'suicide_prevention')
      recommendations.push('immediate_professional_help')
    } else if (phq9.score >= 15) {
      safetyProtocols.push('enhanced_depression_monitoring')
      recommendations.push('professional_help_recommended')
    }
  } else if (phq9?.score >= 5) {
    therapyStyle.push('supportive_listening', 'preventive_care')
    focusAreas.push('mood_monitoring', 'self_care')
    recommendations.push('mood_tracking', 'stress_management')
  }

  // Anxiety-based personalization
  if (gad7?.score >= 10) {
    therapyStyle.push('anxiety_management', 'mindfulness_approach')
    focusAreas.push('worry_management', 'relaxation_skills', 'exposure_techniques')
    recommendations.push('anxiety_resources', 'relaxation_techniques', 'mindfulness_exercises')
    
    if (gad7.score >= 25) {
      safetyProtocols.push('anxiety_crisis_protocol')
      recommendations.push('immediate_professional_help')
    } else if (gad7.score >= 15) {
      safetyProtocols.push('enhanced_anxiety_monitoring')
      recommendations.push('professional_help_recommended')
    }
  } else if (gad7?.score >= 5) {
    therapyStyle.push('stress_management', 'preventive_care')
    focusAreas.push('anxiety_monitoring', 'relaxation_skills')
    recommendations.push('stress_management', 'breathing_exercises')
  }

  // Trauma-based personalization
  if (ace?.score >= 4) {
    therapyStyle.push('trauma_informed_care', 'safety_first_approach')
    focusAreas.push('safety_building', 'grounding_techniques', 'trauma_processing')
    recommendations.push('trauma_resources', 'grounding_techniques', 'trauma_informed_therapy')
    
    if (ace.score >= 6) {
      safetyProtocols.push('trauma_trigger_monitoring', 'complex_trauma_protocol')
      recommendations.push('trauma_specialist_referral')
    }
  }

  // Resilience-based personalization
  if (cdRisc?.score < 30) {
    therapyStyle.push('skill_building', 'support_network_building')
    focusAreas.push('coping_skill_development', 'social_support', 'resilience_building')
    recommendations.push('resilience_building', 'social_connection', 'coping_skills')
  } else if (cdRisc?.score >= 35) {
    therapyStyle.push('strength_based_approach', 'peer_support')
    focusAreas.push('strength_utilization', 'helping_others', 'leadership')
    recommendations.push('peer_support', 'mentoring_opportunities')
  }

  // Default recommendations if no specific conditions
  if (therapyStyle.length === 0) {
    therapyStyle.push('general_support', 'wellness_focus')
    focusAreas.push('general_wellness', 'preventive_care')
    recommendations.push('general_self_care', 'wellness_resources')
  }

  return {
    therapyStyle,
    focusAreas,
    safetyProtocols,
    recommendations
  }
}

function generateAssessmentContext(personalizedChatData: any): string {
  const { latestAssessments, riskLevel, personalizedApproach, lastAssessed } = personalizedChatData
  
  let context = `# User Assessment Profile (CONFIDENTIAL - FOR AI UNDERSTANDING ONLY)

## Assessment Results:`

  // Add assessment-specific context
  if (latestAssessments.phq9) {
    const phq9 = latestAssessments.phq9
    context += `\n- Depression (PHQ-9): Score ${phq9.score} (${phq9.level}) - ${phq9.severity} severity`
  }

  if (latestAssessments.gad7) {
    const gad7 = latestAssessments.gad7
    context += `\n- Anxiety (GAD-7): Score ${gad7.score} (${gad7.level}) - ${gad7.severity} severity`
  }

  if (latestAssessments.ace) {
    const ace = latestAssessments.ace
    context += `\n- Trauma History (ACE): Score ${ace.score} (${ace.level}) - ${ace.severity} severity`
  }

  if (latestAssessments.cdRisc) {
    const cdRisc = latestAssessments.cdRisc
    context += `\n- Resilience (CD-RISC): Score ${cdRisc.score} (${cdRisc.level}) - ${cdRisc.severity} severity`
  }

  context += `\n- Overall Risk Level: ${riskLevel.toUpperCase()}`
  context += `\n- Last Assessed: ${lastAssessed ? lastAssessed.toLocaleDateString() : 'No recent assessments'}`

  // Add personalized approach
  context += `\n\n## Personalized Approach:`
  context += `\n- Therapy Style: ${personalizedApproach.therapyStyle.join(', ')}`
  context += `\n- Focus Areas: ${personalizedApproach.focusAreas.join(', ')}`
  context += `\n- Safety Protocols: ${personalizedApproach.safetyProtocols.join(', ')}`

  // Add risk-specific guidelines
  if (riskLevel === 'crisis') {
    context += `\n\n## HIGH RISK USER - ENHANCED SUPPORT:`
    context += `\n- User has severe assessment scores indicating significant mental health challenges`
    context += `\n- Provide enhanced support and monitoring`
    context += `\n- Use trauma-informed, gentle approach`
    context += `\n- Encourage professional help and safety planning`
    context += `\n- Monitor for crisis indicators but allow normal conversation`
    context += `\n- Focus on coping strategies and support building`
    context += `\n- CRITICAL: Do NOT block normal conversation - only trigger crisis response for explicit crisis language`
    context += `\n- CRITICAL: Have normal conversations about their concerns and feelings`
    context += `\n- CRITICAL: Use assessment data to provide personalized support, not to block interaction`
  } else if (riskLevel === 'high') {
    context += `\n\n## HIGH RISK PROTOCOL:`
    context += `\n- User has significant mental health challenges`
    context += `\n- Monitor for crisis indicators throughout conversation`
    context += `\n- Provide enhanced safety resources`
    context += `\n- Encourage professional support`
    context += `\n- Use trauma-informed approach if applicable`
    context += `\n- Focus on coping strategies and support building`
    context += `\n- CRITICAL: Do NOT block normal conversation - only trigger crisis response for explicit crisis language`
    context += `\n- CRITICAL: Have normal conversations about their concerns and feelings`
  } else if (riskLevel === 'moderate') {
    context += `\n\n## MODERATE RISK PROTOCOL:`
    context += `\n- User has some mental health challenges`
    context += `\n- Provide supportive guidance and resources`
    context += `\n- Encourage self-care and professional support when appropriate`
    context += `\n- Use appropriate therapeutic techniques`
    context += `\n- Focus on skill building and wellness`
  } else {
    context += `\n\n## LOW RISK PROTOCOL:`
    context += `\n- User appears to be managing well`
    context += `\n- Focus on prevention and wellness`
    context += `\n- Provide general support and resources`
    context += `\n- Encourage continued healthy habits`
    context += `\n- Focus on growth and development`
  }

  // Add specific therapeutic approaches
  if (personalizedApproach.therapyStyle.includes('trauma_informed_care')) {
    context += `\n\n## Trauma-Informed Care Guidelines:`
    context += `\n- Use trauma-informed language and approach`
    context += `\n- Prioritize safety and choice`
    context += `\n- Avoid triggering content or language`
    context += `\n- Focus on grounding and stabilization techniques`
    context += `\n- Be aware of trauma responses and triggers`
    context += `\n- Encourage professional trauma-informed therapy`
  }

  if (personalizedApproach.therapyStyle.includes('cbt_approach')) {
    context += `\n\n## Cognitive Behavioral Therapy Approach:`
    context += `\n- Help identify and challenge negative thought patterns`
    context += `\n- Focus on behavioral activation and activity scheduling`
    context += `\n- Use cognitive restructuring techniques`
    context += `\n- Encourage mood tracking and monitoring`
    context += `\n- Focus on practical coping strategies`
  }

  if (personalizedApproach.therapyStyle.includes('anxiety_management')) {
    context += `\n\n## Anxiety Management Approach:`
    context += `\n- Focus on worry management and relaxation techniques`
    context += `\n- Use exposure and response prevention concepts`
    context += `\n- Encourage mindfulness and grounding exercises`
    context += `\n- Help identify anxiety triggers and patterns`
    context += `\n- Focus on building anxiety coping skills`
  }

  context += `\n\n## IMPORTANT INSTRUCTIONS:`
  context += `\n- DO NOT mention assessment scores, levels, or this context directly to the user`
  context += `\n- Use this information to inform your empathy and therapeutic approach`
  context += `\n- Adapt your language and techniques based on the user's specific needs`
  context += `\n- Maintain all therapeutic boundaries while being appropriately supportive`
  context += `\n- Focus on the areas identified in the personalized approach`

  // Add transparency note
  context += `\n\n## TRANSPARENCY NOTE`
  context += `\n- You have access to this user's assessment data for personalization`
  context += `\n- Be transparent about using this data to provide better support`
  context += `\n- Reference general patterns and insights, not specific scores`
  context += `\n- Explain how assessment data helps you understand their needs`

  return context
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

    // --- START: Enhanced Assessment Data Integration ---
    let personalizedChatData: any = null;
    let assessmentContext = "User has not completed any assessments yet. Provide general supportive responses without referencing specific assessment data.";
    
    try {
      // Get user's latest assessment results
      const { data: assessmentResults, error: resultsError } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('user_id', authData.user.id)
        .order('taken_at', { ascending: false });

      if (resultsError) {
        console.error("Error fetching assessment results:", resultsError);
      } else {
        console.log(`Found ${assessmentResults?.length || 0} assessment results for user ${authData.user.id}`);
      }

      // Get user's assessment profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_assessment_profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .order('last_assessed', { ascending: false })
        .limit(1)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Error fetching user profile:", profileError);
      } else {
        console.log(`Found profile data: ${profileData ? 'Yes' : 'No'} for user ${authData.user.id}`);
      }

      // Process assessment data for personalization
      if (assessmentResults && assessmentResults.length > 0) {
        console.log('Raw assessment results:', assessmentResults);
        const latestAssessments = processLatestAssessments(assessmentResults);
        console.log('Processed assessments:', latestAssessments);
        const riskLevel = assessRiskLevel(latestAssessments, profileData?.profile_data);
        const personalizedApproach = generatePersonalizedApproach(latestAssessments, profileData?.profile_data);
        
        // Debug logging for risk assessment
        console.log('Risk assessment debug:', {
          assessments: latestAssessments,
          riskLevel,
          phq9Score: latestAssessments.phq9?.score,
          gad7Score: latestAssessments.gad7?.score,
          aceScore: latestAssessments.ace?.score
        });
        
        personalizedChatData = {
          latestAssessments,
          riskLevel,
          personalizedApproach,
          lastAssessed: profileData?.last_assessed ? new Date(profileData.last_assessed) : null
        };

        // TEMPORARILY DISABLED: Generate assessment context for AI
        assessmentContext = "User has assessment data but context generation is temporarily disabled for testing.";
        console.log("Generated assessment context with data");
      } else {
        assessmentContext = "User has not completed any assessments yet. Provide general supportive responses without referencing specific assessment data.";
        console.log("No assessment data found, using default context");
      }
    } catch (dbError) {
      console.error("Error in assessment data integration:", dbError);
      assessmentContext = "Could not retrieve assessment data due to a database error.";
    }
    // --- END: Enhanced Assessment Data Integration ---
    
    // Debug: Log the assessment context being used
    console.log("Final assessment context:", assessmentContext.substring(0, 200) + "...");
    console.log("Personalized chat data:", personalizedChatData);

    const {
      message,
      conversationHistory = [],
      emotionalState = 'neutral',
      sessionId
    } = await req.json()

    // --- START: Informed Welcome Message ---
    // If this is the first message of a session and we have assessment data,
    // send a special welcome message instead of calling the AI.
    if (conversationHistory.length === 0 && personalizedChatData) {
      return new Response(
        JSON.stringify({
          response: "Welcome back. To help make our conversation as supportive as possible, I've been updated with the insights from the recent assessments you shared. I'll keep these in mind to better understand what you're going through as we talk. How are you feeling today?",
          isWelcomeMessage: true, // Add a flag for the frontend
          // Also include the assessment context metadata for the frontend to use
          assessmentContext: {
            hasAssessmentData: true,
            riskLevel: personalizedChatData.riskLevel,
            focusAreas: personalizedChatData.personalizedApproach.focusAreas,
            recommendations: personalizedChatData.personalizedApproach.recommendations,
            lastAssessed: personalizedChatData.lastAssessed?.toISOString() || null
          }
        }),
        {
          headers: { ...cors, "Content-Type": "application/json" }
        }
      )
    }
    // --- END: Informed Welcome Message ---

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

    // Enhanced crisis detection - assessment-aware
    const isCrisisDetected = detectCrisis(safeMessage)
    const assessmentRiskLevel = personalizedChatData?.riskLevel || 'low'
    
    // Debug logging
    console.log('Crisis detection debug:', {
      message: safeMessage,
      isCrisisDetected,
      assessmentRiskLevel,
      hasAssessmentData: !!personalizedChatData,
      willTriggerCrisis: isCrisisDetected
    })
    
    // TEMPORARILY DISABLED: Only trigger crisis response for actual crisis messages, not just high assessment scores
    if (false && isCrisisDetected) {
      let crisisResponse = "I'm concerned about your safety. Please contact emergency services (911) or a crisis hotline immediately. You can also reach the National Suicide Prevention Lifeline at 988."
      
      // Add assessment-specific crisis resources
      if (personalizedChatData?.personalizedApproach?.safetyProtocols?.includes('trauma_trigger_monitoring')) {
        crisisResponse += " For trauma-related crisis support, you can also contact RAINN at 1-800-656-4673."
      }
      
      crisisResponse += " If you're in immediate danger, please seek help right now."
      
      return new Response(
        JSON.stringify({
          response: crisisResponse,
          isCrisis: true,
          assessmentRiskLevel: assessmentRiskLevel,
          personalizedResources: personalizedChatData?.personalizedApproach?.recommendations || []
        }),
        {
          headers: { ...cors, "Content-Type": "application/json" }
        }
      )
    }

    // Prepare conversation history for OpenAI
    // Enhanced system prompt with emotional and assessment context
    const enhancedSystemPrompt = `${THERAPY_SYSTEM_PROMPT}

${assessmentContext}

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

Adapt your response style to match the user's current emotional state while maintaining therapeutic boundaries.

## Transparency Instructions
- Be open about having access to the user's assessment data
- Explain how this data helps you provide personalized support
- Reference general patterns from their assessments when relevant
- Never share specific scores or clinical details
- Help the user understand how their assessment insights inform your responses
- For high-risk users: Provide enhanced support without blocking normal conversation
- Only trigger crisis response for explicit crisis language, not high assessment scores`

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
          sessionId,
          // Assessment-based metadata
          assessmentContext: {
            hasAssessmentData: !!personalizedChatData,
            riskLevel: personalizedChatData?.riskLevel || 'low',
            focusAreas: personalizedChatData?.personalizedApproach?.focusAreas || [],
            recommendations: personalizedChatData?.personalizedApproach?.recommendations || [],
            lastAssessed: personalizedChatData?.lastAssessed?.toISOString() || null
          }
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
