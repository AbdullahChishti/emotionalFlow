'use client'

import { useState, useEffect } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/**
 * A custom hook to detect if the user has a preference for reduced motion.
 * This is crucial for accessibility, allowing us to disable or alter animations
 * for users who may be sensitive to motion.
 * @returns {boolean} - True if the user prefers reduced motion, false otherwise.
 */
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQueryList = window.matchMedia(QUERY)
    // Set the initial state
    setPrefersReducedMotion(mediaQueryList.matches)

    // Listen for changes
    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQueryList.addEventListener('change', listener)

    return () => {
      mediaQueryList.removeEventListener('change', listener)
    }
  }, [])

  return prefersReducedMotion
}
