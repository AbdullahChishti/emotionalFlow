/**
 * Network Resilience Utilities
 * Provides timeout handling, retry logic, and offline detection
 */

interface RetryOptions {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffFactor: number
}

interface TimeoutOptions {
  timeout: number
  onTimeout?: () => void
}

interface NetworkOperation<T> {
  operation: () => Promise<T>
  operationName: string
  retryOptions?: Partial<RetryOptions>
  timeoutOptions?: TimeoutOptions
}

// Default retry options
const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2
}

// Default timeout options
const DEFAULT_TIMEOUT_OPTIONS: TimeoutOptions = {
  timeout: 15000 // 15 seconds
}

export class NetworkResilience {
  private static isOnline: boolean = true
  private static connectionListeners: Set<(online: boolean) => void> = new Set()

  /**
   * Initialize network monitoring
   */
  static initialize(): void {
    if (typeof window === 'undefined') return

    // Set initial online status
    this.isOnline = navigator.onLine

    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('🌐 [NETWORK_RESILIENCE] Connection restored')
      this.setOnlineStatus(true)
    })

    window.addEventListener('offline', () => {
      console.log('🌐 [NETWORK_RESILIENCE] Connection lost')
      this.setOnlineStatus(false)
    })

    console.log('🌐 [NETWORK_RESILIENCE] Network monitoring initialized')
  }

  /**
   * Check if the device is online
   */
  static getIsOnline(): boolean {
    return this.isOnline
  }

  /**
   * Subscribe to connection status changes
   */
  static onConnectionChange(callback: (online: boolean) => void): () => void {
    this.connectionListeners.add(callback)

    // Return unsubscribe function
    return () => {
      this.connectionListeners.delete(callback)
    }
  }

  /**
   * Update online status and notify listeners
   */
  private static setOnlineStatus(online: boolean): void {
    if (this.isOnline !== online) {
      this.isOnline = online
      this.connectionListeners.forEach(callback => {
        try {
          callback(online)
        } catch (error) {
          console.error('🌐 [NETWORK_RESILIENCE] Error in connection listener:', error)
        }
      })
    }
  }

  /**
   * Execute operation with timeout
   */
  static async withTimeout<T>(
    operation: () => Promise<T>,
    options: TimeoutOptions = DEFAULT_TIMEOUT_OPTIONS
  ): Promise<T> {
    const { timeout, onTimeout } = options

    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | null = null
      let resolved = false

      const cleanup = () => {
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
      }

      // Set up timeout
      timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true
          console.warn(`⏰ [NETWORK_RESILIENCE] Operation timed out after ${timeout}ms`)
          if (onTimeout) {
            onTimeout()
          }
          cleanup()
          reject(new Error(`Operation timed out after ${timeout}ms`))
        }
      }, timeout)

      // Execute operation
      operation()
        .then(result => {
          if (!resolved) {
            resolved = true
            cleanup()
            resolve(result)
          }
        })
        .catch(error => {
          if (!resolved) {
            resolved = true
            cleanup()
            reject(error)
          }
        })
    })
  }

  /**
   * Execute operation with retry logic
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    options: Partial<RetryOptions> = {}
  ): Promise<T> {
    const retryOptions = { ...DEFAULT_RETRY_OPTIONS, ...options }
    const { maxRetries, baseDelay, maxDelay, backoffFactor } = retryOptions

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`🔄 [NETWORK_RESILIENCE] Retrying ${operationName} (attempt ${attempt}/${maxRetries})`)
        }

        const result = await operation()
        return result

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        // Don't retry on the last attempt
        if (attempt === maxRetries) {
          break
        }

        // Check if error is retryable
        if (!this.isRetryableError(lastError)) {
          console.log(`🚫 [NETWORK_RESILIENCE] Non-retryable error for ${operationName}:`, lastError.message)
          break
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt), maxDelay)

        console.log(`⏳ [NETWORK_RESILIENCE] Waiting ${delay}ms before retrying ${operationName}`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    // If we get here, all retries failed
    console.error(`❌ [NETWORK_RESILIENCE] ${operationName} failed after ${maxRetries + 1} attempts:`, lastError?.message)
    throw lastError || new Error(`${operationName} failed after retries`)
  }

  /**
   * Execute operation with both timeout and retry
   */
  static async withTimeoutAndRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    timeoutOptions: TimeoutOptions = DEFAULT_TIMEOUT_OPTIONS,
    retryOptions: Partial<RetryOptions> = {}
  ): Promise<T> {
    const retryableOperation = () =>
      this.withTimeout(operation, timeoutOptions)

    return this.withRetry(retryableOperation, operationName, retryOptions)
  }

  /**
   * Execute operation with network resilience (checks online status, timeout, retry)
   */
  static async executeResiliently<T>(
    operation: () => Promise<T>,
    operationName: string,
    timeoutOptions: TimeoutOptions = DEFAULT_TIMEOUT_OPTIONS,
    retryOptions: Partial<RetryOptions> = {}
  ): Promise<T> {
    // Check if offline
    if (!this.isOnline) {
      console.warn(`🌐 [NETWORK_RESILIENCE] ${operationName} attempted while offline`)
      throw new Error('No internet connection. Please check your network and try again.')
    }

    return this.withTimeoutAndRetry(operation, operationName, timeoutOptions, retryOptions)
  }

  /**
   * Check if an error is retryable
   */
  private static isRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase()

    // Network-related errors
    if (message.includes('network') ||
        message.includes('fetch') ||
        message.includes('connection') ||
        message.includes('timeout') ||
        message.includes('aborted')) {
      return true
    }

    // Server errors (5xx)
    if (message.includes('500') ||
        message.includes('502') ||
        message.includes('503') ||
        message.includes('504')) {
      return true
    }

    // Don't retry authentication errors
    if (message.includes('invalid') ||
        message.includes('unauthorized') ||
        message.includes('forbidden')) {
      return false
    }

    // Retry other errors by default
    return true
  }

  /**
   * Create a resilient operation wrapper
   */
  static createResilientOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    timeoutOptions?: TimeoutOptions,
    retryOptions?: Partial<RetryOptions>
  ) {
    return () => this.executeResiliently(operation, operationName, timeoutOptions, retryOptions)
  }
}

// Initialize network monitoring when module loads (client-side only)
if (typeof window !== 'undefined') {
  NetworkResilience.initialize()
}
