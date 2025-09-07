/**
 * AuthProvider Integration Tests
 * Tests the interaction between AuthProvider and AuthManager
 */

import { describe, it, expect, beforeEach, afterEach, jest, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { AuthProvider, useAuthContext } from '@/components/providers/AuthProvider'
import { authManager } from '@/lib/services/AuthManager'

// Mock AuthManager
vi.mock('@/lib/services/AuthManager', () => ({
  authManager: {
    initialize: vi.fn(),
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    refreshSession: vi.fn()
  }
}))

// Mock NetworkResilience
vi.mock('@/lib/utils/network-resilience', () => ({
  NetworkResilience: {
    getIsOnline: vi.fn(),
    onConnectionChange: vi.fn()
  }
}))

// Mock Zustand stores
const mockAuthStore = {
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: true,
  error: null,
  setUser: vi.fn(),
  setProfile: vi.fn(),
  setLoading: vi.fn(),
  setAuthenticated: vi.fn(),
  setInitialized: vi.fn(),
  setError: vi.fn(),
  updateProfile: vi.fn(),
  reset: vi.fn()
}

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => mockAuthStore,
  useAuth: () => mockAuthStore
}))

describe('AuthProvider Integration', () => {
  let mockNetworkResilience: any

  beforeEach(() => {
    vi.clearAllMocks()

    mockNetworkResilience = {
      getIsOnline: vi.fn().mockReturnValue(true),
      onConnectionChange: vi.fn().mockReturnValue(() => {})
    }

    vi.mocked(require('@/lib/utils/network-resilience').NetworkResilience).mockImplementation(() => mockNetworkResilience)
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('Provider Initialization', () => {
    it('should initialize AuthManager on mount', async () => {
      render(
        <AuthProvider>
          <div>Test Child</div>
        </AuthProvider>
      )

      await waitFor(() => {
        expect(authManager.initialize).toHaveBeenCalled()
      })
    })

    it('should set up network monitoring', () => {
      render(
        <AuthProvider>
          <div>Test Child</div>
        </AuthProvider>
      )

      expect(mockNetworkResilience.onConnectionChange).toHaveBeenCalled()
    })

    it('should provide auth context to children', () => {
      const TestComponent = () => {
        const auth = useAuthContext()
        return <div data-testid="auth-user">{auth.user?.email || 'no-user'}</div>
      }

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(getByTestId('auth-user')).toHaveTextContent('no-user')
    })
  })

  describe('Sign In Flow', () => {
    it('should handle successful sign in', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      const mockResult = {
        success: true,
        user: mockUser,
        profile: { id: 'user123', display_name: 'Test User' }
      }

      vi.mocked(authManager.signIn).mockResolvedValue(mockResult)

      const TestComponent = () => {
        const { signIn, user, currentError } = useAuthContext()

        const handleSignIn = async () => {
          await signIn('test@example.com', 'password123')
        }

        return (
          <div>
            <button onClick={handleSignIn} data-testid="signin-btn">
              Sign In
            </button>
            <div data-testid="user-email">{user?.email || 'no-user'}</div>
            <div data-testid="error">{currentError?.message || 'no-error'}</div>
          </div>
        )
      }

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      const signInButton = getByTestId('signin-btn')
      signInButton.click()

      await waitFor(() => {
        expect(authManager.signIn).toHaveBeenCalledWith('test@example.com', 'password123')
        expect(getByTestId('user-email')).toHaveTextContent('test@example.com')
        expect(getByTestId('error')).toHaveTextContent('no-error')
      })
    })

    it('should handle sign in errors', async () => {
      const mockError = {
        code: 'INVALID_CREDENTIALS',
        title: 'Invalid Credentials',
        message: 'The email or password you entered is incorrect.',
        userMessage: 'Please check your email and password.',
        canRetry: true,
        severity: 'low' as const
      }

      vi.mocked(authManager.signIn).mockResolvedValue({
        success: false,
        error: mockError
      })

      const TestComponent = () => {
        const { signIn, currentError } = useAuthContext()

        const handleSignIn = async () => {
          await signIn('test@example.com', 'wrongpassword')
        }

        return (
          <div>
            <button onClick={handleSignIn} data-testid="signin-btn">
              Sign In
            </button>
            <div data-testid="error-message">
              {currentError?.userMessage || 'no-error'}
            </div>
            <div data-testid="can-retry">
              {currentError?.canRetry ? 'can-retry' : 'no-retry'}
            </div>
          </div>
        )
      }

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      const signInButton = getByTestId('signin-btn')
      signInButton.click()

      await waitFor(() => {
        expect(getByTestId('error-message')).toHaveTextContent('Please check your email and password.')
        expect(getByTestId('can-retry')).toHaveTextContent('can-retry')
      })
    })
  })

  describe('Sign Out Flow', () => {
    it('should handle successful sign out', async () => {
      vi.mocked(authManager.signOut).mockResolvedValue({ success: true })

      const TestComponent = () => {
        const { signOut, isAuthenticated } = useAuthContext()

        const handleSignOut = async () => {
          await signOut()
        }

        return (
          <div>
            <button onClick={handleSignOut} data-testid="signout-btn">
              Sign Out
            </button>
            <div data-testid="auth-status">
              {isAuthenticated ? 'authenticated' : 'not-authenticated'}
            </div>
          </div>
        )
      }

      // Set initial authenticated state
      mockAuthStore.isAuthenticated = true

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      const signOutButton = getByTestId('signout-btn')
      signOutButton.click()

      await waitFor(() => {
        expect(authManager.signOut).toHaveBeenCalled()
        expect(getByTestId('auth-status')).toHaveTextContent('not-authenticated')
      })
    })

    it('should handle sign out errors gracefully', async () => {
      const mockError = {
        code: 'SIGN_OUT_FAILED',
        title: 'Sign Out Failed',
        message: 'Failed to sign out properly.',
        userMessage: 'Failed to sign out properly. You may need to refresh the page.',
        canRetry: true,
        severity: 'medium' as const
      }

      vi.mocked(authManager.signOut).mockResolvedValue({
        success: false,
        error: mockError
      })

      const TestComponent = () => {
        const { signOut, currentError } = useAuthContext()

        const handleSignOut = async () => {
          await signOut()
        }

        return (
          <div>
            <button onClick={handleSignOut} data-testid="signout-btn">
              Sign Out
            </button>
            <div data-testid="error-message">
              {currentError?.userMessage || 'no-error'}
            </div>
          </div>
        )
      }

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      const signOutButton = getByTestId('signout-btn')
      signOutButton.click()

      await waitFor(() => {
        expect(getByTestId('error-message')).toHaveTextContent('Failed to sign out properly. You may need to refresh the page.')
      })
    })
  })

  describe('Network Status Integration', () => {
    it('should reflect online status in context', () => {
      mockNetworkResilience.getIsOnline.mockReturnValue(false)

      const TestComponent = () => {
        const { isOnline } = useAuthContext()
        return <div data-testid="network-status">{isOnline ? 'online' : 'offline'}</div>
      }

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(getByTestId('network-status')).toHaveTextContent('offline')
    })

    it('should handle network status changes', () => {
      let connectionCallback: (online: boolean) => void = () => {}

      mockNetworkResilience.onConnectionChange.mockImplementation((callback) => {
        connectionCallback = callback
        return () => {}
      })

      const TestComponent = () => {
        const { isOnline } = useAuthContext()
        return <div data-testid="network-status">{isOnline ? 'online' : 'offline'}</div>
      }

      const { getByTestId, rerender } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Initially online
      expect(getByTestId('network-status')).toHaveTextContent('online')

      // Simulate going offline
      connectionCallback(false)
      rerender(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(getByTestId('network-status')).toHaveTextContent('offline')
    })
  })

  describe('Error State Management', () => {
    it('should clear errors when clearError is called', async () => {
      const mockError = {
        code: 'INVALID_CREDENTIALS',
        title: 'Invalid Credentials',
        message: 'Invalid credentials',
        userMessage: 'Please check your credentials',
        canRetry: true,
        severity: 'low' as const
      }

      vi.mocked(authManager.signIn).mockResolvedValue({
        success: false,
        error: mockError
      })

      const TestComponent = () => {
        const { signIn, currentError, clearError } = useAuthContext()

        const handleSignIn = async () => {
          await signIn('test@example.com', 'wrongpassword')
        }

        const handleClearError = () => {
          clearError()
        }

        return (
          <div>
            <button onClick={handleSignIn} data-testid="signin-btn">
              Sign In
            </button>
            <button onClick={handleClearError} data-testid="clear-error-btn">
              Clear Error
            </button>
            <div data-testid="error-state">
              {currentError ? 'has-error' : 'no-error'}
            </div>
          </div>
        )
      }

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Trigger error
      const signInButton = getByTestId('signin-btn')
      signInButton.click()

      await waitFor(() => {
        expect(getByTestId('error-state')).toHaveTextContent('has-error')
      })

      // Clear error
      const clearButton = getByTestId('clear-error-btn')
      clearButton.click()

      expect(getByTestId('error-state')).toHaveTextContent('no-error')
    })

    it('should clean up errors on unmount', () => {
      const mockError = {
        code: 'TEST_ERROR',
        title: 'Test Error',
        message: 'Test error message',
        userMessage: 'Test error',
        canRetry: false,
        severity: 'low' as const
      }

      const TestComponent = () => {
        const { currentError } = useAuthContext()
        return <div>{currentError?.message || 'no-error'}</div>
      }

      // This test verifies that the useEffect cleanup in AuthProvider works
      // The component should handle unmounting gracefully
      expect(() => {
        const { unmount } = render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
        unmount()
      }).not.toThrow()
    })
  })

  describe('Loading States', () => {
    it('should reflect loading state from auth store', () => {
      mockAuthStore.isLoading = true

      const TestComponent = () => {
        const { isLoading } = useAuthContext()
        return <div data-testid="loading-state">{isLoading ? 'loading' : 'not-loading'}</div>
      }

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(getByTestId('loading-state')).toHaveTextContent('loading')
    })

    it('should handle loading state changes', () => {
      const TestComponent = () => {
        const { isLoading } = useAuthContext()
        return <div data-testid="loading-state">{isLoading ? 'loading' : 'not-loading'}</div>
      }

      mockAuthStore.isLoading = false

      const { getByTestId, rerender } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(getByTestId('loading-state')).toHaveTextContent('not-loading')

      // Simulate loading state change
      mockAuthStore.isLoading = true
      rerender(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(getByTestId('loading-state')).toHaveTextContent('loading')
    })
  })

  describe('Authentication State', () => {
    it('should reflect authentication state from store', () => {
      mockAuthStore.isAuthenticated = true
      mockAuthStore.user = { id: 'user123', email: 'test@example.com' }

      const TestComponent = () => {
        const { isAuthenticated, user } = useAuthContext()
        return (
          <div>
            <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
            <div data-testid="user-email">{user?.email || 'no-email'}</div>
          </div>
        )
      }

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(getByTestId('auth-status')).toHaveTextContent('authenticated')
      expect(getByTestId('user-email')).toHaveTextContent('test@example.com')
    })

    it('should handle authentication state changes', () => {
      const TestComponent = () => {
        const { isAuthenticated } = useAuthContext()
        return <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      }

      mockAuthStore.isAuthenticated = false

      const { getByTestId, rerender } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(getByTestId('auth-status')).toHaveTextContent('not-authenticated')

      // Simulate authentication
      mockAuthStore.isAuthenticated = true
      rerender(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(getByTestId('auth-status')).toHaveTextContent('authenticated')
    })
  })
})
