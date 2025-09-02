'use client'

import { useState, useEffect } from 'react'
import { WelcomeScreen } from './screens/WelcomeScreen'
import { MoodSelectionScreen } from './screens/MoodSelectionScreen'
import { EmotionRefinementScreen } from './screens/EmotionRefinementScreen'
import { MatchingScreen } from './screens/MatchingScreen'
import { GlassmorphicSessionScreen } from './session/GlassmorphicSessionScreen'
import { WalletScreen } from './screens/WalletScreen'

type Screen = 'Welcome' | 'MoodSelection' | 'EmotionRefinement' | 'Matching' | 'Session' | 'Wallet'

interface ScreenParams {
  mode?: 'listen' | 'support'
  mood?: number
  matchedUser?: any
}

interface ScreenRouterProps {
  initialScreen?: Screen
  onScreenChange?: (screen: Screen) => void
}

export function ScreenRouter({ initialScreen = 'Welcome', onScreenChange }: ScreenRouterProps = {}) {
  const [currentScreen, setCurrentScreen] = useState<Screen>(initialScreen)
  const [screenParams, setScreenParams] = useState<ScreenParams>({})

  // Sync with external screen changes
  useEffect(() => {
    setCurrentScreen(initialScreen)
  }, [initialScreen])

  const handleNavigate = (screen: string, params?: any) => {
    const newScreen = screen as Screen
    setCurrentScreen(newScreen)
    setScreenParams(params || {})
    onScreenChange?.(newScreen)
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Welcome':
        return <WelcomeScreen onNavigate={handleNavigate} />
      
      case 'MoodSelection':
        return (
          <MoodSelectionScreen 
            key="mood-selection"
            onNavigate={handleNavigate} 
            mode={screenParams.mode || 'listen'} 
          />
        )
      
      case 'EmotionRefinement':
        return (
          <EmotionRefinementScreen 
            key="emotion-refinement"
            onNavigate={handleNavigate} 
            mode={screenParams.mode || 'listen'}
            mood={screenParams.mood || 5}
          />
        )
      
      case 'Matching':
        return (
          <MatchingScreen 
            onNavigate={handleNavigate} 
            mood={screenParams.mood || 5}
            mode={screenParams.mode || 'listen'} 
          />
        )
      
      case 'Session':
        return (
          <GlassmorphicSessionScreen
            onNavigate={handleNavigate}
            matchedUser={screenParams.matchedUser || {
              user: { id: 'listener_1', name: 'Alex', role: 'listener', isOnline: true, joinedAt: new Date() },
              joinedAt: new Date(),
              lastActivity: new Date(),
              emotionalState: 'calm'
            }}
            user={{
              id: 'user_1',
              name: 'You',
              role: 'seeker',
              isOnline: true,
              joinedAt: new Date()
            }}
          />
        )
      
      case 'Wallet':
        return <WalletScreen onNavigate={handleNavigate} />
      
      default:
        return <WelcomeScreen onNavigate={handleNavigate} />
    }
  }

  return (
    <div className="min-h-screen">
      {renderScreen()}
      

    </div>
  )
}
