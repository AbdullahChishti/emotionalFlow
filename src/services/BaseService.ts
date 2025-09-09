/**
 * Base Service Class
 * Provides common functionality for all domain services
 */

import { apiManager } from '@/lib/api/ApiManager'
import { ApiResponse, ApiOptions } from '@/lib/api/types'
import {
  BaseError,
  ValidationError,
  BusinessError,
  NotFoundError,
  ServiceError,
  classifySupabaseError
} from '@/lib/api/errors'

export abstract class BaseService {
  protected apiManager = apiManager

  /**
   * Execute an API operation with standardized error handling
   */
  protected async executeApiCall<T>(
    operation: () => Promise<ApiResponse<T>>,
    context: string
  ): Promise<T> {
    try {
      console.log(`🔍 BASE SERVICE TRACE: executeApiCall starting for context: ${context}`)
      
      const response = await operation()
      
      console.log(`🔍 BASE SERVICE TRACE: executeApiCall response:`, {
        hasResponse: !!response,
        success: response?.success,
        hasData: !!response?.data,
        hasError: !!response?.error,
        errorMessage: response?.error,
        responseKeys: response ? Object.keys(response) : []
      })

      if (!response.success) {
        console.error(`🔍 BASE SERVICE TRACE: API call failed:`, {
          context,
          error: response.error,
          errorType: typeof response.error,
          errorMessage: response.error instanceof Error ? response.error.message : response.error,
          errorCode: response.error?.code,
          errorDetails: response.error?.details,
          fullResponse: response
        })
        
        // If the error is an Error object, throw it directly to preserve details
        if (response.error instanceof Error) {
          throw response.error
        }
        
        throw new ServiceError(response.error || `API call failed: ${context}`)
      }

      if (response.data === null) {
        console.error(`🔍 BASE SERVICE TRACE: No data returned:`, {
          context,
          response
        })
        throw new NotFoundError(context, 'The requested data was not found')
      }

      console.log(`🔍 BASE SERVICE TRACE: executeApiCall completed successfully for ${context}`)
      return response.data
    } catch (error) {
      console.error(`🔍 BASE SERVICE TRACE: executeApiCall exception:`, {
        context,
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack?.split('\n').slice(0, 3) : undefined,
        isBaseError: error instanceof BaseError,
        errorType: typeof error,
        errorConstructor: error?.constructor?.name,
        errorKeys: error ? Object.keys(error) : [],
        stringifiedError: JSON.stringify(error, Object.getOwnPropertyNames(error))
      })
      
      if (error instanceof BaseError) {
        console.log(`🔍 BASE SERVICE TRACE: Error is already BaseError, re-throwing:`, error)
        throw error
      }

      console.log(`🔍 BASE SERVICE TRACE: About to classify error...`)
      const classifiedError = classifySupabaseError(error)
      console.error(`🔍 BASE SERVICE TRACE: Classified error:`, classifiedError)
      throw classifiedError
    }
  }

  /**
   * Validate required fields
   */
  protected validateRequired(data: Record<string, any>, fields: string[]): void {
    for (const field of fields) {
      if (!data[field]) {
        throw new ValidationError(field, `${field} is required`)
      }
    }
  }

  /**
   * Validate email format
   */
  protected validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new ValidationError('email', 'Invalid email format')
    }
  }

  /**
   * Log operation for debugging
   */
  protected logOperation(operation: string, data?: any): void {
    // Logging removed for production
  }

  /**
   * Health check for service
   */
  async healthCheck(): Promise<{ healthy: boolean; latency: number; error?: string }> {
    const startTime = Date.now()

    try {
      // Default health check - can be overridden by subclasses
      await this.api.healthCheck()
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