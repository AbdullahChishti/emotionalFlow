'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { Navigation } from '@/components/ui/Navigation'
import { ModernSessionScreen } from '@/components/session/ModernSessionScreen'
import { BackButton } from '@/components/ui/BackButton'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function SessionPage() {
  // Remove auth requirement - make session page publicly accessible
  const router = useRouter()

  const handleNavigate = (screen: string, params?: any) => {
    router.push(`/${screen.toLowerCase()}`)
  }

  const matchedUser = {
    name: 'Alex'
  }



  return (
    <div className="min-h-screen bg-gray-50">
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
