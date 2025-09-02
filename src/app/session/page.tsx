'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { Navigation } from '@/components/ui/Navigation'
import { SessionScreen } from '@/components/screens/SessionScreen'
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
    name: 'Alex' // This would typically come from your matching logic
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-16 pb-20 md:pb-0">
        <SessionScreen onNavigate={handleNavigate} matchedUser={matchedUser} />
      </div>
    </div>
  )
}
