'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
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
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (loading) return

    const shouldRedirect = requireAuth ? !user : !!user

    if (shouldRedirect && !isRedirecting) {
      setIsRedirecting(true)

      const redirectPath = redirectTo || (requireAuth ? '/login' : '/dashboard')

      // Add current path as redirect parameter for login
      const finalRedirect = requireAuth && !user
        ? `${redirectPath}?redirect=${encodeURIComponent(pathname)}`
        : redirectPath

      router.push(finalRedirect)
    }
  }, [user, loading, requireAuth, redirectTo, router, pathname, isRedirecting])

  // Show loading state while checking authentication
  if (loading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-green-50 via-white to-brand-green-100">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-zinc-700 font-medium">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  // Show fallback if redirecting or authentication check failed
  if (isRedirecting || (requireAuth && !user) || (!requireAuth && user)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-green-50 via-white to-brand-green-100">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-zinc-700 font-medium">Redirecting...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Convenience wrapper for protected routes
export function ProtectedRoute({ children, ...props }: Omit<AuthGuardProps, 'requireAuth'>) {
  return <AuthGuard requireAuth={true} {...props}>{children}</AuthGuard>
}

// Convenience wrapper for public-only routes
export function PublicOnlyRoute({ children, ...props }: Omit<AuthGuardProps, 'requireAuth'>) {
  return <AuthGuard requireAuth={false} {...props}>{children}</AuthGuard>
}
