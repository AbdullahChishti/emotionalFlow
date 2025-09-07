/**
 * Authentication Failure Monitoring
 * Detects patterns, alerts on issues, and provides insights
 */

import { authTracker } from './authTracking'
import { AUTH_ERROR_CODES } from '@/lib/constants/auth-errors'

interface FailurePattern {
  id: string
  type: 'user_specific' | 'global' | 'network' | 'service'
  errorCode: string
  threshold: number
  windowMs: number // Time window in milliseconds
  alertLevel: 'low' | 'medium' | 'high' | 'critical'
  description: string
}

interface FailureAlert {
  id: string
  patternId: string
  timestamp: number
  severity: FailurePattern['alertLevel']
  message: string
  details: {
    errorCode: string
    count: number
    windowMs: number
    affectedUsers?: string[]
    recentEvents: any[]
  }
  recommendations: string[]
}

interface MonitoringConfig {
  enabled: boolean
  patterns: FailurePattern[]
  alertCooldownMs: number // Minimum time between same alerts
  maxAlerts: number
  enableConsoleAlerts: boolean
  enableLocalStorage: boolean
}

class AuthFailureMonitor {
  private static instance: AuthFailureMonitor
  private config: MonitoringConfig = {
    enabled: true,
    alertCooldownMs: 300000, // 5 minutes
    maxAlerts: 100,
    enableConsoleAlerts: true,
    enableLocalStorage: true,
    patterns: [
      {
        id: 'high_signin_failures',
        type: 'global',
        errorCode: AUTH_ERROR_CODES.INVALID_CREDENTIALS,
        threshold: 10,
        windowMs: 300000, // 5 minutes
        alertLevel: 'medium',
        description: 'High number of invalid credential attempts'
      },
      {
        id: 'network_failures',
        type: 'network',
        errorCode: AUTH_ERROR_CODES.NETWORK_ERROR,
        threshold: 5,
        windowMs: 60000, // 1 minute
        alertLevel: 'high',
        description: 'Multiple network failures detected'
      },
      {
        id: 'service_unavailable',
        type: 'service',
        errorCode: AUTH_ERROR_CODES.SERVICE_UNAVAILABLE,
        threshold: 3,
        windowMs: 60000, // 1 minute
        alertLevel: 'critical',
        description: 'Service unavailable errors detected'
      },
      {
        id: 'user_rate_limited',
        type: 'user_specific',
        errorCode: AUTH_ERROR_CODES.TOO_MANY_ATTEMPTS,
        threshold: 3,
        windowMs: 300000, // 5 minutes
        alertLevel: 'low',
        description: 'User hitting rate limits'
      },
      {
        id: 'session_expiry_spike',
        type: 'global',
        errorCode: AUTH_ERROR_CODES.SESSION_EXPIRED,
        threshold: 15,
        windowMs: 600000, // 10 minutes
        alertLevel: 'medium',
        description: 'Spike in session expiry errors'
      }
    ]
  }
  private alerts: FailureAlert[] = []
  private lastAlertTimes: Map<string, number> = new Map()

  private constructor() {
    this.loadPersistedAlerts()
  }

  static getInstance(): AuthFailureMonitor {
    if (!AuthFailureMonitor.instance) {
      AuthFailureMonitor.instance = new AuthFailureMonitor()
    }
    return AuthFailureMonitor.instance
  }

  /**
   * Configure monitoring settings
   */
  configure(config: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Process an auth failure event
   */
  processFailure(
    errorCode: string,
    userId?: string,
    metadata?: Record<string, any>
  ): void {
    if (!this.config.enabled) return

    // Check all patterns for matches
    this.config.patterns.forEach(pattern => {
      if (pattern.errorCode === errorCode || pattern.errorCode === '*') {
        this.checkPattern(pattern, userId, metadata)
      }
    })
  }

  /**
   * Get current alerts
   */
  getAlerts(filters?: {
    severity?: FailureAlert['severity']
    since?: number
    patternId?: string
  }): FailureAlert[] {
    let filteredAlerts = [...this.alerts]

    if (filters) {
      if (filters.severity) {
        filteredAlerts = filteredAlerts.filter(a => a.severity === filters.severity)
      }
      if (filters.since) {
        filteredAlerts = filteredAlerts.filter(a => a.timestamp >= filters.since)
      }
      if (filters.patternId) {
        filteredAlerts = filteredAlerts.filter(a => a.patternId === filters.patternId)
      }
    }

    return filteredAlerts.sort((a, b) => b.timestamp - a.timestamp)
  }

  /**
   * Get monitoring statistics
   */
  getStats(): {
    totalAlerts: number
    alertsBySeverity: Record<string, number>
    recentAlerts: FailureAlert[]
    activePatterns: string[]
    failurePatterns: Record<string, number>
  } {
    const alertsBySeverity: Record<string, number> = {}
    const failurePatterns: Record<string, number> = {}

    this.alerts.forEach(alert => {
      alertsBySeverity[alert.severity] = (alertsBySeverity[alert.severity] || 0) + 1
      failurePatterns[alert.patternId] = (failurePatterns[alert.patternId] || 0) + 1
    })

    const recentAlerts = this.alerts
      .filter(alert => alert.timestamp > Date.now() - 3600000) // Last hour
      .slice(0, 10)

    return {
      totalAlerts: this.alerts.length,
      alertsBySeverity,
      recentAlerts,
      activePatterns: this.config.patterns.map(p => p.id),
      failurePatterns
    }
  }

  /**
   * Clear alerts
   */
  clearAlerts(olderThan?: number): void {
    if (olderThan) {
      this.alerts = this.alerts.filter(alert => alert.timestamp > olderThan)
    } else {
      this.alerts = []
    }
    this.persistAlerts()
  }

  /**
   * Export alerts for analysis
   */
  exportAlerts(): FailureAlert[] {
    return [...this.alerts]
  }

  // Private methods

  private checkPattern(
    pattern: FailurePattern,
    userId?: string,
    metadata?: Record<string, any>
  ): void {
    const now = Date.now()
    const windowStart = now - pattern.windowMs

    // Get events in the time window
    const relevantEvents = authTracker.getEvents({
      type: undefined, // We check all failure events
      success: false,
      since: windowStart
    }).filter(event =>
      event.error?.code === pattern.errorCode ||
      (pattern.errorCode === '*' && event.error)
    )

    let eventsToCount = relevantEvents

    // Filter by user for user-specific patterns
    if (pattern.type === 'user_specific' && userId) {
      eventsToCount = relevantEvents.filter(event => event.userId === userId)
    }

    const eventCount = eventsToCount.length

    // Check if threshold is exceeded
    if (eventCount >= pattern.threshold) {
      this.createAlert(pattern, eventCount, eventsToCount, userId)
    }
  }

  private createAlert(
    pattern: FailurePattern,
    count: number,
    events: any[],
    userId?: string
  ): void {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = Date.now()

    // Check cooldown
    const lastAlertTime = this.lastAlertTimes.get(pattern.id)
    if (lastAlertTime && (now - lastAlertTime) < this.config.alertCooldownMs) {
      return // Too soon for another alert
    }

    const affectedUsers = [...new Set(events.map(e => e.userId).filter(Boolean))]
    const recentEvents = events.slice(-5) // Last 5 events

    const alert: FailureAlert = {
      id: alertId,
      patternId: pattern.id,
      timestamp: now,
      severity: pattern.alertLevel,
      message: this.generateAlertMessage(pattern, count, affectedUsers.length),
      details: {
        errorCode: pattern.errorCode,
        count,
        windowMs: pattern.windowMs,
        affectedUsers: pattern.type === 'user_specific' ? affectedUsers : undefined,
        recentEvents
      },
      recommendations: this.generateRecommendations(pattern, count, affectedUsers.length)
    }

    this.alerts.push(alert)
    this.lastAlertTimes.set(pattern.id, now)
    this.enforceLimits()
    this.persistAlerts()

    if (this.config.enableConsoleAlerts) {
      this.logAlert(alert)
    }
  }

  private generateAlertMessage(
    pattern: FailurePattern,
    count: number,
    affectedUsers: number
  ): string {
    const timeWindow = Math.round(pattern.windowMs / 60000) // minutes

    switch (pattern.type) {
      case 'user_specific':
        return `${count} ${pattern.errorCode} failures for ${affectedUsers} user(s) in ${timeWindow} minutes`
      case 'network':
        return `${count} network-related failures detected in ${timeWindow} minutes`
      case 'service':
        return `${count} service-related failures detected in ${timeWindow} minutes`
      case 'global':
      default:
        return `${count} ${pattern.errorCode} failures detected in ${timeWindow} minutes`
    }
  }

  private generateRecommendations(
    pattern: FailurePattern,
    count: number,
    affectedUsers: number
  ): string[] {
    const recommendations: string[] = []

    switch (pattern.errorCode) {
      case AUTH_ERROR_CODES.INVALID_CREDENTIALS:
        recommendations.push('Check for potential brute force attempts')
        recommendations.push('Review password policies and user education')
        recommendations.push('Consider implementing progressive delays')
        break

      case AUTH_ERROR_CODES.NETWORK_ERROR:
        recommendations.push('Check network connectivity and CDN status')
        recommendations.push('Review timeout configurations')
        recommendations.push('Monitor for regional outages')
        break

      case AUTH_ERROR_CODES.SERVICE_UNAVAILABLE:
        recommendations.push('Check server health and load balancers')
        recommendations.push('Review recent deployments and rollbacks')
        recommendations.push('Monitor database connections and performance')
        break

      case AUTH_ERROR_CODES.TOO_MANY_ATTEMPTS:
        recommendations.push('Review rate limiting policies')
        recommendations.push('Consider increasing thresholds if legitimate')
        recommendations.push('Implement exponential backoff in client')
        break

      case AUTH_ERROR_CODES.SESSION_EXPIRED:
        recommendations.push('Review session timeout configurations')
        recommendations.push('Check token refresh mechanisms')
        recommendations.push('Monitor for authentication service issues')
        break

      default:
        recommendations.push('Review recent changes and deployments')
        recommendations.push('Check application logs for related errors')
        recommendations.push('Monitor system resources and performance')
    }

    return recommendations
  }

  private logAlert(alert: FailureAlert): void {
    const logPrefix = this.getSeverityIcon(alert.severity)

    console.warn(`${logPrefix} [AUTH_MONITORING] ${alert.message}`, {
      alertId: alert.id,
      patternId: alert.patternId,
      severity: alert.severity,
      count: alert.details.count,
      affectedUsers: alert.details.affectedUsers?.length || 'N/A',
      recommendations: alert.recommendations
    })
  }

  private getSeverityIcon(severity: FailureAlert['severity']): string {
    switch (severity) {
      case 'critical': return '🚨'
      case 'high': return '🔴'
      case 'medium': return '🟠'
      case 'low': return '🟡'
      default: return '⚠️'
    }
  }

  private enforceLimits(): void {
    // Limit number of alerts
    if (this.alerts.length > this.config.maxAlerts) {
      this.alerts = this.alerts.slice(-this.config.maxAlerts)
    }

    // Remove old alerts (keep last 24 hours)
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000
    this.alerts = this.alerts.filter(alert => alert.timestamp > cutoffTime)
  }

  private persistAlerts(): void {
    if (!this.config.enableLocalStorage || typeof localStorage === 'undefined') return

    try {
      const dataToPersist = {
        alerts: this.alerts,
        lastAlertTimes: Array.from(this.lastAlertTimes.entries()),
        lastUpdated: Date.now()
      }
      localStorage.setItem('auth_monitoring_data', JSON.stringify(dataToPersist))
    } catch (error) {
      console.warn('Failed to persist auth monitoring data:', error)
    }
  }

  private loadPersistedAlerts(): void {
    if (!this.config.enableLocalStorage || typeof localStorage === 'undefined') return

    try {
      const persistedData = localStorage.getItem('auth_monitoring_data')
      if (persistedData) {
        const parsed = JSON.parse(persistedData)

        // Only load recent alerts
        const cutoffTime = Date.now() - 24 * 60 * 60 * 1000
        this.alerts = (parsed.alerts || []).filter((alert: FailureAlert) =>
          alert.timestamp > cutoffTime
        )

        // Restore alert cooldowns
        this.lastAlertTimes = new Map(parsed.lastAlertTimes || [])

        this.enforceLimits()
      }
    } catch (error) {
      console.warn('Failed to load persisted auth monitoring data:', error)
    }
  }
}

// Export singleton instance
export const authFailureMonitor = AuthFailureMonitor.getInstance()

// Convenience functions
export const monitorAuthFailure = authFailureMonitor.processFailure.bind(authFailureMonitor)
export const getAuthAlerts = (filters?: Parameters<typeof authFailureMonitor.getAlerts>[0]) =>
  authFailureMonitor.getAlerts(filters)
export const getAuthMonitoringStats = () => authFailureMonitor.getStats()
export const clearAuthAlerts = (olderThan?: number) => authFailureMonitor.clearAlerts(olderThan)
export const exportAuthAlerts = () => authFailureMonitor.exportAlerts()

// Development helpers
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).authMonitoring = {
    getAlerts: getAuthAlerts,
    getStats: getAuthMonitoringStats,
    clear: clearAuthAlerts,
    export: exportAuthAlerts
  }
}
