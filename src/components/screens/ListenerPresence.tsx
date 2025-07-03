'use client'

import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { useEffect, useState, useCallback } from 'react'

// Component for the listener's presence visualization
// Now focused solely on calm affirmation animations
export function ListenerPresence({ interactionCount, selectedMood }: { interactionCount: number; selectedMood?: string }) {
  const [currentAffirmation, setCurrentAffirmation] = useState('')
  const [isVisible, setIsVisible] = useState(true)
  const [affirmationKey, setAffirmationKey] = useState(0)
  const [affirmationsEnabled, setAffirmationsEnabled] = useState(true)
  
  // General supportive affirmations
  const generalAffirmations = [
    "You're not being judged here.",
    "Take your time. Someone is listening.",
    "You don't have to explain everything.",
    "This space is for you.",
    "What you're feeling makes sense.",
    "We're here with you, not ahead of you.",
    "You're allowed to feel what you feel.",
    "You've already done something brave.",
    "Your feelings are valid.",
    "This is a safe space.",
    "It's okay to take a moment.",
    "You're being heard."
  ]
  
  // Mood-specific affirmations
  const moodAffirmations: Record<string, string[]> = {
    sad: [
      "It's okay to feel sad.",
      "Your sadness is valid and understood.",
      "This feeling will pass, but take the time you need.",
      "You're not alone in feeling this way."
    ],
    anxious: [
      "One breath at a time.",
      "You're safe in this moment.",
      "This anxiety doesn't define you.",
      "Your feelings are temporary, not permanent."
    ],
    angry: [
      "Your anger is valid.",
      "It's okay to feel frustrated.",
      "Your feelings deserve to be expressed.",
      "This anger is information, not your identity."
    ],
    overwhelmed: [
      "You only need to focus on this moment.",
      "Small steps are still progress.",
      "It's okay to pause and breathe.",
      "You don't have to carry everything at once."
    ],
    hopeful: [
      "Your hope matters.",
      "Each step forward counts.",
      "You're growing through this experience.",
      "Your resilience is beautiful to witness."
    ]
  }
  
  // Select appropriate affirmations based on mood
  const selectAffirmation = useCallback(() => {
    if (selectedMood && moodAffirmations[selectedMood.toLowerCase()]) {
      // If we have specific affirmations for this mood, use a mix
      const specificAffirmations = moodAffirmations[selectedMood.toLowerCase()]
      const combinedPool = [...specificAffirmations, ...generalAffirmations]
      const randomIndex = Math.floor(Math.random() * combinedPool.length)
      return combinedPool[randomIndex]
    } else {
      // Otherwise use general affirmations
      const randomIndex = Math.floor(Math.random() * generalAffirmations.length)
      return generalAffirmations[randomIndex]
    }
  }, [selectedMood])
  
  // Cycle through affirmations with gentle fade in/out
  useEffect(() => {
    if (!affirmationsEnabled) return
    
    // Initial affirmation
    setCurrentAffirmation(selectAffirmation())
    
    const cycleInterval = setInterval(() => {
      // Fade out
      setIsVisible(false)
      
      // Wait for fade out, then change affirmation and fade in
      setTimeout(() => {
        setCurrentAffirmation(selectAffirmation())
        setAffirmationKey(prev => prev + 1)
        setIsVisible(true)
      }, 1000)
    }, 8000) // Change affirmation every 8 seconds
    
    return () => {
      clearInterval(cycleInterval)
    }
  }, [selectAffirmation, affirmationsEnabled])
  
  // Toggle affirmations on/off
  const toggleAffirmations = () => {
    setAffirmationsEnabled(prev => !prev)
    if (!affirmationsEnabled) {
      // If turning back on, immediately show an affirmation
      setCurrentAffirmation(selectAffirmation())
      setIsVisible(true)
    }
  }
  
  return (
    <div className="h-full w-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900/50 via-purple-900/30 to-blue-900/50 backdrop-blur-sm">
      {/* Soft background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-purple-400/5 to-transparent opacity-50" />
      
      {/* Affirmations */}
      {affirmationsEnabled && (
        <div className="relative z-10 flex items-center justify-center h-full w-full">
          <AnimatePresence mode="wait">
            {isVisible && (
              <motion.div 
                key={affirmationKey}
                className="text-xl font-light text-purple-100 max-w-xs text-center px-8"
                style={{ 
                  filter: "drop-shadow(0 0 2px rgba(216, 180, 254, 0.5))",
                  textShadow: "0 0 10px rgba(216, 180, 254, 0.3)",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 300,
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              >
                {currentAffirmation}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      
      {/* Controls for affirmations */}
      <div className="absolute bottom-4 right-4">
        <button 
          onClick={toggleAffirmations}
          className="text-xs text-purple-300 opacity-50 hover:opacity-100 transition-opacity px-3 py-1 rounded-full bg-white/5"
          title={affirmationsEnabled ? "Pause affirmations" : "Resume affirmations"}
        >
          {affirmationsEnabled ? "Pause" : "Resume"}
        </button>
      </div>
    </div>
  )
}
