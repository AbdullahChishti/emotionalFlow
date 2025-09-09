import React from 'react'
import { motion } from 'framer-motion'
import { OverallAssessmentResult } from '@/lib/services/OverallAssessmentService'
import { ASSESSMENTS } from '@/data/assessments'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'

interface OverallAssessmentResultsProps {
  overallAssessment: OverallAssessmentResult
  onRetake?: () => void
  className?: string
}

export function OverallAssessmentResults({
  overallAssessment,
  onRetake,
  className = ''
}: OverallAssessmentResultsProps) {
  // Backward/forward compatibility: support both legacy (overallAssessmentData + aiAnalysis)
  // and new holistic shape (assessmentData + holisticAnalysis)
  const buildLegacyData = (oa: any) => {
    if (oa?.overallAssessmentData && oa?.aiAnalysis) return oa

    const ad = oa?.assessmentData
    const ha = oa?.holisticAnalysis
    if (!ad) return { overallAssessmentData: undefined, aiAnalysis: {} }

    // Map assessments array to record keyed by assessmentId
    const allAssessments = (ad.assessments || []).reduce((acc: Record<string, any>, a: any) => {
      acc[a.assessmentId] = {
        score: a.score,
        level: a.level,
        severity: a.severity,
        takenAt: a.takenAt,
        assessment: { title: a.assessmentTitle }
      }
      return acc
    }, {})

    // Highest risk area
    const order: Record<string, number> = {
      none: 0,
      normal: 0,
      mild: 1,
      moderate: 2,
      moderately_severe: 3,
      severe: 4,
      critical: 5
    }
    let highestRiskArea = 'General Wellness'
    let highestScore = -1
    for (const a of ad.assessments || []) {
      const s = order[a.severity] ?? 0
      if (s > highestScore) {
        highestScore = s
        highestRiskArea = a.assessmentTitle || a.assessmentId?.toUpperCase()
      }
    }

    // Overall risk level (prefer AI if present)
    const severities: string[] = (ad.assessments || []).map((a: any) => a.severity)
    const calcRisk = () => {
      if (severities.includes('critical')) return 'critical'
      if (severities.includes('severe')) return 'high'
      if (severities.includes('moderate') || severities.includes('moderately_severe')) return 'moderate'
      return 'low'
    }

    const legacyOverall = {
      userId: ad.userId,
      allAssessments,
      assessmentCount: ad.assessmentCount,
      dateRange: ad.dateRange,
      summary: {
        totalScore: ad.totalScore,
        averageScore: ad.averageScore,
        highestRiskArea,
        overallRiskLevel: ha?.overallRiskLevel || calcRisk()
      }
    }

    const legacyAnalysis = {
      summary: ha?.executiveSummary || '',
      keyInsights: ha?.keyPatterns || ha?.crossAssessmentInsights || [],
      overallRecommendations: ha?.recommendations || [],
      riskAssessment: ha?.overallRiskLevel || legacyOverall.summary.overallRiskLevel,
      nextSteps: ha?.nextSteps || '',
      areasOfConcern: ha?.riskFactors || [],
      strengths: ha?.protectiveFactors || [],
      manifestations: ha?.manifestations || [],
      unconsciousManifestations: ha?.unconsciousManifestations || [],
      supportiveMessage: ha?.supportiveMessage || '',

      // New comprehensive analysis fields
      personalizedSummary: ha?.personalizedSummary || '',
      patternsAndTriggers: ha?.patternsAndTriggers || '',
      psychologicalFramework: ha?.psychologicalFramework || '',
      strengthsAndProtectiveFactors: ha?.strengthsAndProtectiveFactors || '',
      actionableSteps: ha?.actionableSteps || '',
      severityGuidance: ha?.severityGuidance || '',
      trendAnalysis: ha?.trendAnalysis || '',
      personalizedRoadmap: ha?.personalizedRoadmap || ''
    }

    // Build simple score series by assessmentId for sparklines
    const seriesByAssessment = (ad.assessments || []).reduce((acc: Record<string, number[]>, a: any) => {
      if (!acc[a.assessmentId]) acc[a.assessmentId] = []
      acc[a.assessmentId].push(a.score)
      return acc
    }, {})

    return { overallAssessmentData: legacyOverall, aiAnalysis: legacyAnalysis, seriesByAssessment }
  }

  const { overallAssessmentData, aiAnalysis, seriesByAssessment } = buildLegacyData(overallAssessment)
  const { summary, allAssessments, assessmentCount, dateRange } = overallAssessmentData

  // Debug logging for comprehensive analysis fields
  console.log('🔍 [OVERALL ASSESSMENT RESULTS] aiAnalysis object:', {
    hasPersonalizedSummary: !!aiAnalysis.personalizedSummary,
    hasPatternsAndTriggers: !!aiAnalysis.patternsAndTriggers,
    hasPsychologicalFramework: !!aiAnalysis.psychologicalFramework,
    hasStrengthsAndProtectiveFactors: !!aiAnalysis.strengthsAndProtectiveFactors,
    hasActionableSteps: !!aiAnalysis.actionableSteps,
    hasSeverityGuidance: !!aiAnalysis.severityGuidance,
    hasTrendAnalysis: !!aiAnalysis.trendAnalysis,
    hasPersonalizedRoadmap: !!aiAnalysis.personalizedRoadmap,
    aiAnalysisKeys: Object.keys(aiAnalysis)
  })

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-green-600 bg-green-50 border-green-200'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe':
      case 'critical': return 'text-red-600 bg-red-50'
      case 'moderate':
      case 'moderately_severe': return 'text-orange-600 bg-orange-50'
      case 'mild': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-green-600 bg-green-50'
    }
  }

  // Visual, minimal risk dial helpers
  const riskToPct = (level: string) => {
    const l = (level || '').toLowerCase()
    if (l.includes('critical')) return 100
    if (l.includes('high') || l.includes('severe')) return 80
    if (l.includes('moderate')) return 55
    if (l.includes('mild')) return 40
    if (l.includes('low') || l.includes('normal') || l.includes('none')) return 25
    return 30
  }
  const riskToHex = (level: string) => {
    const l = (level || '').toLowerCase()
    if (l.includes('critical')) return '#ef4444'
    if (l.includes('high') || l.includes('severe')) return '#f97316'
    if (l.includes('moderate')) return '#f59e0b'
    return '#10b981'
  }

  const RiskDial = ({ level }: { level: string }) => {
    // Visual fill represents wellness (inverse of risk)
    const pct = Math.max(0, Math.min(100, 100 - riskToPct(level)))
    const r = 44
    const c = 2 * Math.PI * r
    const stroke = riskToHex(level)
    return (
      <div className="relative w-[120px] h-[120px]">
        <svg width="120" height="120" viewBox="0 0 120 120" className="rotate-[-90deg]">
          <circle cx="60" cy="60" r={r} stroke="#e5e7eb" strokeWidth="6" fill="none" />
          <circle
            cx="60" cy="60" r={r}
            stroke={stroke}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${c} ${c}`}
            strokeDashoffset={`${c - (pct / 100) * c}`}
            fill="none"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 rotate-[90deg] flex flex-col items-center justify-center">
          <div className="text-xs uppercase tracking-wide text-slate-500">Risk</div>
          <div className="text-lg font-medium text-slate-900 leading-tight capitalize">
            {String(level || 'unknown')}
          </div>
        </div>
      </div>
    )
  }

  // Tiny ring for per-assessment completion/score
  const MiniRing = ({ pct, color = '#10b981' }: { pct: number; color?: string }) => {
    const r = 10
    const c = 2 * Math.PI * r
    const p = Math.max(0, Math.min(100, pct))
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" className="shrink-0">
        <circle cx="14" cy="14" r={r} stroke="#e5e7eb" strokeWidth="4" fill="none" />
        <circle
          cx="14" cy="14" r={r}
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={`${c - (p / 100) * c}`}
          fill="none"
          className="transition-all duration-500 ease-out"
        />
      </svg>
    )
  }

  // Simple sparkline for score trends
  const Sparkline = ({ values, color = '#64748b' }: { values: number[]; color?: string }) => {
    if (!values || values.length === 0) return null
    const w = 80, h = 24
    const max = Math.max(...values)
    const min = Math.min(...values)
    const norm = (v: number) => (max === min ? 0.5 : (v - min) / (max - min))
    const step = w / Math.max(1, values.length - 1)
    const d = values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${h - norm(v) * h}`).join(' ')
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="opacity-70">
        <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <div 
      className={`max-w-4xl mx-auto space-y-6 ${className}`}
      style={{
        fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Enhanced Header */}
      <div className="text-center py-8">
        <h1 
          className="text-3xl font-bold text-slate-900 mb-3"
          style={{
            fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            letterSpacing: '-0.02em',
            fontWeight: '700'
          }}
        >
          Your Mental Health Profile
        </h1>
        <p 
          className="text-slate-600"
          style={{
            fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            letterSpacing: '-0.01em',
            fontWeight: '300'
          }}
        >
          Analysis based on {assessmentCount} assessments
        </p>
      </div>

      {/* Risk Assessment */}
      <div 
        className="rounded-2xl p-6"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(16, 185, 129, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/10 via-teal-50/5 to-emerald-50/10 rounded-2xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <RiskDial level={summary.overallRiskLevel} />
          <div className="flex-1 text-center md:text-left">
            <div 
              className="text-sm text-slate-500 uppercase tracking-wide mb-1"
              style={{
                fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                letterSpacing: '0.05em',
                fontWeight: '400'
              }}
            >
              Risk Level
            </div>
            <div 
              className="text-2xl font-semibold text-slate-900 capitalize mb-2"
              style={{
                fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                letterSpacing: '-0.02em',
                fontWeight: '600'
              }}
            >
              {summary.overallRiskLevel} Risk
            </div>
            <div 
              className="text-sm text-slate-600"
              style={{
                fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                letterSpacing: '-0.01em',
                fontWeight: '300'
              }}
            >
              Focus area: {summary.highestRiskArea || 'General Wellness'}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div 
          className="rounded-xl p-4 text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(16, 185, 129, 0.1)',
            boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/10 via-teal-50/5 to-emerald-50/10 rounded-xl"></div>
          <div className="relative z-10">
            <div 
              className="text-xl font-semibold text-slate-900"
              style={{
                fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                letterSpacing: '-0.02em',
                fontWeight: '600'
              }}
            >
              {assessmentCount}
            </div>
            <div 
              className="text-sm text-slate-500"
              style={{
                fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                letterSpacing: '-0.005em',
                fontWeight: '400'
              }}
            >
              Assessments
            </div>
          </div>
        </div>
        <div 
          className="rounded-xl p-4 text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(16, 185, 129, 0.1)',
            boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/10 via-teal-50/5 to-emerald-50/10 rounded-xl"></div>
          <div className="relative z-10">
            <div 
              className="text-xl font-semibold text-slate-900"
              style={{
                fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                letterSpacing: '-0.02em',
                fontWeight: '600'
              }}
            >
              {summary.averageScore.toFixed(1)}
            </div>
            <div 
              className="text-sm text-slate-500"
              style={{
                fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                letterSpacing: '-0.005em',
                fontWeight: '400'
              }}
            >
              Avg Score
            </div>
          </div>
        </div>
        <div 
          className="rounded-xl p-4 text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(16, 185, 129, 0.1)',
            boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/10 via-teal-50/5 to-emerald-50/10 rounded-xl"></div>
          <div className="relative z-10">
            <div 
              className="text-xl font-semibold text-slate-900"
              style={{
                fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                letterSpacing: '-0.02em',
                fontWeight: '600'
              }}
            >
              {Math.ceil((new Date(dateRange.latest).getTime() - new Date(dateRange.earliest).getTime()) / (1000 * 60 * 60 * 24))}
            </div>
            <div 
              className="text-sm text-slate-500"
              style={{
                fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                letterSpacing: '-0.005em',
                fontWeight: '400'
              }}
            >
              Days
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Summary Section */}
      {aiAnalysis.summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200/50 shadow-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5" />
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-lg">insights</span>
        </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900">Your Mental Health Summary</h3>
                <p className="text-sm text-slate-600">AI-powered analysis of your overall wellness</p>
        </div>
              <div className="w-16 h-16 opacity-20">
                <img src="/assets/Mental_health-bro_2.svg" alt="" className="w-full h-full object-contain" />
        </div>
      </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50">
              <p className="text-slate-700 text-sm leading-relaxed">{aiAnalysis.summary}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Simple Assessment Overview */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">Assessment Breakdown</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {Object.entries(allAssessments).map(([assessmentId, data]: [string, any], index: number) => {
            const max = ASSESSMENTS[assessmentId]?.scoring?.ranges?.slice(-1)[0]?.max || 100
            const pct = Math.round((data.score / max) * 100)
            return (
              <div key={assessmentId} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-900">{data.assessment?.title || assessmentId.toUpperCase()}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">{data.level}</span>
                    </div>
                    <div className="text-sm text-slate-500">
                      Score: {data.score}/{max} ({pct}%)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getSeverityColor(data.severity)}`}>
                      {data.severity}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Simple Key Insights */}
      {aiAnalysis.keyInsights && aiAnalysis.keyInsights.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Key Insights</h3>
          <ul className="space-y-2">
            {aiAnalysis.keyInsights.map((insight: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-slate-400 mt-1">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Simple Daily-Life Impacts */}
      {aiAnalysis.manifestations && aiAnalysis.manifestations.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Daily-Life Impacts</h3>
          <ul className="space-y-2">
            {aiAnalysis.manifestations.map((manifestation: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-slate-400 mt-1">•</span>
                <span>{manifestation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Simple Unconscious Patterns */}
      {aiAnalysis.unconsciousManifestations && aiAnalysis.unconsciousManifestations.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Unconscious Patterns</h3>
          <ul className="space-y-2">
            {aiAnalysis.unconsciousManifestations.map((manifestation: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-slate-400 mt-1">•</span>
                <span>{manifestation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Simple Recommendations */}
      {aiAnalysis.overallRecommendations && aiAnalysis.overallRecommendations.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Recommendations</h3>
          <ul className="space-y-2">
            {aiAnalysis.overallRecommendations.map((recommendation: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-slate-400 mt-1">•</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Simple Next Steps */}
      {aiAnalysis.nextSteps && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Next Steps</h3>
          <p className="text-slate-700 text-sm leading-relaxed">{aiAnalysis.nextSteps}</p>
        </div>
      )}

      {/* Simple Personalized Summary */}
      {aiAnalysis.personalizedSummary && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Personalized Summary</h3>
          <p className="text-slate-700 text-sm leading-relaxed">{aiAnalysis.personalizedSummary}</p>
        </div>
      )}

      {/* Simple Patterns & Triggers */}
      {aiAnalysis.patternsAndTriggers && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Patterns & Triggers</h3>
          <p className="text-slate-700 text-sm leading-relaxed">{aiAnalysis.patternsAndTriggers}</p>
        </div>
      )}

      {/* Simple Psychological Framework */}
      {aiAnalysis.psychologicalFramework && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Psychological Framework</h3>
          <p className="text-slate-700 text-sm leading-relaxed">{aiAnalysis.psychologicalFramework}</p>
        </div>
      )}

      {/* Simple Strengths & Resilience */}
      {aiAnalysis.strengthsAndProtectiveFactors && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Strengths & Resilience</h3>
          <p className="text-slate-700 text-sm leading-relaxed">{aiAnalysis.strengthsAndProtectiveFactors}</p>
        </div>
      )}

      {/* Simple Actionable Steps */}
      {aiAnalysis.actionableSteps && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Actionable Steps</h3>
          <p className="text-slate-700 text-sm leading-relaxed">{aiAnalysis.actionableSteps}</p>
        </div>
      )}

      {/* Simple Professional Help Guidance */}
      {aiAnalysis.severityGuidance && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">When to Seek Professional Help</h3>
          <p className="text-slate-700 text-sm leading-relaxed">{aiAnalysis.severityGuidance}</p>
        </div>
      )}

      {/* Simple Progress Over Time */}
      {aiAnalysis.trendAnalysis && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Progress Over Time</h3>
          <p className="text-slate-700 text-sm leading-relaxed">{aiAnalysis.trendAnalysis}</p>
        </div>
      )}

      {/* Simple Personalized Roadmap */}
      {aiAnalysis.personalizedRoadmap && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Personalized Roadmap</h3>
          <p className="text-slate-700 text-sm leading-relaxed">{aiAnalysis.personalizedRoadmap}</p>
        </div>
      )}

      {/* Simple Supportive Message */}
      {aiAnalysis.supportiveMessage && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Supportive Message</h3>
          <p className="text-slate-700 text-sm leading-relaxed">{aiAnalysis.supportiveMessage}</p>
        </div>
      )}

      {/* Simple Action Buttons */}
      {onRetake && (
        <div className="mt-8 flex justify-center gap-4">
          <Button variant="outline" onClick={onRetake}>
            Update Assessments
          </Button>
          <Button variant="primary" onClick={() => window.print()}>
            Save as PDF
          </Button>
        </div>
      )}
    </div>
  )
}

// Simple loading component for overall assessment
export function OverallAssessmentLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-2xl mb-6">
          <span className="material-symbols-outlined text-2xl text-slate-600">psychology</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          Analyzing Your Results
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto mb-8">
          We're processing your assessment data...
        </p>
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center max-w-md mx-auto">
          <LoadingSpinner size="lg" />
          <p className="text-slate-600 mt-4">
            This may take a moment.
          </p>
        </div>
      </div>
    </div>
  )
}

export default OverallAssessmentResults
