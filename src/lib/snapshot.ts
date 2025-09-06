import { AssessmentManager } from '@/lib/services/AssessmentManager'
import { ASSESSMENTS } from '@/data/assessments'

export type SnapshotDimension = {
  key: string
  level: string
  evidence: string[]
}

export type NextBestAction = {
  title: string
  duration_min: number
  type: 'exercise' | 'education' | 'checkin' | 'assessment'
}

export type Snapshot = {
  as_of: string
  dimensions: SnapshotDimension[]
  confidence: 'low' | 'medium' | 'high'
  notes: string
  next_best_actions: NextBestAction[]
  explainability: {
    assessments_used: string[]
    last_updated: string
  }
}

const DISPLAY_MAP: Record<string, string> = {
  phq9: 'PHQ-9',
  gad7: 'GAD-7',
  'cd-risc': 'CD-RISC',
  pss10: 'PSS-10',
  who5: 'WHO-5',
  pcl5: 'PCL-5',
  ace: 'ACE'
}

function bandToLevel(severity?: string, fallback?: string): string {
  switch (severity) {
    case 'critical':
    case 'severe':
      return 'high'
    case 'moderate':
      return 'moderate'
    case 'mild':
      return 'mild'
    case 'normal':
      return 'low'
    default:
      return fallback || 'unknown'
  }
}

function latestByAssessment(history: any[]) {
  const byId: Record<string, any> = {}
  for (const h of history || []) {
    const key = h.assessmentId
    if (!key) continue
    if (!byId[key] || new Date(h.takenAt) > new Date(byId[key].takenAt)) {
      byId[key] = h
    }
  }
  return byId
}

function evidenceString(entry: any): string {
  const id = entry.assessmentId
  const display = DISPLAY_MAP[id] || id?.toUpperCase()
  const assessment = ASSESSMENTS[id]
  let max = 100
  if (assessment) {
    const lastRange = assessment.scoring.ranges[assessment.scoring.ranges.length - 1]
    max = lastRange?.max ?? max
  }
  return `${display}:${entry.score}/${max}`
}

function buildDimensions(byId: Record<string, any>): SnapshotDimension[] {
  const dims: SnapshotDimension[] = []
  // Anxiety (gad7)
  if (byId['gad7']) {
    dims.push({ key: 'anxiety', level: bandToLevel(byId['gad7'].severity, 'moderate'), evidence: [evidenceString(byId['gad7'])] })
  }
  // Depression (phq9)
  if (byId['phq9']) {
    dims.push({ key: 'depression', level: bandToLevel(byId['phq9'].severity, 'moderate'), evidence: [evidenceString(byId['phq9'])] })
  }
  // Stress (pss10)
  if (byId['pss10']) {
    dims.push({ key: 'stress', level: bandToLevel(byId['pss10'].severity, 'moderate'), evidence: [evidenceString(byId['pss10'])] })
  }
  // Wellbeing (who5)
  if (byId['who5']) {
    // Lower scores indicate lower wellbeing; map to descriptive band already provided
    dims.push({ key: 'wellbeing', level: bandToLevel(byId['who5'].severity, 'moderate_low'), evidence: [evidenceString(byId['who5'])] })
  }
  // Resilience (cd-risc)
  if (byId['cd-risc']) {
    dims.push({ key: 'resilience', level: bandToLevel(byId['cd-risc'].severity, 'moderate'), evidence: [evidenceString(byId['cd-risc'])] })
  }
  // Trauma exposure (ace or pcl5)
  if (byId['ace']) {
    dims.push({ key: 'trauma_exposure', level: bandToLevel(byId['ace'].severity, 'high'), evidence: [evidenceString(byId['ace'])] })
  } else if (byId['pcl5']) {
    dims.push({ key: 'trauma_exposure', level: bandToLevel(byId['pcl5'].severity, 'moderate'), evidence: [evidenceString(byId['pcl5'])] })
  }
  return dims
}

function pickActions(dimensions: SnapshotDimension[]): NextBestAction[] {
  // Next best actions feature has been removed from dashboard
  // Return empty array to maintain compatibility
  return []
}

export async function buildUserSnapshot(userId: string): Promise<Snapshot | null> {
  try {
    const history = await AssessmentManager.getAssessmentHistory(userId)
    if (!history || history.length === 0) return null
    const byId = latestByAssessment(history)
    const dims = buildDimensions(byId)
    const used = Object.keys(byId).map(id => DISPLAY_MAP[id] || id.toUpperCase())
    const snapshot: Snapshot = {
      as_of: new Date().toISOString(),
      dimensions: dims,
      confidence: 'medium',
      notes: 'Non-diagnostic. For support, consider professional care.',
      next_best_actions: pickActions(dims),
      explainability: {
        assessments_used: used,
        last_updated: new Date().toISOString()
      }
    }
    return snapshot
  } catch (e) {
    console.warn('buildUserSnapshot failed:', e)
    return null
  }
}

