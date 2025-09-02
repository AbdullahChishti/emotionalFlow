'use client'

import { useState, useEffect } from 'react'
import { WelcomeScreen } from './screens/WelcomeScreen'
import { MoodSelectionScreen } from './screens/MoodSelectionScreen'
import { EmotionRefinementScreen } from './screens/EmotionRefinementScreen'
import { MatchingScreen } from './screens/MatchingScreen'
import { SessionScreen } from './screens/SessionScreen'
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
          <SessionScreen
            onNavigate={handleNavigate}
            matchedUser={screenParams.matchedUser || { name: 'Alex' }}
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
      
      {/* Debug Navigation (remove in production) */}
      <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg shadow-lg p-4">
        <div className="text-xs font-medium text-muted-foreground mb-2">
          Debug Navigation
        </div>
        <div className="flex flex-wrap gap-2">
          {(['Welcome', 'MoodSelection', 'Matching', 'Session', 'Wallet'] as Screen[]).map((screen) => (
            <button
              key={screen}
              onClick={() => handleNavigate(screen, { mode: 'listen', mood: 7 })}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                currentScreen === screen
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {screen}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
