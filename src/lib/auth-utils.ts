/**
 * Authentication Utilities
 * Provides secure authentication helper functions
 */

import { supabase } from './supabase'
import { useAuthStore } from '@/stores/authStore'
import { useAssessmentStore } from '@/stores/assessmentStore'
import { useChatStore } from '@/stores/chatStore'
import { useProfileStore } from '@/stores/profileStore'

export class AuthUtils {
  // Note: secureLogout moved to AuthManager.signOut() for consistency

  /**
   * Clear all authentication-related local storage
   */
  private static clearLocalStorage(): void {
    try {
      // Clear auth-related items
      localStorage.removeItem('login_redirect')
      localStorage.removeItem('auth-storage')

      // Clear any other auth-related storage
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.includes('auth') || key.includes('supabase')) {
          localStorage.removeItem(key)
        }
      })

      console.log('🧹 AuthUtils: Local storage cleared')
    } catch (error) {
      console.warn('⚠️ AuthUtils: Failed to clear local storage', error)
    }
  }

  /**
   * Clear all application stores
   */
  private static clearAllStores(): void {
    try {
      const authStore = useAuthStore.getState()
      const assessmentStore = useAssessmentStore.getState()
      const chatStore = useChatStore.getState()
      const profileStore = useProfileStore.getState()

      // Clear stores in order
      authStore.logout()
      assessmentStore.resetAssessmentState()
      chatStore.resetChatState()
      profileStore.clearProfile()

      console.log('🧹 AuthUtils: Application stores cleared')
    } catch (error) {
      console.warn('⚠️ AuthUtils: Failed to clear stores', error)
    }
  }

  /**
   * Sign out from Supabase with timeout protection
   */
  private static async supabaseSignOut(): Promise<void> {
    try {
      const signOutPromise = supabase.auth.signOut()
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Supabase signOut timeout')), 5000)
      )

      await Promise.race([signOutPromise, timeoutPromise])
      console.log('✅ AuthUtils: Supabase signed out successfully')
    } catch (error) {
      console.warn('⚠️ AuthUtils: Supabase sign out failed or timed out', error)
      // Don't throw - we want logout to succeed even if Supabase fails
    }
  }

  /**
   * Validate authentication state
   */
  static async validateAuthState(): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.warn('⚠️ AuthUtils: Session validation failed', error)
        return false
      }

      if (!session) {
        console.log('ℹ️ AuthUtils: No active session found')
        return false
      }

      // Check if session is expired
      const now = Math.floor(Date.now() / 1000)
      if (session.expires_at && session.expires_at < now) {
        console.warn('⚠️ AuthUtils: Session expired')
        return false
      }

      console.log('✅ AuthUtils: Session validated successfully')
      return true
    } catch (error) {
      console.error('❌ AuthUtils: Session validation error', error)
      return false
    }
  }

  /**
   * Force refresh authentication state
   */
  static async refreshAuthState(): Promise<void> {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession()

      if (error) {
        console.warn('⚠️ AuthUtils: Session refresh failed', error)
        return
      }

      if (session) {
        console.log('✅ AuthUtils: Session refreshed successfully')
        // Update the auth store with new session
        const authStore = useAuthStore.getState()
        authStore.setUser(session.user)
        authStore.setAuthenticated(true)
      }
    } catch (error) {
      console.error('❌ AuthUtils: Session refresh error', error)
    }
  }

  /**
   * Check if current user has required permissions
   */
  static hasPermission(user: any, permission: string): boolean {
    // Implement role-based permissions here
    // For now, just check if user exists
    return !!user
  }

  /**
   * Get redirect URL after login
   */
  static getLoginRedirect(): string {
    try {
      return localStorage.getItem('login_redirect') || '/dashboard'
    } catch {
      return '/dashboard'
    }
  }

  /**
   * Set redirect URL for after login
   */
  static setLoginRedirect(path: string): void {
    try {
      localStorage.setItem('login_redirect', path)
    } catch (error) {
      console.warn('⚠️ AuthUtils: Failed to set login redirect', error)
    }
  }

  /**
   * Clear redirect URL
   */
  static clearLoginRedirect(): void {
    try {
      localStorage.removeItem('login_redirect')
    } catch (error) {
      console.warn('⚠️ AuthUtils: Failed to clear login redirect', error)
    }
  }
}
