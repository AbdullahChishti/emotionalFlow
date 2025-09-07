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
    const {
      maxRetries = 3,
      baseDelay = 1000,
      validateAuth = true,
      timeout = 30000
    } = options

    let retryCount = 0
    let lastError: Error

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Validate auth if required
        if (validateAuth) {
          const authValid = await AuthUtils.validateAndRefresh()
          if (!authValid) {
            throw new Error('Authentication failed - please log in again')
          }
        }

        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), timeout)
        })

        // Race between operation and timeout
        const result = await Promise.race([operation(), timeoutPromise])

        return {
          data: result,
          error: null,
          retryCount
        }
      } catch (error) {
        lastError = error as Error
        retryCount = attempt + 1

        console.warn(`🔄 ResilientApi: Attempt ${retryCount} failed:`, error)

        // Don't retry on auth errors
        if (error instanceof Error && error.message.includes('Authentication failed')) {
          break
        }

        // Don't retry on timeout errors
        if (error instanceof Error && error.message.includes('Request timeout')) {
          break
        }

        // Don't retry on the last attempt
        if (attempt === maxRetries - 1) {
          break
        }

        // Wait before retry with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

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
