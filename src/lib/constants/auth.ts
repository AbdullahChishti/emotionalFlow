/**
 * Authentication Constants
 * Centralized definitions for consistent authentication behavior
 */

export const AUTH_MESSAGES = {
  // Sign out success messages
  SIGNED_OUT: 'signed_out',
  LOGGED_OUT: 'logged_out', // Keep for backward compatibility
  SIGN_OUT_ERROR: 'sign_out_error',

  // Sign in success messages
  SIGNED_IN: 'signed_in',
  EMAIL_CONFIRMED: 'email_confirmed',

  // Error messages
  AUTH_FAILED: 'auth_failed',
  NO_SESSION: 'no_session',
  UNEXPECTED: 'unexpected',
} as const

export const AUTH_REDIRECTS = {
  // Default redirect paths
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  SETTINGS: '/settings',

  // Query parameter names
  REDIRECT_PARAM: 'redirect',
  MESSAGE_PARAM: 'message',
} as const

export const AUTH_ROUTES = {
  // Public routes that authenticated users should be redirected from
  PUBLIC_ONLY: [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/auth/callback'
  ],

  // Protected routes that require authentication
  PROTECTED: [
    '/dashboard',
    '/assessments',
    '/profile',
    '/results',
    '/session',
    '/wallet',
    '/check-in',
    '/crisis-support',
    '/help',
    '/community',
    '/meditation',
    '/test-chat'
  ],
} as const

// Type definitions for better TypeScript support
export type AuthMessage = typeof AUTH_MESSAGES[keyof typeof AUTH_MESSAGES]
export type AuthRedirect = typeof AUTH_REDIRECTS[keyof typeof AUTH_REDIRECTS]
