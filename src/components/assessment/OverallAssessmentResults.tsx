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
    <div className={`max-w-6xl mx-auto space-y-8 ${className}`}>
      {/* Enhanced Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border border-slate-200/50 shadow-lg"
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-green-500/5" />
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-emerald-200/20 to-green-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-gradient-to-tr from-teal-200/20 to-emerald-200/20 rounded-full blur-2xl" />

        {/* Header Content */}
        <div className="relative px-8 py-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl mb-6 shadow-lg">
              <span className="material-symbols-outlined text-3xl text-white">psychology</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3">
              Your Mental Health Journey
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              A comprehensive analysis of your mental wellness based on {assessmentCount} assessments
            </p>
          </div>

          {/* Risk Assessment Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-8 shadow-xl"
          >
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <RiskDial level={summary.overallRiskLevel} />
              </div>
              <div className="flex-1 text-center lg:text-left">
                <div className="text-sm uppercase tracking-wider text-slate-500 mb-2">Current Risk Level</div>
                <div className="text-3xl font-bold text-slate-900 mb-4 capitalize">
                  {summary.overallRiskLevel} Risk
                </div>
                <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getRiskColor(summary.overallRiskLevel)} font-medium`}>
                    <span className="w-2 h-2 bg-current rounded-full"></span>
                    {summary.overallRiskLevel} Risk
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white/80 font-medium">
                    <span className="material-symbols-outlined text-lg">assessment</span>
                    {assessmentCount} Assessments
                  </div>
                </div>
                <div className="mt-4 text-sm text-slate-600">
                  <span className="font-medium">Focus Area:</span> {summary.highestRiskArea || 'General Wellness'}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Enhanced Stats Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200/50 p-6 hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-lg">analytics</span>
              </div>
              <div className="text-sm text-slate-600 font-medium">Assessments</div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{assessmentCount}</div>
            <div className="text-sm text-slate-500">Completed & Analyzed</div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50 p-6 hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-lg">score</span>
              </div>
              <div className="text-sm text-slate-600 font-medium">Average Score</div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{summary.averageScore.toFixed(1)}</div>
            <div className="text-sm text-slate-500">Out of 100 points</div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200/50 p-6 hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-emerald-500/5" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-lg">calendar_view_day</span>
              </div>
              <div className="text-sm text-slate-600 font-medium">Tracking Period</div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {Math.ceil((new Date(dateRange.latest).getTime() - new Date(dateRange.earliest).getTime()) / (1000 * 60 * 60 * 24))}
            </div>
            <div className="text-sm text-slate-500">Days of insights</div>
          </div>
        </div>
      </motion.div>

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

      {/* Enhanced Individual Assessment Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-600">assessment</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Assessment Breakdown</h3>
              <p className="text-sm text-slate-600">Detailed analysis of your mental health areas</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-50">
        {Object.entries(allAssessments).map(([assessmentId, data]: [string, any], index: number) => {
          const max = ASSESSMENTS[assessmentId]?.scoring?.ranges?.slice(-1)[0]?.max || 100
          const pct = Math.round((data.score / max) * 100)
          const series = (seriesByAssessment && seriesByAssessment[assessmentId]) || []
          const severityColor = (
            data.severity === 'critical' ? '#ef4444' :
            data.severity === 'severe' ? '#f97316' :
            data.severity?.includes('moderate') ? '#f59e0b' : '#10b981'
          )
          return (
            <motion.div
              key={assessmentId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + index * 0.05 }}
                className="group px-6 py-4 hover:bg-slate-50/50 transition-colors duration-200"
              >
                <div className="grid grid-cols-[auto,1fr,auto] items-center gap-4">
                  <div className="relative">
              <MiniRing pct={pct} color={severityColor} />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border border-slate-200 flex items-center justify-center">
                      <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: severityColor }}></div>
                    </div>
                  </div>

              <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-slate-900 truncate">{data.assessment?.title || assessmentId.toUpperCase()}</h4>
                      <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 font-medium whitespace-nowrap">
                        {data.level}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">{data.score}</span>
                        <span className="text-sm text-slate-500">/ {max}</span>
                        <span className="text-xs text-slate-400">({pct}%)</span>
                </div>
                  {series.length > 1 && <Sparkline values={series} color="#64748b" />}
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: severityColor,
                          boxShadow: `0 0 8px ${severityColor}30`
                        }}
                      />
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${getSeverityColor(data.severity)}`}>
                      <span className="w-1.5 h-1.5 bg-current rounded-full"></span>
                      {data.severity}
                    </span>
                  </div>
                </div>
            </motion.div>
          )
        })}
      </div>
      </motion.div>

      {/* Enhanced Key Insights */}
      {aiAnalysis.keyInsights && aiAnalysis.keyInsights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-lime-50 to-emerald-50 border border-lime-200/50 shadow-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-lime-500/5 to-emerald-500/5" />
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-lime-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-lg">lightbulb</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900">Key Insights</h3>
                <p className="text-sm text-slate-600">Important patterns and discoveries from your assessments</p>
              </div>
              <div className="w-16 h-16 opacity-20">
                <img src="/assets/Thinking_face-bro_1.svg" alt="" className="w-full h-full object-contain" />
              </div>
          </div>
            <div className="space-y-3">
              {aiAnalysis.keyInsights.map((insight: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 hover:shadow-sm transition-shadow duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                    <span className="text-slate-700 text-sm leading-relaxed">{insight}</span>
                  </div>
                </motion.div>
              ))}
            </div>
        </div>
        </motion.div>
      )}

      {/* Enhanced Daily-Life Impacts */}
      {aiAnalysis.manifestations && aiAnalysis.manifestations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50 shadow-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5" />
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-lg">person</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900">Daily-Life Impacts</h3>
                <p className="text-sm text-slate-600">How your mental health affects your everyday experiences</p>
              </div>
              <div className="w-16 h-16 opacity-20">
                <img src="/assets/Overwhelmed-bro_1.svg" alt="" className="w-full h-full object-contain" />
              </div>
          </div>
            <div className="space-y-3">
              {aiAnalysis.manifestations.map((manifestation: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 hover:shadow-sm transition-shadow duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-white text-sm">warning</span>
                    </div>
                    <span className="text-slate-700 text-sm leading-relaxed">{manifestation}</span>
                  </div>
                </motion.div>
              ))}
            </div>
        </div>
        </motion.div>
      )}

      {/* Enhanced Unconscious Patterns */}
      {aiAnalysis.unconsciousManifestations && aiAnalysis.unconsciousManifestations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200/50 shadow-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-emerald-500/5" />
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-lg">psychology</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900">Unconscious Patterns</h3>
                <p className="text-sm text-slate-600">Hidden patterns that may influence your behavior and thoughts</p>
              </div>
              <div className="w-16 h-16 opacity-20">
                <img src="/assets/Psychologist-amico.svg" alt="" className="w-full h-full object-contain" />
              </div>
          </div>
            <div className="space-y-3">
              {aiAnalysis.unconsciousManifestations.map((manifestation: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 hover:shadow-sm transition-shadow duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-white text-sm">visibility_off</span>
                    </div>
                    <span className="text-slate-700 text-sm leading-relaxed">{manifestation}</span>
                  </div>
                </motion.div>
              ))}
            </div>
        </div>
        </motion.div>
      )}

      {/* Enhanced Recommendations */}
      {aiAnalysis.overallRecommendations && aiAnalysis.overallRecommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/50 shadow-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5" />
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-lg">recommend</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900">Personalized Recommendations</h3>
                <p className="text-sm text-slate-600">Actionable steps tailored to your mental health profile</p>
              </div>
              <div className="w-16 h-16 opacity-20">
                <img src="/assets/Peace_of_mind-bro_2.svg" alt="" className="w-full h-full object-contain" />
              </div>
          </div>
            <div className="space-y-3">
              {aiAnalysis.overallRecommendations.map((recommendation: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 hover:shadow-sm transition-shadow duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-white text-sm">check_circle</span>
                    </div>
                    <span className="text-slate-700 text-sm leading-relaxed">{recommendation}</span>
                  </div>
                </motion.div>
              ))}
            </div>
        </div>
        </motion.div>
      )}

      {/* Enhanced Next Steps */}
      {aiAnalysis.nextSteps && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-lime-50 to-green-50 border border-lime-200/50 shadow-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-lime-500/5 to-green-500/5" />
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-lime-500 to-green-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-lg">trending_up</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900">Your Next Steps</h3>
                <p className="text-sm text-slate-600">Strategic guidance for your mental health journey ahead</p>
              </div>
              <div className="w-16 h-16 opacity-20">
                <img src="/assets/personal_growth-bro_1.svg" alt="" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50">
              <p className="text-slate-700 text-sm leading-relaxed">{aiAnalysis.nextSteps}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Enhanced Personalized Summary */}
      {aiAnalysis.personalizedSummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200/50 shadow-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5" />
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-lg">person</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900">Personalized Summary</h3>
                <p className="text-sm text-slate-600">Your unique mental health profile and story</p>
              </div>
              <div className="w-16 h-16 opacity-20">
                <img src="/assets/Contemplating-bro_1.svg" alt="" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50">
              <p className="text-slate-700 text-sm leading-relaxed">{aiAnalysis.personalizedSummary}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Enhanced Patterns & Triggers */}
      {aiAnalysis.patternsAndTriggers && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200/50 shadow-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-emerald-500/5" />
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-lg">timeline</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900">Patterns & Triggers</h3>
                <p className="text-sm text-slate-600">Understanding your mental health patterns and what influences them</p>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50">
              <p className="text-slate-700 text-sm leading-relaxed">{aiAnalysis.patternsAndTriggers}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Enhanced Psychological Framework */}
      {aiAnalysis.psychologicalFramework && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/50 shadow-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5" />
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-lg">psychology</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900">Psychological Framework</h3>
                <p className="text-sm text-slate-600">Evidence-based understanding of your mental health dynamics</p>
              </div>
              <div className="w-16 h-16 opacity-20">
                <img src="/assets/Psychologist-bro.svg" alt="" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50">
              <p className="text-slate-700 text-sm leading-relaxed">{aiAnalysis.psychologicalFramework}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Enhanced Strengths & Resilience */}
      {aiAnalysis.strengthsAndProtectiveFactors && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50 shadow-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5" />
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-lg">shield</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900">Strengths & Resilience</h3>
                <p className="text-sm text-slate-600">Your protective factors and inner strengths</p>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50">
              <p className="text-slate-700 text-sm leading-relaxed">{aiAnalysis.strengthsAndProtectiveFactors}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Enhanced Actionable Steps */}
      {aiAnalysis.actionableSteps && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200/50 shadow-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5" />
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-lg">checklist</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900">Actionable Steps</h3>
                <p className="text-sm text-slate-600">Practical steps you can take to improve your mental health</p>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50">
              <p className="text-slate-700 text-sm leading-relaxed">{aiAnalysis.actionableSteps}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Enhanced Professional Help Guidance */}
      {aiAnalysis.severityGuidance && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200/50 shadow-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-emerald-500/5" />
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-lg">health_and_safety</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900">When to Seek Professional Help</h3>
                <p className="text-sm text-slate-600">Important guidance about when to reach out for professional support</p>
              </div>
              <div className="w-16 h-16 opacity-20">
                <img src="/assets/Psychologist-cuate.svg" alt="" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50">
              <p className="text-slate-700 text-sm leading-relaxed">{aiAnalysis.severityGuidance}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Enhanced Progress Over Time */}
      {aiAnalysis.trendAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7, duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-lime-50 to-emerald-50 border border-lime-200/50 shadow-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-lime-500/5 to-emerald-500/5" />
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-lime-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-lg">show_chart</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900">Your Progress Over Time</h3>
                <p className="text-sm text-slate-600">Tracking your mental health journey and improvements</p>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50">
              <p className="text-slate-700 text-sm leading-relaxed">{aiAnalysis.trendAnalysis}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Enhanced Personalized Roadmap */}
      {aiAnalysis.personalizedRoadmap && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-teal-50 border border-green-200/50 shadow-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-teal-500/5" />
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-lg">route</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900">Personalized Roadmap</h3>
                <p className="text-sm text-slate-600">Your customized path to better mental health</p>
              </div>
              <div className="w-16 h-16 opacity-20">
                <img src="/assets/Marriage_counseling-bro.svg" alt="" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50">
              <p className="text-slate-700 text-sm leading-relaxed">{aiAnalysis.personalizedRoadmap}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Enhanced Supportive Message */}
      {aiAnalysis.supportiveMessage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.9, duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200/50 shadow-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5" />
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-lg">favorite</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900">Supportive Message</h3>
                <p className="text-sm text-slate-600">Words of encouragement and understanding</p>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50">
              <p className="text-slate-700 text-sm leading-relaxed">{aiAnalysis.supportiveMessage}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Enhanced Action Buttons */}
      {onRetake && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0, duration: 0.4 }}
          className="mt-12"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Ready for Next Steps?</h3>
              <p className="text-slate-600">Continue your mental health journey with updated assessments or save your results</p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={onRetake}
                className="px-8 py-3 text-base font-medium border-2 hover:bg-slate-50 transition-all duration-200 group"
              >
                <span className="material-symbols-outlined text-lg mr-2 group-hover:scale-110 transition-transform duration-200">refresh</span>
                Update Assessments
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={() => window.print()}
                className="px-8 py-3 text-base font-medium bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-200 group"
              >
                <span className="material-symbols-outlined text-lg mr-2 group-hover:scale-110 transition-transform duration-200">download</span>
            Save as PDF
          </Button>
        </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Enhanced loading component for overall assessment
export function OverallAssessmentLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border border-slate-200/50 shadow-lg"
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-green-500/5" />
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-emerald-200/20 to-green-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-gradient-to-tr from-teal-200/20 to-emerald-200/20 rounded-full blur-2xl" />

        <div className="relative px-8 py-16 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl mb-8 shadow-xl">
            <span className="material-symbols-outlined text-4xl text-white animate-pulse">psychology</span>
        </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-4">
            Analyzing Your Journey
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            We're synthesizing all your assessments to create a comprehensive mental health profile...
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-8 shadow-xl max-w-lg mx-auto"
          >
        <LoadingSpinner size="lg" />
            <p className="text-slate-700 mt-6 text-lg">
              This comprehensive analysis may take a moment as we process your complete mental health profile.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </motion.div>
      </div>
      </motion.div>
    </div>
  )
}

export default OverallAssessmentResults
