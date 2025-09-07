/**
 * Authentication Redirect Utilities
 * Centralized redirect handling for consistent user experience
 */

import { AUTH_MESSAGES, AUTH_REDIRECTS, type AuthMessage } from '@/lib/constants/auth'

/**
 * Create a redirect URL with consistent formatting
 */
export function createRedirectUrl(
  path: string,
  message?: AuthMessage,
  redirectPath?: string
): string {
  const url = new URL(path, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')

  if (message) {
    url.searchParams.set(AUTH_REDIRECTS.MESSAGE_PARAM, message)
  }

  if (redirectPath) {
    url.searchParams.set(AUTH_REDIRECTS.REDIRECT_PARAM, redirectPath)
  }

  return url.pathname + url.search
}

/**
 * Redirect to login page with optional message
 */
export function redirectToLogin(message?: AuthMessage, returnPath?: string): void {
  if (typeof window === 'undefined') {
    console.error('❌ [REDIRECT_UTILS] redirectToLogin called on server side')
    return
  }

  const redirectUrl = createRedirectUrl(AUTH_REDIRECTS.LOGIN, message, returnPath)
  console.log('🔄 [REDIRECT_UTILS] Redirecting to login:', redirectUrl)
  window.location.href = redirectUrl
}

/**
 * Redirect to dashboard
 */
export function redirectToDashboard(): void {
  if (typeof window === 'undefined') {
    console.error('❌ [REDIRECT_UTILS] redirectToDashboard called on server side')
    return
  }

  const redirectUrl = AUTH_REDIRECTS.DASHBOARD
  console.log('🔄 [REDIRECT_UTILS] Redirecting to dashboard:', redirectUrl)
  window.location.href = redirectUrl
}

/**
 * Redirect to settings page
 */
export function redirectToSettings(): void {
  if (typeof window === 'undefined') {
    console.error('❌ [REDIRECT_UTILS] redirectToSettings called on server side')
    return
  }

  const redirectUrl = AUTH_REDIRECTS.SETTINGS
  console.log('🔄 [REDIRECT_UTILS] Redirecting to settings:', redirectUrl)
  window.location.href = redirectUrl
}

/**
 * Handle sign out redirect with success message
 */
export function handleSignOutSuccess(): void {
  console.log('✅ [REDIRECT_UTILS] Sign out successful, redirecting to login')
  redirectToLogin(AUTH_MESSAGES.SIGNED_OUT)
}

/**
 * Handle sign out error redirect
 */
export function handleSignOutError(error?: string): void {
  console.error('❌ [REDIRECT_UTILS] Sign out failed, redirecting to login:', error)
  redirectToLogin(AUTH_MESSAGES.SIGN_OUT_ERROR)
}

/**
 * Get redirect path from URL parameters
 */
export function getRedirectPath(): string | null {
  if (typeof window === 'undefined') return null

  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(AUTH_REDIRECTS.REDIRECT_PARAM)
}

/**
 * Get message from URL parameters
 */
export function getMessageFromUrl(): AuthMessage | null {
  if (typeof window === 'undefined') return null

  const urlParams = new URLSearchParams(window.location.search)
  const message = urlParams.get(AUTH_REDIRECTS.MESSAGE_PARAM)

  // Validate that the message is one of our known messages
  if (message && Object.values(AUTH_MESSAGES).includes(message as AuthMessage)) {
    return message as AuthMessage
  }

  return null
}
