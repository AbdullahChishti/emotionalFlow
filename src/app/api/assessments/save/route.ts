import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { AssessmentManager } from '@/lib/services/AssessmentManager'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { assessmentId, assessmentTitle, result, responses, friendlyExplanation } = body

    // Validate required fields
    if (!assessmentId || !result || !responses) {
      return NextResponse.json(
        { error: 'Missing required fields: assessmentId, result, responses' },
        { status: 400 }
      )
    }

    // Save assessment result
    const savedResult = await AssessmentManager.saveAssessmentResult(
      user.id,
      assessmentId,
      assessmentTitle || assessmentId,
      result,
      responses,
      friendlyExplanation
    )

    if (!savedResult) {
      return NextResponse.json(
        { error: 'Failed to save assessment result' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: savedResult
    })

  } catch (error) {
    console.error('❌ API Error - Save Assessment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
