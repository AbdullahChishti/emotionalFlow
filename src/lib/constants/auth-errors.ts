/**
 * Authentication Error Constants and Messages
 * Centralized error handling for consistent user experience
 */

export interface AuthError {
  code: string
  title: string
  message: string
  userMessage: string
  canRetry: boolean
  suggestedAction?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

// Error codes for different auth operations
export const AUTH_ERROR_CODES = {
  // Network/Connection errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  CONNECTION_LOST: 'CONNECTION_LOST',

  // Authentication errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_NOT_CONFIRMED: 'EMAIL_NOT_CONFIRMED',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
  TOO_MANY_ATTEMPTS: 'TOO_MANY_ATTEMPTS',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',

  // Session errors
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  INVALID_SESSION: 'INVALID_SESSION',
  UNAUTHORIZED: 'UNAUTHORIZED',

  // Profile errors
  PROFILE_NOT_FOUND: 'PROFILE_NOT_FOUND',
  PROFILE_CREATION_FAILED: 'PROFILE_CREATION_FAILED',

  // Sign out errors
  SIGN_OUT_FAILED: 'SIGN_OUT_FAILED',

  // Generic errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const

// Error definitions with user-friendly messages
export const AUTH_ERRORS: Record<string, AuthError> = {
  [AUTH_ERROR_CODES.NETWORK_ERROR]: {
    code: AUTH_ERROR_CODES.NETWORK_ERROR,
    title: 'Connection Issue',
    message: 'Unable to connect to our servers. Please check your internet connection.',
    userMessage: 'Please check your internet connection and try again.',
    canRetry: true,
    suggestedAction: 'Check your internet connection',
    severity: 'medium'
  },

  [AUTH_ERROR_CODES.TIMEOUT_ERROR]: {
    code: AUTH_ERROR_CODES.TIMEOUT_ERROR,
    title: 'Request Timeout',
    message: 'The request is taking longer than expected.',
    userMessage: 'The request is taking longer than expected. Please try again.',
    canRetry: true,
    suggestedAction: 'Try again in a moment',
    severity: 'medium'
  },

  [AUTH_ERROR_CODES.CONNECTION_LOST]: {
    code: AUTH_ERROR_CODES.CONNECTION_LOST,
    title: 'Connection Lost',
    message: 'Your internet connection was lost during the operation.',
    userMessage: 'Your connection was lost. Please check your internet and try again.',
    canRetry: true,
    suggestedAction: 'Check your internet connection',
    severity: 'medium'
  },

  [AUTH_ERROR_CODES.INVALID_CREDENTIALS]: {
    code: AUTH_ERROR_CODES.INVALID_CREDENTIALS,
    title: 'Invalid Credentials',
    message: 'The email or password you entered is incorrect.',
    userMessage: 'The email or password you entered is incorrect. Please try again.',
    canRetry: true,
    suggestedAction: 'Check your email and password',
    severity: 'low'
  },

  [AUTH_ERROR_CODES.EMAIL_NOT_CONFIRMED]: {
    code: AUTH_ERROR_CODES.EMAIL_NOT_CONFIRMED,
    title: 'Email Not Confirmed',
    message: 'Please confirm your email address before signing in.',
    userMessage: 'Please check your email and click the confirmation link before signing in.',
    canRetry: false,
    suggestedAction: 'Check your email for confirmation link',
    severity: 'low'
  },

  [AUTH_ERROR_CODES.ACCOUNT_DISABLED]: {
    code: AUTH_ERROR_CODES.ACCOUNT_DISABLED,
    title: 'Account Disabled',
    message: 'Your account has been disabled. Please contact support.',
    userMessage: 'Your account has been disabled. Please contact support for assistance.',
    canRetry: false,
    suggestedAction: 'Contact support',
    severity: 'high'
  },

  [AUTH_ERROR_CODES.TOO_MANY_ATTEMPTS]: {
    code: AUTH_ERROR_CODES.TOO_MANY_ATTEMPTS,
    title: 'Too Many Attempts',
    message: 'Too many failed attempts. Please wait before trying again.',
    userMessage: 'Too many failed attempts. Please wait a few minutes before trying again.',
    canRetry: false,
    suggestedAction: 'Wait a few minutes and try again',
    severity: 'medium'
  },

  [AUTH_ERROR_CODES.USER_ALREADY_EXISTS]: {
    code: AUTH_ERROR_CODES.USER_ALREADY_EXISTS,
    title: 'Account Already Exists',
    message: 'An account with this email already exists.',
    userMessage: 'This email is already registered. Please try signing in instead.',
    canRetry: false,
    suggestedAction: 'Try signing in instead',
    severity: 'low'
  },

  [AUTH_ERROR_CODES.SESSION_EXPIRED]: {
    code: AUTH_ERROR_CODES.SESSION_EXPIRED,
    title: 'Session Expired',
    message: 'Your session has expired. Please sign in again.',
    userMessage: 'Your session has expired. Please sign in again.',
    canRetry: true,
    suggestedAction: 'Sign in again',
    severity: 'low'
  },

  [AUTH_ERROR_CODES.INVALID_SESSION]: {
    code: AUTH_ERROR_CODES.INVALID_SESSION,
    title: 'Invalid Session',
    message: 'Your session is invalid. Please sign in again.',
    userMessage: 'Your session is invalid. Please sign in again.',
    canRetry: true,
    suggestedAction: 'Sign in again',
    severity: 'medium'
  },

  [AUTH_ERROR_CODES.UNAUTHORIZED]: {
    code: AUTH_ERROR_CODES.UNAUTHORIZED,
    title: 'Unauthorized',
    message: 'You are not authorized to perform this action.',
    userMessage: 'You are not authorized to perform this action.',
    canRetry: false,
    suggestedAction: 'Contact support if this seems incorrect',
    severity: 'high'
  },

  [AUTH_ERROR_CODES.PROFILE_NOT_FOUND]: {
    code: AUTH_ERROR_CODES.PROFILE_NOT_FOUND,
    title: 'Profile Not Found',
    message: 'Your profile could not be found. It will be created automatically.',
    userMessage: 'Setting up your profile...',
    canRetry: true,
    suggestedAction: 'Please wait while we set up your profile',
    severity: 'low'
  },

  [AUTH_ERROR_CODES.PROFILE_CREATION_FAILED]: {
    code: AUTH_ERROR_CODES.PROFILE_CREATION_FAILED,
    title: 'Profile Setup Failed',
    message: 'Failed to create your profile. Please try again.',
    userMessage: 'Failed to set up your profile. Please try signing in again.',
    canRetry: true,
    suggestedAction: 'Try signing in again',
    severity: 'medium'
  },

  [AUTH_ERROR_CODES.SIGN_OUT_FAILED]: {
    code: AUTH_ERROR_CODES.SIGN_OUT_FAILED,
    title: 'Sign Out Failed',
    message: 'Failed to sign out properly. You may need to clear your browser data.',
    userMessage: 'Failed to sign out properly. You may need to refresh the page.',
    canRetry: true,
    suggestedAction: 'Try refreshing the page',
    severity: 'medium'
  },

  [AUTH_ERROR_CODES.SERVICE_UNAVAILABLE]: {
    code: AUTH_ERROR_CODES.SERVICE_UNAVAILABLE,
    title: 'Service Unavailable',
    message: 'Our authentication service is temporarily unavailable.',
    userMessage: 'Our service is temporarily unavailable. Please try again in a few minutes.',
    canRetry: true,
    suggestedAction: 'Try again in a few minutes',
    severity: 'high'
  },

  [AUTH_ERROR_CODES.UNKNOWN_ERROR]: {
    code: AUTH_ERROR_CODES.UNKNOWN_ERROR,
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again.',
    userMessage: 'Something went wrong. Please try again.',
    canRetry: true,
    suggestedAction: 'Try again',
    severity: 'medium'
  }
}

// Helper function to get error by code
export function getAuthError(errorCode: string): AuthError {
  return AUTH_ERRORS[errorCode] || AUTH_ERRORS[AUTH_ERROR_CODES.UNKNOWN_ERROR]
}

// Helper function to classify Supabase errors
export function classifySupabaseError(error: any): AuthError {
  if (!error) return AUTH_ERRORS[AUTH_ERROR_CODES.UNKNOWN_ERROR]

  const message = error.message?.toLowerCase() || ''
  const status = error.status

  // Network/connection errors
  if (message.includes('network') || message.includes('fetch')) {
    return AUTH_ERRORS[AUTH_ERROR_CODES.NETWORK_ERROR]
  }

  // Timeout errors
  if (message.includes('timeout') || message.includes('timed out')) {
    return AUTH_ERRORS[AUTH_ERROR_CODES.TIMEOUT_ERROR]
  }

  // Authentication errors
  if (message.includes('invalid login credentials') || message.includes('invalid_credentials')) {
    return AUTH_ERRORS[AUTH_ERROR_CODES.INVALID_CREDENTIALS]
  }

  if (message.includes('email not confirmed') || message.includes('email_not_confirmed')) {
    return AUTH_ERRORS[AUTH_ERROR_CODES.EMAIL_NOT_CONFIRMED]
  }

  if (message.includes('too many requests') || status === 429) {
    return AUTH_ERRORS[AUTH_ERROR_CODES.TOO_MANY_ATTEMPTS]
  }

  if (message.includes('user is disabled') || message.includes('user_disabled')) {
    return AUTH_ERRORS[AUTH_ERROR_CODES.ACCOUNT_DISABLED]
  }

  // Session errors
  if (message.includes('jwt expired') || message.includes('session expired')) {
    return AUTH_ERRORS[AUTH_ERROR_CODES.SESSION_EXPIRED]
  }

  if (message.includes('invalid jwt') || message.includes('invalid session')) {
    return AUTH_ERRORS[AUTH_ERROR_CODES.INVALID_SESSION]
  }

  // Service unavailable
  if (status === 503 || status === 502 || message.includes('service unavailable')) {
    return AUTH_ERRORS[AUTH_ERROR_CODES.SERVICE_UNAVAILABLE]
  }

  // User already exists
  if (message.includes('already registered') || message.includes('already in use') || 
      message.includes('user already exists') || message.includes('email already exists') ||
      error.code === 'user_already_exists') {
    return AUTH_ERRORS[AUTH_ERROR_CODES.USER_ALREADY_EXISTS]
  }

  // Unauthorized
  if (status === 401 || message.includes('unauthorized')) {
    return AUTH_ERRORS[AUTH_ERROR_CODES.UNAUTHORIZED]
  }

  return AUTH_ERRORS[AUTH_ERROR_CODES.UNKNOWN_ERROR]
}
