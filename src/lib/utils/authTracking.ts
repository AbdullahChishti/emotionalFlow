/**
 * Authentication Event Tracking
 * Comprehensive tracking and monitoring for auth operations
 */

interface AuthEvent {
  id: string
  type: AuthEventType
  timestamp: number
  duration?: number
  userId?: string
  sessionId: string
  userAgent: string
  ipAddress?: string
  metadata: Record<string, any>
  success: boolean
  error?: {
    code: string
    message: string
    canRetry: boolean
  }
}

type AuthEventType =
  | 'signin_start'
  | 'signin_success'
  | 'signin_failure'
  | 'signup_start'
  | 'signup_success'
  | 'signup_failure'
  | 'signout_start'
  | 'signout_success'
  | 'signout_failure'
  | 'session_refresh_start'
  | 'session_refresh_success'
  | 'session_refresh_failure'
  | 'profile_load_start'
  | 'profile_load_success'
  | 'profile_load_failure'
  | 'network_status_change'
  | 'auth_error_boundary_triggered'

interface TrackingConfig {
  enabled: boolean
  sampleRate: number // 0.0 to 1.0
  maxEvents: number
  retentionPeriod: number // in milliseconds
  enableConsoleLogging: boolean
  enableLocalStorage: boolean
}

class AuthTracker {
  private static instance: AuthTracker
  private events: AuthEvent[] = []
  private config: TrackingConfig = {
    enabled: true,
    sampleRate: 1.0, // Track all events by default
    maxEvents: 1000,
    retentionPeriod: 24 * 60 * 60 * 1000, // 24 hours
    enableConsoleLogging: true,
    enableLocalStorage: true
  }
  private currentSessionId: string

  private constructor() {
    this.currentSessionId = this.generateSessionId()
    this.loadPersistedEvents()
    this.setupCleanup()
  }

  static getInstance(): AuthTracker {
    if (!AuthTracker.instance) {
      AuthTracker.instance = new AuthTracker()
    }
    return AuthTracker.instance
  }

  /**
   * Configure tracking settings
   */
  configure(config: Partial<TrackingConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Track an authentication event
   */
  track(
    type: AuthEventType,
    data: {
      userId?: string
      duration?: number
      success: boolean
      error?: AuthEvent['error']
      metadata?: Record<string, any>
    }
  ): void {
    if (!this.config.enabled) return

    // Sampling
    if (Math.random() > this.config.sampleRate) return

    const event: AuthEvent = {
      id: this.generateEventId(),
      type,
      timestamp: Date.now(),
      duration: data.duration,
      userId: data.userId,
      sessionId: this.currentSessionId,
      userAgent: this.getUserAgent(),
      metadata: data.metadata || {},
      success: data.success,
      error: data.error
    }

    this.events.push(event)
    this.enforceLimits()
    this.persistEvents()

    if (this.config.enableConsoleLogging) {
      this.logEvent(event)
    }
  }

  /**
   * Track operation start
   */
  startOperation(operationType: AuthEventType, userId?: string, metadata?: Record<string, any>): string {
    const operationId = this.generateEventId()

    this.track(`${operationType}_start` as AuthEventType, {
      userId,
      success: true,
      metadata: {
        ...metadata,
        operationId
      }
    })

    return operationId
  }

  /**
   * Track operation completion
   */
  endOperation(
    operationId: string,
    operationType: AuthEventType,
    success: boolean,
    userId?: string,
    duration?: number,
    error?: AuthEvent['error'],
    metadata?: Record<string, any>
  ): void {
    this.track(`${operationType}_${success ? 'success' : 'failure'}` as AuthEventType, {
      userId,
      duration,
      success,
      error,
      metadata: {
        ...metadata,
        operationId
      }
    })
  }

  /**
   * Track network status changes
   */
  trackNetworkStatus(isOnline: boolean): void {
    this.track('network_status_change', {
      success: true,
      metadata: {
        isOnline,
        timestamp: Date.now()
      }
    })
  }

  /**
   * Track error boundary triggers
   */
  trackErrorBoundary(error: Error, errorType?: string): void {
    this.track('auth_error_boundary_triggered', {
      success: false,
      error: {
        code: 'ERROR_BOUNDARY',
        message: error.message,
        canRetry: false
      },
      metadata: {
        errorType,
        stack: error.stack
      }
    })
  }

  /**
   * Get all tracked events
   */
  getEvents(filters?: {
    type?: AuthEventType
    userId?: string
    success?: boolean
    since?: number
  }): AuthEvent[] {
    let filteredEvents = [...this.events]

    if (filters) {
      if (filters.type) {
        filteredEvents = filteredEvents.filter(e => e.type === filters.type)
      }
      if (filters.userId) {
        filteredEvents = filteredEvents.filter(e => e.userId === filters.userId)
      }
      if (filters.success !== undefined) {
        filteredEvents = filteredEvents.filter(e => e.success === filters.success)
      }
      if (filters.since) {
        filteredEvents = filteredEvents.filter(e => e.timestamp >= filters.since)
      }
    }

    return filteredEvents
  }

  /**
   * Get analytics data
   */
  getAnalytics(): {
    totalEvents: number
    successRate: number
    averageDuration: number
    eventsByType: Record<string, number>
    errorsByType: Record<string, number>
    networkStatusChanges: number
  } {
    const events = this.events
    const totalEvents = events.length
    const successfulEvents = events.filter(e => e.success).length
    const successRate = totalEvents > 0 ? (successfulEvents / totalEvents) * 100 : 0

    const eventsWithDuration = events.filter(e => e.duration !== undefined)
    const averageDuration = eventsWithDuration.length > 0
      ? eventsWithDuration.reduce((sum, e) => sum + (e.duration || 0), 0) / eventsWithDuration.length
      : 0

    const eventsByType: Record<string, number> = {}
    const errorsByType: Record<string, number> = {}

    events.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1
      if (!event.success) {
        errorsByType[event.type] = (errorsByType[event.type] || 0) + 1
      }
    })

    const networkStatusChanges = events.filter(e => e.type === 'network_status_change').length

    return {
      totalEvents,
      successRate,
      averageDuration,
      eventsByType,
      errorsByType,
      networkStatusChanges
    }
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.events = []
    this.persistEvents()
  }

  /**
   * Export events for analysis
   */
  export(): AuthEvent[] {
    return [...this.events]
  }

  // Private methods

  private generateEventId(): string {
    return `auth_evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateSessionId(): string {
    return `auth_sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getUserAgent(): string {
    if (typeof navigator !== 'undefined') {
      return navigator.userAgent
    }
    return 'unknown'
  }

  private logEvent(event: AuthEvent): void {
    const logData = {
      id: event.id,
      type: event.type,
      success: event.success,
      duration: event.duration,
      userId: event.userId ? `${event.userId.substring(0, 8)}...` : undefined,
      sessionId: event.sessionId,
      timestamp: new Date(event.timestamp).toISOString(),
      error: event.error ? {
        code: event.error.code,
        canRetry: event.error.canRetry
      } : undefined
    }

    if (event.success) {
      console.log(`🔐 [AUTH_TRACKING] ${event.type}`, logData)
    } else {
      console.error(`❌ [AUTH_TRACKING] ${event.type}`, logData)
    }
  }

  private enforceLimits(): void {
    // Remove old events
    const cutoffTime = Date.now() - this.config.retentionPeriod
    this.events = this.events.filter(event => event.timestamp > cutoffTime)

    // Limit number of events
    if (this.events.length > this.config.maxEvents) {
      this.events = this.events.slice(-this.config.maxEvents)
    }
  }

  private persistEvents(): void {
    if (!this.config.enableLocalStorage || typeof localStorage === 'undefined') return

    try {
      const dataToPersist = {
        events: this.events,
        sessionId: this.currentSessionId,
        lastUpdated: Date.now()
      }
      localStorage.setItem('auth_tracking_data', JSON.stringify(dataToPersist))
    } catch (error) {
      console.warn('Failed to persist auth tracking data:', error)
    }
  }

  private loadPersistedEvents(): void {
    if (!this.config.enableLocalStorage || typeof localStorage === 'undefined') return

    try {
      const persistedData = localStorage.getItem('auth_tracking_data')
      if (persistedData) {
        const parsed = JSON.parse(persistedData)

        // Only load recent events
        const cutoffTime = Date.now() - this.config.retentionPeriod
        this.events = (parsed.events || []).filter((event: AuthEvent) =>
          event.timestamp > cutoffTime
        )

        // Use existing session if recent
        if (parsed.sessionId && parsed.lastUpdated > (Date.now() - 3600000)) { // 1 hour
          this.currentSessionId = parsed.sessionId
        }

        this.enforceLimits()
      }
    } catch (error) {
      console.warn('Failed to load persisted auth tracking data:', error)
    }
  }

  private setupCleanup(): void {
    // Clean up old events periodically
    setInterval(() => {
      this.enforceLimits()
    }, 60000) // Every minute
  }
}

// Export singleton instance
export const authTracker = AuthTracker.getInstance()

// Convenience functions for common tracking scenarios
export const trackAuthEvent = authTracker.track.bind(authTracker)
export const startAuthOperation = authTracker.startOperation.bind(authTracker)
export const endAuthOperation = authTracker.endOperation.bind(authTracker)
export const trackNetworkStatus = authTracker.trackNetworkStatus.bind(authTracker)
export const trackErrorBoundary = authTracker.trackErrorBoundary.bind(authTracker)

// Analytics helpers
export const getAuthAnalytics = () => authTracker.getAnalytics()
export const getAuthEvents = (filters?: Parameters<typeof authTracker.getEvents>[0]) =>
  authTracker.getEvents(filters)
export const clearAuthTracking = () => authTracker.clear()
export const exportAuthEvents = () => authTracker.export()

// Development helpers
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Expose tracking functions to window for debugging
  (window as any).authTracking = {
    getEvents: getAuthEvents,
    getAnalytics: getAuthAnalytics,
    clear: clearAuthTracking,
    export: exportAuthEvents
  }
}
