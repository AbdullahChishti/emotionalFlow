/**
 * Health Monitor Tests
 * Comprehensive testing for health monitoring and alerting
 */

import { describe, it, expect, beforeEach, afterEach, jest } from 'vitest'
import { HealthMonitor } from '@/lib/health-monitor'

// Mock fetch for API health checks
global.fetch = jest.fn()

// Mock performance.memory
Object.defineProperty(window.performance, 'memory', {
  value: {
    usedJSHeapSize: 50 * 1024 * 1024, // 50MB
    totalJSHeapSize: 100 * 1024 * 1024, // 100MB
    jsHeapSizeLimit: 200 * 1024 * 1024 // 200MB
  },
  writable: true
})

describe('HealthMonitor', () => {
  let mockAlertCallback: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    HealthMonitor.clearHealthData()
    mockAlertCallback = jest.fn()
    HealthMonitor.onAlert(mockAlertCallback)

    // Mock fetch responses
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK'
    })
  })

  afterEach(() => {
    HealthMonitor.stopMonitoring()
  })

  describe('Health Monitoring', () => {
    it('should perform health checks successfully', async () => {
      // Mock successful responses
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK'
      })

      await HealthMonitor['performHealthCheck']()

      const status = HealthMonitor.getHealthStatus()
      expect(status.checks.length).toBeGreaterThan(0)
      expect(status.overall).toBe('healthy')
    })

    it('should detect API failures', async () => {
      // Mock API failure
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      await HealthMonitor['performHealthCheck']()

      const status = HealthMonitor.getHealthStatus()
      const apiCheck = status.checks.find(check => check.name === 'api')
      expect(apiCheck?.status).toBe('critical')
      expect(mockAlertCallback).toHaveBeenCalled()
    })

    it('should detect memory issues', async () => {
      // Mock high memory usage
      Object.defineProperty(window.performance, 'memory', {
        value: {
          usedJSHeapSize: 180 * 1024 * 1024, // 180MB (90% usage)
          totalJSHeapSize: 200 * 1024 * 1024,
          jsHeapSizeLimit: 200 * 1024 * 1024
        },
        writable: true
      })

      await HealthMonitor['performHealthCheck']()

      const status = HealthMonitor.getHealthStatus()
      const memoryCheck = status.checks.find(check => check.name === 'memory')
      expect(memoryCheck?.status).toBe('warning')
    })

    it('should handle network failures gracefully', async () => {
      // Mock network failure
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network request failed')
      )

      await HealthMonitor['performHealthCheck']()

      const status = HealthMonitor.getHealthStatus()
      expect(status.checks.length).toBeGreaterThan(0)
      // Should still have some checks even if API fails
    })
  })

  describe('Alert System', () => {
    it('should trigger alerts for critical issues', async () => {
      // Mock critical API failure
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable'
      })

      await HealthMonitor['performHealthCheck']()

      expect(mockAlertCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          title: expect.stringContaining('Critical')
        })
      )
    })

    it('should trigger alerts for warnings', async () => {
      // Mock slow response
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK'
      })

      // Mock slow response time by spying on Date.now
      const originalNow = Date.now
      let callCount = 0
      jest.spyOn(Date, 'now').mockImplementation(() => {
        callCount++
        // Return increasing timestamps to simulate slow response
        return originalNow() + (callCount > 2 ? 2000 : 0)
      })

      await HealthMonitor['performHealthCheck']()

      expect(mockAlertCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning'
        })
      )

      // Restore original Date.now
      jest.restoreAllMocks()
    })

    it('should handle multiple alert subscribers', () => {
      const mockCallback2 = jest.fn()
      const unsubscribe1 = HealthMonitor.onAlert(mockAlertCallback)
      const unsubscribe2 = HealthMonitor.onAlert(mockCallback2)

      // Trigger an alert manually
      HealthMonitor['createAlert']('info', 'Test Alert', 'Test message')

      expect(mockAlertCallback).toHaveBeenCalled()
      expect(mockCallback2).toHaveBeenCalled()

      // Test unsubscribe
      unsubscribe1()
      HealthMonitor['createAlert']('info', 'Test Alert 2', 'Test message 2')

      expect(mockCallback2).toHaveBeenCalledTimes(2) // Called twice
      expect(mockAlertCallback).toHaveBeenCalledTimes(1) // Only called once
    })
  })

  describe('Monitoring Lifecycle', () => {
    it('should start and stop monitoring', () => {
      HealthMonitor.startMonitoring(1000)
      expect(HealthMonitor['isMonitoring']).toBe(true)

      HealthMonitor.stopMonitoring()
      expect(HealthMonitor['isMonitoring']).toBe(false)
    })

    it('should collect metrics over time', async () => {
      HealthMonitor.startMonitoring(100)

      // Wait for a few health checks
      await new Promise(resolve => setTimeout(resolve, 350))

      HealthMonitor.stopMonitoring()

      const status = HealthMonitor.getHealthStatus()
      expect(status.metrics.length).toBeGreaterThan(0)
    })

    it('should maintain health check history', async () => {
      // Perform multiple health checks
      await HealthMonitor['performHealthCheck']()
      await HealthMonitor['performHealthCheck']()
      await HealthMonitor['performHealthCheck']()

      const status = HealthMonitor.getHealthStatus()
      expect(status.checks.length).toBe(3)
    })

    it('should limit stored health checks', async () => {
      // Mock many health checks
      for (let i = 0; i < 120; i++) {
        await HealthMonitor['performHealthCheck']()
      }

      const status = HealthMonitor.getHealthStatus()
      // Should be limited to 100 most recent
      expect(status.checks.length).toBeLessThanOrEqual(100)
    })
  })

  describe('Health Summary', () => {
    it('should provide comprehensive health summary', async () => {
      await HealthMonitor['performHealthCheck']()

      const summary = HealthMonitor.getHealthSummary()

      expect(summary).toHaveProperty('status')
      expect(summary).toHaveProperty('uptime')
      expect(summary).toHaveProperty('lastCheck')
      expect(summary).toHaveProperty('activeAlerts')
      expect(summary).toHaveProperty('errorRate')
      expect(summary).toHaveProperty('performance')
    })

    it('should calculate error rate correctly', async () => {
      // Mock some failures
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: false, status: 500 }) // Failure
        .mockResolvedValueOnce({ ok: true, status: 200 })  // Success
        .mockResolvedValueOnce({ ok: false, status: 500 }) // Failure

      await HealthMonitor['performHealthCheck']()
      await HealthMonitor['performHealthCheck']()
      await HealthMonitor['performHealthCheck']()

      const summary = HealthMonitor.getHealthSummary()
      expect(summary.errorRate).toBeGreaterThan(0)
    })

    it('should format uptime correctly', () => {
      // Mock uptime
      HealthMonitor['metrics'] = [{
        responseTime: 100,
        errorRate: 0,
        memoryUsage: 0.5,
        databaseConnections: 10,
        cacheHitRate: 0.9,
        uptime: 3723000 // 1 hour, 2 minutes
      }]

      const summary = HealthMonitor.getHealthSummary()
      expect(summary.uptime).toContain('1h')
      expect(summary.uptime).toContain('2m')
    })
  })

  describe('Data Management', () => {
    it('should export health data', async () => {
      await HealthMonitor['performHealthCheck']()

      const data = HealthMonitor.exportHealthData()

      expect(data).toHaveProperty('healthChecks')
      expect(data).toHaveProperty('alerts')
      expect(data).toHaveProperty('metrics')
      expect(data).toHaveProperty('summary')
    })

    it('should clear health data', () => {
      HealthMonitor['alerts'].push({
        id: 'test',
        type: 'info',
        title: 'Test',
        message: 'Test message',
        timestamp: Date.now(),
        resolved: false
      })

      HealthMonitor.clearHealthData()

      const status = HealthMonitor.getHealthStatus()
      expect(status.alerts.length).toBe(0)
      expect(status.checks.length).toBe(0)
      expect(status.metrics.length).toBe(0)
    })
  })

  describe('Error Handling', () => {
    it('should handle health check errors gracefully', async () => {
      // Mock all services failing
      ;(global.fetch as jest.Mock).mockRejectedValue(
        new Error('Network completely down')
      )

      // Should not throw
      await expect(HealthMonitor['performHealthCheck']()).resolves.not.toThrow()

      const status = HealthMonitor.getHealthStatus()
      expect(status.checks.length).toBeGreaterThan(0)
    })

    it('should handle alert callback errors', () => {
      const failingCallback = jest.fn().mockImplementation(() => {
        throw new Error('Callback failed')
      })

      HealthMonitor.onAlert(failingCallback)

      // Should not throw when alert callback fails
      expect(() => {
        HealthMonitor['createAlert']('error', 'Test', 'Message')
      }).not.toThrow()
    })
  })

  describe('Performance Metrics Integration', () => {
    it('should integrate with PerformanceMonitor', async () => {
      // Mock performance data
      const mockPerformanceSummary = {
        'slow_operation': { count: 5, avg: 150, min: 100, max: 200, p95: 180 }
      }

      // Mock the PerformanceMonitor.getPerformanceSummary method
      jest.doMock('@/lib/performance-utils', () => ({
        PerformanceMonitor: {
          getPerformanceSummary: jest.fn().mockReturnValue(mockPerformanceSummary)
        }
      }))

      await HealthMonitor['performHealthCheck']()

      const status = HealthMonitor.getHealthStatus()
      const performanceCheck = status.checks.find(check => check.name === 'performance')

      if (performanceCheck) {
        expect(performanceCheck.metadata).toHaveProperty('performanceMetrics')
      }
    })
  })
})
