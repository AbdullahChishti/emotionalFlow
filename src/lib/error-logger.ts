/**
 * Error Logger Service
 * Centralized error logging and monitoring
 */

interface ErrorContext {
  userId?: string
  sessionId?: string
  component?: string
  action?: string
  metadata?: Record<string, any>
}

interface ErrorLog {
  id: string
  timestamp: Date
  level: 'error' | 'warning' | 'info'
  message: string
  stack?: string
  context: ErrorContext
  userAgent: string
  url: string
}

class ErrorLogger {
  private logs: ErrorLog[] = []
  private maxLogs = 100 // Keep last 100 errors in memory

  /**
   * Log an error with context
   */
  logError(
    error: Error | string,
    context: ErrorContext = {},
    level: 'error' | 'warning' | 'info' = 'error'
  ): void {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date(),
      level,
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      context,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'server'
    }

    // Add to memory logs
    this.logs.unshift(errorLog)
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }

    // Console logging
    this.logToConsole(errorLog)

    // External service logging (in production)
    if (process.env.NODE_ENV === 'production') {
      this.logToExternalService(errorLog)
    }
  }

  /**
   * Log authentication errors
   */
  logAuthError(error: Error, action: string, userId?: string): void {
    this.logError(error, {
      userId,
      component: 'AuthProvider',
      action,
      metadata: { authError: true }
    })
  }

  /**
   * Log assessment errors
   */
  logAssessmentError(error: Error, assessmentId: string, userId?: string): void {
    this.logError(error, {
      userId,
      component: 'AssessmentFlow',
      action: 'assessment_completion',
      metadata: { assessmentId }
    })
  }

  /**
   * Log chat errors
   */
  logChatError(error: Error, sessionId: string, userId?: string): void {
    this.logError(error, {
      userId,
      sessionId,
      component: 'ChatService',
      action: 'message_send',
      metadata: { chatError: true }
    })
  }

  /**
   * Log database errors
   */
  logDatabaseError(error: Error, operation: string, userId?: string): void {
    this.logError(error, {
      userId,
      component: 'Database',
      action: operation,
      metadata: { databaseError: true }
    })
  }

  /**
   * Log performance issues
   */
  logPerformanceIssue(message: string, duration: number, context: ErrorContext = {}): void {
    this.logError(`Performance issue: ${message} (${duration}ms)`, {
      ...context,
      metadata: { performanceIssue: true, duration }
    }, 'warning')
  }

  /**
   * Get recent error logs
   */
  getRecentLogs(count: number = 10): ErrorLog[] {
    return this.logs.slice(0, count)
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number
    errorsByLevel: Record<string, number>
    errorsByComponent: Record<string, number>
    recentErrors: ErrorLog[]
  } {
    const errorsByLevel = this.logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const errorsByComponent = this.logs.reduce((acc, log) => {
      const component = log.context.component || 'unknown'
      acc[component] = (acc[component] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalErrors: this.logs.length,
      errorsByLevel,
      errorsByComponent,
      recentErrors: this.logs.slice(0, 5)
    }
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = []
  }

  private generateId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private logToConsole(errorLog: ErrorLog): void {
    const { level, message, context, stack } = errorLog
    
    const logMethod = level === 'error' ? console.error : 
                     level === 'warning' ? console.warn : 
                     console.info

    logMethod(`🚨 [${level.toUpperCase()}] ${message}`, {
      context,
      stack: stack ? stack.split('\n').slice(0, 5) : undefined, // Limit stack trace
      timestamp: errorLog.timestamp.toISOString()
    })
  }

  private logToExternalService(errorLog: ErrorLog): void {
    // In production, this would send to external services like:
    // - Sentry
    // - LogRocket
    // - DataDog
    // - Custom analytics service
    
    try {
      // Example: Sentry.captureException(new Error(errorLog.message), {
      //   extra: errorLog.context,
      //   tags: {
      //     component: errorLog.context.component,
      //     action: errorLog.context.action
      //   }
      // })
      
      console.log('📊 Error sent to external service:', {
        id: errorLog.id,
        level: errorLog.level,
        component: errorLog.context.component
      })
    } catch (error) {
      console.error('Failed to send error to external service:', error)
    }
  }
}

// Singleton instance
export const errorLogger = new ErrorLogger()

// Convenience functions
export const logError = (error: Error | string, context?: ErrorContext) => 
  errorLogger.logError(error, context)

export const logAuthError = (error: Error, action: string, userId?: string) =>
  errorLogger.logAuthError(error, action, userId)

export const logAssessmentError = (error: Error, assessmentId: string, userId?: string) =>
  errorLogger.logAssessmentError(error, assessmentId, userId)

export const logChatError = (error: Error, sessionId: string, userId?: string) =>
  errorLogger.logChatError(error, sessionId, userId)

export const logDatabaseError = (error: Error, operation: string, userId?: string) =>
  errorLogger.logDatabaseError(error, operation, userId)

export const logPerformanceIssue = (message: string, duration: number, context?: ErrorContext) =>
  errorLogger.logPerformanceIssue(message, duration, context)

export default errorLogger
