/**
 * Health Check API Endpoint
 * Provides system health status for monitoring
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkSupabaseHealth } from '@/lib/supabase'
import { HealthMonitor } from '@/lib/health-monitor'
import { PerformanceMonitor } from '@/lib/performance-utils'

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()

    // Check database connectivity
    const dbHealth = await checkSupabaseHealth()

    // Get system health status
    const healthStatus = HealthMonitor.getHealthStatus()

    // Get performance metrics
    const performanceSummary = PerformanceMonitor.getPerformanceSummary()

    // Check memory usage (if available)
    let memoryUsage = null
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory
      memoryUsage = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        usagePercent: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
      }
    }

    // Check request processing time
    const processingTime = Date.now() - startTime

    // Determine overall health
    const isHealthy = dbHealth.healthy && healthStatus.overall === 'healthy'

    const healthResponse = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),

      // Database health
      database: {
        healthy: dbHealth.healthy,
        responseTime: dbHealth.latency,
        error: dbHealth.error
      },

      // System health
      system: {
        overall: healthStatus.overall,
        checksCount: healthStatus.checks.length,
        activeAlerts: healthStatus.alerts.filter(a => !a.resolved).length,
        memory: memoryUsage
      },

      // Performance metrics
      performance: {
        processingTime,
        slowOperations: Object.entries(performanceSummary)
          .filter(([_, metrics]) => metrics.p95 > 1000)
          .map(([name, metrics]) => ({
            operation: name,
            p95: Math.round(metrics.p95),
            count: metrics.count
          }))
      },

      // Service dependencies
      dependencies: {
        supabase: dbHealth.healthy ? 'operational' : 'degraded',
        database: dbHealth.healthy ? 'operational' : 'degraded'
      }
    }

    // Return appropriate status code
    const statusCode = isHealthy ? 200 : (healthStatus.overall === 'critical' ? 503 : 200)

    return NextResponse.json(healthResponse, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Health check failed:', error)

    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache'
      }
    })
  }
}

// Support HEAD requests for simple health checks
export async function HEAD(request: NextRequest) {
  try {
    const dbHealth = await checkSupabaseHealth()
    const statusCode = dbHealth.healthy ? 200 : 503

    return new NextResponse(null, { status: statusCode })
  } catch {
    return new NextResponse(null, { status: 503 })
  }
}
