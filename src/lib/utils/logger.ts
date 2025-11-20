/**
 * Production-safe logger utility
 * Respects NODE_ENV and sanitizes sensitive data in production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LoggerConfig {
  enabled: boolean
  level: LogLevel
  sanitize: boolean
}

class Logger {
  private config: LoggerConfig

  constructor() {
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    this.config = {
      enabled: isDevelopment,
      level: isDevelopment ? 'debug' : 'error',
      sanitize: !isDevelopment
    }
  }

  /**
   * Sanitize sensitive data before logging
   */
  private sanitize(data: any): any {
    if (!this.config.sanitize || !data) return data

    // Don't sanitize primitives
    if (typeof data !== 'object') return data

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item))
    }

    // Sanitize objects
    const sanitized: any = {}
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase()
      
      // Redact sensitive fields
      if (
        lowerKey.includes('password') ||
        lowerKey.includes('token') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('key') ||
        lowerKey.includes('auth')
      ) {
        sanitized[key] = '[REDACTED]'
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitize(value)
      } else {
        sanitized[key] = value
      }
    }
    
    return sanitized
  }

  /**
   * Format log message with timestamp and context
   */
  private format(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`
    
    if (data) {
      const sanitizedData = this.sanitize(data)
      return `${prefix} ${message} ${JSON.stringify(sanitizedData, null, 2)}`
    }
    
    return `${prefix} ${message}`
  }

  /**
   * Debug level logging (development only)
   */
  debug(message: string, data?: any): void {
    if (!this.config.enabled) return
    
    if (this.config.level === 'debug') {
      console.log(this.format('debug', message, data))
    }
  }

  /**
   * Info level logging (development only)
   */
  info(message: string, data?: any): void {
    if (!this.config.enabled) return
    
    console.log(this.format('info', message, data))
  }

  /**
   * Warning level logging (always enabled)
   */
  warn(message: string, data?: any): void {
    console.warn(this.format('warn', message, data))
  }

  /**
   * Error level logging (always enabled)
   */
  error(message: string, error?: any): void {
    const sanitizedError = this.sanitize(error)
    console.error(this.format('error', message, sanitizedError))
  }

  /**
   * Create a scoped logger with a prefix
   */
  scope(prefix: string) {
    return {
      debug: (msg: string, data?: any) => this.debug(`[${prefix}] ${msg}`, data),
      info: (msg: string, data?: any) => this.info(`[${prefix}] ${msg}`, data),
      warn: (msg: string, data?: any) => this.warn(`[${prefix}] ${msg}`, data),
      error: (msg: string, error?: any) => this.error(`[${prefix}] ${msg}`, error)
    }
  }
}

// Export singleton instance
export const logger = new Logger()

// Export scoped logger creator
export const createLogger = (scope: string) => logger.scope(scope)

// Export default
export default logger
