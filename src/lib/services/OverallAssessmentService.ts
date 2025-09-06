/**
 * Overall Assessment Service
 * Collects all user assessments and sends them to AI for comprehensive holistic analysis
 * Focus on AI-driven insights rather than static responses
 */

import { supabase } from '../supabase'
import { AssessmentManager } from './AssessmentManager'
import { ASSESSMENTS } from '@/data/assessments'

// Types and Interfaces
export interface AssessmentResponse {
  questionId: string
  questionText: string
  response: any
  score?: number
}

export interface DetailedAssessmentEntry {
  id: string
  userId: string
  assessmentId: string
  assessmentTitle: string
  assessmentDescription?: string
  score: number
  level: string
  severity: string
  takenAt: string
  responses: AssessmentResponse[]
  interpretation?: string
}

export interface OverallAssessmentData {
  userId: string
  assessments: DetailedAssessmentEntry[]
  assessmentCount: number
  dateRange: {
    earliest: string
    latest: string
  }
  totalScore: number
  averageScore: number
}

export interface AIHolisticAnalysis {
  executiveSummary: string
  manifestations: string[]  // Observable impacts on daily life
  unconsciousManifestations: string[]  // Subtle impacts user might not be aware of
  riskFactors: string[]
  protectiveFactors: string[]
  overallRiskLevel: 'low' | 'moderate' | 'high' | 'critical'
  confidenceLevel: number
  supportiveMessage: string
}

export interface OverallAssessmentResult {
  id?: string
  userId: string
  assessmentData: OverallAssessmentData
  holisticAnalysis: AIHolisticAnalysis
  createdAt: string
  updatedAt: string
}

// Constants
const AI_TIMEOUT_DURATION = 45000 // 45 seconds for comprehensive analysis
const MIN_ASSESSMENTS_FOR_HOLISTIC = 2 // Need multiple assessments for true holistic view

export class OverallAssessmentService {
  /**
   * Collect comprehensive assessment data with full response details
   */
  static async collectComprehensiveAssessmentData(userId: string): Promise<OverallAssessmentData> {
    if (!userId?.trim()) {
      throw new Error('Valid user ID is required')
    }

    console.log(`🔍 Collecting comprehensive assessment data for user ${userId}...`)

    try {
      // Get full assessment history with responses
      const assessmentHistory = await AssessmentManager.getAssessmentHistory(userId)

      if (!Array.isArray(assessmentHistory) || assessmentHistory.length === 0) {
        throw new Error('No assessments found for user')
      }

      // Get detailed responses for each assessment
      const detailedAssessments: DetailedAssessmentEntry[] = []
      let totalScore = 0
      let earliestDate = new Date()
      let latestDate = new Date(0)

      // Group assessments and get latest of each type with full details
      const groupedAssessments = this.groupAssessmentsByType(assessmentHistory)

      for (const [assessmentId, entries] of Object.entries(groupedAssessments)) {
        // Get most recent assessment of this type
        const latestEntry = entries.sort((a, b) => 
          new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime()
        )[0]

        if (!latestEntry) continue

        // Get full response details
        const responses = await this.getAssessmentResponses(latestEntry.id)
        const assessmentMeta = this.getAssessmentMetadata(assessmentId)

        const detailedEntry: DetailedAssessmentEntry = {
          id: latestEntry.id,
          userId: latestEntry.userId,
          assessmentId,
          assessmentTitle: assessmentMeta.title,
          assessmentDescription: assessmentMeta.description,
          score: latestEntry.score || 0,
          level: latestEntry.level || '',
          severity: latestEntry.severity || 'unknown',
          takenAt: latestEntry.takenAt,
          responses,
          interpretation: latestEntry.interpretation
        }

        detailedAssessments.push(detailedEntry)
        totalScore += detailedEntry.score

        // Update date range
        const entryDate = new Date(latestEntry.takenAt)
        if (this.isValidDate(entryDate)) {
          if (entryDate < earliestDate) earliestDate = entryDate
          if (entryDate > latestDate) latestDate = entryDate
        }
      }

      if (detailedAssessments.length === 0) {
        throw new Error('No valid detailed assessments found')
      }

      return {
        userId: userId.trim(),
        assessments: detailedAssessments,
        assessmentCount: detailedAssessments.length,
        dateRange: {
          earliest: earliestDate.toISOString(),
          latest: latestDate.toISOString()
        },
        totalScore,
        averageScore: totalScore / detailedAssessments.length
      }
    } catch (error) {
      console.error('Error collecting comprehensive assessment data:', error)
      throw new Error(`Failed to collect assessment data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate holistic AI analysis from all assessment data
   */
  static async generateHolisticAssessment(userId: string): Promise<OverallAssessmentResult> {
    if (!userId?.trim()) {
      throw new Error('Valid user ID is required')
    }

    console.log(`🤖 Generating holistic AI assessment for user ${userId}...`)

    try {
      // Collect comprehensive data
      const assessmentData = await this.collectComprehensiveAssessmentData(userId)

      // Validate we have enough data for holistic analysis
      if (assessmentData.assessments.length < MIN_ASSESSMENTS_FOR_HOLISTIC) {
        console.warn(`Only ${assessmentData.assessments.length} assessment(s) found. Holistic analysis works best with ${MIN_ASSESSMENTS_FOR_HOLISTIC}+ assessments.`)
      }

      // Send to AI for holistic analysis
      const holisticAnalysis = await this.requestHolisticAIAnalysis(assessmentData)

      const result: OverallAssessmentResult = {
        userId: userId.trim(),
        assessmentData,
        holisticAnalysis,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Save result (non-blocking)
      this.saveHolisticAssessment(result).catch(error => {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error('[HolisticAssessment] Failed to save holistic assessment (continuing):', {
          message: errorMessage,
          error: error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack?.split('\n').slice(0, 5).join('\n')
          } : error,
          userId: result.userId,
          timestamp: new Date().toISOString()
        })
      })

      return result
    } catch (error) {
      console.error('Error generating holistic assessment:', error)
      throw new Error(`Failed to generate holistic assessment: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Request comprehensive AI analysis of all assessment data
   */
  private static async requestHolisticAIAnalysis(assessmentData: OverallAssessmentData): Promise<AIHolisticAnalysis> {
    console.log(`🧠 Requesting holistic AI analysis for ${assessmentData.assessments.length} assessments...`)

    try {
      // Prepare comprehensive prompt with all assessment data
      const analysisPrompt = this.buildHolisticAnalysisPrompt(assessmentData)
      
      // Log what we're sending (sanitized)
      console.log('[HolisticAI] 📤 Sending comprehensive data:', {
        userId: assessmentData.userId,
        assessmentCount: assessmentData.assessments.length,
        assessmentTypes: assessmentData.assessments.map(a => a.assessmentTitle),
        totalResponses: assessmentData.assessments.reduce((sum, a) => sum + a.responses.length, 0),
        dateRange: assessmentData.dateRange,
        promptLength: analysisPrompt.length
      })

      // Create timeout for AI request
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Holistic AI analysis timeout')), AI_TIMEOUT_DURATION)
      )

      // Include Authorization explicitly to avoid 401 in some environments
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token

      // Build payload compatible with the Edge Function contract (overallData)
      const overallData = this.toEdgeOverallPayload(assessmentData)

      // Call AI service (Edge Function expects { overallData })
      const invokePromise = supabase.functions.invoke('overall-assessment-analysis', {
        body: { overallData },
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined
      })

      const { data, error } = await Promise.race([invokePromise, timeoutPromise])

      if (error) {
        console.error('[HolisticAI] AI service error:', error)
        throw new Error(`AI analysis failed: ${error.message}`)
      }

      if (!data) {
        throw new Error('Empty response from AI service')
      }

      // Parse and validate AI response
      const analysis = this.parseHolisticAIResponse(data, assessmentData)
      
      console.log('[HolisticAI] ✅ Analysis completed:', {
        riskLevel: analysis.overallRiskLevel,
        confidence: analysis.confidenceLevel,
        manifestationsCount: analysis.manifestations?.length || 0,
        unconsciousManifestationsCount: analysis.unconsciousManifestations?.length || 0
      })

      return analysis
    } catch (error) {
      console.error('Holistic AI analysis failed:', error)
      throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Service unavailable'}`)
    }
  }

  /**
   * Build comprehensive prompt for holistic AI analysis
   */
  private static buildHolisticAnalysisPrompt(assessmentData: OverallAssessmentData): string {
    const daysBetween = Math.ceil((
      new Date(assessmentData.dateRange.latest).getTime() - 
      new Date(assessmentData.dateRange.earliest).getTime()
    ) / (1000 * 60 * 60 * 24))

    let prompt = `# Comprehensive Holistic Mental Health Assessment Analysis

## Overview
You are analyzing ${assessmentData.assessmentCount} mental health assessments taken over ${daysBetween} days. Please provide a holistic, integrated analysis that looks at patterns across all assessments rather than treating them separately.

## Assessment Timeline
- Period: ${new Date(assessmentData.dateRange.earliest).toLocaleDateString()} to ${new Date(assessmentData.dateRange.latest).toLocaleDateString()}
- Total Score Across Assessments: ${assessmentData.totalScore}
- Average Score: ${assessmentData.averageScore.toFixed(1)}

## Detailed Assessment Data:
`

    // Include each assessment with full response data
    assessmentData.assessments.forEach((assessment, index) => {
      prompt += `
### Assessment ${index + 1}: ${assessment.assessmentTitle}
**Overview:**
- Score: ${assessment.score}
- Level: ${assessment.level}
- Severity: ${assessment.severity}
- Date: ${new Date(assessment.takenAt).toLocaleDateString()}
- Description: ${assessment.assessmentDescription || 'N/A'}

**Detailed Responses:**`

      assessment.responses.forEach((response, respIndex) => {
        prompt += `
${respIndex + 1}. ${response.questionText}
   Response: ${this.formatResponseForPrompt(response.response)}
   ${response.score ? `Score: ${response.score}` : ''}`
      })

      if (assessment.interpretation) {
        prompt += `
**Individual Interpretation:** ${assessment.interpretation}`
      }

      prompt += '\n---\n'
    })

    prompt += `
## Analysis Instructions:

Please provide a comprehensive holistic analysis that:

1. **Executive Summary**: Integrate findings across all assessments into a cohesive mental health profile
2. **Cross-Assessment Patterns**: Identify themes and patterns that emerge when looking at all assessments together
3. **Risk and Protective Factors**: Analyze both concerning patterns and strengths across the data
4. **Holistic Recommendations**: Provide integrated recommendations based on the complete picture
5. **Priority Areas**: Identify which areas need immediate vs long-term attention
6. **Progress Indicators**: Suggest what to monitor going forward

**Important**: This should NOT be separate analysis of each assessment, but rather a unified understanding of the person's mental health based on all available data. Look for:
- Contradictions or confirmations between assessments
- Severity patterns across different mental health domains  
- Underlying themes that connect different symptoms/concerns
- Comprehensive risk level based on all factors
- Personalized recommendations that address the full picture

Please respond with a structured JSON object containing the requested analysis fields.`

    return prompt
  }

  /**
   * Convert comprehensive assessment data to Edge Function payload shape
   */
  private static toEdgeOverallPayload(assessmentData: OverallAssessmentData) {
    // Map assessments to record keyed by assessmentId
    const allAssessments: Record<string, any> = {}
    for (const a of assessmentData.assessments) {
      allAssessments[a.assessmentId] = {
        score: a.score,
        level: a.level,
        severity: a.severity,
        takenAt: a.takenAt,
        assessment: { title: a.assessmentTitle }
      }
    }

    // Determine highest risk area by severity order
    const order: Record<string, number> = {
      none: 0,
      normal: 0,
      mild: 1,
      moderate: 2,
      moderately_severe: 3,
      severe: 4,
      critical: 5
    }
    let highestRiskArea = 'General Wellness'
    let highestScore = -1
    for (const a of assessmentData.assessments) {
      const s = order[a.severity] ?? 0
      if (s > highestScore) {
        highestScore = s
        highestRiskArea = a.assessmentTitle || a.assessmentId.toUpperCase()
      }
    }

    // Calculate overall risk level from severities
    const severities = assessmentData.assessments.map(a => a.severity)
    const overallRiskLevel = this.calculateOverallRiskFromSeverities(severities)

    return {
      userId: assessmentData.userId,
      allAssessments,
      assessmentCount: assessmentData.assessmentCount,
      dateRange: assessmentData.dateRange,
      summary: {
        totalScore: assessmentData.totalScore,
        averageScore: assessmentData.averageScore,
        highestRiskArea,
        overallRiskLevel
      }
    }
  }

  private static calculateOverallRiskFromSeverities(severities: string[]): 'low' | 'moderate' | 'high' | 'critical' {
    if (severities.includes('critical')) return 'critical'
    if (severities.includes('severe')) return 'high'
    if (severities.includes('moderate') || severities.includes('moderately_severe')) return 'moderate'
    return 'low'
  }

  /**
   * Parse holistic AI response into structured format
   */
  private static parseHolisticAIResponse(
    aiResponse: any, 
    assessmentData: OverallAssessmentData
  ): AIHolisticAnalysis {
    try {
      // Handle different response formats
      const analysis = aiResponse.analysis || aiResponse.data || aiResponse

      if (typeof analysis === 'string') {
        // Parse JSON string if needed
        try {
          const parsed = JSON.parse(analysis)
          return this.validateAndStructureAnalysis(parsed, assessmentData)
        } catch {
          // If not JSON, create structure from string
          return this.createAnalysisFromString(analysis, assessmentData)
        }
      }

      return this.validateAndStructureAnalysis(analysis, assessmentData)
    } catch (error) {
      console.error('Error parsing holistic AI response:', error)
      throw new Error('Failed to parse AI analysis response')
    }
  }

  /**
   * Validate and structure AI analysis response
   */
  private static validateAndStructureAnalysis(
    analysis: any, 
    assessmentData: OverallAssessmentData
  ): AIHolisticAnalysis {
      return {
        executiveSummary: this.sanitizeString(analysis?.executiveSummary || analysis?.summary, 2000) || 
          'Analysis of how your mental health might be affecting your daily life.',
        
        manifestations: this.sanitizeStringArray(
          analysis?.manifestations || analysis?.impacts || [], 10, 300
        ) || [],
        
        unconsciousManifestations: this.sanitizeStringArray(
          analysis?.unconsciousManifestations || analysis?.subtleImpacts || [], 10, 300
        ) || [],
        
        riskFactors: this.sanitizeStringArray(analysis?.riskFactors || analysis?.risks, 8, 200) || [],
        
        protectiveFactors: this.sanitizeStringArray(
          analysis?.protectiveFactors || analysis?.strengths, 8, 200
        ) || [],
        
        overallRiskLevel: this.validateRiskLevel(analysis?.overallRiskLevel || analysis?.riskLevel) || 
          this.calculateRiskFromAssessments(assessmentData),
        
        confidenceLevel: this.validateConfidence(analysis?.confidenceLevel) || 0.75,
        
        supportiveMessage: this.sanitizeString(analysis?.supportiveMessage, 500) || 
          'Understanding how mental health affects your daily life can help you recognize and validate your experiences.'
      }
  }

  /**
   * Helper methods
   */
  
  private static async getAssessmentResponses(assessmentId: string): Promise<AssessmentResponse[]> {
    try {
      const { data, error } = await supabase
        .from('assessment_results')
        .select('responses')
        .eq('id', assessmentId)
        .single()

      if (error) {
        console.warn('Could not fetch responses for assessment:', assessmentId, error)
        return []
      }

      if (!data?.responses) {
        return []
      }

      // Parse responses from JSON field
      const responses = data.responses as any[]
      if (!Array.isArray(responses)) {
        return []
      }

      return responses.map((item, index) => ({
        questionId: item.question_id || `q_${index}`,
        questionText: item.question_text || item.question || 'Question text unavailable',
        response: item.response || item.answer || item.value,
        score: item.score
      }))
    } catch (error) {
      console.warn('Error fetching assessment responses:', error)
      return []
    }
  }

  private static groupAssessmentsByType(assessmentHistory: any[]): Record<string, any[]> {
    const grouped: Record<string, any[]> = {}
    
    assessmentHistory.forEach(entry => {
      if (!entry?.assessmentId) return
      if (!grouped[entry.assessmentId]) {
        grouped[entry.assessmentId] = []
      }
      grouped[entry.assessmentId].push(entry)
    })

    return grouped
  }

  private static getAssessmentMetadata(assessmentId: string): { title: string; description?: string } {
    const assessment = ASSESSMENTS?.[assessmentId]
    return {
      title: assessment?.title || assessmentId.toUpperCase().replace('_', ' '),
      description: assessment?.description
    }
  }

  private static formatResponseForPrompt(response: any): string {
    if (typeof response === 'string') return response
    if (typeof response === 'number') return response.toString()
    if (typeof response === 'boolean') return response ? 'Yes' : 'No'
    if (Array.isArray(response)) return response.join(', ')
    if (typeof response === 'object') return JSON.stringify(response)
    return 'No response'
  }

  private static calculateRiskFromAssessments(assessmentData: OverallAssessmentData): 'low' | 'moderate' | 'high' | 'critical' {
    const severities = assessmentData.assessments.map(a => a.severity)
    
    if (severities.includes('critical')) return 'critical'
    if (severities.includes('severe')) return 'high'
    if (severities.includes('moderate') || severities.includes('moderately_severe')) return 'moderate'
    return 'low'
  }

  private static validateRiskLevel(level: any): 'low' | 'moderate' | 'high' | 'critical' | null {
    const validLevels = ['low', 'moderate', 'high', 'critical']
    return validLevels.includes(level) ? level : null
  }

  private static validateConfidence(confidence: any): number {
    const num = parseFloat(confidence)
    return !isNaN(num) && num >= 0 && num <= 1 ? num : 0
  }

  private static createAnalysisFromString(analysisString: string, assessmentData: OverallAssessmentData): AIHolisticAnalysis {
    return {
      executiveSummary: this.sanitizeString(analysisString, 2000),
      manifestations: [],
      unconsciousManifestations: [],
      riskFactors: [],
      protectiveFactors: [],
      overallRiskLevel: this.calculateRiskFromAssessments(assessmentData),
      confidenceLevel: 0.5,
      supportiveMessage: 'Understanding how mental health affects your daily life can help you recognize and validate your experiences.'
    }
  }

  private static sanitizeString(str: any, maxLength: number = 500): string {
    if (typeof str !== 'string') return ''
    return str.trim().substring(0, maxLength)
  }

  private static sanitizeStringArray(arr: any, maxItems: number = 10, maxLength: number = 200): string[] {
    if (!Array.isArray(arr)) return []
    return arr
      .filter(item => typeof item === 'string')
      .map(item => this.sanitizeString(item, maxLength))
      .filter(item => item.length > 0)
      .slice(0, maxItems)
  }

  private static isValidDate(date: Date): boolean {
    return date instanceof Date && !isNaN(date.getTime())
  }

  /**
   * Save holistic assessment
   */
  private static async saveHolisticAssessment(result: OverallAssessmentResult): Promise<void> {
    try {
      console.log('[HolisticAssessment] 🔄 Starting save operation for user:', result.userId)
      
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) {
        console.error('[HolisticAssessment] Auth error:', authError)
        throw new Error(`Authentication error: ${authError.message}`)
      }
      
      if (!user) {
        throw new Error('No authenticated user found')
      }
      
      if (user.id !== result.userId) {
        throw new Error(`User ID mismatch: authenticated=${user.id}, result=${result.userId}`)
      }

      console.log('[HolisticAssessment] 📝 Attempting database upsert...')
      
      // Validate data before saving
      if (!result.assessmentData || typeof result.assessmentData !== 'object') {
        throw new Error('Invalid assessmentData: must be a valid object')
      }
      
      if (!result.holisticAnalysis || typeof result.holisticAnalysis !== 'object') {
        throw new Error('Invalid holisticAnalysis: must be a valid object')
      }
      
      if (!result.createdAt || !result.updatedAt) {
        throw new Error('Invalid timestamps: createdAt and updatedAt are required')
      }
      
      // Prepare the data payload
      const payload = {
        user_id: result.userId,
        overall_assessment_data: result.assessmentData as any,
        ai_analysis: result.holisticAnalysis as any,
        created_at: result.createdAt,
        updated_at: result.updatedAt
      }
      
      console.log('[HolisticAssessment] 📦 Payload prepared:', {
        user_id: payload.user_id,
        assessmentDataKeys: Object.keys(result.assessmentData),
        analysisKeys: Object.keys(result.holisticAnalysis),
        created_at: payload.created_at,
        updated_at: payload.updated_at
      })
      
      // Upsert the holistic assessment
      const { data, error } = await supabase
        .from('overall_assessments')
        .upsert(payload, {
          onConflict: 'user_id'
        })
        .select()

      if (error) {
        console.error('[HolisticAssessment] Database error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        throw new Error(`Database save failed: ${error.message} (${error.code})`)
      }
      
      console.log('[HolisticAssessment] ✅ Saved successfully:', {
        recordId: data?.[0]?.id,
        userId: result.userId
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const errorDetails = error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 3).join('\n') // First 3 lines of stack
      } : { error }
      
      console.error('[HolisticAssessment] Save failed:', {
        message: errorMessage,
        details: errorDetails,
        userId: result.userId
      })
      
      // Re-throw with more context
      throw new Error(`Failed to save holistic assessment: ${errorMessage}`)
    }
  }

  /**
   * Get latest holistic assessment
   */
  static async getLatestHolisticAssessment(userId: string): Promise<OverallAssessmentResult | null> {
    if (!userId?.trim()) return null

    console.log('📖 getLatestHolisticAssessment called for user:', userId)
    
    try {
      const { data, error } = await supabase
        .from('overall_assessments')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error fetching holistic assessment:', error)
        return null
      }

      if (!data) {
        console.log('📖 No stored holistic assessment found for user:', userId)
        return null
      }

      console.log('✅ Found stored holistic assessment:', {
        id: data.id,
        userId: data.user_id,
        hasAssessmentData: !!data.overall_assessment_data,
        hasAiAnalysis: !!data.ai_analysis,
        updatedAt: data.updated_at
      })

      return {
        id: data.id,
        userId: data.user_id,
        assessmentData: data.overall_assessment_data as unknown as OverallAssessmentData,
        holisticAnalysis: data.ai_analysis as unknown as AIHolisticAnalysis,
        createdAt: data.created_at || new Date().toISOString(),
        updatedAt: data.updated_at || new Date().toISOString()
      }
    } catch (error) {
      console.error('❌ Error fetching holistic assessment:', error)
      return null
    }
  }

  /**
   * Get fresh life impacts using the dedicated Edge Function
   */
  static async getFreshLifeImpacts(userId: string): Promise<OverallAssessmentResult | null> {
    if (!userId?.trim()) return null

    try {
      console.log('🔄 Starting getFreshLifeImpacts for user:', userId)

      // Get latest assessment data
      const assessmentData = await this.collectComprehensiveAssessmentData(userId)
      console.log('✅ Collected assessment data:', {
        userId: assessmentData.userId,
        assessmentCount: assessmentData.assessmentCount,
        hasAssessments: assessmentData.assessments.length > 0
      })
      
      // Transform assessment data to expected format for Edge Function
      const transformedData = this.toEdgeOverallPayload(assessmentData)
      console.log('🔄 Transformed data structure:', {
        userId: transformedData.userId,
        assessmentCount: transformedData.assessmentCount,
        hasAllAssessments: !!transformedData.allAssessments,
        allAssessmentsKeys: transformedData.allAssessments ? Object.keys(transformedData.allAssessments) : []
      })
      
      // Get life impacts from dedicated endpoint
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token

      console.log('🚀 Calling daily-life-impacts Edge Function with data:', {
        userId: transformedData.userId,
        assessmentCount: transformedData.assessmentCount,
        hasAccessToken: !!accessToken
      })

      let impactsData: any = null
      try {
        const { data, error: impactsError } = await supabase.functions.invoke('daily-life-impacts', {
          body: { assessmentData: transformedData },
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined
        })
        impactsData = data

        console.log('📡 Edge Function response:', {
          hasData: !!impactsData,
          hasError: !!impactsError,
          errorType: typeof impactsError,
          errorKeys: impactsError ? Object.keys(impactsError) : 'no keys'
        })

        if (impactsError) {
          console.error('❌ Error getting life impacts:', impactsError)
          throw impactsError
        }
      } catch (invokeError) {
        console.error('❌ Function invoke error:', invokeError)
        console.error('❌ Invoke error type:', typeof invokeError)
        console.error('❌ Invoke error keys:', invokeError ? Object.keys(invokeError) : 'no keys')
        console.error('❌ Invoke error as JSON:', JSON.stringify(invokeError, null, 2))
        throw invokeError
      }

      const impacts = impactsData?.impacts

      // Get stored assessment for other data
      const { data: storedData, error: storedError } = await supabase
        .from('overall_assessments')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

      if (storedError && storedError.code !== 'PGRST116') {
        console.error('Error fetching stored assessment:', storedError)
      }

      // Combine stored data with fresh impacts
      const result: OverallAssessmentResult = {
        id: storedData?.id,
        userId,
        assessmentData,
        holisticAnalysis: {
          executiveSummary: (storedData?.ai_analysis as unknown as AIHolisticAnalysis)?.executiveSummary || 'Analysis of how your mental health might be affecting your daily life.',
          manifestations: impacts?.manifestations || [],
          unconsciousManifestations: impacts?.unconsciousManifestations || [],
          riskFactors: (storedData?.ai_analysis as unknown as AIHolisticAnalysis)?.riskFactors || [],
          protectiveFactors: (storedData?.ai_analysis as unknown as AIHolisticAnalysis)?.protectiveFactors || [],
          overallRiskLevel: impacts?.riskLevel || (storedData?.ai_analysis as unknown as AIHolisticAnalysis)?.overallRiskLevel || 'low',
          confidenceLevel: impacts?.confidenceLevel || (storedData?.ai_analysis as unknown as AIHolisticAnalysis)?.confidenceLevel || 0.75,
          supportiveMessage: (storedData?.ai_analysis as unknown as AIHolisticAnalysis)?.supportiveMessage || 'Understanding how mental health affects your daily life can help you recognize and validate your experiences.'
        },
        createdAt: storedData?.created_at || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      return result
    } catch (error) {
      console.error('Error fetching fresh life impacts:', error)
      throw error
    }
  }

  /**
   * Check if new holistic assessment is needed
   */
  static async shouldGenerateNewHolisticAssessment(userId: string): Promise<boolean> {
    if (!userId?.trim()) return false

    try {
      const latest = await this.getLatestHolisticAssessment(userId)
      if (!latest) return true

      const lastHolisticDate = new Date(latest.updatedAt)
      const assessmentHistory = await AssessmentManager.getAssessmentHistory(userId)

      const latestAssessment = assessmentHistory
        .filter(a => a?.takenAt)
        .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime())[0]

      if (latestAssessment) {
        const latestAssessmentDate = new Date(latestAssessment.takenAt)
        return latestAssessmentDate > lastHolisticDate
      }

      return false
    } catch (error) {
      console.error('Error checking if new holistic assessment needed:', error)
      return true
    }
  }
}

export default OverallAssessmentService
