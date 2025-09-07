import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { AssessmentDeletionService } from '@/lib/services/AssessmentDeletionService'

export async function DELETE(request: NextRequest) {
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

    const url = new URL(request.url)
    const permanent = url.searchParams.get('permanent') === 'true'
    const reason = url.searchParams.get('reason') || undefined

    // Additional safety check for bulk deletion
    if (!permanent) {
      // For soft deletes, require confirmation via body parameter
      const body = await request.json().catch(() => ({}))
      if (body.confirmation !== 'DELETE_ALL_ASSESSMENTS') {
        return NextResponse.json(
          {
            error: 'Bulk soft deletion requires confirmation',
            message: 'Please include confirmation: "DELETE_ALL_ASSESSMENTS" in request body'
          },
          { status: 400 }
        )
      }
    }

    // Perform bulk deletion
    const result = await AssessmentDeletionService.deleteAllAssessments(
      user.id,
      { permanent, reason }
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
    console.error('❌ API Error - Delete All Assessments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
