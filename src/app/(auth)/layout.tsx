'use client'

import { AuthProvider } from '@/components/providers/AuthProvider'
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout'
import { useAuth } from '@/components/providers/AuthProvider'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { usePathname } from 'next/navigation'

function AuthenticatedContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()

  // Show loading spinner during auth loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-green-50 via-white to-brand-green-100">
        <div className="glassmorphic rounded-3xl p-8 shadow-2xl border border-white/20 text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-zinc-700 font-medium">Loading MindWell...</p>
          <p className="mt-2 text-sm text-zinc-600">Initializing your wellness journey</p>
        </div>
      </div>
    )
  }

  // Handle unauthenticated routes - only redirect if not already on login/signup
  if (!user) {
    // Only redirect if we're not already on a public route
    if (typeof window !== 'undefined' && !pathname.startsWith('/login') && !pathname.startsWith('/signup')) {
      // Use router.push instead of window.location.href to avoid full page reload
      window.location.href = '/login'
    }
    return null
  }

  // User is authenticated - go directly to dashboard
  return (
    <AuthenticatedLayout>
      {children}
    </AuthenticatedLayout>
  )
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <AuthenticatedContent>
        {children}
      </AuthenticatedContent>
    </AuthProvider>
  )
}

// Import the onboarding flow here to avoid circular imports
import { EnhancedOnboardingFlow } from '@/components/auth/EnhancedOnboardingFlow'
