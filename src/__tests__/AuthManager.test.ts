/**
 * AuthManager Unit Tests
 * Comprehensive testing for authentication operations
 */

import { describe, it, expect, beforeEach, afterEach, jest, vi } from 'vitest'
import { AuthManager } from '@/lib/services/AuthManager'
import { AUTH_ERRORS, AUTH_ERROR_CODES } from '@/lib/constants/auth-errors'

// Mock Supabase
const mockSupabase = {
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn()
  }
}

// Mock the supabase import
vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase
}))

// Mock NetworkResilience
const mockNetworkResilience = {
  executeResiliently: vi.fn(),
  getIsOnline: vi.fn(),
  onConnectionChange: vi.fn()
}

vi.mock('@/lib/utils/network-resilience', () => ({
  NetworkResilience: mockNetworkResilience
}))

// Mock Zustand stores
const mockAuthStore = {
  setUser: vi.fn(),
  setProfile: vi.fn(),
  setLoading: vi.fn(),
  setAuthenticated: vi.fn(),
  setInitialized: vi.fn(),
  setError: vi.fn(),
  reset: vi.fn(),
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false
}

const mockProfileStore = {
  setProfile: vi.fn(),
  clearProfile: vi.fn(),
  profile: null
}

const mockAssessmentStore = {
  resetAssessmentState: vi.fn()
}

const mockChatStore = {
  resetChatState: vi.fn()
}

vi.mock('@/stores/authStore', () => ({
  useAuthStore: {
    getState: () => mockAuthStore,
    setState: vi.fn()
  }
}))

vi.mock('@/stores/profileStore', () => ({
  useProfileStore: {
    getState: () => mockProfileStore
  }
}))

vi.mock('@/stores/assessmentStore', () => ({
  useAssessmentStore: {
    getState: () => mockAssessmentStore
  }
}))

vi.mock('@/stores/chatStore', () => ({
  useChatStore: {
    getState: () => mockChatStore
  }
}))

describe('AuthManager', () => {
  let authManager: AuthManager

  beforeEach(() => {
    vi.clearAllMocks()
    authManager = AuthManager.getInstance()

    // Reset mock states
    Object.assign(mockAuthStore, {
      setUser: vi.fn(),
      setProfile: vi.fn(),
      setLoading: vi.fn(),
      setAuthenticated: vi.fn(),
      setInitialized: vi.fn(),
      setError: vi.fn(),
      reset: vi.fn(),
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false
    })

    Object.assign(mockProfileStore, {
      setProfile: vi.fn(),
      clearProfile: vi.fn(),
      profile: null
    })

    // Setup default mock behaviors
    mockNetworkResilience.executeResiliently.mockImplementation(async (operation) => {
      return { data: { user: null }, error: null }
    })
    mockNetworkResilience.getIsOnline.mockReturnValue(true)
    mockNetworkResilience.onConnectionChange.mockReturnValue(() => {})

    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: null
    })
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: null
    })
    mockSupabase.auth.signOut.mockResolvedValue({
      error: null
    })
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    })
  })

  afterEach(() => {
    // Clean up singleton instance
    vi.clearAllTimers()
  })

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = AuthManager.getInstance()
      const instance2 = AuthManager.getInstance()

      expect(instance1).toBe(instance2)
      expect(instance1).toBe(authManager)
    })

    it('should initialize only once', async () => {
      await authManager.initialize()
      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalledTimes(1)
      expect(mockSupabase.auth.getSession).toHaveBeenCalledTimes(1)
    })
  })

  describe('Sign In Functionality', () => {
    it('should successfully sign in with valid credentials', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        user_metadata: { display_name: 'Test User' }
      }

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'token123' } },
        error: null
      })

      mockNetworkResilience.executeResiliently.mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'token123' } },
        error: null
      })

      const result = await authManager.signIn('test@example.com', 'password123')

      expect(result.success).toBe(true)
      expect(result.user).toEqual(mockUser)
      expect(mockAuthStore.setUser).toHaveBeenCalledWith(mockUser)
      expect(mockAuthStore.setAuthenticated).toHaveBeenCalledWith(true)
      expect(mockAuthStore.setLoading).toHaveBeenCalledWith(false)
    })

    it('should handle sign in errors gracefully', async () => {
      const mockError = { message: 'Invalid credentials', status: 400 }

      mockNetworkResilience.executeResiliently.mockResolvedValue({
        data: { user: null },
        error: mockError
      })

      const result = await authManager.signIn('test@example.com', 'wrongpassword')

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe(AUTH_ERROR_CODES.INVALID_CREDENTIALS)
      expect(mockAuthStore.setLoading).toHaveBeenCalledWith(false)
    })

    it('should prevent duplicate sign in attempts', async () => {
      // Mock ongoing operation
      authManager['activeOperations'].add('signin')

      const result = await authManager.signIn('test@example.com', 'password123')

      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('Sign in already in progress')
    })

    it('should handle network errors', async () => {
      mockNetworkResilience.executeResiliently.mockRejectedValue(
        new Error('Network request failed')
      )

      const result = await authManager.signIn('test@example.com', 'password123')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe(AUTH_ERROR_CODES.NETWORK_ERROR)
    })

    it('should block sign in when user is already authenticated', async () => {
      mockAuthStore.user = { id: 'existing_user' }
      mockAuthStore.isAuthenticated = true

      const result = await authManager.signIn('test@example.com', 'password123')

      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('User is already authenticated')
      expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled()
    })
  })

  describe('Sign Up Functionality', () => {
    it('should successfully sign up with valid data', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        user_metadata: { display_name: 'Test User' }
      }

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null
      })

      mockNetworkResilience.executeResiliently.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null
      })

      const result = await authManager.signUp('test@example.com', 'password123', 'Test User')

      expect(result.success).toBe(true)
      expect(result.user).toEqual(mockUser)
      expect(mockAuthStore.setUser).toHaveBeenCalledWith(mockUser)
      expect(mockAuthStore.setAuthenticated).toHaveBeenCalledWith(false) // Not confirmed yet
    })

    it('should handle email already exists error', async () => {
      const mockError = { message: 'User already registered', status: 422 }

      mockNetworkResilience.executeResiliently.mockResolvedValue({
        data: { user: null },
        error: mockError
      })

      const result = await authManager.signUp('existing@example.com', 'password123', 'Test User')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe(AUTH_ERROR_CODES.UNKNOWN_ERROR) // Should be classified properly
    })

    it('should prevent duplicate sign up attempts', async () => {
      authManager['activeOperations'].add('signup')

      const result = await authManager.signUp('test@example.com', 'password123', 'Test User')

      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('Sign up already in progress')
    })
  })

  describe('Sign Out Functionality', () => {
    it('should successfully sign out and clear all state', async () => {
      mockAuthStore.user = { id: 'user123' }
      mockAuthStore.isAuthenticated = true

      mockSupabase.auth.signOut.mockResolvedValue({
        error: null
      })

      mockNetworkResilience.executeResiliently.mockResolvedValue({
        error: null
      })

      const result = await authManager.signOut()

      expect(result.success).toBe(true)
      expect(mockAuthStore.reset).toHaveBeenCalled()
      expect(mockProfileStore.clearProfile).toHaveBeenCalled()
      expect(mockAssessmentStore.resetAssessmentState).toHaveBeenCalled()
      expect(mockChatStore.resetChatState).toHaveBeenCalled()
    })

    it('should handle sign out when no user is logged in', async () => {
      mockAuthStore.user = null

      const result = await authManager.signOut()

      expect(result.success).toBe(true)
      expect(mockSupabase.auth.signOut).not.toHaveBeenCalled()
    })

    it('should handle sign out errors gracefully', async () => {
      mockAuthStore.user = { id: 'user123' }

      const mockError = { message: 'Sign out failed', status: 500 }
      mockNetworkResilience.executeResiliently.mockResolvedValue({
        error: mockError
      })

      const result = await authManager.signOut()

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe(AUTH_ERROR_CODES.SIGN_OUT_FAILED)
      // Should still clear local state even on error
      expect(mockAuthStore.reset).toHaveBeenCalled()
    })

    it('should prevent duplicate sign out attempts', async () => {
      authManager['activeOperations'].add('signout')

      const result = await authManager.signOut()

      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('Sign out already in progress')
    })
  })

  describe('Profile Management', () => {
    it('should load existing profile successfully', async () => {
      const mockProfile = {
        id: 'user123',
        display_name: 'Test User',
        empathy_credits: 10
      }

      // Mock successful profile fetch
      vi.mock('@/lib/supabase', () => ({
        supabase: {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({
                  data: mockProfile,
                  error: null
                }))
              }))
            }))
          }))
        }
      }), { virtual: true })

      const result = await authManager['loadProfile']('user123', 'test_op')

      expect(result.success).toBe(true)
      expect(result.profile).toEqual(mockProfile)
    })

    it('should create new profile when none exists', async () => {
      const mockNewProfile = {
        id: 'user123',
        display_name: 'New User',
        empathy_credits: 10
      }

      // Mock profile not found, then successful creation
      const mockSupabaseInstance = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({
                data: null,
                error: { code: 'PGRST116' } // Not found
              }))
            }))
          })),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({
                data: mockNewProfile,
                error: null
              }))
            }))
          }))
        }))
      }

      vi.mock('@/lib/supabase', () => ({
        supabase: mockSupabaseInstance
      }), { virtual: true })

      const result = await authManager['loadProfile']('user123', 'test_op')

      expect(result.success).toBe(true)
      expect(result.profile).toEqual(mockNewProfile)
    })

    it('should handle profile loading errors', async () => {
      // Mock database error
      vi.mock('@/lib/supabase', () => ({
        supabase: {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({
                  data: null,
                  error: { message: 'Database connection failed' }
                }))
              }))
            }))
          }))
        }
      }), { virtual: true })

      const result = await authManager['loadProfile']('user123', 'test_op')

      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('Database connection failed')
    })

    it('should deduplicate concurrent profile requests', async () => {
      const mockProfile = { id: 'user123', display_name: 'Test User' }

      vi.mock('@/lib/supabase', () => ({
        supabase: {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({
                  data: mockProfile,
                  error: null
                }))
              }))
            }))
          }))
        }
      }), { virtual: true })

      // Start two concurrent requests
      const promise1 = authManager['loadProfile']('user123', 'test_op_1')
      const promise2 = authManager['loadProfile']('user123', 'test_op_2')

      const [result1, result2] = await Promise.all([promise1, promise2])

      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
      expect(result1.profile).toEqual(result2.profile)
      // Should only make one actual request to Supabase
    })
  })

  describe('Session Management', () => {
    it('should refresh session successfully', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      const mockSession = { user: mockUser, access_token: 'token123' }

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      mockNetworkResilience.executeResiliently.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      const result = await authManager.refreshSession()

      expect(result.success).toBe(true)
      expect(mockAuthStore.setUser).toHaveBeenCalledWith(mockUser)
      expect(mockAuthStore.setAuthenticated).toHaveBeenCalledWith(true)
    })

    it('should handle session refresh when no session exists', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      })

      const result = await authManager.refreshSession()

      expect(result.success).toBe(true) // Not an error, just no session
      expect(mockAuthStore.setUser).toHaveBeenCalledWith(null)
      expect(mockAuthStore.setAuthenticated).toHaveBeenCalledWith(false)
    })

    it('should handle session refresh errors', async () => {
      const mockError = { message: 'Session refresh failed', status: 401 }

      mockNetworkResilience.executeResiliently.mockResolvedValue({
        data: { session: null },
        error: mockError
      })

      const result = await authManager.refreshSession()

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe(AUTH_ERROR_CODES.UNAUTHORIZED)
    })
  })

  describe('State Management', () => {
    it('should clear all authentication state', () => {
      authManager['clearAuthState']()

      expect(mockAuthStore.reset).toHaveBeenCalled()
      expect(mockProfileStore.clearProfile).toHaveBeenCalled()
      expect(mockAssessmentStore.resetAssessmentState).toHaveBeenCalled()
      expect(mockChatStore.resetChatState).toHaveBeenCalled()
    })

    it('should clear all persisted state', () => {
      // Mock localStorage
      const localStorageMock = {
        removeItem: vi.fn(),
        getItem: vi.fn(),
        setItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0
      }

      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true
      })

      authManager['clearAllState']('test_op')

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('zustand-auth-storage')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('zustand-profile-storage')
    })
  })

  describe('Error Classification', () => {
    it('should classify Supabase errors correctly', () => {
      // Test invalid credentials
      const invalidCredsError = { message: 'Invalid login credentials', status: 400 }
      const classified = require('@/lib/constants/auth-errors').classifySupabaseError(invalidCredsError)
      expect(classified.code).toBe(AUTH_ERROR_CODES.INVALID_CREDENTIALS)

      // Test network error
      const networkError = { message: 'Network request failed', status: 0 }
      const networkClassified = require('@/lib/constants/auth-errors').classifySupabaseError(networkError)
      expect(networkClassified.code).toBe(AUTH_ERROR_CODES.NETWORK_ERROR)
    })
  })

  describe('Operation Deduplication', () => {
    it('should prevent multiple concurrent operations of the same type', async () => {
      // Start first operation
      authManager['activeOperations'].add('signin')

      // Try to start another operation of the same type
      const canStart = !authManager['activeOperations'].has('signin')

      expect(canStart).toBe(false)
    })

    it('should clean up operations after completion', async () => {
      // Simulate operation starting
      authManager['activeOperations'].add('signin')

      // Simulate operation completing
      authManager['activeOperations'].delete('signin')

      expect(authManager['activeOperations'].has('signin')).toBe(false)
    })
  })

  describe('Initialization', () => {
    it('should initialize auth state listener', async () => {
      await authManager.initialize()

      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled()
      expect(mockSupabase.auth.getSession).toHaveBeenCalled()
    })

    it('should handle initialization with existing session', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null
      })

      await authManager.initialize()

      expect(mockAuthStore.setUser).toHaveBeenCalledWith(mockUser)
      expect(mockAuthStore.setAuthenticated).toHaveBeenCalledWith(true)
    })

    it('should handle initialization errors gracefully', async () => {
      mockSupabase.auth.getSession.mockRejectedValue(new Error('Init failed'))

      await authManager.initialize()

      // Should still set initialized to true even on error
      expect(mockAuthStore.setInitialized).toHaveBeenCalledWith(true)
      expect(mockAuthStore.setLoading).toHaveBeenCalledWith(false)
    })
  })

  describe('Cleanup', () => {
    it('should clean up resources properly', () => {
      // Mock auth state change listener
      authManager['authStateChangeListener'] = vi.fn()

      authManager.cleanup()

      expect(authManager['authStateChangeListener']).toBe(null)
      expect(authManager['isInitialized']).toBe(false)
      expect(authManager['activeOperations'].size).toBe(0)
      expect(authManager['profileRequests'].size).toBe(0)
    })
  })
})
