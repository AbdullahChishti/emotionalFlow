/**
 * Resilient API Wrapper
 * Provides network-resilient API calls with automatic retry and auth validation
 */

import { AuthUtils } from './auth-utils'

interface ApiOptions {
  maxRetries?: number
  baseDelay?: number
  validateAuth?: boolean
  timeout?: number
}

interface ApiResponse<T> {
  data: T | null
  error: Error | null
  retryCount: number
}

export class ResilientApi {
  /**
   * Make a resilient API call with automatic retry and auth validation
   */
  static async call<T>(
    operation: () => Promise<T>,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    console.log(`🔍 RESILIENT API TRACE: call() starting`, {
      maxRetries: options.maxRetries,
      baseDelay: options.baseDelay,
      validateAuth: options.validateAuth,
      timeout: options.timeout
    })
    
    const {
      maxRetries = 3,
      baseDelay = 1000,
      validateAuth = true,
      timeout = 30000
    } = options

    let retryCount = 0
    let lastError: Error

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      console.log(`🔍 RESILIENT API TRACE: Attempt ${attempt + 1}/${maxRetries}`)
      
      try {
        // Validate auth if required
        if (validateAuth) {
          console.log(`🔍 RESILIENT API TRACE: Validating authentication...`)
          const authValid = await AuthUtils.validateAndRefresh()
          console.log(`🔍 RESILIENT API TRACE: Auth validation result:`, authValid)
          if (!authValid) {
            throw new Error('Authentication failed - please log in again')
          }
        }

        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), timeout)
        })

        console.log(`🔍 RESILIENT API TRACE: Executing operation...`)
        // Race between operation and timeout
        const result = await Promise.race([operation(), timeoutPromise])

        console.log(`🔍 RESILIENT API TRACE: Operation completed successfully:`, {
          hasResult: !!result,
          resultType: typeof result,
          resultKeys: result && typeof result === 'object' ? Object.keys(result) : 'not an object'
        })

        return {
          data: result,
          error: null,
          retryCount
        }
      } catch (error) {
        lastError = error as Error
        retryCount = attempt + 1

        console.warn(`🔍 RESILIENT API TRACE: Attempt ${retryCount} failed:`, {
          error,
          errorMessage: error?.message,
          errorStack: error?.stack?.split('\n').slice(0, 3),
          errorType: typeof error,
          errorConstructor: error?.constructor?.name
        })

        // Don't retry on auth errors
        if (error instanceof Error && error.message.includes('Authentication failed')) {
          console.log(`🔍 RESILIENT API TRACE: Auth error detected, not retrying`)
          break
        }

        // Don't retry on timeout errors
        if (error instanceof Error && error.message.includes('Request timeout')) {
          console.log(`🔍 RESILIENT API TRACE: Timeout error detected, not retrying`)
          break
        }

        // Don't retry on the last attempt
        if (attempt === maxRetries - 1) {
          console.log(`🔍 RESILIENT API TRACE: Last attempt reached, not retrying`)
          break
        }

        // Wait before retry with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000
        console.log(`🔍 RESILIENT API TRACE: Waiting ${delay}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    console.log(`🔍 RESILIENT API TRACE: All attempts failed, returning error:`, {
      error: lastError,
      errorMessage: lastError?.message,
      retryCount
    })

    return {
      data: null,
      error: lastError!,
      retryCount
    }
  }

  /**
   * Make a resilient fetch request
   */
  static async fetch<T>(
    url: string,
    options: RequestInit = {},
    apiOptions: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.call(async () => {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return response.json()
    }, apiOptions)
  }

  /**
   * Make a resilient Supabase operation
   */
  static async supabase<T>(
    operation: () => Promise<{ data: T; error: any }>,
    apiOptions: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.call(async () => {
      const { data, error } = await operation()

      if (error) {
        throw new Error(error.message || 'Supabase operation failed')
      }

      return data
    }, apiOptions)
  }
}
