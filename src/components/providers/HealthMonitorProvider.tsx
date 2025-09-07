'use client'

/**
 * Health Monitor Provider
 * Initializes health monitoring and provides health status to the app
 */

import { useEffect, useState } from 'react'
import { HealthMonitor } from '@/lib/health-monitor'
import { PerformanceMonitor } from '@/lib/performance-utils'
import { CacheManager } from '@/lib/cache-manager'

interface HealthMonitorProviderProps {
  children: React.ReactNode
}

export function HealthMonitorProvider({ children }: HealthMonitorProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Initialize monitoring systems
    const initializeMonitoring = async () => {
      try {
        // Start health monitoring (temporarily disabled to prevent 503 errors)
        // HealthMonitor.startMonitoring(60000) // Check every minute

        // Initialize cache manager
        CacheManager.initialize()

        // Set up global error handler for unhandled errors
        const handleUnhandledError = (event: ErrorEvent) => {
          HealthMonitor['createAlert']('error', 'Unhandled Error', event.message, {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error?.stack
          })
        }

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
          HealthMonitor['createAlert']('error', 'Unhandled Promise Rejection', event.reason?.toString() || 'Unknown promise rejection', {
            reason: event.reason
          })
        }

        window.addEventListener('error', handleUnhandledError)
        window.addEventListener('unhandledrejection', handleUnhandledRejection)

        // Log initialization
        console.log('🏥 Health monitoring initialized')

        // Set up performance observer for long tasks
        if ('PerformanceObserver' in window) {
          try {
            const observer = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (entry.duration > 50) { // Long task > 50ms
                  PerformanceMonitor.recordMetric('long_task', entry.duration, {
                    startTime: entry.startTime,
                    name: entry.name
                  })
                }
              }
            })

            observer.observe({ entryTypes: ['longtask'] })
          } catch (error) {
            console.warn('Performance observer not supported:', error)
          }
        }

        setIsInitialized(true)

        // Cleanup function
        return () => {
          window.removeEventListener('error', handleUnhandledError)
          window.removeEventListener('unhandledrejection', handleUnhandledRejection)
          HealthMonitor.stopMonitoring()
        }

      } catch (error) {
        console.error('Failed to initialize health monitoring:', error)
        // Continue without monitoring rather than breaking the app
        setIsInitialized(true)
      }
    }

    const cleanup = initializeMonitoring()

    // Cleanup on unmount
    return () => {
      cleanup?.then(cleanupFn => cleanupFn?.())
    }
  }, [])

  // Provide health status to window for debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).getHealthStatus = () => HealthMonitor.getHealthStatus()
      (window as any).getHealthSummary = () => HealthMonitor.getHealthSummary()
      (window as any).getPerformanceReport = () => PerformanceMonitor.getPerformanceSummary()
      (window as any).getCacheStats = () => CacheManager.getStats()
    }
  }, [])

  return <>{children}</>
}
