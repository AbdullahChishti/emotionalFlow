'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { Profile } from '@/types'
import { Heart, Settings, LogOut, Bell, Moon, Sun } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

interface DashboardHeaderProps {
  profile: Profile
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  const { signOut } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Greeting */}
          <div className="flex items-center space-x-4">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-blue-400 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm text-muted-foreground">{getGreeting()},</p>
              <p className="font-medium text-foreground">{profile.display_name || 'Friend'}</p>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-muted/50 hover:bg-muted"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-400 rounded-full flex items-center justify-center text-sm font-semibold text-primary-foreground">
                  {profile.display_name?.[0]?.toUpperCase() || 'U'}
                </div>
              </button>

              {showUserMenu && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-card border rounded-lg shadow-lg py-2 z-50 animate-scale-in origin-top-right"
                >
                  <div className="px-4 py-3 border-b">
                    <p className="font-semibold text-foreground">{profile.display_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {profile.empathy_credits} empathy credits
                    </p>
                  </div>
                  
                  <button className="w-full text-left px-4 py-3 hover:bg-muted transition-colors flex items-center space-x-3 text-foreground">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <span>Settings & Profile</span>
                  </button>
                  
                  <button
                    onClick={signOut}
                    className="w-full text-left px-4 py-3 hover:bg-muted transition-colors flex items-center space-x-3 text-destructive"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
