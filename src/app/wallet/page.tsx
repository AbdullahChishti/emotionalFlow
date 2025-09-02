'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { Navigation } from '@/components/ui/Navigation'
import { WalletScreen } from '@/components/screens/WalletScreen'
import { BackButton } from '@/components/ui/BackButton'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function WalletPage() {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-16 pb-20 md:pb-0">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <BackButton />
          </div>
          <WalletScreen onNavigate={handleNavigate} />
        </div>
      </div>
    </div>
  )
}
