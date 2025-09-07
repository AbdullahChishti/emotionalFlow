import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { AssessmentDeletionService } from '@/lib/services/AssessmentDeletionService'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { assessmentId: string } }
) {
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

    const { assessmentId } = params
    const url = new URL(request.url)
    const cascade = url.searchParams.get('cascade') === 'true'
    const permanent = url.searchParams.get('permanent') === 'true'
    const reason = url.searchParams.get('reason') || undefined

    // Validate assessment ID
    const validAssessments = ['phq9', 'gad7', 'pss10', 'who5', 'pcl5', 'cd-risc', 'ace']
    if (!validAssessments.includes(assessmentId)) {
      return NextResponse.json(
        { error: 'Invalid assessment ID' },
        { status: 400 }
      )
    }

    // Perform deletion
    const result = await AssessmentDeletionService.deleteIndividualAssessment(
      user.id,
      assessmentId,
      { cascade, permanent, reason }
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.affectedData
    })

  } catch (error) {
    console.error('❌ API Error - Delete Assessment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { assessmentId: string } }
) {
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

    const { assessmentId } = params

    // Check if restoration is allowed
    const canRestore = await AssessmentDeletionService.canRestoreAssessment(user.id, assessmentId)

    if (!canRestore) {
      return NextResponse.json(
        { error: 'Assessment cannot be restored (outside grace period or not deleted)' },
        { status: 400 }
      )
    }

    // Perform restoration
    const result = await AssessmentDeletionService.restoreAssessment(user.id, assessmentId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message
    })

  } catch (error) {
    console.error('❌ API Error - Restore Assessment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
