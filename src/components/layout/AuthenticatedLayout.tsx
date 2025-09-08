'use client'

import React, { useState } from 'react'
import { useAuthContext } from '@/components/providers/AuthProvider'
import { Navigation } from '@/components/ui/Navigation'
import { usePathname } from 'next/navigation'
import { handleSignOutError } from '@/lib/utils/authRedirects'
// Database connection testing removed - handled by AssessmentManager

interface AuthenticatedLayoutProps {
  children: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { user, signOut } = useAuthContext()
  const pathname = usePathname()
  const [currentPage, setCurrentPage] = useState('dashboard')

  // Update current page based on pathname
  React.useEffect(() => {
    if (pathname.includes('/dashboard')) setCurrentPage('dashboard')
    else if (pathname.includes('/assessments')) setCurrentPage('assessments')
    else if (pathname.includes('/session') || pathname.includes('/meditation')) {
      setCurrentPage('therapy')
    }
    else if (pathname.includes('/profile')) setCurrentPage('profile')
    else if (pathname.includes('/wallet')) setCurrentPage('wallet')
    else if (pathname.includes('/check-in')) setCurrentPage('check-in')
    else if (pathname.includes('/help')) setCurrentPage('help')
    else if (pathname.includes('/community')) setCurrentPage('community')
  }, [pathname])

  const handleNavigation = (page: string) => {
    setCurrentPage(page)
    // Navigation will be handled by Next.js router
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-green-50 via-white to-brand-green-100">
      {/* Navigation Header */}
      <Navigation
        currentPage={currentPage}
        onPageChange={handleNavigation}
        user={user}
        onSignOut={async () => {
          try {
            console.log('🚪 [AUTH_LAYOUT_SIGN_OUT] AuthenticatedLayout: Calling unified sign out')
            await signOut()
            // AuthManager handles the redirect
          } catch (error) {
            console.error('❌ [AUTH_LAYOUT_SIGN_OUT_ERROR] AuthenticatedLayout: Sign out failed:', error)
            // Fallback to redirect if sign out fails
            handleSignOutError(error instanceof Error ? error.message : 'Unknown error')
          }
        }}
      />

      {/* Main Content Area (offset for fixed header) */}
      <main className="container mx-auto px-4 pt-24 lg:pt-28 pb-6 max-w-7xl">
        {/* Page Content */}
        <div className="space-y-6">
          {children}
        </div>
      </main>

    </div>
  )
}
