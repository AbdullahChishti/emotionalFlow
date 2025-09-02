'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { Profile } from '@/types'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LogOut, AlertTriangle, Play } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DashboardHeaderProps {
  profile: Profile
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  const { signOut } = useAuth()
  const router = useRouter()

  const testOnboarding = () => {
    // Clear mood entries to trigger onboarding
    if (typeof window !== 'undefined') {
      localStorage.setItem('testOnboarding', 'true')
      window.location.reload()
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Name */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-sm">M</span>
            </div>
            <div>
              <h1 className="font-medium text-gray-900">MindWell</h1>
              <p className="text-sm text-gray-500">Welcome back, {profile.display_name?.split(' ')[0] || 'there'}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* TEST BUTTON - Remove in production */}
            <button
              onClick={testOnboarding}
              className="px-3 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              title="Test Onboarding Flow"
            >
              <Play className="w-3 h-3 inline mr-1" />
              Test Onboarding
            </button>
            <button
              onClick={() => router.push('/crisis-support')}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
              title="Crisis Support - Available 24/7"
            >
              <AlertTriangle className="w-5 h-5" />
            </button>
            <ThemeToggle />
            <button
              onClick={signOut}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
