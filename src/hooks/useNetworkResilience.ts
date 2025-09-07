/**
 * Network Resilience Hook
 * Provides network state management and retry logic
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { AuthUtils } from '@/lib/auth-utils'

interface NetworkState {
  isOnline: boolean
  isReconnecting: boolean
  retryCount: number
  lastError: Error | null
}

interface RetryOptions {
  maxRetries?: number
  baseDelay?: number
  onRetry?: (attempt: number, error: Error) => void
  onMaxRetriesReached?: (error: Error) => void
}

export function useNetworkResilience() {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isReconnecting: false,
    retryCount: 0,
    lastError: null
  })

  const retryTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttemptsRef = useRef(0)

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Network: Back online')
      setNetworkState(prev => ({
        ...prev,
        isOnline: true,
        isReconnecting: false,
        retryCount: 0,
        lastError: null
      }))
      reconnectAttemptsRef.current = 0
    }

    const handleOffline = () => {
      console.log('🌐 Network: Gone offline')
      setNetworkState(prev => ({
        ...prev,
        isOnline: false,
        isReconnecting: false
      }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Retry operation with network resilience
  const retryOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> => {
    const {
      maxRetries = 3,
      baseDelay = 1000,
      onRetry,
      onMaxRetriesReached
    } = options

    let lastError: Error

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Check if we're online before attempting
        if (!networkState.isOnline) {
          throw new Error('Network is offline')
        }

        // Validate and refresh auth if needed
        const authValid = await AuthUtils.validateAndRefresh()
        if (!authValid) {
          throw new Error('Authentication failed')
        }

        setNetworkState(prev => ({
          ...prev,
          isReconnecting: false,
          retryCount: attempt
        }))

        const result = await operation()
        
        // Reset retry count on success
        setNetworkState(prev => ({
          ...prev,
          retryCount: 0,
          lastError: null
        }))

        return result
      } catch (error) {
        lastError = error as Error
        console.warn(`🌐 Network: Attempt ${attempt + 1} failed:`, error)

        setNetworkState(prev => ({
          ...prev,
          isReconnecting: attempt < maxRetries - 1,
          lastError: lastError
        }))

        if (onRetry) {
          onRetry(attempt + 1, lastError)
        }

        if (attempt === maxRetries - 1) {
          if (onMaxRetriesReached) {
            onMaxRetriesReached(lastError)
          }
          throw lastError
        }

        // Wait before retry
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError!
  }, [networkState.isOnline])

  // Auto-reconnect when back online
  useEffect(() => {
    if (networkState.isOnline && networkState.isReconnecting) {
      console.log('🌐 Network: Auto-reconnecting...')
      
      // Clear any existing timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }

      // Set a timeout to reset reconnecting state
      retryTimeoutRef.current = setTimeout(() => {
        setNetworkState(prev => ({
          ...prev,
          isReconnecting: false
        }))
      }, 5000)
    }

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [networkState.isOnline, networkState.isReconnecting])

  return {
    ...networkState,
    retryOperation
  }
}
