/**
 * Network Resilience Tests
 * Comprehensive testing for network resilience features
 */

import { describe, it, expect, beforeEach, afterEach, jest, vi } from 'vitest'
import { NetworkResilience } from '@/lib/utils/network-resilience'

// Mock window.navigator and window events
const mockNavigator = {
  onLine: true
}

const mockWindow = {
  navigator: mockNavigator,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
}

Object.defineProperty(window, 'navigator', {
  value: mockNavigator,
  writable: true
})

Object.defineProperty(window, 'addEventListener', {
  value: mockWindow.addEventListener
})

Object.defineProperty(window, 'removeEventListener', {
  value: mockWindow.removeEventListener
})

describe('NetworkResilience', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()

    // Reset network state
    mockNavigator.onLine = true

    // Mock window event listeners
    mockWindow.addEventListener.mockImplementation((event, callback) => {
      if (event === 'online') {
        mockWindow.onlineCallback = callback
      } else if (event === 'offline') {
        mockWindow.offlineCallback = callback
      }
    })

    mockWindow.removeEventListener.mockImplementation((event, callback) => {
      if (event === 'online' && mockWindow.onlineCallback === callback) {
        mockWindow.onlineCallback = null
      } else if (event === 'offline' && mockWindow.offlineCallback === callback) {
        mockWindow.offlineCallback = null
      }
    })

    // Re-initialize NetworkResilience
    NetworkResilience.initialize()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  describe('Initialization', () => {
    it('should initialize network monitoring', () => {
      NetworkResilience.initialize()

      expect(mockWindow.addEventListener).toHaveBeenCalledWith('online', expect.any(Function))
      expect(mockWindow.addEventListener).toHaveBeenCalledWith('offline', expect.any(Function))
    })

    it('should detect initial online status', () => {
      mockNavigator.onLine = true
      expect(NetworkResilience.getIsOnline()).toBe(true)

      mockNavigator.onLine = false
      // Note: This won't update the cached value without reinitializing
      NetworkResilience.initialize()
      expect(NetworkResilience.getIsOnline()).toBe(false)
    })
  })

  describe('Network Status Monitoring', () => {
    it('should notify subscribers when going online', () => {
      const mockCallback = vi.fn()
      const unsubscribe = NetworkResilience.onConnectionChange(mockCallback)

      // Simulate going offline first
      mockNavigator.onLine = false
      mockWindow.offlineCallback()

      expect(mockCallback).toHaveBeenCalledWith(false)

      // Simulate going online
      mockNavigator.onLine = true
      mockWindow.onlineCallback()

      expect(mockCallback).toHaveBeenCalledWith(true)

      // Cleanup
      unsubscribe()
    })

    it('should notify subscribers when going offline', () => {
      const mockCallback = vi.fn()
      const unsubscribe = NetworkResilience.onConnectionChange(mockCallback)

      // Start online
      mockNavigator.onLine = true

      // Simulate going offline
      mockNavigator.onLine = false
      mockWindow.offlineCallback()

      expect(mockCallback).toHaveBeenCalledWith(false)

      // Cleanup
      unsubscribe()
    })

    it('should handle multiple subscribers', () => {
      const mockCallback1 = vi.fn()
      const mockCallback2 = vi.fn()

      const unsubscribe1 = NetworkResilience.onConnectionChange(mockCallback1)
      const unsubscribe2 = NetworkResilience.onConnectionChange(mockCallback2)

      // Simulate network change
      mockNavigator.onLine = false
      mockWindow.offlineCallback()

      expect(mockCallback1).toHaveBeenCalledWith(false)
      expect(mockCallback2).toHaveBeenCalledWith(false)

      // Cleanup
      unsubscribe1()
      unsubscribe2()
    })

    it('should handle subscriber errors gracefully', () => {
      const mockCallback = vi.fn().mockImplementation(() => {
        throw new Error('Subscriber error')
      })

      const unsubscribe = NetworkResilience.onConnectionChange(mockCallback)

      // Should not throw when subscriber errors
      expect(() => {
        mockWindow.offlineCallback()
      }).not.toThrow()

      expect(mockCallback).toHaveBeenCalled()

      // Cleanup
      unsubscribe()
    })
  })

  describe('Timeout Operations', () => {
    it('should resolve operation within timeout', async () => {
      const mockOperation = vi.fn().mockResolvedValue('success')

      const result = await NetworkResilience.withTimeout(mockOperation, { timeout: 1000 })

      expect(result).toBe('success')
      expect(mockOperation).toHaveBeenCalled()
    })

    it('should timeout slow operations', async () => {
      const mockOperation = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve('slow'), 2000))
      )

      const timeoutPromise = NetworkResilience.withTimeout(mockOperation, { timeout: 1000 })

      // Advance timers to trigger timeout
      vi.advanceTimersByTime(1000)

      await expect(timeoutPromise).rejects.toThrow('Operation timed out after 1000ms')
    })

    it('should handle operation rejection before timeout', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('Operation failed'))

      await expect(
        NetworkResilience.withTimeout(mockOperation, { timeout: 1000 })
      ).rejects.toThrow('Operation failed')
    })

    it('should call onTimeout callback when timing out', async () => {
      const mockOnTimeout = vi.fn()
      const mockOperation = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve('slow'), 2000))
      )

      const timeoutPromise = NetworkResilience.withTimeout(mockOperation, {
        timeout: 1000,
        onTimeout: mockOnTimeout
      })

      vi.advanceTimersByTime(1000)

      await expect(timeoutPromise).rejects.toThrow()
      expect(mockOnTimeout).toHaveBeenCalled()
    })
  })

  describe('Retry Operations', () => {
    it('should succeed on first attempt', async () => {
      const mockOperation = vi.fn().mockResolvedValue('success')

      const result = await NetworkResilience.withRetry(mockOperation, 'test operation')

      expect(result).toBe('success')
      expect(mockOperation).toHaveBeenCalledTimes(1)
    })

    it('should retry on failure and eventually succeed', async () => {
      let attemptCount = 0
      const mockOperation = vi.fn().mockImplementation(() => {
        attemptCount++
        if (attemptCount < 3) {
          return Promise.reject(new Error('Temporary failure'))
        }
        return Promise.resolve('success')
      })

      const result = await NetworkResilience.withRetry(mockOperation, 'test operation', {
        maxRetries: 3
      })

      expect(result).toBe('success')
      expect(mockOperation).toHaveBeenCalledTimes(3)
    })

    it('should fail after max retries', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('Persistent failure'))

      await expect(
        NetworkResilience.withRetry(mockOperation, 'test operation', { maxRetries: 2 })
      ).rejects.toThrow('Persistent failure')

      expect(mockOperation).toHaveBeenCalledTimes(3) // Initial + 2 retries
    })

    it('should respect retry delay', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('Failure'))
      const startTime = Date.now()

      const retryPromise = NetworkResilience.withRetry(mockOperation, 'test operation', {
        maxRetries: 1,
        baseDelay: 500
      })

      // Advance time for first retry delay
      vi.advanceTimersByTime(500)
      await expect(retryPromise).rejects.toThrow()

      const elapsedTime = Date.now() - startTime
      expect(elapsedTime).toBeGreaterThanOrEqual(500)
    })

    it('should not retry non-retryable errors', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('Invalid credentials'))

      await expect(
        NetworkResilience.withRetry(mockOperation, 'test operation')
      ).rejects.toThrow('Invalid credentials')

      expect(mockOperation).toHaveBeenCalledTimes(1) // Only initial attempt
    })

    it('should handle exponential backoff', async () => {
      let delays: number[] = []
      const originalSetTimeout = global.setTimeout

      global.setTimeout = vi.fn().mockImplementation((callback, delay) => {
        delays.push(delay as number)
        return originalSetTimeout(callback, 0) // Execute immediately for testing
      })

      const mockOperation = vi.fn().mockRejectedValue(new Error('Failure'))

      await expect(
        NetworkResilience.withRetry(mockOperation, 'test operation', {
          maxRetries: 2,
          baseDelay: 100,
          backoffFactor: 2
        })
      ).rejects.toThrow()

      // Should have delays: 100ms, 200ms
      expect(delays).toEqual([100, 200])

      global.setTimeout = originalSetTimeout
    })
  })

  describe('Resilient Operations', () => {
    it('should execute operation when online', async () => {
      mockNavigator.onLine = true
      const mockOperation = vi.fn().mockResolvedValue('success')

      const result = await NetworkResilience.executeResiliently(
        mockOperation,
        'test operation'
      )

      expect(result).toBe('success')
      expect(mockOperation).toHaveBeenCalled()
    })

    it('should fail when offline', async () => {
      mockNavigator.onLine = false
      const mockOperation = vi.fn().mockResolvedValue('success')

      await expect(
        NetworkResilience.executeResiliently(mockOperation, 'test operation')
      ).rejects.toThrow('No internet connection')
    })

    it('should apply timeout and retry to operations', async () => {
      mockNavigator.onLine = true

      let callCount = 0
      const mockOperation = vi.fn().mockImplementation(() => {
        callCount++
        if (callCount < 2) {
          return new Promise((_, reject) => setTimeout(() => reject(new Error('Network error')), 2000))
        }
        return Promise.resolve('success')
      })

      const result = await NetworkResilience.executeResiliently(
        mockOperation,
        'test operation',
        { timeout: 1000 }, // Short timeout
        { maxRetries: 2 }  // Allow retries
      )

      expect(result).toBe('success')
      expect(callCount).toBe(2) // One timeout, one success
    })

    it('should handle operation timeouts', async () => {
      mockNavigator.onLine = true
      const mockOperation = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve('slow'), 2000))
      )

      const resilientPromise = NetworkResilience.executeResiliently(
        mockOperation,
        'test operation',
        { timeout: 1000 }
      )

      vi.advanceTimersByTime(1000)

      await expect(resilientPromise).rejects.toThrow('Operation timed out')
    })
  })

  describe('Error Classification', () => {
    it('should identify retryable network errors', () => {
      const networkErrors = [
        new Error('Network request failed'),
        new Error('fetch failed'),
        new Error('Connection timeout'),
        new Error('Request aborted')
      ]

      networkErrors.forEach(error => {
        expect(NetworkResilience['isRetryableError'](error)).toBe(true)
      })
    })

    it('should identify retryable server errors', () => {
      const serverErrors = [
        new Error('500 Internal Server Error'),
        new Error('502 Bad Gateway'),
        new Error('503 Service Unavailable'),
        new Error('504 Gateway Timeout')
      ]

      serverErrors.forEach(error => {
        expect(NetworkResilience['isRetryableError'](error)).toBe(true)
      })
    })

    it('should identify non-retryable auth errors', () => {
      const authErrors = [
        new Error('Invalid credentials'),
        new Error('Unauthorized'),
        new Error('Forbidden'),
        new Error('invalid_credentials')
      ]

      authErrors.forEach(error => {
        expect(NetworkResilience['isRetryableError'](error)).toBe(false)
      })
    })

    it('should default to retryable for unknown errors', () => {
      const unknownError = new Error('Some unknown error')

      expect(NetworkResilience['isRetryableError'](unknownError)).toBe(true)
    })
  })

  describe('Resilient Operation Builder', () => {
    it('should create resilient operation wrapper', async () => {
      mockNavigator.onLine = true
      const mockOperation = vi.fn().mockResolvedValue('success')

      const resilientOperation = NetworkResilience.createResilientOperation(
        mockOperation,
        'test operation'
      )

      const result = await resilientOperation()

      expect(result).toBe('success')
      expect(mockOperation).toHaveBeenCalled()
    })

    it('should apply custom timeout and retry options', async () => {
      mockNavigator.onLine = true
      let callCount = 0
      const mockOperation = vi.fn().mockImplementation(() => {
        callCount++
        if (callCount < 2) {
          return Promise.reject(new Error('Temporary failure'))
        }
        return Promise.resolve('success')
      })

      const resilientOperation = NetworkResilience.createResilientOperation(
        mockOperation,
        'test operation',
        { timeout: 5000 },
        { maxRetries: 3, baseDelay: 100 }
      )

      const result = await resilientOperation()

      expect(result).toBe('success')
      expect(callCount).toBe(2)
    })
  })

  describe('Memory Management', () => {
    it('should clean up event listeners on page unload', () => {
      NetworkResilience.initialize()

      // Simulate page unload
      NetworkResilience.cleanup?.()

      expect(mockWindow.removeEventListener).toHaveBeenCalledWith('online', expect.any(Function))
      expect(mockWindow.removeEventListener).toHaveBeenCalledWith('offline', expect.any(Function))
    })

    it('should handle multiple initialization calls', () => {
      NetworkResilience.initialize()
      NetworkResilience.initialize()

      // Should only add listeners once
      expect(mockWindow.addEventListener).toHaveBeenCalledTimes(2) // online + offline
    })
  })

  describe('Edge Cases', () => {
    it('should handle very short timeouts', async () => {
      mockNavigator.onLine = true
      const mockOperation = vi.fn().mockResolvedValue('success')

      const result = await NetworkResilience.withTimeout(mockOperation, { timeout: 1 })

      expect(result).toBe('success')
    })

    it('should handle zero max retries', async () => {
      mockNavigator.onLine = true
      const mockOperation = vi.fn().mockRejectedValue(new Error('Failure'))

      await expect(
        NetworkResilience.withRetry(mockOperation, 'test', { maxRetries: 0 })
      ).rejects.toThrow('Failure')

      expect(mockOperation).toHaveBeenCalledTimes(1)
    })

    it('should handle concurrent operations', async () => {
      mockNavigator.onLine = true

      const mockOperation1 = vi.fn().mockResolvedValue('result1')
      const mockOperation2 = vi.fn().mockResolvedValue('result2')

      const [result1, result2] = await Promise.all([
        NetworkResilience.executeResiliently(mockOperation1, 'op1'),
        NetworkResilience.executeResiliently(mockOperation2, 'op2')
      ])

      expect(result1).toBe('result1')
      expect(result2).toBe('result2')
    })

    it('should handle operations that resolve immediately', async () => {
      mockNavigator.onLine = true
      const mockOperation = vi.fn().mockResolvedValue('immediate')

      const result = await NetworkResilience.withTimeout(mockOperation, { timeout: 1000 })

      expect(result).toBe('immediate')
      expect(mockOperation).toHaveBeenCalled()
    })
  })
})
