/**
 * Unified Authentication Manager
 * Single source of truth for all authentication operations
 * Consolidates auth state management, profile handling, and cleanup
 */

import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useProfileStore } from '@/stores/profileStore'
import { useAssessmentStore } from '@/stores/assessmentStore'
import { useChatStore } from '@/stores/chatStore'
import { User, Profile } from '@/types'
import { AUTH_MESSAGES, AUTH_REDIRECTS } from '@/lib/constants/auth'
import { AUTH_ERRORS, AUTH_ERROR_CODES, classifySupabaseError, type AuthError } from '@/lib/constants/auth-errors'
import { NetworkResilience } from '@/lib/utils/network-resilience'

// Lazy load tracking utilities to avoid circular dependencies
let trackingInitialized = false
let trackingUtils: any = null

const getTrackingUtils = async () => {
  if (!trackingInitialized) {
    try {
      const [
        { startAuthOperation, endAuthOperation, trackNetworkStatus },
        { monitorAuthFailure },
        { startUserJourney, endUserJourney, recordPerformance }
      ] = await Promise.all([
        import('@/lib/utils/authTracking'),
        import('@/lib/utils/authMonitoring'),
        import('@/lib/utils/userExperienceMetrics')
      ])
      trackingUtils = {
        startAuthOperation,
        endAuthOperation,
        trackNetworkStatus,
        monitorAuthFailure,
        startUserJourney,
        endUserJourney,
        recordPerformance
      }
      trackingInitialized = true
    } catch (error) {
      console.warn('Failed to load tracking utilities:', error)
      trackingUtils = null
      trackingInitialized = true // Don't try again
    }
  }
  return trackingUtils
}

interface SignInResult {
  success: boolean
  error?: AuthError
  user?: User
  profile?: Profile
}

interface SignUpResult {
  success: boolean
  error?: AuthError
  user?: User
}

interface SignOutResult {
  success: boolean
  error?: AuthError
}

interface ProfileResult {
  success: boolean
  error?: AuthError
  profile?: Profile
}

export class AuthManager {
  private static instance: AuthManager
  private authStateChangeListener: (() => void) | null = null
  private isInitialized = false
  private activeOperations = new Set<string>()

  // Request deduplication maps
  private profileRequests = new Map<string, Promise<ProfileResult>>()
  private authOperations = new Map<string, Promise<any>>()

  // CRITICAL: Circuit breaker for auth failures
  private failureCount = 0
  private lastFailureTime = 0
  private circuitBreakerThreshold = 5
  private circuitBreakerTimeout = 60000 // 1 minute

  // CRITICAL: Session recovery mechanism
  private sessionRecoveryAttempts = 0
  private maxSessionRecoveryAttempts = 3

  // CRITICAL: Health check mechanism
  private healthCheckInterval: NodeJS.Timeout | null = null
  private lastHealthCheck = 0
  private healthCheckFrequency = 300000 // 5 minutes

  private constructor() {}

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager()
    }
    return AuthManager.instance
  }

  /**
   * Initialize the auth manager - call once per app lifecycle
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('🔄 [AUTH_MANAGER] Already initialized, skipping')
      return
    }

    console.log('🚀 [AUTH_MANAGER] Initializing unified auth manager')

    try {
      await this.setupAuthStateListener()
      await this.initializeAuthState()
      this.startHealthCheck()
      this.isInitialized = true
      console.log('✅ [AUTH_MANAGER] Initialization complete with health monitoring')
    } catch (error) {
      console.error('❌ [AUTH_MANAGER] Initialization failed:', error)
      throw error
    }
  }

  /**
   * Clean up resources - BULLETPROOF VERSION
   */
  cleanup(): void {
    console.log('🧹 [AUTH_MANAGER] Starting comprehensive cleanup')

    // CRITICAL: Safe listener cleanup
    try {
      if (this.authStateChangeListener) {
        this.authStateChangeListener()
        this.authStateChangeListener = null
      }
    } catch (error) {
      console.error('❌ [AUTH_MANAGER] Error cleaning up auth listener:', error)
    }

    // CRITICAL: Clear all active operations safely
    try {
      this.activeOperations.clear()
    } catch (error) {
      console.error('❌ [AUTH_MANAGER] Error clearing active operations:', error)
    }

    // CRITICAL: Clear request maps with proper cleanup
    try {
      // Cancel any pending requests
      for (const [key, promise] of this.profileRequests.entries()) {
        try {
          // Note: We can't actually cancel promises, but we clear the map
          console.log('🧹 [AUTH_MANAGER] Clearing pending profile request:', key)
        } catch (requestError) {
          console.error('❌ [AUTH_MANAGER] Error clearing profile request:', requestError)
        }
      }
      this.profileRequests.clear()
    } catch (error) {
      console.error('❌ [AUTH_MANAGER] Error clearing profile requests:', error)
    }

    try {
      // Clear auth operations
      for (const [key, promise] of this.authOperations.entries()) {
        try {
          console.log('🧹 [AUTH_MANAGER] Clearing pending auth operation:', key)
        } catch (requestError) {
          console.error('❌ [AUTH_MANAGER] Error clearing auth operation:', requestError)
        }
      }
      this.authOperations.clear()
    } catch (error) {
      console.error('❌ [AUTH_MANAGER] Error clearing auth operations:', error)
    }

    // CRITICAL: Stop health check
    try {
      this.stopHealthCheck()
    } catch (error) {
      console.error('❌ [AUTH_MANAGER] Error stopping health check:', error)
    }

    // CRITICAL: Reset circuit breaker state
    try {
      this.failureCount = 0
      this.lastFailureTime = 0
      this.sessionRecoveryAttempts = 0
    } catch (error) {
      console.error('❌ [AUTH_MANAGER] Error resetting circuit breaker:', error)
    }

    // CRITICAL: Clear application state safely
    try {
      this.clearAuthState()
    } catch (error) {
      console.error('❌ [AUTH_MANAGER] Error clearing auth state during cleanup:', error)
    }

    this.isInitialized = false
    console.log('✅ [AUTH_MANAGER] Comprehensive cleanup complete')
  }

  // ==================== AUTHENTICATION OPERATIONS ====================

  /**
   * Unified sign in method - BULLETPROOF VERSION
   */
  async signIn(email: string, password: string): Promise<SignInResult> {
    const operationId = `signin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // CRITICAL: Input validation
    if (!email?.trim() || !password?.trim()) {
      console.error('❌ [AUTH_MANAGER] Invalid input parameters')
      return { success: false, error: AUTH_ERRORS[AUTH_ERROR_CODES.INVALID_CREDENTIALS] }
    }

    // CRITICAL: Circuit breaker check
    if (this.isCircuitBreakerOpen()) {
      console.error('❌ [AUTH_MANAGER] Circuit breaker open - too many failures')
      return { success: false, error: AUTH_ERRORS[AUTH_ERROR_CODES.SERVICE_UNAVAILABLE] }
    }

    // CRITICAL: Prevent concurrent operations
    const operationKey = `signin_${email}`
    if (this.activeOperations.has('signin') || this.authOperations.has(operationKey)) {
      console.log('🚫 [AUTH_MANAGER] Sign in already in progress for this email')
      return { success: false, error: AUTH_ERRORS[AUTH_ERROR_CODES.UNKNOWN_ERROR] }
    }

    this.activeOperations.add('signin')
    
    // CRITICAL: Deduplicate requests by email
    const existingOperation = this.authOperations.get(operationKey)
    if (existingOperation) {
      console.log('🔄 [AUTH_MANAGER] Reusing existing sign-in operation')
      return existingOperation
    }

    const authPromise = this.performSignIn(email, password, operationId)
    this.authOperations.set(operationKey, authPromise)

    // Cleanup after completion
    authPromise.finally(() => {
      this.authOperations.delete(operationKey)
    })

    return authPromise
  }

  /**
   * Perform the actual sign-in operation - BULLETPROOF VERSION
   */
  private async performSignIn(email: string, password: string, operationId: string): Promise<SignInResult> {
    // Start tracking and journey (lazy loaded to avoid circular dependencies)
    getTrackingUtils().then(utils => {
      if (utils) {
        utils.startAuthOperation('signin', undefined, { operationId, email: email.substring(0, 3) + '***' })
        utils.startUserJourney(operationId, 'signin', undefined, operationId)
      }
    }).catch(() => {
      // Silently fail if tracking is not available
    })

    console.log('🔑 [AUTH_MANAGER] Sign in initiated', { operationId, email: email.substring(0, 3) + '***' })

    const startTime = Date.now()

    try {
      const authStore = useAuthStore.getState()

      // CRITICAL: Enhanced state validation
      const currentUser = authStore.user
      if (currentUser && authStore.isAuthenticated && currentUser.email === email) {
        console.log('🚫 [AUTH_MANAGER] User already authenticated with same email')
        return { success: true, user: currentUser, profile: authStore.profile }
      }

      // CRITICAL: Clear any stale state for different user
      if (currentUser && currentUser.email !== email) {
        console.log('🧹 [AUTH_MANAGER] Clearing stale state for different user')
        this.clearAuthState()
      }

      // Set loading state with error recovery
      try {
        authStore.setLoading(true)
        authStore.setError(null)
      } catch (stateError) {
        console.error('❌ [AUTH_MANAGER] Failed to set loading state:', stateError)
        // Continue anyway - don't fail the entire operation
      }

      console.log('🔐 [AUTH_MANAGER] Calling Supabase signInWithPassword')

      let data, error
      try {
        const signInOperation = () => supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim()
        })

        // CRITICAL: Enhanced network resilience
        const result = await NetworkResilience.executeResiliently(
          signInOperation,
          'sign in',
          { timeout: 15000 }, // Increased timeout for reliability
          { maxRetries: 3 }    // More retries for better reliability
        )

        data = result.data
        error = result.error
      } catch (networkError) {
        console.error('❌ [AUTH_MANAGER] Network error during sign in:', networkError instanceof Error ? networkError.message : networkError)
        const authError = classifySupabaseError(networkError)
        
        // CRITICAL: Safe state cleanup
        try {
          authStore.setLoading(false)
        } catch (cleanupError) {
          console.error('❌ [AUTH_MANAGER] Failed to clear loading state:', cleanupError)
        }
        
        return { success: false, error: authError }
      }

      if (error) {
        console.error('❌ [AUTH_MANAGER] Supabase sign in failed:', error.message)
        const authError = classifySupabaseError(error)
        
        // CRITICAL: Safe state cleanup
        try {
          authStore.setLoading(false)
        } catch (cleanupError) {
          console.error('❌ [AUTH_MANAGER] Failed to clear loading state:', cleanupError)
        }
        
        return { success: false, error: authError }
      }

      // CRITICAL: Enhanced data validation
      if (!data?.user?.id || !data?.user?.email) {
        console.error('❌ [AUTH_MANAGER] Invalid user data received from Supabase:', data)
        try {
          authStore.setLoading(false)
        } catch (cleanupError) {
          console.error('❌ [AUTH_MANAGER] Failed to clear loading state:', cleanupError)
        }
        return { success: false, error: AUTH_ERRORS[AUTH_ERROR_CODES.UNKNOWN_ERROR] }
      }

      console.log('✅ [AUTH_MANAGER] User authenticated successfully', { userId: data.user.id, email: data.user.email })

      // CRITICAL: Safe state updates with error recovery
      try {
        authStore.setUser(data.user)
        authStore.setAuthenticated(true)
      } catch (stateError) {
        console.error('❌ [AUTH_MANAGER] Failed to set auth state:', stateError)
        // Try to recover by clearing state and retrying
        try {
          this.clearAuthState()
          authStore.setUser(data.user)
          authStore.setAuthenticated(true)
        } catch (recoveryError) {
          console.error('❌ [AUTH_MANAGER] Failed to recover auth state:', recoveryError)
          return { success: false, error: AUTH_ERRORS[AUTH_ERROR_CODES.UNKNOWN_ERROR] }
        }
      }

      // CRITICAL: Enhanced profile loading with fallback
      let profileResult: ProfileResult
      try {
        profileResult = await this.loadProfile(data.user.id, operationId)
      } catch (profileError) {
        console.error('❌ [AUTH_MANAGER] Profile loading threw error:', profileError)
        profileResult = { success: false, error: AUTH_ERRORS[AUTH_ERROR_CODES.PROFILE_CREATION_FAILED] }
      }

      if (!profileResult.success) {
        console.warn('⚠️ [AUTH_MANAGER] Profile load failed, attempting recovery', profileResult.error?.message)
        
        // CRITICAL: Try to create minimal profile as fallback
        try {
          const fallbackProfile = {
            id: data.user.id,
            display_name: data.user.email?.split('@')[0] || 'User',
            empathy_credits: 10,
            total_credits_earned: 10,
            total_credits_spent: 0,
            emotional_capacity: 'medium' as const,
            preferred_mode: 'both' as const,
            is_anonymous: false,
            last_active: new Date().toISOString()
          }
          
          authStore.setProfile(fallbackProfile)
          profileResult = { success: true, profile: fallbackProfile }
          console.log('✅ [AUTH_MANAGER] Created fallback profile')
        } catch (fallbackError) {
          console.error('❌ [AUTH_MANAGER] Fallback profile creation failed:', fallbackError)
          // Continue without profile - don't fail the entire auth
        }
      }

      // CRITICAL: Safe loading state cleanup
      try {
        authStore.setLoading(false)
      } catch (cleanupError) {
        console.error('❌ [AUTH_MANAGER] Failed to clear loading state:', cleanupError)
      }

      console.log('✅ [AUTH_MANAGER] Sign in completed successfully', { userId: data.user.id })

      // CRITICAL: Record success for circuit breaker
      this.recordSuccess()

      const duration = Date.now() - startTime

      // End tracking and journey (lazy loaded)
      getTrackingUtils().then(utils => {
        if (utils) {
          utils.recordPerformance('signin', duration, true, data.user.id)
          utils.endAuthOperation(operationId, 'signin', true, data.user.id, duration)
          utils.endUserJourney(operationId, 'success')
        }
      }).catch(() => {
        // Silently fail if tracking is not available
      })

      return {
        success: true,
        user: data.user,
        profile: profileResult.profile
      }

    } catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      const authError = error instanceof Error ? classifySupabaseError(error) : AUTH_ERRORS[AUTH_ERROR_CODES.UNKNOWN_ERROR]

      console.error('❌ [AUTH_MANAGER] Sign in failed:', { error: errorMessage, operationId, duration })

      // Track failure and monitor (lazy loaded)
      getTrackingUtils().then(utils => {
        if (utils) {
          utils.recordPerformance('signin', duration, false)
          utils.endAuthOperation(operationId, 'signin', false, undefined, duration, {
            code: authError.code,
            message: authError.message,
            canRetry: authError.canRetry
          })
          utils.endUserJourney(operationId, 'failure')
          utils.monitorAuthFailure(authError.code)
        }
      }).catch(() => {
        // Silently fail if tracking is not available
      })

      // CRITICAL: Safe state cleanup
      const authStore = useAuthStore.getState()
      try {
        authStore.setLoading(false)
      } catch (cleanupError) {
        console.error('❌ [AUTH_MANAGER] Failed to clear loading state in error handler:', cleanupError)
      }

      // CRITICAL: Record failure for circuit breaker
      this.recordFailure()

      return {
        success: false,
        error: authError
      }
    } finally {
      this.activeOperations.delete('signin')
    }
  }

  /**
   * CRITICAL: Circuit breaker methods for resilience
   */
  private isCircuitBreakerOpen(): boolean {
    const now = Date.now()
    
    // Reset circuit breaker if timeout has passed
    if (now - this.lastFailureTime > this.circuitBreakerTimeout) {
      this.failureCount = 0
      return false
    }
    
    return this.failureCount >= this.circuitBreakerThreshold
  }

  private recordFailure(): void {
    this.failureCount++
    this.lastFailureTime = Date.now()
    
    if (this.failureCount >= this.circuitBreakerThreshold) {
      console.warn('⚠️ [AUTH_MANAGER] Circuit breaker opened due to repeated failures')
    }
  }

  private recordSuccess(): void {
    this.failureCount = 0
    this.lastFailureTime = 0
  }

  /**
   * Unified sign up method
   */
  async signUp(email: string, password: string, displayName: string): Promise<SignUpResult> {
    const operationId = `signup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    if (this.activeOperations.has('signup')) {
      console.log('🚫 [AUTH_MANAGER] Sign up already in progress')
      return { success: false, error: 'Sign up already in progress' }
    }

    this.activeOperations.add('signup')
    console.log('📝 [AUTH_MANAGER_SIGNUP_START] Sign up initiated', {
      operationId,
      maskedEmail: email.replace(/(.{2}).*@/, '$1***@')
    })

    try {
      const authStore = useAuthStore.getState()

      authStore.setLoading(true)
      authStore.setError(null)

      console.log('🔐 [AUTH_MANAGER_SIGNUP_SUPABASE] Calling Supabase signUp', { operationId })
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName
          }
        }
      })

      if (error) {
        console.error('❌ [AUTH_MANAGER_SIGNUP_FAILED] Supabase sign up failed', {
          operationId,
          error: error.message,
          errorCode: error.status,
          fullError: error,
          errorType: typeof error,
          errorKeys: error ? Object.keys(error) : []
        })
        authStore.setLoading(false)
        
        // Extract error message properly
        let errorMessage = 'Signup failed'
        
        if (error.message) {
          errorMessage = error.message
        } else if (error.error_description) {
          errorMessage = error.error_description
        } else if (error.msg) {
          errorMessage = error.msg
        } else if (typeof error === 'string') {
          errorMessage = error
        } else {
          // Try to extract meaningful message from error object
          const errorStr = JSON.stringify(error)
          if (errorStr.includes('already registered') || errorStr.includes('already in use')) {
            errorMessage = 'User already registered'
          } else if (errorStr.includes('password')) {
            errorMessage = 'Password does not meet requirements'
          } else if (errorStr.includes('email')) {
            errorMessage = 'Invalid email address'
          }
        }
        
        console.log('🔍 [AUTH_MANAGER_SIGNUP_ERROR] Returning error message:', errorMessage)
        return { success: false, error: errorMessage }
      }

      if (data.user) {
        console.log('👤 [AUTH_MANAGER_SIGNUP_USER_SET] Setting user data', {
          operationId,
          userId: data.user.id,
          userEmail: data.user.email,
          needsEmailConfirmation: !data.session,
          identitiesLength: data.user.identities?.length || 0
        })

        // Check if user has no identities (indicates email already registered)
        if (data.user.identities && data.user.identities.length === 0) {
          console.log('⚠️ [AUTH_MANAGER_SIGNUP_DUPLICATE] Empty identities array - email already registered')
          authStore.setLoading(false)
          return { success: false, error: 'User already registered' }
        }

        // Set user data (but not authenticated until email confirmed)
        authStore.setUser(data.user)
        authStore.setAuthenticated(!!data.session)
        authStore.setLoading(false)

        console.log('✅ [AUTH_MANAGER_SIGNUP_SUCCESS] Sign up completed successfully', {
          operationId,
          userId: data.user.id,
          emailConfirmed: !!data.session
        })

        return {
          success: true,
          user: data.user
        }
      }

      authStore.setLoading(false)
      return { success: false, error: 'No user data received' }

    } catch (error) {
      console.error('❌ [AUTH_MANAGER_SIGNUP_EXCEPTION] Sign up exception', {
        operationId,
        error: error instanceof Error ? error.message : error
      })

      const authStore = useAuthStore.getState()
      authStore.setLoading(false)

      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    } finally {
      this.activeOperations.delete('signup')
    }
  }

  /**
   * Unified sign out method - single source of truth
   * Handles all cleanup but does NOT handle redirects (let caller handle that)
   */
  async signOut(): Promise<SignOutResult> {
    const operationId = `signout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    if (this.activeOperations.has('signout')) {
      console.log('🚫 [AUTH_MANAGER] Sign out already in progress')
      return { success: false, error: 'Sign out already in progress' }
    }

    this.activeOperations.add('signout')
    console.log('🚪 [AUTH_MANAGER_SIGNOUT_START] Sign out initiated', { operationId })

    try {
      const authStore = useAuthStore.getState()
      const profileStore = useProfileStore.getState()

      // Log pre-sign-out state
      const preAuthState = authStore
      const preProfileState = profileStore.profile

      console.log('📊 [AUTH_MANAGER_SIGNOUT_PRE_STATE] Pre-sign-out state', {
        operationId,
        hasUser: !!preAuthState.user,
        isAuthenticated: preAuthState.isAuthenticated,
        hasProfile: !!preProfileState,
        userId: preAuthState.user?.id
      })

      // Prevent sign out if already signed out
      if (!preAuthState.user) {
        console.log('🚪 [AUTH_MANAGER_SIGNOUT_ALREADY_SIGNED_OUT] Already signed out', { operationId })
        return { success: true }
      }

      authStore.setLoading(true)

      // Sign out from Supabase with network resilience
      console.log('🔐 [AUTH_MANAGER_SIGNOUT_SUPABASE] Calling Supabase signOut', { operationId })

      let error
      try {
        const signOutOperation = () => supabase.auth.signOut()

        const result = await NetworkResilience.executeResiliently(
          signOutOperation,
          'sign out',
          { timeout: 8000 }, // 8 second timeout for sign out
          { maxRetries: 1 }  // Retry once on failure
        )

        error = result.error
      } catch (networkError) {
        console.error('❌ [AUTH_MANAGER_SIGNOUT_NETWORK_FAILED] Network error during sign out', {
          operationId,
          error: networkError instanceof Error ? networkError.message : networkError
        })

        // Even if sign out fails due to network, we should still clear local state
        console.log('🧹 [AUTH_MANAGER_SIGNOUT_NETWORK_FALLBACK] Clearing local state despite network error', { operationId })
        await this.clearAllState(operationId)
        authStore.setLoading(false)

        return {
          success: true,
          error: AUTH_ERRORS[AUTH_ERROR_CODES.SIGN_OUT_FAILED]
        }
      }

      if (error) {
        console.error('❌ [AUTH_MANAGER_SIGNOUT_SUPABASE_ERROR] Supabase sign out failed', {
          operationId,
          error: error.message,
          errorCode: error.status
        })

        // For non-critical errors, still clear local state
        if (error.status !== 401 && error.status !== 403) {
          console.log('🧹 [AUTH_MANAGER_SIGNOUT_ERROR_FALLBACK] Clearing local state despite error', { operationId })
          await this.clearAllState(operationId)
        }

        authStore.setLoading(false)
        return { success: false, error: classifySupabaseError(error) }
      }

      console.log('✅ [AUTH_MANAGER_SIGNOUT_SUPABASE_SUCCESS] Supabase sign out successful', { operationId })

      // Clear all application state
      await this.clearAllState(operationId)

      console.log('✅ [AUTH_MANAGER_SIGNOUT_SUCCESS] Sign out completed successfully', { operationId })

      return { success: true }

    } catch (error) {
      console.error('❌ [AUTH_MANAGER_SIGNOUT_EXCEPTION] Sign out exception', {
        operationId,
        error: error instanceof Error ? error.message : error
      })

      const authStore = useAuthStore.getState()
      authStore.setLoading(false)

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign out failed'
      }
    } finally {
      this.activeOperations.delete('signout')
    }
  }

  /**
   * Refresh session - BULLETPROOF VERSION
   */
  async refreshSession(): Promise<{ success: boolean; error?: string }> {
    const operationId = `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    if (this.activeOperations.has('refresh')) {
      console.log('🚫 [AUTH_MANAGER] Session refresh already in progress')
      return { success: false, error: 'Session refresh already in progress' }
    }

    // CRITICAL: Check circuit breaker for session operations
    if (this.isCircuitBreakerOpen()) {
      console.error('❌ [AUTH_MANAGER] Circuit breaker open - session refresh blocked')
      return { success: false, error: 'Service temporarily unavailable' }
    }

    this.activeOperations.add('refresh')
    console.log('🔄 [AUTH_MANAGER] Session refresh initiated', { operationId, attempt: this.sessionRecoveryAttempts + 1 })

    try {
      const authStore = useAuthStore.getState()

      console.log('🔐 [AUTH_MANAGER] Calling Supabase getSession', { operationId })
      
      // CRITICAL: Enhanced session retrieval with network resilience
      let data, error
      try {
        const sessionOperation = () => supabase.auth.getSession()
        
        const result = await NetworkResilience.executeResiliently(
          sessionOperation,
          'session refresh',
          { timeout: 10000 }, // 10 second timeout
          { maxRetries: 2 }   // Retry once
        )
        
        data = result.data
        error = result.error
      } catch (networkError) {
        console.error('❌ [AUTH_MANAGER] Network error during session refresh:', networkError)
        this.recordFailure()
        return { success: false, error: 'Network error during session refresh' }
      }

      if (error) {
        console.error('❌ [AUTH_MANAGER] Session refresh failed:', {
          operationId,
          error: error.message,
          attempt: this.sessionRecoveryAttempts + 1
        })
        
        this.sessionRecoveryAttempts++
        
        // CRITICAL: Attempt session recovery if under max attempts
        if (this.sessionRecoveryAttempts < this.maxSessionRecoveryAttempts) {
          console.log('🔄 [AUTH_MANAGER] Attempting session recovery', { 
            attempt: this.sessionRecoveryAttempts,
            maxAttempts: this.maxSessionRecoveryAttempts 
          })
          
          // Try to recover by clearing state and re-initializing
          try {
            this.clearAuthState()
            await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
            return this.refreshSession() // Recursive retry
          } catch (recoveryError) {
            console.error('❌ [AUTH_MANAGER] Session recovery failed:', recoveryError)
          }
        }
        
        this.recordFailure()
        return { success: false, error: error.message }
      }

      // CRITICAL: Enhanced session validation
      if (data?.session?.user?.id && data?.session?.user?.email) {
        console.log('✅ [AUTH_MANAGER] Session refreshed successfully', {
          operationId,
          userId: data.session.user.id,
          email: data.session.user.email
        })

        // CRITICAL: Safe state updates with error recovery
        try {
          authStore.setUser(data.session.user)
          authStore.setAuthenticated(true)
        } catch (stateError) {
          console.error('❌ [AUTH_MANAGER] Failed to update auth state during refresh:', stateError)
          // Try recovery
          try {
            this.clearAuthState()
            authStore.setUser(data.session.user)
            authStore.setAuthenticated(true)
          } catch (recoveryError) {
            console.error('❌ [AUTH_MANAGER] Failed to recover auth state during refresh:', recoveryError)
            return { success: false, error: 'Failed to update authentication state' }
          }
        }

        // CRITICAL: Enhanced profile refresh with fallback
        try {
          const profileResult = await this.loadProfile(data.session.user.id, operationId)
          if (profileResult.success && profileResult.profile) {
            authStore.setProfile(profileResult.profile)
          } else {
            console.warn('⚠️ [AUTH_MANAGER] Profile refresh failed during session refresh')
            // Don't fail the entire session refresh for profile issues
          }
        } catch (profileError) {
          console.error('❌ [AUTH_MANAGER] Profile refresh threw error:', profileError)
          // Don't fail the entire session refresh for profile issues
        }

        // Reset recovery attempts on success
        this.sessionRecoveryAttempts = 0
        this.recordSuccess()
        
        return { success: true }
      } else {
        console.log('ℹ️ [AUTH_MANAGER] No valid session found', { operationId })
        this.clearAuthState()
        this.sessionRecoveryAttempts = 0
        return { success: true } // Not an error, just no session
      }

    } catch (error) {
      console.error('❌ [AUTH_MANAGER] Session refresh exception:', {
        operationId,
        error: error instanceof Error ? error.message : error,
        attempt: this.sessionRecoveryAttempts + 1
      })
      
      this.sessionRecoveryAttempts++
      this.recordFailure()
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Session refresh failed'
      }
    } finally {
      this.activeOperations.delete('refresh')
    }
  }

  // ==================== PROFILE MANAGEMENT ====================

  /**
   * Load user profile with deduplication and error handling
   */
  async loadProfile(userId: string, operationId?: string): Promise<ProfileResult> {
    const opId = operationId || `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const requestKey = `profile_${userId}`

    // Check for existing request
    const existingRequest = this.profileRequests.get(requestKey)
    if (existingRequest) {
      console.log('👤 [AUTH_MANAGER_PROFILE_DEDUPE] Reusing existing profile request', {
        opId,
        userId,
        requestKey
      })
      return existingRequest
    }

    // Create new request
    const profilePromise = this.performProfileLoad(userId, opId)
    this.profileRequests.set(requestKey, profilePromise)

    // Clean up after completion
    profilePromise.finally(() => {
      this.profileRequests.delete(requestKey)
    })

    return profilePromise
  }

  /**
   * Perform the actual profile loading
   */
  private async performProfileLoad(userId: string, operationId: string): Promise<ProfileResult> {
    console.log('👤 [AUTH_MANAGER_PROFILE_LOAD_START] Loading profile', {
      operationId,
      userId
    })

    try {
      const authStore = useAuthStore.getState()
      const profileStore = useProfileStore.getState()

      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (existingProfile && !fetchError) {
        console.log('✅ [AUTH_MANAGER_PROFILE_LOAD_FOUND] Found existing profile', {
          operationId,
          profileId: existingProfile.id
        })

        authStore.setProfile(existingProfile)
        profileStore.setProfile(existingProfile)

        return { success: true, profile: existingProfile }
      }

      // Profile doesn't exist, create it
      if (fetchError?.code === 'PGRST116') {
        console.log('📝 [AUTH_MANAGER_PROFILE_LOAD_CREATE] Creating new profile', {
          operationId,
          userId
        })

        const newProfileData = {
          id: userId,
          display_name: authStore.user?.user_metadata?.display_name ||
                       authStore.user?.user_metadata?.full_name ||
                       authStore.user?.user_metadata?.name ||
                       authStore.user?.email?.split('@')[0] ||
                       'User',
          username: null,
          avatar_url: authStore.user?.user_metadata?.avatar_url || null,
          bio: null,
          empathy_credits: 10,
          total_credits_earned: 10,
          total_credits_spent: 0,
          emotional_capacity: 'medium' as const,
          preferred_mode: 'both' as const,
          is_anonymous: false,
          last_active: new Date().toISOString()
        }

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfileData)
          .select()
          .single()

        if (createError) {
          console.error('❌ [AUTH_MANAGER_PROFILE_LOAD_CREATE_ERROR] Profile creation failed', {
            operationId,
            error: createError.message
          })
          return { success: false, error: createError.message }
        }

        console.log('✅ [AUTH_MANAGER_PROFILE_LOAD_CREATED] Profile created successfully', {
          operationId,
          profileId: createdProfile.id
        })

        authStore.setProfile(createdProfile)
        profileStore.setProfile(createdProfile)

        return { success: true, profile: createdProfile }
      }

      // Other error
      console.error('❌ [AUTH_MANAGER_PROFILE_LOAD_ERROR] Profile fetch error', {
        operationId,
        error: fetchError?.message
      })

      return { success: false, error: fetchError?.message || 'Failed to load profile' }

    } catch (error) {
      console.error('❌ [AUTH_MANAGER_PROFILE_LOAD_EXCEPTION] Profile load exception', {
        operationId,
        error: error instanceof Error ? error.message : error
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Profile load failed'
      }
    }
  }

  // ==================== PRIVATE HELPER METHODS ====================

  /**
   * Set up auth state change listener
   */
  private async setupAuthStateListener(): Promise<void> {
    console.log('🔄 [AUTH_MANAGER_LISTENER_SETUP] Setting up auth state change listener')

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const listenerId = `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        console.log('🔄 [AUTH_MANAGER_LISTENER_EVENT] Auth state change detected', {
          listenerId,
          event,
          hasSession: !!session,
          sessionUserId: session?.user?.id,
          sessionUserEmail: session?.user?.email
        })

        const authStore = useAuthStore.getState()

        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              console.log('👤 AUTH DEBUG: Auth listener processing SIGNED_IN event', {
                listenerId,
                userId: session.user.id
              })

              // Check if this is a programmatic sign-in (don't duplicate state updates)
              const currentUser = authStore.user
              const isAlreadyAuthenticated = authStore.isAuthenticated

              if (!currentUser || !isAlreadyAuthenticated || currentUser.id !== session.user.id) {
                console.log('✅ AUTH DEBUG: Auth listener setting user state (first time)', {
                  listenerId,
                  userId: session.user.id,
                  isNewUser: !currentUser || currentUser.id !== session.user.id
                })
                // Only set state if we're not already authenticated with this user (prevents duplicate updates)
                authStore.setUser(session.user)
                authStore.setAuthenticated(true)
                authStore.setLoading(false)

                // Load profile only if we don't already have one for this user
                if (!currentUser || currentUser.id !== session.user.id) {
                  const profileResult = await this.loadProfile(session.user.id, listenerId)
                  if (!profileResult.success) {
                    console.warn('⚠️ [AUTH_MANAGER_LISTENER_PROFILE_WARN] Profile load failed in listener', {
                      listenerId,
                      error: profileResult.error
                    })
                  }
                }
              } else {
                // User is already authenticated, just ensure loading is false
                authStore.setLoading(false)
                console.log('ℹ️ AUTH DEBUG: Auth listener skipping duplicate state update (user already authenticated)', {
                  listenerId,
                  currentUserId: currentUser.id
                })
              }
            }
            break

          case 'SIGNED_OUT':
            console.log('🚪 [AUTH_MANAGER_LISTENER_SIGNED_OUT] Processing sign out event', { listenerId })
            this.clearAuthState()
            break

          case 'TOKEN_REFRESHED':
            if (session?.user) {
              console.log('🔄 [AUTH_MANAGER_LISTENER_TOKEN_REFRESH] Processing token refresh', {
                listenerId,
                userId: session.user.id
              })

              authStore.setUser(session.user)
              authStore.setAuthenticated(true)
            }
            break

          default:
            console.log('ℹ️ [AUTH_MANAGER_LISTENER_IGNORED] Ignoring unhandled auth event', {
              listenerId,
              event
            })
        }
      }
    )

    this.authStateChangeListener = () => subscription.unsubscribe()
  }

  /**
   * Initialize auth state on app startup
   */
  private async initializeAuthState(): Promise<void> {
    console.log('🚀 [AUTH_MANAGER_INIT_STATE] Initializing auth state')

    const authStore = useAuthStore.getState()

    try {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error('❌ [AUTH_MANAGER_INIT_ERROR] Session check failed:', error.message)
        authStore.setLoading(false)
        authStore.setInitialized(true)
        return
      }

      if (data.session?.user) {
        console.log('✅ [AUTH_MANAGER_INIT_SESSION_FOUND] Found active session', {
          userId: data.session.user.id
        })

        authStore.setUser(data.session.user)
        authStore.setAuthenticated(true)

        // Load profile
        const profileResult = await this.loadProfile(data.session.user.id, 'init')
        if (!profileResult.success) {
          console.warn('⚠️ [AUTH_MANAGER_INIT_PROFILE_WARN] Profile load failed during init', {
            error: profileResult.error
          })
        }
      } else {
        console.log('ℹ️ [AUTH_MANAGER_INIT_NO_SESSION] No active session')
        this.clearAuthState()
      }

      authStore.setLoading(false)
      authStore.setInitialized(true)

    } catch (error) {
      console.error('❌ [AUTH_MANAGER_INIT_EXCEPTION] Initialization exception:', error)
      authStore.setLoading(false)
      authStore.setInitialized(true)
    }
  }

  /**
   * Clear all authentication state
   */
  private clearAuthState(): void {
    console.log('🧹 [AUTH_MANAGER_CLEAR_STATE] Clearing auth state')

    const authStore = useAuthStore.getState()
    const profileStore = useProfileStore.getState()
    const assessmentStore = useAssessmentStore.getState()
    const chatStore = useChatStore.getState()

    authStore.reset()
    profileStore.clearProfile()
    assessmentStore.resetAssessmentState()
    chatStore.resetChatState()
  }

  /**
   * Clear all state and persisted data
   */
  private async clearAllState(operationId: string): Promise<void> {
    console.log('🧹 [AUTH_MANAGER_CLEAR_ALL_START] Clearing all state', { operationId })

    // Clear in-memory state
    this.clearAuthState()

    // Clear persisted state
    if (typeof window !== 'undefined') {
      try {
        console.log('🗑️ [AUTH_MANAGER_CLEAR_STORAGE] Clearing localStorage', { operationId })

        // Clear auth-related keys
        const keysToRemove = Object.keys(localStorage).filter(key =>
          key.startsWith('zustand-') ||
          key.includes('auth') ||
          key.includes('profile') ||
          key.includes('assessment') ||
          key.includes('chat') ||
          key.includes('mindwell')
        )

        console.log('📋 [AUTH_MANAGER_CLEAR_STORAGE_KEYS] Keys to remove', {
          operationId,
          keys: keysToRemove
        })

        keysToRemove.forEach(key => {
          localStorage.removeItem(key)
        })

        // Clear Supabase cookies
        document.cookie.split(';').forEach(cookie => {
          const eqPos = cookie.indexOf('=')
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
          if (name.startsWith('sb-') || name.includes('supabase')) {
            console.log('🍪 [AUTH_MANAGER_CLEAR_COOKIE] Removing cookie', {
              operationId,
              name
            })
            document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'
          }
        })

        console.log('✅ [AUTH_MANAGER_CLEAR_STORAGE_COMPLETE] Storage cleanup complete', { operationId })

      } catch (error) {
        console.warn('⚠️ [AUTH_MANAGER_CLEAR_STORAGE_ERROR] Storage cleanup failed', {
          operationId,
          error: error instanceof Error ? error.message : error
        })
      }
    }

    console.log('✅ [AUTH_MANAGER_CLEAR_ALL_COMPLETE] All state cleared', { operationId })
  }

  // ==================== HEALTH CHECK AND RECOVERY ====================

  /**
   * Start periodic health checks
   */
  private startHealthCheck(): void {
    if (typeof window === 'undefined') return // Skip on server-side

    console.log('💓 [AUTH_MANAGER] Starting health check monitoring')
    
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck().catch(error => {
        console.error('❌ [AUTH_MANAGER] Health check failed:', error)
      })
    }, this.healthCheckFrequency)

    // Perform initial health check
    this.performHealthCheck().catch(error => {
      console.error('❌ [AUTH_MANAGER] Initial health check failed:', error)
    })
  }

  /**
   * Stop health checks
   */
  private stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
      console.log('💓 [AUTH_MANAGER] Health check monitoring stopped')
    }
  }

  /**
   * Perform comprehensive health check
   */
  private async performHealthCheck(): Promise<void> {
    const now = Date.now()
    this.lastHealthCheck = now

    console.log('💓 [AUTH_MANAGER] Performing health check')

    try {
      const authStore = useAuthStore.getState()
      
      // Check if user claims to be authenticated but session is invalid
      if (authStore.isAuthenticated && authStore.user) {
        try {
          const sessionResult = await this.refreshSession()
          
          if (!sessionResult.success) {
            console.warn('⚠️ [AUTH_MANAGER] Health check detected invalid session, clearing state')
            this.clearAuthState()
          } else {
            console.log('✅ [AUTH_MANAGER] Health check passed - session is valid')
          }
        } catch (error) {
          console.error('❌ [AUTH_MANAGER] Health check session validation failed:', error)
          // Clear state if we can't validate the session
          this.clearAuthState()
        }
      } else {
        console.log('ℹ️ [AUTH_MANAGER] Health check - no authenticated user')
      }

      // Check for memory leaks in request maps
      if (this.profileRequests.size > 50) {
        console.warn('⚠️ [AUTH_MANAGER] Health check detected potential memory leak in profile requests')
        this.profileRequests.clear()
      }

      if (this.authOperations.size > 20) {
        console.warn('⚠️ [AUTH_MANAGER] Health check detected potential memory leak in auth operations')
        this.authOperations.clear()
      }

      // Reset circuit breaker if it's been open for too long
      if (this.isCircuitBreakerOpen() && (now - this.lastFailureTime) > (this.circuitBreakerTimeout * 2)) {
        console.log('🔄 [AUTH_MANAGER] Health check resetting circuit breaker after extended timeout')
        this.failureCount = 0
        this.lastFailureTime = 0
      }

    } catch (error) {
      console.error('❌ [AUTH_MANAGER] Health check failed:', error)
    }
  }

  /**
   * Get health status
   */
  getHealthStatus(): {
    isHealthy: boolean
    lastHealthCheck: number
    circuitBreakerOpen: boolean
    activeOperations: number
    pendingRequests: number
  } {
    return {
      isHealthy: this.isInitialized && !this.isCircuitBreakerOpen(),
      lastHealthCheck: this.lastHealthCheck,
      circuitBreakerOpen: this.isCircuitBreakerOpen(),
      activeOperations: this.activeOperations.size,
      pendingRequests: this.profileRequests.size + this.authOperations.size
    }
  }
}

// Export singleton instance
export const authManager = AuthManager.getInstance()
