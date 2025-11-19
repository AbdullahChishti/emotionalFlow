import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { AssessmentManager } from '@/lib/services/AssessmentManager'

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

    // Get query parameters
    const url = new URL(request.url)
    const includeHistory = url.searchParams.get('include_history') === 'true'

    // Fetch assessment results
    const history = await AssessmentManager.getAssessmentHistory(user.id)

    if (includeHistory) {
      // Return full history
      return NextResponse.json({
        success: true,
        data: history
      })
    } else {
      // Return only latest results per assessment type
      const latestResults: Record<string, any> = {}
      history.forEach(entry => {
        if (!latestResults[entry.assessmentId] || 
            new Date(entry.takenAt) > new Date(latestResults[entry.assessmentId].takenAt)) {
          latestResults[entry.assessmentId] = entry
        }
      })

      return NextResponse.json({
        success: true,
        data: Object.values(latestResults)
      })
    }

  } catch (error) {
    console.error('❌ API Error - Get Assessment Results:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
