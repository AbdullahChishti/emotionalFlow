'use client'

import { useAuth } from '@/components/providers/TestAuthProvider'
import { Navigation } from '@/components/ui/Navigation'
import { ModernSessionScreen } from '@/components/session/ModernSessionScreen'
import { BackButton } from '@/components/ui/BackButton'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function SessionPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleNavigate = (screen: string, params?: any) => {
    router.push(`/${screen.toLowerCase()}`)
  }

  const matchedUser = {
    user: {
      id: 'listener_1',
      name: 'Alex',
      role: 'listener' as const,
      isOnline: true,
      joinedAt: new Date()
    },
    joinedAt: new Date(),
    lastActivity: new Date(),
    emotionalState: 'calm' as const
  }

  const currentUser = {
    id: user?.id || 'user_1',
    name: user?.user_metadata?.full_name || 'You',
    role: 'seeker' as const,
    isOnline: true,
    joinedAt: new Date()
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-16 pb-20 md:pb-0">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <BackButton />
          </div>
          <ModernSessionScreen
            onNavigate={handleNavigate}
            matchedUser={matchedUser}
          />
        </div>
      </div>
    </div>
  )
}
