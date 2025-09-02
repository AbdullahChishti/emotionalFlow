'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { Profile } from '@/types'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LogOut } from 'lucide-react'

interface DashboardHeaderProps {
  profile: Profile
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  const { signOut } = useAuth()

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Name */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-semibold text-sm">M</span>
            </div>
            <div>
              <h1 className="font-medium text-gray-900">MindWell</h1>
              <p className="text-sm text-gray-500">Welcome back, {profile.display_name?.split(' ')[0] || 'there'}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
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
