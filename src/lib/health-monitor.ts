/**
 * Health Monitoring and Alerting System
 * Monitors application health, performance, and sends alerts
 */

import { usePerformanceMonitor } from './performance-utils'
import { errorLogger } from './error-logger'

export interface HealthCheck {
  name: string
  status: 'healthy' | 'warning' | 'critical'
  message: string
  timestamp: number
  metadata?: Record<string, any>
}

export interface HealthMetrics {
  responseTime: number
  errorRate: number
  memoryUsage: number
  cpuUsage?: number
  databaseConnections: number
  cacheHitRate: number
  uptime: number
}

export interface Alert {
  id: string
  type: 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: number
  resolved: boolean
  resolvedAt?: number
  metadata?: Record<string, any>
}

export class HealthMonitor {
  private static healthChecks: HealthCheck[] = []
  private static alerts: Alert[] = []
  private static metrics: HealthMetrics[] = []
  private static isMonitoring = false
  private static monitoringInterval: NodeJS.Timeout | null = null
  private static alertCallbacks: ((alert: Alert) => void)[] = []

  // Health thresholds
  private static readonly THRESHOLDS = {
    responseTime: { warning: 1000, critical: 5000 }, // ms
    errorRate: { warning: 0.05, critical: 0.15 }, // 5%, 15%
    memoryUsage: { warning: 0.8, critical: 0.95 }, // 80%, 95%
    databaseConnections: { warning: 80, critical: 95 }, // percentage
    cacheHitRate: { warning: 0.7, critical: 0.5 } // 70%, 50%
  }

  /**
   * Start health monitoring
   */
  static startMonitoring(intervalMs: number = 30000) { // Default: 30 seconds
    if (this.isMonitoring) {
      console.warn('Health monitoring already running')
      return
    }

    console.log('🏥 Starting health monitoring...')
    this.isMonitoring = true

    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck()
    }, intervalMs)
  }

  /**
   * Stop health monitoring
   */
  static stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
    this.isMonitoring = false
    console.log('🏥 Health monitoring stopped')
  }

  /**
   * Perform comprehensive health check
   */
  private static async performHealthCheck() {
    const checks: HealthCheck[] = []

    try {
      // Database health check
      const dbCheck = await this.checkDatabaseHealth()
      checks.push(dbCheck)

      // API health check
      const apiCheck = await this.checkAPIHealth()
      checks.push(apiCheck)

      // Memory health check
      const memoryCheck = this.checkMemoryHealth()
      checks.push(memoryCheck)

      // Performance health check
      const performanceCheck = this.checkPerformanceHealth()
      checks.push(performanceCheck)

      // Cache health check
      const cacheCheck = await this.checkCacheHealth()
      checks.push(cacheCheck)

    } catch (error) {
      console.error('Health check error:', error)
      checks.push({
        name: 'health_check_system',
        status: 'critical',
        message: `Health check system error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now()
      })
    }

    // Store health checks
    this.healthChecks.push(...checks)

    // Keep only recent health checks (last 100)
    if (this.healthChecks.length > 100) {
      this.healthChecks = this.healthChecks.slice(-100)
    }

    // Generate alerts for critical issues
    checks.forEach(check => {
      if (check.status === 'critical') {
        this.createAlert('error', `Critical: ${check.name}`, check.message, check.metadata)
      } else if (check.status === 'warning') {
        this.createAlert('warning', `Warning: ${check.name}`, check.message, check.metadata)
      }
    })

    // Collect metrics
    this.collectMetrics()
  }

  /**
   * Check database health
   */
  private static async checkDatabaseHealth(): Promise<HealthCheck> {
    try {
      const startTime = Date.now()

      // Import supabase client dynamically to avoid circular dependencies
      const { checkSupabaseHealth } = await import('./supabase')

      const health = await checkSupabaseHealth()
      const responseTime = Date.now() - startTime

      if (!health.healthy) {
        return {
          name: 'database',
          status: 'critical',
          message: `Database unhealthy: ${health.error}`,
          timestamp: Date.now(),
          metadata: { responseTime, error: health.error }
        }
      }

      if (responseTime > this.THRESHOLDS.responseTime.warning) {
        return {
          name: 'database',
          status: 'warning',
          message: `Database response slow: ${responseTime}ms`,
          timestamp: Date.now(),
          metadata: { responseTime }
        }
      }

      return {
        name: 'database',
        status: 'healthy',
        message: `Database healthy (${responseTime}ms)`,
        timestamp: Date.now(),
        metadata: { responseTime, latency: health.latency }
      }
    } catch (error) {
      return {
        name: 'database',
        status: 'critical',
        message: `Database check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now(),
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  }

  /**
   * Check API health
   */
  private static async checkAPIHealth(): Promise<HealthCheck> {
    try {
      const startTime = Date.now()

      // Check a simple API endpoint with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const response = await fetch('/api/health', {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      const responseTime = Date.now() - startTime

      if (!response.ok) {
        // Don't spam console with 503 errors - just log once
        if (response.status === 503) {
          console.warn(`⚠️ API health check: Service temporarily unavailable (${response.status})`)
        }
        
        return {
          name: 'api',
          status: response.status === 503 ? 'warning' : 'critical',
          message: `API unhealthy: ${response.status} ${response.statusText}`,
          timestamp: Date.now(),
          metadata: { responseTime, status: response.status }
        }
      }

      if (responseTime > this.THRESHOLDS.responseTime.warning) {
        return {
          name: 'api',
          status: 'warning',
          message: `API response slow: ${responseTime}ms`,
          timestamp: Date.now(),
          metadata: { responseTime }
        }
      }

      return {
        name: 'api',
        status: 'healthy',
        message: `API healthy (${responseTime}ms)`,
        timestamp: Date.now(),
        metadata: { responseTime }
      }
    } catch (error) {
      // Handle abort errors gracefully
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('⚠️ API health check timed out')
        return {
          name: 'api',
          status: 'warning',
          message: 'API check timed out',
          timestamp: Date.now(),
          metadata: { error: 'timeout' }
        }
      }

      console.warn('⚠️ API health check failed:', error instanceof Error ? error.message : 'Unknown error')
      return {
        name: 'api',
        status: 'warning', // Changed from critical to warning to reduce noise
        message: `API check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now(),
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  }

  /**
   * Check memory health
   */
  private static checkMemoryHealth(): HealthCheck {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory
      const usedMemory = memory.usedJSHeapSize
      const totalMemory = memory.totalJSHeapSize
      const memoryUsage = usedMemory / totalMemory

      if (memoryUsage > this.THRESHOLDS.memoryUsage.critical) {
        return {
          name: 'memory',
          status: 'critical',
          message: `Memory usage critical: ${(memoryUsage * 100).toFixed(1)}%`,
          timestamp: Date.now(),
          metadata: { usedMemory, totalMemory, memoryUsage }
        }
      }

      if (memoryUsage > this.THRESHOLDS.memoryUsage.warning) {
        return {
          name: 'memory',
          status: 'warning',
          message: `Memory usage high: ${(memoryUsage * 100).toFixed(1)}%`,
          timestamp: Date.now(),
          metadata: { usedMemory, totalMemory, memoryUsage }
        }
      }

      return {
        name: 'memory',
        status: 'healthy',
        message: `Memory usage normal: ${(memoryUsage * 100).toFixed(1)}%`,
        timestamp: Date.now(),
        metadata: { usedMemory, totalMemory, memoryUsage }
      }
    }

    return {
      name: 'memory',
      status: 'healthy',
      message: 'Memory monitoring not available',
      timestamp: Date.now()
    }
  }

  /**
   * Check performance health
   */
  private static checkPerformanceHealth(): HealthCheck {
    // TODO: Implement performance monitoring
    const performanceMetrics = {
      totalRenders: 0,
      slowRenders: 0,
      averageRenderTime: 0,
      memoryUsage: 0
    }

    return {
      name: 'performance',
      status: 'healthy',
      message: 'Performance monitoring temporarily disabled',
      timestamp: Date.now(),
      metadata: performanceMetrics
    }
  }

  /**
   * Check cache health
   */
  private static async checkCacheHealth(): Promise<HealthCheck> {
    try {
      // Check localStorage availability and usage
      if (typeof Storage === 'undefined') {
        return {
          name: 'cache',
          status: 'warning',
          message: 'Local storage not available',
          timestamp: Date.now()
        }
      }

      // Estimate cache hit rate from localStorage keys
      const cacheKeys = Object.keys(localStorage).filter(key =>
        key.startsWith('assessment-') ||
        key.startsWith('chat-') ||
        key.startsWith('profile-')
      )

      // For now, assume healthy if we have cache keys
      return {
        name: 'cache',
        status: 'healthy',
        message: `Cache operational (${cacheKeys.length} cached items)`,
        timestamp: Date.now(),
        metadata: { cacheKeysCount: cacheKeys.length, cacheKeys }
      }
    } catch (error) {
      return {
        name: 'cache',
        status: 'warning',
        message: `Cache check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now(),
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  }

  /**
   * Collect system metrics
   */
  private static collectMetrics() {
    const metrics: HealthMetrics = {
      responseTime: 0, // Will be populated from health checks
      errorRate: this.calculateErrorRate(),
      memoryUsage: 0, // Will be populated from memory check
      databaseConnections: 0, // Placeholder
      cacheHitRate: 0.8, // Placeholder - would need actual cache tracking
      uptime: Date.now() - (window as any).__appStartTime || 0
    }

    this.metrics.push(metrics)

    // Keep only recent metrics (last 100)
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100)
    }
  }

  /**
   * Calculate error rate from recent health checks
   */
  private static calculateErrorRate(): number {
    const recentChecks = this.healthChecks.slice(-20) // Last 20 checks
    const errorChecks = recentChecks.filter(check =>
      check.status === 'critical' || check.status === 'warning'
    )
    return errorChecks.length / recentChecks.length
  }

  /**
   * Create an alert
   */
  private static createAlert(type: Alert['type'], title: string, message: string, metadata?: Record<string, any>) {
    // Skip creating alerts for API 503 errors to reduce noise
    if (title.includes('Critical: api') && message.includes('503')) {
      return
    }

    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      timestamp: Date.now(),
      resolved: false,
      metadata
    }

    this.alerts.push(alert)

    // Keep only recent alerts (last 50)
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-50)
    }

    // Notify alert subscribers
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert)
      } catch (error) {
        console.error('Alert callback error:', error)
      }
    })

    // Log alert (reduced noise for API issues)
    if (!(title.includes('api') && message.includes('503'))) {
      console.warn(`🚨 ${type.toUpperCase()}: ${title} - ${message}`, metadata)
    }

    // Log to error logger for critical alerts
    if (type === 'error') {
      errorLogger.logError(new Error(message), {
        context: 'health_monitor',
        alert: alert,
        metadata
      })
    }
  }

  /**
   * Subscribe to alerts
   */
  static onAlert(callback: (alert: Alert) => void): () => void {
    this.alertCallbacks.push(callback)

    // Return unsubscribe function
    return () => {
      const index = this.alertCallbacks.indexOf(callback)
      if (index > -1) {
        this.alertCallbacks.splice(index, 1)
      }
    }
  }

  /**
   * Get current health status
   */
  static getHealthStatus(): {
    overall: 'healthy' | 'warning' | 'critical'
    checks: HealthCheck[]
    metrics: HealthMetrics[]
    alerts: Alert[]
  } {
    const recentChecks = this.healthChecks.slice(-10) // Last 10 checks
    const criticalChecks = recentChecks.filter(check => check.status === 'critical')
    const warningChecks = recentChecks.filter(check => check.status === 'warning')

    let overall: 'healthy' | 'warning' | 'critical' = 'healthy'
    if (criticalChecks.length > 0) {
      overall = 'critical'
    } else if (warningChecks.length > 0) {
      overall = 'warning'
    }

    return {
      overall,
      checks: recentChecks,
      metrics: this.metrics.slice(-10), // Last 10 metrics
      alerts: this.alerts.slice(-10) // Last 10 alerts
    }
  }

  /**
   * Get health summary
   */
  static getHealthSummary(): {
    status: 'healthy' | 'warning' | 'critical'
    uptime: string
    lastCheck: number
    activeAlerts: number
    errorRate: number
    performance: Record<string, any>
  } {
    const status = this.getHealthStatus()
    const uptime = this.metrics.length > 0 ? this.metrics[this.metrics.length - 1].uptime : 0
    const lastCheck = this.healthChecks.length > 0 ?
      this.healthChecks[this.healthChecks.length - 1].timestamp : Date.now()
    const activeAlerts = this.alerts.filter(alert => !alert.resolved).length
    const errorRate = this.calculateErrorRate()
    // TODO: Implement performance monitoring
    const performance = {
      totalRenders: 0,
      slowRenders: 0,
      averageRenderTime: 0,
      memoryUsage: 0
    }

    return {
      status: status.overall,
      uptime: this.formatUptime(uptime),
      lastCheck,
      activeAlerts,
      errorRate,
      performance
    }
  }

  /**
   * Format uptime duration
   */
  private static formatUptime(ms: number): string {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  /**
   * Clear all health data
   */
  static clearHealthData() {
    this.healthChecks = []
    this.alerts = []
    this.metrics = []
  }

  /**
   * Export health data for analysis
   */
  static exportHealthData() {
    return {
      healthChecks: this.healthChecks,
      alerts: this.alerts,
      metrics: this.metrics,
      summary: this.getHealthSummary()
    }
  }
}

// Initialize app start time for uptime tracking
if (typeof window !== 'undefined') {
  (window as any).__appStartTime = Date.now()
}
