/**
 * User Experience Metrics for Authentication
 * Measures user satisfaction, performance, and interaction patterns
 */

import { authTracker } from './authTracking'

interface UserInteraction {
  id: string
  userId?: string
  sessionId: string
  timestamp: number
  type: 'click' | 'input' | 'submit' | 'error' | 'success' | 'navigation'
  element?: string
  page: string
  duration?: number
  metadata: Record<string, any>
}

interface UserJourney {
  id: string
  userId?: string
  sessionId: string
  startTime: number
  endTime?: number
  steps: UserInteraction[]
  outcome: 'success' | 'failure' | 'abandoned'
  totalDuration?: number
  errorCount: number
  retryCount: number
}

interface UXMetric {
  name: string
  value: number
  timestamp: number
  context: Record<string, any>
  userId?: string
}

interface UXAnalytics {
  // Performance metrics
  averageSignInTime: number
  averageSignUpTime: number
  averageSignOutTime: number
  successRate: number
  errorRate: number

  // User behavior metrics
  averageRetryCount: number
  abandonmentRate: number
  conversionRate: number
  bounceRate: number

  // Experience quality metrics
  averageErrorRecoveryTime: number
  userSatisfactionScore: number // 1-5 scale
  easeOfUseScore: number // 1-5 scale

  // Technical metrics
  averageNetworkLatency: number
  timeoutRate: number
  offlineRecoveryRate: number
}

interface UXMConfig {
  enabled: boolean
  trackUserInteractions: boolean
  trackJourneys: boolean
  sampleRate: number
  maxMetrics: number
  retentionPeriod: number
}

class UserExperienceMetrics {
  private static instance: UserExperienceMetrics
  private config: UXMConfig = {
    enabled: true,
    trackUserInteractions: true,
    trackJourneys: true,
    sampleRate: 1.0,
    maxMetrics: 10000,
    retentionPeriod: 7 * 24 * 60 * 60 * 1000 // 7 days
  }

  private metrics: UXMetric[] = []
  private userJourneys: Map<string, UserJourney> = new Map()
  private userInteractions: UserInteraction[] = []
  private journeyTimeouts: Map<string, NodeJS.Timeout> = new Map()

  private constructor() {
    this.loadPersistedData()
    this.setupJourneyCleanup()
  }

  static getInstance(): UserExperienceMetrics {
    if (!UserExperienceMetrics.instance) {
      UserExperienceMetrics.instance = new UserExperienceMetrics()
    }
    return UserExperienceMetrics.instance
  }

  /**
   * Configure UX metrics tracking
   */
  configure(config: Partial<UXMConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Start tracking a user journey
   */
  startJourney(
    journeyId: string,
    type: 'signin' | 'signup' | 'signout' | 'password_reset',
    userId?: string,
    sessionId?: string
  ): void {
    if (!this.config.enabled || !this.config.trackJourneys) return
    if (Math.random() > this.config.sampleRate) return

    const journey: UserJourney = {
      id: journeyId,
      userId,
      sessionId: sessionId || this.generateSessionId(),
      startTime: Date.now(),
      steps: [],
      outcome: 'abandoned',
      errorCount: 0,
      retryCount: 0
    }

    this.userJourneys.set(journeyId, journey)

    // Set timeout for abandoned journeys (15 minutes)
    const timeout = setTimeout(() => {
      this.endJourney(journeyId, 'abandoned')
    }, 15 * 60 * 1000)

    this.journeyTimeouts.set(journeyId, timeout)

    this.recordMetric('journey_started', 1, { journeyType: type, journeyId }, userId)
  }

  /**
   * End tracking a user journey
   */
  endJourney(journeyId: string, outcome: UserJourney['outcome']): void {
    if (!this.config.enabled || !this.config.trackJourneys) return

    const journey = this.userJourneys.get(journeyId)
    if (!journey) return

    journey.endTime = Date.now()
    journey.outcome = outcome
    journey.totalDuration = journey.endTime - journey.startTime

    // Clear timeout
    const timeout = this.journeyTimeouts.get(journeyId)
    if (timeout) {
      clearTimeout(timeout)
      this.journeyTimeouts.delete(journeyId)
    }

    // Record final metrics
    this.recordMetric('journey_completed', journey.totalDuration, {
      journeyId,
      outcome,
      stepCount: journey.steps.length,
      errorCount: journey.errorCount,
      retryCount: journey.retryCount
    }, journey.userId)

    this.persistJourneys()
  }

  /**
   * Record user interaction
   */
  recordInteraction(
    type: UserInteraction['type'],
    page: string,
    userId?: string,
    metadata?: Record<string, any>
  ): void {
    if (!this.config.enabled || !this.config.trackUserInteractions) return
    if (Math.random() > this.config.sampleRate) return

    const interaction: UserInteraction = {
      id: this.generateInteractionId(),
      userId,
      sessionId: this.generateSessionId(),
      timestamp: Date.now(),
      type,
      page,
      metadata: metadata || {}
    }

    this.userInteractions.push(interaction)
    this.enforceLimits()

    // Add to current journey if exists
    if (metadata?.journeyId) {
      const journey = this.userJourneys.get(metadata.journeyId)
      if (journey) {
        journey.steps.push(interaction)

        // Track specific interaction types
        if (type === 'error') journey.errorCount++
        if (type === 'submit' && metadata.retry) journey.retryCount++
      }
    }
  }

  /**
   * Record performance metric
   */
  recordPerformance(
    operation: string,
    duration: number,
    success: boolean,
    userId?: string,
    metadata?: Record<string, any>
  ): void {
    if (!this.config.enabled) return

    this.recordMetric(`performance_${operation}`, duration, {
      success,
      ...metadata
    }, userId)
  }

  /**
   * Record user satisfaction feedback
   */
  recordSatisfaction(
    score: number, // 1-5
    feedback?: string,
    userId?: string,
    context?: Record<string, any>
  ): void {
    if (!this.config.enabled) return

    this.recordMetric('user_satisfaction', score, {
      feedback,
      ...context
    }, userId)
  }

  /**
   * Record ease of use rating
   */
  recordEaseOfUse(
    score: number, // 1-5
    operation: string,
    userId?: string,
    context?: Record<string, any>
  ): void {
    if (!this.config.enabled) return

    this.recordMetric('ease_of_use', score, {
      operation,
      ...context
    }, userId)
  }

  /**
   * Calculate UX analytics
   */
  getAnalytics(timeRange?: { start: number; end: number }): UXAnalytics {
    const now = Date.now()
    const startTime = timeRange?.start || (now - 24 * 60 * 60 * 1000) // Last 24 hours
    const endTime = timeRange?.end || now

    // Get auth events from tracker
    const authEvents = authTracker.getEvents({
      since: startTime
    })

    // Calculate performance metrics
    const signInEvents = authEvents.filter(e => e.type.includes('signin'))
    const signUpEvents = authEvents.filter(e => e.type.includes('signup'))
    const signOutEvents = authEvents.filter(e => e.type.includes('signout'))

    const averageSignInTime = this.calculateAverageDuration(signInEvents)
    const averageSignUpTime = this.calculateAverageDuration(signUpEvents)
    const averageSignOutTime = this.calculateAverageDuration(signOutEvents)

    const totalAuthEvents = signInEvents.length + signUpEvents.length + signOutEvents.length
    const successfulAuthEvents = authEvents.filter(e => e.success && e.type.includes('_success')).length
    const successRate = totalAuthEvents > 0 ? (successfulAuthEvents / totalAuthEvents) * 100 : 0

    const failedEvents = authEvents.filter(e => !e.success)
    const errorRate = totalAuthEvents > 0 ? (failedEvents.length / totalAuthEvents) * 100 : 0

    // User behavior metrics
    const journeys = Array.from(this.userJourneys.values())
      .filter(j => j.startTime >= startTime && j.startTime <= endTime)

    const totalJourneys = journeys.length
    const completedJourneys = journeys.filter(j => j.outcome === 'success').length
    const abandonedJourneys = journeys.filter(j => j.outcome === 'abandoned').length

    const conversionRate = totalJourneys > 0 ? (completedJourneys / totalJourneys) * 100 : 0
    const abandonmentRate = totalJourneys > 0 ? (abandonedJourneys / totalJourneys) * 100 : 0

    const totalRetries = journeys.reduce((sum, j) => sum + j.retryCount, 0)
    const averageRetryCount = totalJourneys > 0 ? totalRetries / totalJourneys : 0

    // Experience quality metrics
    const satisfactionMetrics = this.metrics.filter(m =>
      m.name === 'user_satisfaction' &&
      m.timestamp >= startTime &&
      m.timestamp <= endTime
    )
    const userSatisfactionScore = satisfactionMetrics.length > 0
      ? satisfactionMetrics.reduce((sum, m) => sum + m.value, 0) / satisfactionMetrics.length
      : 0

    const easeOfUseMetrics = this.metrics.filter(m =>
      m.name === 'ease_of_use' &&
      m.timestamp >= startTime &&
      m.timestamp <= endTime
    )
    const easeOfUseScore = easeOfUseMetrics.length > 0
      ? easeOfUseMetrics.reduce((sum, m) => sum + m.value, 0) / easeOfUseMetrics.length
      : 0

    const errorRecoveryTimes = journeys
      .filter(j => j.errorCount > 0 && j.outcome === 'success')
      .map(j => j.totalDuration || 0)
    const averageErrorRecoveryTime = errorRecoveryTimes.length > 0
      ? errorRecoveryTimes.reduce((sum, time) => sum + time, 0) / errorRecoveryTimes.length
      : 0

    // Technical metrics
    const networkMetrics = this.metrics.filter(m =>
      m.name.includes('network') &&
      m.timestamp >= startTime &&
      m.timestamp <= endTime
    )
    const averageNetworkLatency = networkMetrics.length > 0
      ? networkMetrics.reduce((sum, m) => sum + m.value, 0) / networkMetrics.length
      : 0

    const timeoutMetrics = authEvents.filter(e => e.error?.code === 'TIMEOUT_ERROR')
    const timeoutRate = authEvents.length > 0 ? (timeoutMetrics.length / authEvents.length) * 100 : 0

    const offlineRecoveries = journeys.filter(j =>
      j.steps.some(step => step.metadata?.wasOffline) && j.outcome === 'success'
    )
    const offlineRecoveryRate = totalJourneys > 0 ? (offlineRecoveries.length / totalJourneys) * 100 : 0

    return {
      averageSignInTime,
      averageSignUpTime,
      averageSignOutTime,
      successRate,
      errorRate,
      averageRetryCount,
      abandonmentRate,
      conversionRate,
      bounceRate: abandonmentRate, // Simplified calculation
      averageErrorRecoveryTime,
      userSatisfactionScore,
      easeOfUseScore,
      averageNetworkLatency,
      timeoutRate,
      offlineRecoveryRate
    }
  }

  /**
   * Get user journey data
   */
  getJourneys(filters?: {
    userId?: string
    outcome?: UserJourney['outcome']
    since?: number
  }): UserJourney[] {
    let journeys = Array.from(this.userJourneys.values())

    if (filters) {
      if (filters.userId) {
        journeys = journeys.filter(j => j.userId === filters.userId)
      }
      if (filters.outcome) {
        journeys = journeys.filter(j => j.outcome === filters.outcome)
      }
      if (filters.since) {
        journeys = journeys.filter(j => j.startTime >= filters.since)
      }
    }

    return journeys.sort((a, b) => b.startTime - a.startTime)
  }

  /**
   * Export metrics for analysis
   */
  export(): {
    metrics: UXMetric[]
    journeys: UserJourney[]
    interactions: UserInteraction[]
  } {
    return {
      metrics: [...this.metrics],
      journeys: Array.from(this.userJourneys.values()),
      interactions: [...this.userInteractions]
    }
  }

  /**
   * Clear old data
   */
  clear(olderThan?: number): void {
    const cutoffTime = olderThan || (Date.now() - this.config.retentionPeriod)

    this.metrics = this.metrics.filter(m => m.timestamp > cutoffTime)
    this.userInteractions = this.userInteractions.filter(i => i.timestamp > cutoffTime)

    // Clear old journeys
    for (const [journeyId, journey] of this.userJourneys) {
      if (journey.startTime < cutoffTime) {
        this.userJourneys.delete(journeyId)
      }
    }

    this.persistData()
  }

  // Private methods

  private recordMetric(
    name: string,
    value: number,
    context: Record<string, any>,
    userId?: string
  ): void {
    const metric: UXMetric = {
      name,
      value,
      timestamp: Date.now(),
      context,
      userId
    }

    this.metrics.push(metric)
    this.enforceLimits()
    this.persistData()
  }

  private calculateAverageDuration(events: any[]): number {
    const eventsWithDuration = events.filter(e => e.duration !== undefined)
    if (eventsWithDuration.length === 0) return 0

    const totalDuration = eventsWithDuration.reduce((sum, e) => sum + (e.duration || 0), 0)
    return totalDuration / eventsWithDuration.length
  }

  private generateInteractionId(): string {
    return `ux_int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateSessionId(): string {
    return `ux_sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private enforceLimits(): void {
    // Limit metrics
    if (this.metrics.length > this.config.maxMetrics) {
      this.metrics = this.metrics.slice(-this.config.maxMetrics)
    }

    // Limit interactions
    if (this.userInteractions.length > this.config.maxMetrics) {
      this.userInteractions = this.userInteractions.slice(-this.config.maxMetrics)
    }

    // Limit journeys
    if (this.userJourneys.size > 1000) {
      const entries = Array.from(this.userJourneys.entries())
      entries.sort(([,a], [,b]) => b.startTime - a.startTime)
      this.userJourneys = new Map(entries.slice(0, 1000))
    }
  }

  private persistData(): void {
    if (typeof localStorage === 'undefined') return

    try {
      const dataToPersist = {
        metrics: this.metrics.slice(-1000), // Keep last 1000 metrics
        journeys: Array.from(this.userJourneys.entries()).slice(-100), // Keep last 100 journeys
        interactions: this.userInteractions.slice(-1000), // Keep last 1000 interactions
        lastUpdated: Date.now()
      }
      localStorage.setItem('ux_metrics_data', JSON.stringify(dataToPersist))
    } catch (error) {
      console.warn('Failed to persist UX metrics data:', error)
    }
  }

  private loadPersistedData(): void {
    if (typeof localStorage === 'undefined') return

    try {
      const persistedData = localStorage.getItem('ux_metrics_data')
      if (persistedData) {
        const parsed = JSON.parse(persistedData)

        // Only load recent data
        const cutoffTime = Date.now() - this.config.retentionPeriod

        this.metrics = (parsed.metrics || []).filter((m: UXMetric) => m.timestamp > cutoffTime)
        this.userInteractions = (parsed.interactions || []).filter((i: UserInteraction) => i.timestamp > cutoffTime)

        // Restore journeys
        this.userJourneys = new Map(
          (parsed.journeys || [])
            .filter(([, journey]: [string, UserJourney]) => journey.startTime > cutoffTime)
        )

        this.enforceLimits()
      }
    } catch (error) {
      console.warn('Failed to load persisted UX metrics data:', error)
    }
  }

  private setupJourneyCleanup(): void {
    // Clean up abandoned journeys periodically
    setInterval(() => {
      const now = Date.now()
      for (const [journeyId, journey] of this.userJourneys) {
        // Mark journeys older than 30 minutes as abandoned
        if (!journey.endTime && (now - journey.startTime) > 30 * 60 * 1000) {
          this.endJourney(journeyId, 'abandoned')
        }
      }
    }, 5 * 60 * 1000) // Every 5 minutes
  }
}

// Export singleton instance
export const uxMetrics = UserExperienceMetrics.getInstance()

// Convenience functions
export const startUserJourney = uxMetrics.startJourney.bind(uxMetrics)
export const endUserJourney = uxMetrics.endJourney.bind(uxMetrics)
export const recordUserInteraction = uxMetrics.recordInteraction.bind(uxMetrics)
export const recordPerformance = uxMetrics.recordPerformance.bind(uxMetrics)
export const recordSatisfaction = uxMetrics.recordSatisfaction.bind(uxMetrics)
export const recordEaseOfUse = uxMetrics.recordEaseOfUse.bind(uxMetrics)
export const getUXAnalytics = (timeRange?: { start: number; end: number }) =>
  uxMetrics.getAnalytics(timeRange)
export const getUserJourneys = (filters?: Parameters<typeof uxMetrics.getJourneys>[0]) =>
  uxMetrics.getJourneys(filters)
export const exportUXMetrics = () => uxMetrics.export()
export const clearUXMetrics = (olderThan?: number) => uxMetrics.clear(olderThan)

// Development helpers
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).uxMetrics = {
    getAnalytics: getUXAnalytics,
    getJourneys: getUserJourneys,
    export: exportUXMetrics,
    clear: clearUXMetrics
  }
}
