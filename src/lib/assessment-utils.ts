/**
 * Assessment Utilities
 * Centralized utilities for assessment counting and progress calculation
 * Ensures consistency across all components
 */

import { ASSESSMENTS, AssessmentResult } from '@/data/assessments'

/**
 * Get all available assessment IDs from the ASSESSMENTS object
 */
export function getAvailableAssessmentIds(): string[] {
  return Object.keys(ASSESSMENTS)
}

/**
 * Calculate assessment progress from completed assessments
 */
export function calculateAssessmentProgress(
} {
  const availableIds = getAvailableAssessmentIds()
  const completedIds = Object.keys(completedAssessments)
  const completed = completedIds.length
  const total = availableIds.length
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return {
    completed,
    total,
    percentage,
    availableIds,
    completedIds
  }
}

/**
 * Calculate coverage statistics for assessments
 */
export function calculateAssessmentCoverage(
} {
  const availableIds = getAvailableAssessmentIds()
  const now = Date.now()
  const assessed: string[] = []
  const missing: string[] = []
  const stale: string[] = []

  for (const id of availableIds) {
    const dt = latestMeta[id]
    if (!dt) {
      missing.push(id)
      continue
    }
    const ageDays = Math.floor((now - new Date(dt).getTime()) / (1000 * 60 * 60 * 24))
    if (ageDays > staleCutoffDays) {
      stale.push(id)
    } else {
      assessed.push(id)
    }
  }

  const totalCompleted = assessed.length + stale.length
  const totalAvailable = availableIds.length
  const completionPercentage = totalAvailable > 0 ? Math.round((totalCompleted / totalAvailable) * 100) : 0

  return {
    assessed,
    stale,
    missing,
    totalCompleted,
    totalAvailable,
    completionPercentage
  }
}

/**
 * Get completion status for all assessments
 */
export function getAssessmentCompletionStatus(
  const availableIds = getAvailableAssessmentIds()
  return availableIds.reduce((acc, id) => {
    acc[id] = !!completedAssessments[id]
    return acc
  }, {} as Record<string, boolean>)
}

/**
 * Validate assessment counts for debugging
 * Logs discrepancies between different counting methods
 */
export function validateAssessmentCounts(
  }
  const availableIds = getAvailableAssessmentIds()
  const totalAvailable = availableIds.length
  
  // Check for inconsistencies
  const inconsistencies: string[] = []
  
  if (data.completedAssessments && data.progress) {
    const actualCompleted = Object.keys(data.completedAssessments).length
    if (actualCompleted !== data.progress.completed) {
      inconsistencies.push(`Progress completed (${data.progress.completed}) doesn't match actual completed (${actualCompleted})`)
    }
    if (data.progress.total !== totalAvailable) {
      inconsistencies.push(`Progress total (${data.progress.total}) doesn't match available assessments (${totalAvailable})`)
    }
  }

  if (data.coverage && data.completedAssessments) {
    const coverageTotal = data.coverage.assessed.length + data.coverage.stale.length
    const actualCompleted = Object.keys(data.completedAssessments).length
    if (coverageTotal !== actualCompleted) {
      inconsistencies.push(`Coverage total (${coverageTotal}) doesn't match completed assessments (${actualCompleted})`)
    }
  }

  if (inconsistencies.length > 0) {
  } else {
  }
}

/**
 * Debug helper to log assessment data structure
 */
export function debugAssessmentData(componentName: string, data: any): void {
  if (process.env.NODE_ENV === 'development') {
    // Debug logging removed for production
  }
}

/**
 * Get unique assessment types and count from assessment array
 */
export function uniqueAssessmentTypes(assessments: any[]): { types: string[], count: number } {
  const uniqueTypes = [...new Set(assessments.map(a => a.assessmentId || a.assessment_id))]
  return {
  }
}

/**
 * Compute date range from array of objects with date properties
 */
export function computeDateRange(items: { completedAt: string }[]): { earliest: string, latest: string } {
  if (items.length === 0) {
    const now = new Date().toISOString()
    return { earliest: now, latest: now }
  }

  const dates = items.map(item => new Date(item.completedAt).getTime()).filter(time => !isNaN(time))
  
  if (dates.length === 0) {
    const now = new Date().toISOString()
    return { earliest: now, latest: now }
  }

  const earliest = new Date(Math.min(...dates)).toISOString()
  const latest = new Date(Math.max(...dates)).toISOString()

  return { earliest, latest }
}