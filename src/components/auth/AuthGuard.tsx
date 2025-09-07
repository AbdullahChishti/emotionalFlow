'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthContext } from '@/components/providers/AuthProvider'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
  fallback?: React.ReactNode
}

export function AuthGuard({
  children,
  requireAuth = true,
  redirectTo,
  fallback
}: AuthGuardProps) {
  const { user, isAuthenticated, isLoading, isInitialized } = useAuthContext()
  const router = useRouter()
  const pathname = usePathname()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    // Wait for auth to initialize
    if (!isInitialized || isLoading) return

    const shouldRedirect = requireAuth ? !isAuthenticated : isAuthenticated

    if (shouldRedirect && !isRedirecting) {
      setIsRedirecting(true)

      const redirectPath = redirectTo || (requireAuth ? '/login' : '/dashboard')

      // Add current path as redirect parameter for login
      const finalRedirect = requireAuth && !isAuthenticated
        ? `${redirectPath}?redirect=${encodeURIComponent(pathname)}`
        : redirectPath

      console.log('🛡️ AuthGuard: Redirecting to', finalRedirect)
      router.push(finalRedirect)
    }
  }, [isAuthenticated, isInitialized, isLoading, requireAuth, redirectTo, router, pathname, isRedirecting])

  // Show loading state while checking authentication
  if (!isInitialized || isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-slate-700 font-medium">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  // Show fallback if redirecting or authentication check failed
  if (isRedirecting || (requireAuth && !isAuthenticated) || (!requireAuth && isAuthenticated)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-slate-700 font-medium">Redirecting...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Convenience wrapper for protected routes
export function ProtectedRoute({ children, ...props }: Omit<AuthGuardProps, 'requireAuth'>) {
  return (
    <AuthGuard requireAuth={true} {...props}>
      {children}
    </AuthGuard>
  )
}

// Convenience wrapper for public routes (redirect if authenticated)
export function PublicRoute({ children, ...props }: Omit<AuthGuardProps, 'requireAuth'>) {
  return (
    <AuthGuard requireAuth={false} {...props}>
      {children}
    </AuthGuard>
  )
}