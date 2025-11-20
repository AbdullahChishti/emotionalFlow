/**
 * Authentication Service
 * Handles all authentication operations with Supabase integration
 */

import { createClient } from '@supabase/supabase-js'
import { User, Profile } from '@/types'
import { classifySupabaseError, AUTH_ERROR_CODES, AUTH_ERRORS, type AuthError as AuthErrorType } from '@/lib/constants/auth-errors'
import { createLogger } from '@/lib/utils/logger'

// Create scoped logger for this service
const logger = createLogger('AuthService')

// Custom error classes (simplified versions)
export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export interface SignInResult {
  success: boolean
  user?: User
  error?: AuthErrorType
}

export interface SignUpResult {
  success: boolean
  user?: User
  error?: AuthErrorType
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export class AuthService {
  /**
   * Log operation for debugging
   */
  private logOperation(operation: string, data?: any): void {
    // Logging removed for production
  }

  /**
   * Validate required fields
   */
  private validateRequired(data: Record<string, any>, fields: string[]): void {
    for (const field of fields) {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        throw new ValidationError(`${field} is required`)
      }
    }
  }

  /**
   * Validate email format
   */
  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new ValidationError('Please enter a valid email address')
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<SignInResult> {
    const operationId = Math.random().toString(36).substr(2, 9)
    // Debug logging removed for production

    this.logOperation('signIn', { email: email.substring(0, 3) + '***' })

    // Validate inputs
    try {
      this.validateRequired({ email, password }, ['email', 'password'])
      this.validateEmail(email)

      if (password.length < 6) {
        const error = AUTH_ERRORS[AUTH_ERROR_CODES.INVALID_CREDENTIALS]
        return { success: false, error }
      }
    } catch (validationError) {
      const error = AUTH_ERRORS[AUTH_ERROR_CODES.INVALID_CREDENTIALS]
      return { success: false, error }
    }

    // Execute sign in with Supabase
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        const authError = classifySupabaseError(error)
        return { success: false, error: authError }
      }

      if (!data.user) {
        const authError = AUTH_ERRORS[AUTH_ERROR_CODES.UNKNOWN_ERROR]
        return { success: false, error: authError }
      }

      this.logOperation('signIn.success', { userId: data.user.id })
      return { success: true, user: data.user as unknown as User }
    } catch (error) {
      const authError = classifySupabaseError(error)
      return { success: false, error: authError }
    }
  }

  /**
   * Sign up new user
   */
  async signUp(email: string, password: string, displayName: string): Promise<SignUpResult> {
    const operationId = Math.random().toString(36).substr(2, 9)
    // Debug logging removed for production

    this.logOperation('signUp', { email: email.substring(0, 3) + '***' })

    // Validate inputs
    try {
      this.validateRequired({ email, password, displayName }, ['email', 'password', 'displayName'])
      this.validateEmail(email)

      if (password.length < 6) {
        const error = AUTH_ERRORS[AUTH_ERROR_CODES.INVALID_CREDENTIALS]
        return { success: false, error }
      }

      if (displayName.length < 2) {
        const error = AUTH_ERRORS[AUTH_ERROR_CODES.INVALID_CREDENTIALS]
        return { success: false, error }
      }
    } catch (validationError) {
      const error = AUTH_ERRORS[AUTH_ERROR_CODES.INVALID_CREDENTIALS]
      return { success: false, error }
    }

    // Execute sign up with Supabase
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) {
        const authError = classifySupabaseError(error)
        return { success: false, error: authError }
      }

      if (!data.user) {
        const authError = AUTH_ERRORS[AUTH_ERROR_CODES.UNKNOWN_ERROR]
        return { success: false, error: authError }
      }

      this.logOperation('signUp.success', { userId: data.user.id })
      return { success: true, user: data.user as unknown as User }
    } catch (error) {
      const authError = classifySupabaseError(error)
      return { success: false, error: authError }
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    this.logOperation('signOut')

    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw new AuthError(error.message)
      }

      this.logOperation('signOut.success')
    } catch (error) {
      throw error
    }
  }

  /**
   * Get current session
   */
  async getCurrentSession(): Promise<{ user: User; session: any } | null> {
    const operationId = Math.random().toString(36).substr(2, 9)
    
    logger.debug('getCurrentSession started', { operationId })
    
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Session check timeout')), 10000)
      )

      const sessionPromise = supabase.auth.getSession()
      const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any

      logger.debug('Supabase getSession result', {
        operationId,
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id
      })

      if (error) {
        logger.error('Session error', { operationId, error: error.message })
        return null
      }

      if (!session?.user) {
        logger.debug('No user in session', { operationId })
        return null
      }

      logger.debug('Session retrieved successfully', { operationId, userId: session.user.id })
      
      return {
        user: session.user as unknown as User,
        session
      }
    } catch (error) {
      logger.error('getCurrentSession error', {
        operationId,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return null
    }
  }

  /**
   * Refresh current session
   */
  async refreshSession(): Promise<User | null> {
    this.logOperation('refreshSession')

    try {
      const { data: { session }, error } = await supabase.auth.refreshSession()

      if (error) {
        this.logOperation('refreshSession.failed', { error: error.message })
        return null
      }

      if (!session?.user) {
        this.logOperation('refreshSession.noUser')
        return null
      }

      this.logOperation('refreshSession.success', { userId: session.user.id })
      return session.user as unknown as User
    } catch (error) {
      this.logOperation('refreshSession.failed', { error })
      return null
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getCurrentSession()
    return !!session
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    const operationId = Math.random().toString(36).substr(2, 9)

    logger.debug('getCurrentUser started', { operationId })

    try {
      const session = await this.getCurrentSession()
      const user = session?.user || null

      logger.debug('getCurrentUser result', {
        operationId,
        hasSession: !!session,
        hasUser: !!user,
        userId: user?.id
      })

      return user
    } catch (error) {
      logger.error('getCurrentUser error', {
        operationId,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return null
    }
  }

  /**
   * Sign in with OAuth provider
   */
  async signInWithOAuth(provider: 'google' | 'github' | 'discord' | 'gitlab' | 'apple'): Promise<{ success: boolean; error?: string }> {
    this.logOperation('signInWithOAuth', { provider })

    // Validate provider
    const validProviders = ['google', 'github', 'discord', 'gitlab', 'apple']
    if (!validProviders.includes(provider)) {
      throw new ValidationError('Invalid OAuth provider')
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider
      })

      if (error) {
        this.logOperation('signInWithOAuth.failed', { provider, error: error.message })
        return { success: false, error: error.message }
      }

      this.logOperation('signInWithOAuth.success', { provider })
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'OAuth sign-in failed'
      this.logOperation('signInWithOAuth.failed', { provider, error: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Request password reset
   */
  async resetPasswordForEmail(email: string): Promise<{ success: boolean; error?: string }> {
    this.logOperation('resetPasswordForEmail', { email: email.substring(0, 3) + '***' })

    // Validate inputs
    this.validateRequired({ email }, ['email'])
    this.validateEmail(email)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
      })

      if (error) {
        this.logOperation('resetPasswordForEmail.failed', { email: email.substring(0, 3) + '***', error: error.message })
        return { success: false, error: error.message }
      }

      this.logOperation('resetPasswordForEmail.success', { email: email.substring(0, 3) + '***' })
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send password reset email'
      this.logOperation('resetPasswordForEmail.failed', { email: email.substring(0, 3) + '***', error: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Update user password
   */
  async updatePassword(password: string): Promise<{ success: boolean; error?: string }> {
    this.logOperation('updatePassword')

    // Validate inputs
    this.validateRequired({ password }, ['password'])

    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters long')
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password
      })

      if (error) {
        this.logOperation('updatePassword.failed', { error: error.message })
        return { success: false, error: error.message }
      }

      this.logOperation('updatePassword.success')
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update password'
      this.logOperation('updatePassword.failed', { error: errorMessage })
      return { success: false, error: errorMessage }
    }
  }
}

// Export singleton instance
export const authService = new AuthService()