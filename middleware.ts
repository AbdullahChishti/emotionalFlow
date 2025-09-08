import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { AUTH_ROUTES, AUTH_REDIRECTS } from '@/lib/constants/auth'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const { pathname } = request.nextUrl

  // CRITICAL LOGGING: Track middleware execution
  console.log('🔍 [MIDDLEWARE] Processing request:', {
    pathname,
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get('user-agent')?.substring(0, 50),
    referer: request.headers.get('referer')
  })

  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const value = request.cookies.get(name)?.value
          // CRITICAL LOGGING: Track cookie access
          if (name.includes('auth-token') || name.includes('sb-')) {
            console.log('🍪 [MIDDLEWARE] Cookie get:', { name, hasValue: !!value, valueLength: value?.length || 0 })
          }
          return value
        },
        set(name: string, value: string, options: any) {
          // CRITICAL LOGGING: Track cookie setting
          if (name.includes('auth-token') || name.includes('sb-')) {
            console.log('🍪 [MIDDLEWARE] Cookie set:', { name, hasValue: !!value, valueLength: value?.length || 0 })
          }
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          // CRITICAL LOGGING: Track cookie removal
          console.log('🗑️ [MIDDLEWARE] Cookie remove:', { name })
          res.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Get the session
  console.log('🔐 [MIDDLEWARE] Attempting to get session...')
  const { data: { session }, error } = await supabase.auth.getSession()

  // CRITICAL LOGGING: Session state
  console.log('🔐 [MIDDLEWARE] Session check result:', {
    hasSession: !!session,
    sessionUserId: session?.user?.id,
    sessionEmail: session?.user?.email,
    expiresAt: session?.expires_at,
    accessToken: session?.access_token ? `${session.access_token.substring(0, 20)}...` : null,
    refreshToken: session?.refresh_token ? `${session.refresh_token.substring(0, 20)}...` : null,
    error: error?.message,
    pathname
  })

  // Use centralized route definitions
  const protectedRoutes = AUTH_ROUTES.PROTECTED
  const authRoutes = AUTH_ROUTES.PUBLIC_ONLY

  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Check if current path is an auth route
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // CRITICAL LOGGING: Route classification
  console.log('🛣️ [MIDDLEWARE] Route analysis:', {
    pathname,
    isProtectedRoute,
    isAuthRoute,
    protectedRoutes: protectedRoutes.filter(route => pathname.startsWith(route)),
    authRoutes: authRoutes.filter(route => pathname.startsWith(route))
  })

  // If user is not authenticated and trying to access protected route
  if (isProtectedRoute && !session) {
    console.log('❌ [MIDDLEWARE] REDIRECTING TO LOGIN:', {
      reason: 'No session found for protected route',
      pathname,
      hasSession: !!session,
      sessionError: error?.message
    })
    
    const loginUrl = new URL(AUTH_REDIRECTS.LOGIN, request.url)
    // Add the current path as a redirect parameter
    loginUrl.searchParams.set(AUTH_REDIRECTS.REDIRECT_PARAM, pathname)
    
    console.log('🔄 [MIDDLEWARE] Redirect URL:', loginUrl.toString())
    return NextResponse.redirect(loginUrl)
  }

  // If user is authenticated and trying to access auth routes (except callback)
  if (isAuthRoute && session && !pathname.includes('/auth/callback')) {
    console.log('🔄 [MIDDLEWARE] REDIRECTING TO DASHBOARD:', {
      reason: 'Authenticated user accessing auth route',
      pathname,
      dashboardUrl: AUTH_REDIRECTS.DASHBOARD
    })
    return NextResponse.redirect(new URL(AUTH_REDIRECTS.DASHBOARD, request.url))
  }

  console.log('✅ [MIDDLEWARE] Request allowed:', { pathname, hasSession: !!session })
  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
