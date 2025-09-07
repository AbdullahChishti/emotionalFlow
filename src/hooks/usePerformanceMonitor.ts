/**
 * Performance Monitoring Hook
 * Tracks component performance and provides optimization insights
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { PerformanceMonitor } from '@/lib/performance-utils'

export interface ComponentMetrics {
  renderCount: number
  averageRenderTime: number
  totalRenderTime: number
  lastRenderTime: number
  slowRenders: number
  memoryUsage?: number
}

export interface PerformanceConfig {
  enableLogging?: boolean
  slowThreshold?: number
  enableMemoryTracking?: boolean
  enableRenderTracking?: boolean
}

export function usePerformanceMonitor(
  componentName: string,
  config: PerformanceConfig = {}
) {
  const {
    enableLogging = true,
    slowThreshold = 16, // 16ms = 1 frame at 60fps
    enableMemoryTracking = false,
    enableRenderTracking = true
  } = config

  const [metrics, setMetrics] = useState<ComponentMetrics>({
    renderCount: 0,
    averageRenderTime: 0,
    totalRenderTime: 0,
    lastRenderTime: 0,
    slowRenders: 0
  })

  const renderStartTime = useRef<number>()
  const totalRenderTime = useRef(0)
  const slowRenderCount = useRef(0)
  const renderCount = useRef(0)

  // Track component render performance - only when render tracking is enabled
  useEffect(() => {
    if (!enableRenderTracking) return

    renderCount.current++
    renderStartTime.current = performance.now()

    // Return cleanup function to measure render time
    return () => {
      if (!renderStartTime.current) return

      const renderTime = performance.now() - renderStartTime.current
      totalRenderTime.current += renderTime

      if (renderTime > slowThreshold) {
        slowRenderCount.current++

        if (enableLogging) {
          PerformanceMonitor.recordMetric(
            `${componentName}_slow_render`,
            renderTime,
            {
              renderCount: renderCount.current,
              component: componentName
            }
          )

          console.warn(`🚨 Slow render in ${componentName}: ${renderTime.toFixed(2)}ms (render #${renderCount.current})`)
        }
      }

      // Update metrics asynchronously to avoid render loops
      setTimeout(() => {
        setMetrics(prevMetrics => {
          const newMetrics: ComponentMetrics = {
            renderCount: renderCount.current,
            averageRenderTime: totalRenderTime.current / Math.max(1, renderCount.current),
            totalRenderTime: totalRenderTime.current,
            lastRenderTime: renderTime,
            slowRenders: slowRenderCount.current
          }

          // Add memory tracking if enabled
          if (enableMemoryTracking && (performance as any).memory) {
            const memory = (performance as any).memory
            newMetrics.memoryUsage = memory.usedJSHeapSize
          }

          return newMetrics
        })
      }, 0)
    }
  }, [enableRenderTracking, enableMemoryTracking, enableLogging, slowThreshold, componentName])

  // Performance measurement function
  const measurePerformance = useCallback(async <T>(
    operationName: string,
    operation: () => T | Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> => {
    const startTime = performance.now()

    try {
      const result = await operation()
      const duration = performance.now() - startTime

      if (enableLogging) {
        PerformanceMonitor.recordMetric(
          `${componentName}_${operationName}`,
          duration,
          {
            component: componentName,
            ...metadata
          }
        )

        if (duration > 100) {
          console.warn(`🚨 Slow operation in ${componentName}.${operationName}: ${duration.toFixed(2)}ms`)
        }
      }

      return result
    } catch (error) {
      const duration = performance.now() - startTime

      if (enableLogging) {
        PerformanceMonitor.recordMetric(
          `${componentName}_${operationName}_error`,
          duration,
          {
            component: componentName,
            error: error instanceof Error ? error.message : 'Unknown error',
            ...metadata
          }
        )
      }

      throw error
    }
  }, [componentName, enableLogging])

  // Reset metrics
  const resetMetrics = useCallback(() => {
    renderCount.current = 0
    totalRenderTime.current = 0
    slowRenderCount.current = 0

    setMetrics({
      renderCount: 0,
      averageRenderTime: 0,
      totalRenderTime: 0,
      lastRenderTime: 0,
      slowRenders: 0
    })
  }, [])

  // Get performance report
  const getPerformanceReport = useCallback(() => {
    const performanceMetrics = PerformanceMonitor.getPerformanceSummary()
    const componentMetrics = PerformanceMonitor.getComponentMetrics(componentName)

    return {
      component: {
        name: componentName,
        metrics,
        efficiency: metrics.renderCount > 0 ?
          ((metrics.totalRenderTime / metrics.renderCount) / 16.67 * 100) : 0 // % of frame time used
      },
      operations: Object.entries(performanceMetrics)
        .filter(([key]) => key.startsWith(`${componentName}_`))
        .map(([key, data]) => ({
          operation: key.replace(`${componentName}_`, ''),
          ...data
        })),
      renderMetrics: componentMetrics
    }
  }, [componentName, metrics])

  // Performance optimization suggestions
  const getOptimizationSuggestions = useCallback(() => {
    const suggestions: string[] = []

    if (metrics.averageRenderTime > 16) {
      suggestions.push('Consider memoizing expensive computations with useMemo')
    }

    if (metrics.slowRenders > metrics.renderCount * 0.1) {
      suggestions.push('High number of slow renders - review component dependencies')
    }

    if (metrics.renderCount > 50) {
      suggestions.push('Component re-renders frequently - check for unnecessary state updates')
    }

    if (metrics.memoryUsage && metrics.memoryUsage > 50 * 1024 * 1024) { // 50MB
      suggestions.push('High memory usage detected - consider optimizing data structures')
    }

    return suggestions
  }, [metrics])

  return {
    metrics,
    measurePerformance,
    resetMetrics,
    getPerformanceReport,
    getOptimizationSuggestions,

    // Utility functions
    isSlowRender: (threshold = slowThreshold) => metrics.lastRenderTime > threshold,
    getRenderEfficiency: () => metrics.renderCount > 0 ?
      Math.min(100, (16.67 / (metrics.totalRenderTime / metrics.renderCount)) * 100) : 100
  }
}
