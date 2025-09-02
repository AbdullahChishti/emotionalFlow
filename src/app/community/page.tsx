'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { Navigation } from '@/components/ui/Navigation'
import { CommunityScreen } from '@/components/screens/CommunityScreen'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function CommunityPage() {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-16 pb-20 md:pb-0">
        <CommunityScreen />
      </div>
    </div>
  )
}
