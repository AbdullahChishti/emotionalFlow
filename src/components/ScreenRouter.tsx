'use client'

import { useState, useEffect } from 'react'
import { WelcomeScreen } from './screens/WelcomeScreen'
import { MoodSelectionScreen } from './screens/MoodSelectionScreen'
import { EmotionRefinementScreen } from './screens/EmotionRefinementScreen'
import { MatchingScreen } from './screens/MatchingScreen'
import { ModernSessionScreen } from './session/ModernSessionScreen'
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
          <ModernSessionScreen
            onNavigate={handleNavigate}
            matchedUser={screenParams.matchedUser || {
              name: 'Alex'
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
