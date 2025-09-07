'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/components/providers/AuthProvider'
import { handleSignOutError } from '@/lib/utils/authRedirects'

interface NavigationProps {
  className?: string
  currentPage?: string
  onPageChange?: (page: string) => void
  user?: any
  onSignOut?: () => void
}

export function Navigation({ className = '', user, onSignOut, currentPage }: NavigationProps) {
  const { signOut: authSignOut } = useAuthContext()
  const router = useRouter()

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${className || ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex justify-between items-center glassmorphic rounded-3xl px-6 py-4">
          <Link href="/" className="flex items-center space-x-3">
            <span className="text-lg font-bold text-emerald-700">
              MindWell
            </span>
          </Link>

          {user && (
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 'dashboard'
                    ? 'text-white bg-emerald-600 shadow-sm'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/assessments"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 'assessments'
                    ? 'text-white bg-emerald-600 shadow-sm'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Assessments
              </Link>
              <div className="relative group">
                <button className={`px-4 py-2 flex items-center gap-1 transition-colors ${
                  currentPage === 'therapy'
                    ? 'text-white bg-emerald-600 rounded-lg shadow-sm'
                    : 'text-slate-700 hover:text-slate-900'
                }`}>
                  Therapy
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <Link href="/session" className="block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 first:rounded-t-lg">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">psychology</span>
                      Therapy Session
                    </div>
                  </Link>
                  <Link href="/meditation" className="block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">self_improvement</span>
                      Meditation
                    </div>
                  </Link>
                  <Link href="/crisis-support" className="block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 last:rounded-b-lg">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">emergency</span>
                      Crisis Support
                    </div>
                  </Link>
                </div>
              </div>
              <button
                onClick={async () => {
                  const navSessionId = Math.random().toString(36).substr(2, 9)
                  console.log('🚪 [NAV_SIGN_OUT_CLICK] Navigation: Sign out button clicked', {
                    hasOnSignOut: !!onSignOut,
                    timestamp: new Date().toISOString(),
                    navSessionId
                  })

                  try {
                    if (onSignOut) {
                      console.log('🔄 [NAV_SIGN_OUT_CALL] Navigation: Calling onSignOut handler', {
                        navSessionId
                      })
                      await onSignOut()
                    } else {
                      console.log('🔄 [NAV_SIGN_OUT_AUTH_MANAGER] Navigation: Using AuthManager sign out', {
                        navSessionId
                      })
                      await authSignOut()
                    }
                  } catch (error) {
                    console.error('❌ [NAV_SIGN_OUT_ERROR] Navigation: Sign out failed', {
                      error,
                      navSessionId
                    })
                    // Fallback to redirect if sign out fails
                    handleSignOutError(error instanceof Error ? error.message : 'Unknown error')
                  }
                }}
                className="px-4 py-2 bg-transparent text-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all duration-300"
              >
                Sign Out
              </button>
            </div>
          )}

          {!user && (
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2 text-white rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, #335f64 0%, #2a4f54 50%, #1e3a3e 100%)'
              }}
            >
              Find Peace
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
