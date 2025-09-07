/**
 * Base Data Service
 * Provides common patterns for services that update stores
 */

import { useAssessmentStore } from '@/stores/assessmentStore'
import { useAuthStore } from '@/stores/authStore'
import { useChatStore } from '@/stores/chatStore'
import { useProfileStore } from '@/stores/profileStore'

export interface DataServiceEvent {
  type: string
  data: any
  timestamp: Date
}

export class DataService {
  private static subscribers = new Map<string, Set<(event: DataServiceEvent) => void>>()

  /**
   * Subscribe to data service events
   */
  static subscribe(eventType: string, callback: (event: DataServiceEvent) => void): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set())
    }

    this.subscribers.get(eventType)!.add(callback)

    // Return unsubscribe function
    return () => {
      const eventSubscribers = this.subscribers.get(eventType)
      if (eventSubscribers) {
        eventSubscribers.delete(callback)
        if (eventSubscribers.size === 0) {
          this.subscribers.delete(eventType)
        }
      }
    }
  }

  /**
   * Notify all subscribers of an event
   */
  protected static notifySubscribers(eventType: string, data: any): void {
    const event: DataServiceEvent = {
      type: eventType,
      data,
      timestamp: new Date()
    }

    const eventSubscribers = this.subscribers.get(eventType)
    if (eventSubscribers) {
      eventSubscribers.forEach(callback => {
        try {
          callback(event)
        } catch (error) {
          console.error(`Error in subscriber for event ${eventType}:`, error)
        }
      })
    }
  }

  /**
   * Safely update a store with error handling
   */
  protected static updateStore<T>(
    storeUpdater: (data: T) => void,
    data: T,
    errorHandler?: (error: Error) => void
  ): void {
    try {
      storeUpdater(data)
    } catch (error) {
      console.error('Error updating store:', error)
      if (errorHandler) {
        errorHandler(error as Error)
      }
    }
  }

  /**
   * Get current user ID from auth store
   */
  protected static getCurrentUserId(): string | null {
    const { user } = useAuthStore.getState()
    return user?.id || null
  }

  /**
   * Check if user is authenticated
   */
  protected static isAuthenticated(): boolean {
    const { isAuthenticated } = useAuthStore.getState()
    return isAuthenticated
  }

  /**
   * Handle common error patterns
   */
  protected static handleError(
    error: any,
    context: string,
    storeSetter?: (error: string) => void
  ): void {
    console.error(`${context}:`, error)

    const errorMessage = error?.message || 'An unexpected error occurred'

    if (storeSetter) {
      storeSetter(errorMessage)
    }

    this.notifySubscribers('error', {
      context,
      error: errorMessage,
      timestamp: new Date()
    })
  }

  /**
   * Set loading state across relevant stores
   */
  protected static setLoadingState(loading: boolean, stores: ('auth' | 'assessment' | 'profile' | 'chat')[] = []): void {
    if (stores.includes('auth')) {
      useAuthStore.getState().setLoading(loading)
    }
    if (stores.includes('assessment')) {
      useAssessmentStore.getState().setLoading(loading)
    }
    if (stores.includes('profile')) {
      useProfileStore.getState().setUpdating(loading)
    }
    if (stores.includes('chat')) {
      useChatStore.getState().setLoadingContext(loading)
    }
  }

  /**
   * Reset error states across stores
   */
  protected static clearErrors(stores: ('auth' | 'assessment' | 'profile' | 'chat')[] = []): void {
    if (stores.includes('auth')) {
      useAuthStore.getState().setError(null)
    }
    if (stores.includes('assessment')) {
      useAssessmentStore.getState().setError(null)
    }
    if (stores.includes('profile')) {
      useProfileStore.getState().setError(null)
    }
    if (stores.includes('chat')) {
      useChatStore.getState().setError(null)
    }
  }
}
