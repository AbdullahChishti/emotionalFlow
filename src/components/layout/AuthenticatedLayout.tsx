'use client'

import React, { useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { Navigation } from '@/components/ui/Navigation'
import { BackButton } from '@/components/ui/BackButton'
import { usePathname } from 'next/navigation'
// Database connection testing removed - handled by AssessmentManager

interface AuthenticatedLayoutProps {
  children: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const [currentPage, setCurrentPage] = useState('dashboard')

  // Update current page based on pathname
  React.useEffect(() => {
    if (pathname.includes('/dashboard')) setCurrentPage('dashboard')
    else if (pathname.includes('/assessments')) setCurrentPage('assessments')
    else if (pathname.includes('/profile')) setCurrentPage('profile')
    else if (pathname.includes('/session')) setCurrentPage('session')
    else if (pathname.includes('/wallet')) setCurrentPage('wallet')
    else if (pathname.includes('/check-in')) setCurrentPage('check-in')
    else if (pathname.includes('/crisis-support')) setCurrentPage('crisis-support')
    else if (pathname.includes('/help')) setCurrentPage('help')
    else if (pathname.includes('/wellness')) setCurrentPage('wellness')
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
        onSignOut={signOut}
      />

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Back Button for certain pages */}
        {(currentPage === 'assessments' ||
          currentPage === 'results' ||
          currentPage === 'session' ||
          currentPage === 'profile') && (
          <div className="mb-4">
            <BackButton />
          </div>
        )}

        {/* Page Content */}
        <div className="space-y-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 bg-white/50 backdrop-blur-sm border-t border-white/20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-zinc-600">
            © 2024 MindWell. Your personal therapy companion.
          </p>
        </div>
      </footer>
    </div>
  )
}
