/**
 * Centralized API Manager
 * Single source of truth for all API calls with unified error handling, retry logic, and auth validation
 */

'use client'

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

// Types
export interface ApiResponse<T = any> {
  data: T | null
  error: string | null
  success: boolean
  retryCount: number
  timestamp: number
}

export interface ApiOptions {
  maxRetries?: number
  baseDelay?: number
  validateAuth?: boolean
  timeout?: number
  cache?: boolean
  cacheTTL?: number
}

export interface RetryOptions {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
  jitter: boolean
}

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

// Default configuration
const DEFAULT_OPTIONS: Required<ApiOptions> = {
  maxRetries: 3,
  baseDelay: 1000,
  validateAuth: true,
  timeout: 30000,
  cache: false,
  cacheTTL: 300000 // 5 minutes
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  jitter: true
}

export class ApiManager {
  private static instance: ApiManager
  private supabase: SupabaseClient
  private cache: Map<string, CacheEntry<any>> = new Map()
  private requestQueue: Map<string, Promise<any>> = new Map()

  private constructor() {
    this.supabase = supabase
  }

  public static getInstance(): ApiManager {
    if (!ApiManager.instance) {
      ApiManager.instance = new ApiManager()
    }
    return ApiManager.instance
  }

  /**
   * Unified error handling with context
   */
  private async handleError(error: any, context: string, retryCount: number = 0): Promise<never> {
    console.error(`❌ ApiManager Error [${context}] (Attempt ${retryCount + 1}):`, error)
    
    // Categorize errors
    if (error?.message?.includes('Authentication failed') || error?.message?.includes('Unauthorized')) {
      throw new Error('Authentication failed - please log in again')
    }
    
    if (error?.message?.includes('timeout') || error?.message?.includes('Request timeout')) {
      throw new Error('Request timeout - please try again')
    }
    
    if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
      throw new Error('Network error - please check your connection')
    }
    
    // Generic error
    throw new Error(error?.message || `API Error in ${context}`)
  }

  /**
   * Unified retry logic with exponential backoff
   */
  private async withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = DEFAULT_RETRY_OPTIONS,
    context: string = 'unknown'
  ): Promise<T> {
    let lastError: Error
    const { maxRetries, baseDelay, maxDelay, backoffMultiplier, jitter } = options

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await operation()
        return result
      } catch (error) {
        lastError = error as Error
        console.warn(`🔄 ApiManager Retry [${context}] Attempt ${attempt + 1}/${maxRetries}:`, error)

        // Don't retry on auth errors
        if (error instanceof Error && error.message.includes('Authentication failed')) {
          break
        }

        // Don't retry on the last attempt
        if (attempt === maxRetries - 1) {
          break
        }

        // Calculate delay with exponential backoff and jitter
        const delay = Math.min(
          baseDelay * Math.pow(backoffMultiplier, attempt),
          maxDelay
        )
        const jitterDelay = jitter ? delay + Math.random() * 1000 : delay
        
        console.log(`⏳ ApiManager Waiting ${Math.round(jitterDelay)}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, jitterDelay))
      }
    }

    throw lastError!
  }

  /**
   * Centralized authentication validation
   */
  private async validateAuth(): Promise<boolean> {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession()
      
      if (error) {
        console.error('❌ Auth validation failed:', error)
        return false
      }
      
      if (!session) {
        console.warn('⚠️ No active session found')
        return false
      }
      
      // Check if session is expired
      const now = Math.floor(Date.now() / 1000)
      if (session.expires_at && session.expires_at < now) {
        console.warn('⚠️ Session expired, attempting refresh...')
        const { error: refreshError } = await this.supabase.auth.refreshSession()
        if (refreshError) {
          console.error('❌ Session refresh failed:', refreshError)
          return false
        }
      }
      
      return true
    } catch (error) {
      console.error('❌ Auth validation error:', error)
      return false
    }
  }

  /**
   * Cache management
   */
  private getCacheKey(endpoint: string, params?: any): string {
    const paramString = params ? JSON.stringify(params) : ''
    return `${endpoint}:${paramString}`
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }

  private setCache<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  /**
   * Request deduplication
   */
  private async deduplicateRequest<T>(key: string, operation: () => Promise<T>): Promise<T> {
    if (this.requestQueue.has(key)) {
      console.log(`🔄 Deduplicating request: ${key}`)
      return this.requestQueue.get(key)!
    }

    const promise = operation().finally(() => {
      this.requestQueue.delete(key)
    })

    this.requestQueue.set(key, promise)
    return promise
  }

  /**
   * Core API call method with all features
   */
  private async call<T>(
    operation: () => Promise<T>,
    options: ApiOptions = {},
    context: string = 'api-call'
  ): Promise<ApiResponse<T>> {
    const opts = { ...DEFAULT_OPTIONS, ...options }
    const startTime = Date.now()

    console.log(`🔍 APIMANAGER TRACE: call() starting for context: ${context}`)
    console.log(`🔍 APIMANAGER TRACE: Options:`, {
      validateAuth: opts.validateAuth,
      timeout: opts.timeout,
      maxRetries: opts.maxRetries,
      cache: opts.cache
    })

    try {
      // Validate auth if required
      if (opts.validateAuth) {
        console.log(`🔍 APIMANAGER TRACE: Validating authentication...`)
        const authValid = await this.validateAuth()
        console.log(`🔍 APIMANAGER TRACE: Auth validation result:`, authValid)
        if (!authValid) {
          console.error(`🔍 APIMANAGER TRACE: Authentication failed`)
          throw new Error('Authentication failed - please log in again')
        }
      }

      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), opts.timeout)
      })

      console.log(`🔍 APIMANAGER TRACE: Starting operation with retry logic...`)

      // Race between operation and timeout
      const result = await Promise.race([
        this.withRetry(operation, {
          maxRetries: opts.maxRetries,
          baseDelay: opts.baseDelay,
          maxDelay: opts.baseDelay * 8,
          backoffMultiplier: 2,
          jitter: true
        }, context),
        timeoutPromise
      ])

      console.log(`🔍 APIMANAGER TRACE: Operation completed successfully`)

      return {
        data: result,
        error: null,
        success: true,
        retryCount: 0,
        timestamp: Date.now() - startTime
      }
    } catch (error) {
      console.error(`🔍 APIMANAGER TRACE: Operation failed:`, {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        context
      })
      await this.handleError(error, context)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
        retryCount: opts.maxRetries,
        timestamp: Date.now() - startTime
      }
    }
  }

  /**
   * Generic HTTP methods
   */
  async get<T>(endpoint: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    const cacheKey = this.getCacheKey(endpoint, options)
    
    // Check cache first
    if (options.cache) {
      const cached = this.getFromCache<T>(cacheKey)
      if (cached) {
        console.log(`📦 Cache hit for ${endpoint}`)
        return {
          data: cached,
          error: null,
          success: true,
          retryCount: 0,
          timestamp: 0
        }
      }
    }

    return this.call(
      () => fetch(endpoint).then(res => res.json()),
      options,
      `GET ${endpoint}`
    )
  }

  async post<T>(endpoint: string, data: any, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    return this.call(
      () => fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()),
      options,
      `POST ${endpoint}`
    )
  }

  async put<T>(endpoint: string, data: any, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    return this.call(
      () => fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()),
      options,
      `PUT ${endpoint}`
    )
  }

  async delete<T>(endpoint: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    return this.call(
      () => fetch(endpoint, { method: 'DELETE' }).then(res => res.json()),
      options,
      `DELETE ${endpoint}`
    )
  }

  /**
   * Supabase-specific methods
   */
  async supabaseQuery<T>(
    table: string,
    query: any,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const cacheKey = this.getCacheKey(`supabase:${table}`, query)
    
    // Check cache first
    if (options.cache) {
      const cached = this.getFromCache<T>(cacheKey)
      if (cached) {
        console.log(`📦 Cache hit for Supabase query: ${table}`)
        return {
          data: cached,
          error: null,
          success: true,
          retryCount: 0,
          timestamp: 0
        }
      }
    }

    return this.call(
      async () => {
        const { data, error } = await this.supabase
          .from(table)
          .select(query.select || '*')
          .match(query.match || {})
          .order(query.order || 'created_at', { ascending: false })
          .limit(query.limit || 1000)

        if (error) throw error
        return data as T
      },
      options,
      `Supabase Query: ${table}`
    )
  }

  async supabaseInsert<T>(
    table: string,
    data: any,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    console.log(`🔍 APIMANAGER TRACE: supabaseInsert called for table: ${table}`)
    console.log(`🔍 APIMANAGER TRACE: Insert data:`, {
      dataKeys: Object.keys(data),
      sampleData: data,
      hasValidateAuth: options.validateAuth,
      optionsKeys: Object.keys(options)
    })

    return this.call(
      async () => {
        console.log(`🔍 APIMANAGER TRACE: About to call supabase.from(${table}).insert()`)
        console.log(`🔍 APIMANAGER TRACE: Insert data being sent:`, {
          table,
          dataKeys: Object.keys(data),
          dataValues: data,
          user_id: data.user_id,
          assessment_id: data.assessment_id,
          hasRequiredFields: {
            user_id: !!data.user_id,
            assessment_id: !!data.assessment_id,
            score: data.score !== undefined,
            responses: !!data.responses
          }
        })
        
        const { data: result, error } = await this.supabase
          .from(table)
          .insert(data)
          .select()

        console.log(`🔍 APIMANAGER TRACE: Supabase insert response:`, {
          hasResult: !!result,
          resultLength: Array.isArray(result) ? result.length : (result ? 1 : 0),
          hasError: !!error,
          errorMessage: error?.message,
          errorCode: error?.code,
          errorDetails: error?.details,
          errorHint: error?.hint,
          errorStatus: error?.status,
          // Check if this is a foreign key error
          isForeignKeyError: error?.message?.includes('foreign key') || error?.message?.includes('violates') || error?.code === '23503'
        })

        if (error) {
          console.error(`🔍 APIMANAGER TRACE: Supabase error details:`, {
            error,
            message: error?.message,
            code: error?.code,
            details: error?.details,
            hint: error?.hint,
            statusCode: error?.statusCode,
            status: error?.status,
            // Get all properties including non-enumerable ones
            allProperties: Object.getOwnPropertyNames(error),
            allValues: Object.getOwnPropertyNames(error).map(key => ({
              key,
              value: (error as any)[key]
            })),
            // Try different ways to stringify
            jsonStringify: JSON.stringify(error),
            stringifiedWithProps: JSON.stringify(error, Object.getOwnPropertyNames(error)),
            // Check for specific Supabase error patterns
            isPostgrestError: error?.constructor?.name === 'PostgrestError',
            isAuthError: error?.constructor?.name === 'AuthError',
            isNetworkError: error?.constructor?.name === 'Error' && error?.message?.includes('fetch'),
            // Raw error object inspection
            errorPrototype: Object.getPrototypeOf(error),
            errorPrototypeName: Object.getPrototypeOf(error)?.constructor?.name
          })
          throw error
        }
        return result as T
      },
      options,
      `Supabase Insert: ${table}`
    )
  }

  async supabaseUpdate<T>(
    table: string,
    data: any,
    match: any,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.call(
      async () => {
        const { data: result, error } = await this.supabase
          .from(table)
          .update(data)
          .match(match)
          .select()

        if (error) throw error
        return result as T
      },
      options,
      `Supabase Update: ${table}`
    )
  }

  async supabaseDelete<T>(
    table: string,
    match: any,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.call(
      async () => {
        const { data: result, error } = await this.supabase
          .from(table)
          .delete()
          .match(match)
          .select()

        if (error) throw error
        return result as T
      },
      options,
      `Supabase Delete: ${table}`
    )
  }

  async supabaseFunction<T>(
    functionName: string,
    payload: any,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.call(
      async () => {
        const { data, error } = await this.supabase.functions.invoke(functionName, {
          body: payload
        })

        if (error) throw error
        return data as T
      },
      options,
      `Supabase Function: ${functionName}`
    )
  }

  /**
   * Utility methods
   */
  clearCache(): void {
    this.cache.clear()
    console.log('🧹 ApiManager cache cleared')
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ healthy: boolean; latency: number; error?: string }> {
    const startTime = Date.now()
    
    try {
      await this.supabase.from('assessment_results').select('count').limit(1)
      return {
        healthy: true,
        latency: Date.now() - startTime
      }
    } catch (error) {
      return {
        healthy: false,
        latency: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Export singleton instance
export const apiManager = ApiManager.getInstance()

// Export convenience functions
export const api = {
  get: <T>(endpoint: string, options?: ApiOptions) => apiManager.get<T>(endpoint, options),
  post: <T>(endpoint: string, data: any, options?: ApiOptions) => apiManager.post<T>(endpoint, data, options),
  put: <T>(endpoint: string, data: any, options?: ApiOptions) => apiManager.put<T>(endpoint, data, options),
  delete: <T>(endpoint: string, options?: ApiOptions) => apiManager.delete<T>(endpoint, options),
  
  // Supabase methods
  query: <T>(table: string, query: any, options?: ApiOptions) => apiManager.supabaseQuery<T>(table, query, options),
  insert: <T>(table: string, data: any, options?: ApiOptions) => apiManager.supabaseInsert<T>(table, data, options),
  update: <T>(table: string, data: any, match: any, options?: ApiOptions) => apiManager.supabaseUpdate<T>(table, data, match, options),
  deleteRecord: <T>(table: string, match: any, options?: ApiOptions) => apiManager.supabaseDelete<T>(table, match, options),
  function: <T>(functionName: string, payload: any, options?: ApiOptions) => apiManager.supabaseFunction<T>(functionName, payload, options),
  
  // Utilities
  clearCache: () => apiManager.clearCache(),
  getCacheStats: () => apiManager.getCacheStats(),
  healthCheck: () => apiManager.healthCheck()
}
