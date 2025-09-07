import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { AssessmentDeletionService } from '@/lib/services/AssessmentDeletionService'

export async function GET(request: NextRequest) {
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
    const includeDeleted = url.searchParams.get('include_deleted') === 'true'

    // Get assessment summary
    const summary = await AssessmentDeletionService.getUserAssessmentSummary(user.id)

    // Get deletion history if requested
    let deletionHistory = []
    if (includeDeleted) {
      deletionHistory = await AssessmentDeletionService.getDeletionHistory(user.id)
    }

    return NextResponse.json({
      success: true,
      data: {
        summary,
        deletionHistory: includeDeleted ? deletionHistory : []
      }
    })

  } catch (error) {
    console.error('❌ API Error - Get Assessment Summary:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
