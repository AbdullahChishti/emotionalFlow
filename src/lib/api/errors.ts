/**
 * Centralized Error Types for API Layer
 * All errors are standardized and categorized for consistent handling
 */

export enum ErrorCode {
  // Auth Errors
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  AUTH_INVALID = 'AUTH_INVALID',
  AUTH_EXPIRED = 'AUTH_EXPIRED',
  AUTH_FAILED = 'AUTH_FAILED',

  // Network Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR',

  // API Errors
  API_ERROR = 'API_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  RATE_LIMITED = 'RATE_LIMITED',

  // Data Errors
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  BUSINESS_ERROR = 'BUSINESS_ERROR',

  // Unknown
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class BaseError extends Error {
  public readonly code: ErrorCode
  public readonly isRetryable: boolean
  public readonly userMessage: string
  public readonly technicalMessage: string
  public readonly statusCode?: number

  constructor(
    code: ErrorCode,
    message: string,
    userMessage: string,
    isRetryable: boolean = false,
    statusCode?: number
  ) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.userMessage = userMessage
    this.technicalMessage = message
    this.isRetryable = isRetryable
    this.statusCode = statusCode
  }
}

export class AuthError extends BaseError {
  constructor(message: string, userMessage?: string) {
    super(ErrorCode.AUTH_FAILED, message, userMessage, false, 401)
  }
}

export class NetworkError extends BaseError {
  constructor(message: string, userMessage?: string) {
    super(ErrorCode.NETWORK_ERROR, message, userMessage, true, 0)
  }
}

export class TimeoutError extends BaseError {
  constructor(message: string, userMessage?: string) {
    super(ErrorCode.TIMEOUT_ERROR, message, userMessage, true, 408)
  }
}

export class ApiError extends BaseError {
  constructor(message: string, statusCode: number, userMessage?: string) {
    const defaultUserMessage = statusCode === 404 ? 'Resource not found' :
                              statusCode === 403 ? 'Access denied' :
                              statusCode === 429 ? 'Too many requests. Please wait.' :
                              'Something went wrong. Please try again.'

    super(
      ErrorCode.API_ERROR,
      message,
      userMessage || defaultUserMessage,
      statusCode !== 401 && statusCode !== 403,
      statusCode
    )
  }
}

export class ServiceUnavailableError extends BaseError {
  constructor(message: string, userMessage?: string) {
    super(ErrorCode.SERVICE_UNAVAILABLE, message, userMessage, true, 503)
  }
}

export class NotFoundError extends BaseError {
  constructor(resource: string, userMessage?: string) {
    super(ErrorCode.NOT_FOUND, `Resource not found: ${resource}`, userMessage, false, 404)
  }
}

export class ValidationError extends BaseError {
  constructor(field: string, userMessage?: string) {
    super(ErrorCode.VALIDATION_ERROR, `Validation failed: ${field}`, userMessage, false, 400)
  }
}

export class BusinessError extends BaseError {
  constructor(message: string, userMessage?: string) {
    super(ErrorCode.BUSINESS_ERROR, message, userMessage, false, 400)
  }
}

export class ServiceError extends BaseError {
  constructor(message: string, userMessage?: string) {
    super(ErrorCode.UNKNOWN_ERROR, message, userMessage, true, 500)
  }
}

// Error classification utility
export function classifySupabaseError(error: any): BaseError {
  console.log(`🔍 ERROR CLASSIFICATION: Classifying error:`, {
    error,
    errorType: typeof error,
    errorMessage: error?.message,
    errorToString: error?.toString(),
    hasMessage: !!error?.message,
    errorKeys: error ? Object.keys(error) : []
  })

  if (!error) return new ServiceError('Unknown error')

  const message = error.message || error.toString()
  console.log(`🔍 ERROR CLASSIFICATION: Using message:`, message)

  // Auth errors
  if (message.includes('Invalid login credentials') || message.includes('Email not confirmed')) {
    return new AuthError(message, 'Invalid email or password')
  }

  if (message.includes('JWT') || message.includes('session')) {
    return new AuthError(message, 'Session expired. Please sign in again.')
  }

  // Network errors
  if (message.includes('fetch') || message.includes('network') || message.includes('connection')) {
    return new NetworkError(message)
  }

  // Timeout errors
  if (message.includes('timeout') || message.includes('aborted')) {
    return new TimeoutError(message)
  }

  // API errors with status codes
  if (error.status) {
    return new ApiError(message, error.status)
  }

  // Default to service error
  return new ServiceError(message)
}

// Error handling utility for components
export function handleError(error: any): {
} {
  if (error instanceof BaseError) {
    return {
    }
  }

  // Fallback for non-standard errors
  const classified = classifySupabaseError(error)
  return {
  }
}
