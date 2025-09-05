'use client'

import { ModernSessionScreen } from '@/components/session/ModernSessionScreen'
import { useRouter } from 'next/navigation'

export default function SessionPage() {
  const router = useRouter()
  
  const handleNavigate = (screen: string, params?: any) => {
    // Handle navigation based on the screen name
    switch (screen) {
      case 'dashboard':
        router.push('/dashboard')
        break
      case 'profile':
        router.push('/profile')
        break
      case 'assessments':
        router.push('/assessments')
        break
      default:
        router.push('/dashboard')
    }
  }

  return (
    <ModernSessionScreen 
      onNavigate={handleNavigate}
      matchedUser={{ name: 'MindWell' }}
    />
  )
}
