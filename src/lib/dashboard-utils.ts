/**
 * Dashboard Utilities
 * Shared utility functions for dashboard components
 */

// Generation error types
export type GenerationError =
  | 'NO_USER'
  | 'NO_ASSESSMENTS'
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'SERVICE_ERROR'
  | 'AUTH_ERROR'
  | 'DATA_ERROR'
  | 'UNKNOWN_ERROR'

// Error message interface
export interface ErrorInfo {
  title: string
  message: string
  canRetry: boolean
}

/**
 * Classify error type for better handling
 */
export const classifyError = (error: any): GenerationError => {
  if (!error) return 'UNKNOWN_ERROR'

  const errorMessage = error.message?.toLowerCase() || ''
  const errorString = error.toString?.()?.toLowerCase() || ''

  // Check for specific error patterns
  if (errorMessage.includes('no assessments') || errorMessage.includes('assessment history')) {
    return 'NO_ASSESSMENTS'
  }
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return 'TIMEOUT_ERROR'
  }
  if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
    return 'NETWORK_ERROR'
  }
  if (errorMessage.includes('unauthorized') || errorMessage.includes('auth') || errorMessage.includes('401')) {
    return 'AUTH_ERROR'
  }
  if (errorMessage.includes('service') || errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('503')) {
    return 'SERVICE_ERROR'
  }
  if (errorMessage.includes('data') || errorMessage.includes('parse') || errorMessage.includes('validation')) {
    return 'DATA_ERROR'
  }

  return 'UNKNOWN_ERROR'
}

/**
 * Get error message for user display
 */
export const getErrorMessage = (errorType: GenerationError, retryCount: number): ErrorInfo => {
  switch (errorType) {
    case 'NO_USER':
      return {
        title: 'Authentication Required',
        message: 'Please log in to generate your insights.',
        canRetry: false
      }
    case 'NO_ASSESSMENTS':
      return {
        title: 'No Assessments Found',
        message: 'Complete at least one assessment to generate personalized insights.',
        canRetry: false
      }
    case 'NETWORK_ERROR':
      return {
        title: 'Connection Issue',
        message: retryCount > 0 ? 'Still having connection issues. Please check your internet connection.' : 'Unable to connect to our servers. Please check your internet connection.',
        canRetry: true
      }
    case 'TIMEOUT_ERROR':
      return {
        title: 'Request Timeout',
        message: retryCount > 0 ? 'The analysis is taking longer than expected. This might be due to high server load.' : 'The analysis is taking longer than expected. Let\'s try again.',
        canRetry: true
      }
    case 'SERVICE_ERROR':
      return {
        title: 'Service Temporarily Unavailable',
        message: retryCount > 0 ? 'Our AI analysis service is experiencing issues. Please try again in a few minutes.' : 'Our analysis service is temporarily unavailable.',
        canRetry: true
      }
    case 'AUTH_ERROR':
      return {
        title: 'Authentication Error',
        message: 'Your session has expired. Please refresh the page and try again.',
        canRetry: false
      }
    case 'DATA_ERROR':
      return {
        title: 'Data Processing Error',
        message: 'There was an issue processing your assessment data. Please try again.',
        canRetry: true
      }
    default:
      return {
        title: 'Unexpected Error',
        message: retryCount > 0 ? 'We\'re still experiencing technical difficulties. Please try again later.' : 'Something unexpected happened. Let\'s try again.',
        canRetry: true
      }
  }
}

/**
 * Get severity color for assessments
 */
export const getSeverityColor = (severity: string): string => {
  const colors = {
    normal: 'text-green-600 bg-green-100',
    mild: 'text-emerald-600 bg-emerald-100',
    moderate: 'text-amber-600 bg-amber-100',
    severe: 'text-orange-600 bg-orange-100',
    critical: 'text-red-600 bg-red-100'
  }
  return colors[severity as keyof typeof colors] || 'text-slate-600 bg-slate-100'
}

/**
 * Map level bands to badge styles
 */
export const getLevelBadgeClasses = (level: string): string => {
  const map: Record<string, string> = {
    low: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
    mild: 'text-amber-700 bg-amber-50 border border-amber-200',
    high: 'text-rose-700 bg-rose-50 border border-rose-200',
    moderate: 'text-slate-700 bg-slate-50 border border-slate-200',
    critical: 'text-slate-700 bg-slate-50 border border-slate-200'
  }
  return map[level?.toLowerCase()] || map.moderate
}

/**
 * Get pill classes for wellness dimensions
 */
export const getPillClasses = (): string => {
  // Neutral, minimal styling only (grey/white)
  return 'border-slate-300 hover:border-slate-400 shadow-sm hover:shadow-md'
}

/**
 * Get maximum score for an assessment
 */
export const getMaxScore = (assessmentId: string): number => {
  const { ASSESSMENTS } = require('@/data/assessments')
  const assessment = ASSESSMENTS[assessmentId]
  if (!assessment) return 100
  const lastRange = assessment.scoring.ranges[assessment.scoring.ranges.length - 1]
  return lastRange?.max ?? 100
}

/**
 * Format relative time
 */
export const formatRelative = (iso?: string): string => {
  if (!iso) return ''
  const diffMs = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (d <= 0) {
    const h = Math.floor(diffMs / (1000 * 60 * 60))
    if (h > 0) return `${h}h ago`
    const m = Math.max(1, Math.floor(diffMs / (1000 * 60)))
    return `${m}m ago`
  }
  if (d < 7) return `${d}d ago`
  const w = Math.floor(d / 7)
  if (w < 8) return `${w}w ago`
  const mo = Math.floor(d / 30)
  return `${mo}mo ago`
}

/**
 * Truncate text
 */
export const truncate = (text: string, len = 120): string => {
  if (!text) return ''
  return text.length > len ? `${text.slice(0, len).trim()}…` : text
}

/**
 * Get greeting based on time of day
 */
export const getGreeting = (): string => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

/**
 * Get formatted date
 */
export const getFormattedDate = (): string => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Key label mapping for wellness dimensions
 */
export const keyLabel = (key: string): string => {
  switch (key) {
    case 'anxiety': return 'Anxiety'
    case 'depression': return 'Depression'
    case 'stress': return 'Stress'
    case 'wellbeing': return 'Well-being'
    case 'resilience': return 'Resilience'
    case 'trauma_exposure': return 'Trauma exposure'
    default: return key
  }
}
