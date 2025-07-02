'use client'

import React, { useState } from 'react'
import { X, Play, Pause, SkipForward, RotateCcw, User, Heart, MessageCircle, Wallet, Settings } from 'lucide-react'
import { ScreenRouter } from '../ScreenRouter'

interface ScreenDemoProps {
  onClose: () => void
}

type DemoMode = 'flow' | 'navigator'
type Screen = 'Welcome' | 'MoodSelection' | 'Matching' | 'Session' | 'Wallet'

const FLOW_STEPS = [
  { screen: 'Welcome' as Screen, title: 'Welcome Screen', description: 'User chooses to listen or seek support', duration: 3000 },
  { screen: 'MoodSelection' as Screen, title: 'Mood Selection', description: 'User selects their current emotional state', duration: 4000 },
  { screen: 'Matching' as Screen, title: 'Matching Process', description: 'System finds compatible users for connection', duration: 5000 },
  { screen: 'Session' as Screen, title: 'Support Session', description: 'Users engage in emotional support conversation', duration: 6000 },
  { screen: 'Wallet' as Screen, title: 'Credit Management', description: 'Users manage their emotional support credits', duration: 3000 }
]

export function ScreenDemo({ onClose }: ScreenDemoProps) {
  const [mode, setMode] = useState<DemoMode>('flow')
  const [currentScreen, setCurrentScreen] = useState<Screen>('Welcome')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [flowInterval, setFlowInterval] = useState<NodeJS.Timeout | null>(null)

  const startFlow = () => {
    setIsPlaying(true)
    setCurrentStepIndex(0)
    setCurrentScreen(FLOW_STEPS[0].screen)

    const interval = setInterval(() => {
      setCurrentStepIndex(prev => {
        const nextIndex = prev + 1
        if (nextIndex >= FLOW_STEPS.length) {
          setIsPlaying(false)
          clearInterval(interval)
          return 0
        }
        setCurrentScreen(FLOW_STEPS[nextIndex].screen)
        return nextIndex
      })
    }, FLOW_STEPS[currentStepIndex]?.duration || 3000)

    setFlowInterval(interval)
  }

  const pauseFlow = () => {
    setIsPlaying(false)
    if (flowInterval) {
      clearInterval(flowInterval)
      setFlowInterval(null)
    }
  }

  const resetFlow = () => {
    pauseFlow()
    setCurrentStepIndex(0)
    setCurrentScreen(FLOW_STEPS[0].screen)
  }

  const nextStep = () => {
    const nextIndex = (currentStepIndex + 1) % FLOW_STEPS.length
    setCurrentStepIndex(nextIndex)
    setCurrentScreen(FLOW_STEPS[nextIndex].screen)
  }

  const handleScreenChange = (screen: Screen) => {
    setCurrentScreen(screen)
    pauseFlow()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col border border-white/30">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-light text-foreground">heard Flow Demo</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setMode('flow')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  mode === 'flow'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-white/50 text-foreground hover:bg-white/70'
                }`}
              >
                Complete Flow
              </button>
              <button
                onClick={() => setMode('navigator')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  mode === 'navigator'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-white/50 text-foreground hover:bg-white/70'
                }`}
              >
                Screen Navigator
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-foreground" />
          </button>
        </div>

        {/* Controls */}
        {mode === 'flow' && (
          <div className="p-4 border-b border-white/20 bg-white/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={isPlaying ? pauseFlow : startFlow}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-blue-500 text-primary-foreground rounded-full hover:from-violet-500 hover:to-blue-500 transition-all duration-300 shadow-lg"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? 'Pause' : 'Start'} Flow
                </button>
                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 px-4 py-2 bg-white/60 text-foreground rounded-full hover:bg-white/80 transition-all"
                >
                  <SkipForward className="w-4 h-4" />
                  Next
                </button>
                <button
                  onClick={resetFlow}
                  className="flex items-center gap-2 px-4 py-2 bg-white/60 text-foreground rounded-full hover:bg-white/80 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
              <div className="text-sm text-muted-foreground">
                Step {currentStepIndex + 1} of {FLOW_STEPS.length}: {FLOW_STEPS[currentStepIndex]?.title}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-white/30 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((currentStepIndex + 1) / FLOW_STEPS.length) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {FLOW_STEPS[currentStepIndex]?.description}
              </p>
            </div>
          </div>
        )}

        {/* Screen Navigation */}
        {mode === 'navigator' && (
          <div className="p-4 border-b border-white/20 bg-white/30">
            <div className="flex gap-2 flex-wrap">
              {FLOW_STEPS.map((step, index) => (
                <button
                  key={step.screen}
                  onClick={() => handleScreenChange(step.screen)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    currentScreen === step.screen
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'bg-white/60 text-foreground hover:bg-white/80'
                  }`}
                >
                  {step.screen === 'Welcome' && <Heart className="w-4 h-4" />}
                  {step.screen === 'MoodSelection' && <User className="w-4 h-4" />}
                  {step.screen === 'Matching' && <Settings className="w-4 h-4" />}
                  {step.screen === 'Session' && <MessageCircle className="w-4 h-4" />}
                  {step.screen === 'Wallet' && <Wallet className="w-4 h-4" />}
                  {step.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Screen Display */}
          <div className="flex-1 overflow-hidden">
            <ScreenRouter
              initialScreen={currentScreen}
              onScreenChange={handleScreenChange}
            />
          </div>

          {/* Flow Information Panel */}
          {mode === 'flow' && (
            <div className="w-80 border-l border-white/20 bg-white/20 p-6 overflow-y-auto">
              <h3 className="text-lg font-medium text-foreground mb-4">Flow Overview</h3>
              <div className="space-y-4">
                {FLOW_STEPS.map((step, index) => (
                  <div
                    key={step.screen}
                    className={`p-4 rounded-xl border transition-all ${
                      index === currentStepIndex
                        ? 'border-primary bg-primary/10 shadow-lg'
                        : index < currentStepIndex
                        ? 'border-green-300 bg-green-50/50'
                        : 'border-white/30 bg-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        index === currentStepIndex
                          ? 'bg-primary text-primary-foreground'
                          : index < currentStepIndex
                          ? 'bg-green-500 text-white'
                          : 'bg-white/40 text-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <h4 className="font-medium text-foreground">{step.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                    {index === currentStepIndex && isPlaying && (
                      <div className="mt-3">
                        <div className="w-full bg-white/30 rounded-full h-1">
                          <div className="bg-primary h-1 rounded-full animate-pulse" style={{ width: '60%' }} />
                        </div>
                        <p className="text-xs text-primary mt-1">Currently viewing...</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-white/30 rounded-xl">
                <h4 className="font-medium text-foreground mb-2">About heard</h4>
                <p className="text-sm text-muted-foreground">
                  A platform connecting people for emotional support through a credit-based system.
                  Users can both provide and receive support, creating a balanced community of care.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}