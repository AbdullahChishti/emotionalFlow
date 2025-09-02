/**
 * Glassmorphic SessionScreen Demo Page
 * Showcase of the complete glassmorphic redesign
 */

'use client'

import React from 'react'
import dynamic from 'next/dynamic'

// Dynamically import components to avoid SSR issues
const GlassmorphicSessionScreen = dynamic(
  () => import('@/components/session/GlassmorphicSessionScreen').then(mod => ({ default: mod.GlassmorphicSessionScreen })),
  { ssr: false, loading: () => <div className="min-h-screen flex items-center justify-center">Loading...</div> }
)

const GlassmorphicStatusIndicator = dynamic(
  () => import('@/components/ui/GlassmorphicNavigation').then(mod => ({ default: mod.GlassmorphicStatusIndicator })),
  { ssr: false }
)

export default function GlassmorphicSessionDemo() {
  const mockMatchedUser = {
    user: {
      id: 'listener_1',
      name: 'Dr. Maya Chen',
      role: 'listener' as const,
      isOnline: true,
      avatar: undefined,
      joinedAt: new Date()
    },
    joinedAt: new Date(),
    lastActivity: new Date(),
    emotionalState: 'calm' as const
  }

  const mockUser = {
    id: 'user_demo',
    name: 'Demo User',
    role: 'seeker' as const,
    isOnline: true,
    joinedAt: new Date()
  }

  const handleNavigate = (screen: string) => {
    console.log('Navigate to:', screen)
    // In a real app, this would handle navigation
    if (screen === 'dashboard') {
      window.location.href = '/'
    }
  }

  return (
    <div className="relative">
      {/* Glassmorphic Status Indicator */}
      <GlassmorphicStatusIndicator
        status="active"
        emotionalState="calm"
        duration={125} // 2:05
      />

      {/* Main Session Screen */}
      <GlassmorphicSessionScreen
        matchedUser={mockMatchedUser}
        user={mockUser}
        onNavigate={handleNavigate}
      />

      {/* Demo Info Overlay */}
      <div className="fixed top-4 left-4 z-50 max-w-sm">
        <div
          className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4"
          style={{
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 1px 0 rgba(255, 255, 255, 0.1) inset'
          }}
        >
          <h3 className="text-lg font-light text-white mb-2">✨ Glassmorphic Session Demo</h3>
          <p className="text-sm text-white/80 mb-3">
            Experience the new ethereal design with therapeutic UX principles.
          </p>
          <div className="space-y-2 text-xs text-white/70">
            <div>🎨 Glassmorphism aesthetics</div>
            <div>🧠 Emotional intelligence</div>
            <div>🌟 Smooth animations</div>
            <div>🔒 Privacy-focused design</div>
          </div>
        </div>
      </div>
    </div>
  )
}
