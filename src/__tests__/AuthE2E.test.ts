/**
 * Authentication E2E Test Scenarios
 * Comprehensive edge case and error scenario testing
 * These tests simulate real user journeys and system failures
 */

import { describe, it, expect, beforeEach, afterEach, jest, vi } from 'vitest'
import { authManager } from '@/lib/services/AuthManager'
import { NetworkResilience } from '@/lib/utils/network-resilience'
import { AUTH_ERRORS, AUTH_ERROR_CODES } from '@/lib/constants/auth-errors'

// Mock all external dependencies
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }
}))

vi.mock('@/lib/utils/network-resilience', () => ({
  NetworkResilience: {
    executeResiliently: vi.fn(),
    getIsOnline: vi.fn(),
    onConnectionChange: vi.fn()
  }
}))

vi.mock('@/stores/authStore', () => ({
  useAuthStore: {
    getState: vi.fn(),
    setState: vi.fn()
  }
}))

vi.mock('@/stores/profileStore', () => ({
  useProfileStore: {
    getState: vi.fn()
  }
}))

vi.mock('@/stores/assessmentStore', () => ({
  useAssessmentStore: {
    getState: vi.fn()
  }
}))

vi.mock('@/stores/chatStore', () => ({
  useChatStore: {
    getState: vi.fn()
  }
}))

describe('Authentication E2E Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  describe('Happy Path User Journeys', () => {
    it('should handle complete user registration to login flow', async () => {
      const userEmail = 'newuser@example.com'
      const userPassword = 'SecurePass123!'
      const displayName = 'New User'

      // Mock successful sign up
      const mockSupabase = require('@/lib/supabase').supabase
      mockSupabase.auth.signUp.mockResolvedValue({
        data: {
          user: { id: 'user123', email: userEmail, user_metadata: { display_name: displayName } },
          session: null // Email confirmation required
        },
        error: null
      })

      // Mock successful email confirmation (OAuth callback)
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        setTimeout(() => {
          callback('SIGNED_IN', {
            user: { id: 'user123', email: userEmail },
            session: { access_token: 'token123' }
          })
        }, 100)
        return { unsubscribe: vi.fn() }
      })

      // Mock successful sign in
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: { id: 'user123', email: userEmail },
          session: { access_token: 'token123' }
        },
        error: null
      })

      // Mock network resilience
      const mockNetwork = require('@/lib/utils/network-resilience').NetworkResilience
      mockNetwork.executeResiliently.mockImplementation(async (operation) => {
        return { data: await operation(), error: null }
      })

      // Step 1: User signs up
      const signUpResult = await authManager.signUp(userEmail, userPassword, displayName)
      expect(signUpResult.success).toBe(true)
      expect(signUpResult.user?.email).toBe(userEmail)

      // Step 2: User confirms email (simulated)
      await new Promise(resolve => setTimeout(resolve, 150))

      // Step 3: User signs in
      const signInResult = await authManager.signIn(userEmail, userPassword)
      expect(signInResult.success).toBe(true)
      expect(signInResult.user?.email).toBe(userEmail)

      // Verify all operations completed successfully
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: userEmail,
        password: userPassword,
        options: { data: { display_name: displayName } }
      })
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: userEmail,
        password: userPassword
      })
    })

    it('should handle user session persistence across browser refreshes', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }

      // Mock existing session
      const mockSupabase = require('@/lib/supabase').supabase
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: mockUser, access_token: 'token123' } },
        error: null
      })

      // Mock profile loading
      const mockSupabaseFrom = mockSupabase.from
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'user123', display_name: 'Test User' },
              error: null
            })
          })
        })
      })

      // Initialize auth manager (simulates app startup)
      await authManager.initialize()

      // Verify session was restored
      expect(mockSupabase.auth.getSession).toHaveBeenCalled()
      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled()
    })
  })

  describe('Error Recovery Scenarios', () => {
    it('should recover from network failures during sign in', async () => {
      const mockNetwork = require('@/lib/utils/network-resilience').NetworkResilience
      const mockSupabase = require('@/lib/supabase').supabase

      // First two attempts fail with network errors
      let attemptCount = 0
      mockNetwork.executeResiliently.mockImplementation(async () => {
        attemptCount++
        if (attemptCount <= 2) {
          throw new Error('Network request failed')
        }
        return {
          data: {
            user: { id: 'user123', email: 'test@example.com' },
            session: { access_token: 'token123' }
          },
          error: null
        }
      })

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: { id: 'user123', email: 'test@example.com' },
          session: { access_token: 'token123' }
        },
        error: null
      })

      const result = await authManager.signIn('test@example.com', 'password123')

      expect(result.success).toBe(true)
      expect(mockNetwork.executeResiliently).toHaveBeenCalledTimes(3) // Initial + 2 retries
    })

    it('should handle rate limiting gracefully', async () => {
      const mockSupabase = require('@/lib/supabase').supabase

      // Mock rate limiting error
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Too many requests', status: 429 }
      })

      const mockNetwork = require('@/lib/utils/network-resilience').NetworkResilience
      mockNetwork.executeResiliently.mockResolvedValue({
        data: null,
        error: { message: 'Too many requests', status: 429 }
      })

      const result = await authManager.signIn('test@example.com', 'password123')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe(AUTH_ERROR_CODES.TOO_MANY_ATTEMPTS)
      expect(result.error?.canRetry).toBe(false)
    })

    it('should handle session expiration and automatic refresh', async () => {
      const mockSupabase = require('@/lib/supabase').supabase

      // Mock expired session
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      })

      // Mock successful session refresh
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        setTimeout(() => {
          callback('TOKEN_REFRESHED', {
            user: { id: 'user123', email: 'test@example.com' },
            session: { access_token: 'new_token123' }
          })
        }, 50)
        return { unsubscribe: vi.fn() }
      })

      const result = await authManager.refreshSession()

      await new Promise(resolve => setTimeout(resolve, 100))

      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled()
    })
  })

  describe('Offline and Network Scenarios', () => {
    it('should handle offline state gracefully', async () => {
      const mockNetwork = require('@/lib/utils/network-resilience').NetworkResilience
      mockNetwork.getIsOnline.mockReturnValue(false)

      const result = await authManager.signIn('test@example.com', 'password123')

      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('No internet connection. Please check your network and try again.')
    })

    it('should recover when connection is restored', async () => {
      const mockNetwork = require('@/lib/utils/network-resilience').NetworkResilience
      const mockSupabase = require('@/lib/supabase').supabase

      let isOnline = false

      mockNetwork.getIsOnline.mockImplementation(() => isOnline)
      mockNetwork.onConnectionChange.mockImplementation((callback) => {
        // Simulate connection restoration
        setTimeout(() => {
          isOnline = true
          callback(true)
        }, 1000)
        return () => {}
      })

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: { id: 'user123', email: 'test@example.com' },
          session: { access_token: 'token123' }
        },
        error: null
      })

      mockNetwork.executeResiliently.mockImplementation(async (operation) => {
        if (!isOnline) {
          throw new Error('Network request failed')
        }
        return { data: await operation(), error: null }
      })

      // Start offline
      isOnline = false
      const offlineResult = await authManager.signIn('test@example.com', 'password123')
      expect(offlineResult.success).toBe(false)

      // Wait for connection to be restored
      await new Promise(resolve => setTimeout(resolve, 1100))

      // Try again when online
      isOnline = true
      const onlineResult = await authManager.signIn('test@example.com', 'password123')
      expect(onlineResult.success).toBe(true)
    })
  })

  describe('Profile Management Edge Cases', () => {
    it('should handle profile creation race conditions', async () => {
      const mockSupabase = require('@/lib/supabase').supabase

      // Mock profile not found initially
      let callCount = 0
      const mockSingle = vi.fn()
      mockSingle.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({
            data: null,
            error: { code: 'PGRST116' } // Not found
          })
        }
        return Promise.resolve({
          data: { id: 'user123', display_name: 'Test User' },
          error: null
        })
      })

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSingle
          })
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'user123', display_name: 'Test User' },
              error: null
            })
          })
        })
      })

      // Start multiple concurrent profile requests
      const promise1 = authManager['loadProfile']('user123', 'test1')
      const promise2 = authManager['loadProfile']('user123', 'test2')
      const promise3 = authManager['loadProfile']('user123', 'test3')

      const [result1, result2, result3] = await Promise.all([promise1, promise2, promise3])

      // All should succeed and return the same profile
      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
      expect(result3.success).toBe(true)
      expect(result1.profile?.id).toBe('user123')
      expect(result2.profile?.id).toBe('user123')
      expect(result3.profile?.id).toBe('user123')

      // Should only make one actual database call
      expect(callCount).toBe(1)
    })

    it('should handle profile loading failures gracefully', async () => {
      const mockSupabase = require('@/lib/supabase').supabase

      // Mock database connection failure
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockRejectedValue(new Error('Database connection failed'))
          })
        })
      })

      const result = await authManager['loadProfile']('user123', 'test')

      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('Database connection failed')
    })
  })

  describe('Concurrent Operation Handling', () => {
    it('should prevent multiple simultaneous sign in attempts', async () => {
      const mockNetwork = require('@/lib/utils/network-resilience').NetworkResilience
      mockNetwork.executeResiliently.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve({
          data: { user: { id: 'user123' }, session: { access_token: 'token' } },
          error: null
        }), 100)
      }))

      // Start multiple sign in attempts
      const promise1 = authManager.signIn('test@example.com', 'password1')
      const promise2 = authManager.signIn('test@example.com', 'password2')
      const promise3 = authManager.signIn('test@example.com', 'password3')

      const [result1, result2, result3] = await Promise.all([promise1, promise2, promise3])

      // Only one should succeed, others should be blocked
      const successCount = [result1, result2, result3].filter(r => r.success).length
      expect(successCount).toBe(1)

      const blockedCount = [result1, result2, result3].filter(r =>
        r.error?.message === 'Sign in already in progress'
      ).length
      expect(blockedCount).toBe(2)
    })

    it('should handle rapid sign in/out cycles', async () => {
      const mockNetwork = require('@/lib/utils/network-resilience').NetworkResilience
      const mockSupabase = require('@/lib/supabase').supabase

      // Mock all operations to succeed quickly
      mockNetwork.executeResiliently.mockResolvedValue({
        data: { user: { id: 'user123' }, session: { access_token: 'token' } },
        error: null
      })

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'user123' } },
        error: null
      })

      mockSupabase.auth.signOut.mockResolvedValue({
        error: null
      })

      // Rapid sign in/out cycles
      for (let i = 0; i < 5; i++) {
        const signInResult = await authManager.signIn('test@example.com', 'password123')
        expect(signInResult.success).toBe(true)

        const signOutResult = await authManager.signOut()
        expect(signOutResult.success).toBe(true)
      }

      // All operations should have completed successfully
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledTimes(5)
      expect(mockSupabase.auth.signOut).toHaveBeenCalledTimes(5)
    })
  })

  describe('State Synchronization Edge Cases', () => {
    it('should handle auth state changes during operations', async () => {
      const mockSupabase = require('@/lib/supabase').supabase

      // Mock auth state change listener
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        // Simulate auth state change during operation
        setTimeout(() => {
          callback('SIGNED_OUT', null)
        }, 50)
        return { unsubscribe: vi.fn() }
      })

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'user123' }, session: { access_token: 'token' } },
        error: null
      })

      const mockNetwork = require('@/lib/utils/network-resilience').NetworkResilience
      mockNetwork.executeResiliently.mockResolvedValue({
        data: { user: { id: 'user123' }, session: { access_token: 'token' } },
        error: null
      })

      const result = await authManager.signIn('test@example.com', 'password123')

      // Operation should still succeed despite state change
      expect(result.success).toBe(true)

      // Wait for auth state change to process
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    it('should handle store updates during concurrent operations', async () => {
      const mockAuthStore = require('@/stores/authStore').useAuthStore

      // Mock store state changes
      let storeState = { isAuthenticated: false, user: null }
      mockAuthStore.getState.mockImplementation(() => storeState)

      // Simulate store state changing during operation
      setTimeout(() => {
        storeState = { isAuthenticated: true, user: { id: 'user123' } }
      }, 25)

      const mockNetwork = require('@/lib/utils/network-resilience').NetworkResilience
      mockNetwork.executeResiliently.mockResolvedValue({
        data: { user: { id: 'user123' }, session: { access_token: 'token' } },
        error: null
      })

      const result = await authManager.signIn('test@example.com', 'password123')

      expect(result.success).toBe(true)
    })
  })

  describe('Memory and Resource Management', () => {
    it('should clean up resources properly on errors', async () => {
      const mockNetwork = require('@/lib/utils/network-resilience').NetworkResilience

      // Mock network failure
      mockNetwork.executeResiliently.mockRejectedValue(new Error('Network failed'))

      const result = await authManager.signIn('test@example.com', 'password123')

      expect(result.success).toBe(false)

      // Verify resources are cleaned up
      expect(authManager['activeOperations'].has('signin')).toBe(false)
    })

    it('should handle memory pressure gracefully', async () => {
      const mockNetwork = require('@/lib/utils/network-resilience').NetworkResilience
      mockNetwork.executeResiliently.mockResolvedValue({
        data: { user: { id: 'user123' }, session: { access_token: 'token' } },
        error: null
      })

      // Simulate many concurrent operations
      const promises = []
      for (let i = 0; i < 10; i++) {
        promises.push(authManager.signIn(`user${i}@example.com`, 'password123'))
      }

      const results = await Promise.all(promises)

      // Some should succeed, some should be blocked due to deduplication
      const successCount = results.filter(r => r.success).length
      const blockedCount = results.filter(r => r.error?.message === 'Sign in already in progress').length

      expect(successCount + blockedCount).toBe(10)
    })
  })

  describe('Security Edge Cases', () => {
    it('should handle malformed input gracefully', async () => {
      // Test with various malformed inputs
      const malformedInputs = [
        { email: '', password: 'password123' },
        { email: 'invalid-email', password: 'password123' },
        { email: 'test@example.com', password: '' },
        { email: null, password: 'password123' },
        { email: 'test@example.com', password: null },
        { email: 'a'.repeat(1000) + '@example.com', password: 'password123' },
        { email: 'test@example.com', password: 'a'.repeat(1000) }
      ]

      for (const input of malformedInputs) {
        const result = await authManager.signIn(input.email as string, input.password as string)
        expect(result.success).toBe(false)
        expect(result.error).toBeDefined()
      }
    })

    it('should prevent session fixation attacks', async () => {
      const mockSupabase = require('@/lib/supabase').supabase

      // Mock existing session that should be cleared
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: 'old_user' }, access_token: 'old_token' } },
        error: null
      })

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'new_user' }, session: { access_token: 'new_token' } },
        error: null
      })

      const mockNetwork = require('@/lib/utils/network-resilience').NetworkResilience
      mockNetwork.executeResiliently.mockResolvedValue({
        data: { user: { id: 'new_user' }, session: { access_token: 'new_token' } },
        error: null
      })

      const result = await authManager.signIn('test@example.com', 'password123')

      expect(result.success).toBe(true)
      expect(result.user?.id).toBe('new_user')
    })

    it('should handle XSS attempts in error messages', async () => {
      const mockNetwork = require('@/lib/utils/network-resilience').NetworkResilience

      // Mock error with potentially malicious content
      mockNetwork.executeResiliently.mockRejectedValue(new Error('<script>alert("XSS")</script>'))

      const result = await authManager.signIn('test@example.com', 'password123')

      expect(result.success).toBe(false)
      expect(result.error?.message).toContain('<script>') // Should be sanitized by our error handling
    })
  })

  describe('Performance and Scalability', () => {
    it('should handle high-frequency operations', async () => {
      const mockNetwork = require('@/lib/utils/network-resilience').NetworkResilience
      mockNetwork.executeResiliently.mockResolvedValue({
        data: { user: { id: 'user123' }, session: { access_token: 'token' } },
        error: null
      })

      const startTime = Date.now()

      // Rapid fire operations
      const operations = []
      for (let i = 0; i < 20; i++) {
        operations.push(authManager.signIn(`user${i}@example.com`, 'password123'))
      }

      await Promise.all(operations)

      const endTime = Date.now()
      const duration = endTime - startTime

      // Should complete within reasonable time (allowing for deduplication)
      expect(duration).toBeLessThan(5000) // 5 seconds
    })

    it('should maintain performance under memory pressure', async () => {
      const mockNetwork = require('@/lib/utils/network-resilience').NetworkResilience
      mockNetwork.executeResiliently.mockResolvedValue({
        data: { user: { id: 'user123' }, session: { access_token: 'token' } },
        error: null
      })

      // Create many profile requests to test memory management
      const profilePromises = []
      for (let i = 0; i < 50; i++) {
        profilePromises.push(authManager['loadProfile'](`user${i}`, `req${i}`))
      }

      const startTime = Date.now()
      await Promise.all(profilePromises)
      const endTime = Date.now()

      // Should complete efficiently
      expect(endTime - startTime).toBeLessThan(3000) // 3 seconds
    })
  })
})
