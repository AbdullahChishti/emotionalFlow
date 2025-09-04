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
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-20">
        <ModernSessionScreen
          onNavigate={handleNavigate}
          matchedUser={matchedUser}
        />
      </div>
    </div>
  )
}
