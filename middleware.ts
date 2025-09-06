import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()

  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
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
  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl

  // Define protected routes
  const protectedRoutes = [
    '/dashboard',
    '/assessments',
    '/profile',
    '/results',
    '/session',
    '/wallet',
    '/check-in',
    '/crisis-support',
    '/help',
    '/wellness',
    '/community',
    '/meditation',
    '/test-chat'
  ]

  // Define public routes that authenticated users should be redirected from
  const authRoutes = [
    '/login',
    '/signup',
    '/auth/callback'
  ]

  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Check if current path is an auth route
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // If user is not authenticated and trying to access protected route
  if (isProtectedRoute && !session) {
    const loginUrl = new URL('/login', request.url)
    // Add the current path as a redirect parameter
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If user is authenticated and trying to access auth routes (except callback)
  if (isAuthRoute && session && !pathname.includes('/auth/callback')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

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
