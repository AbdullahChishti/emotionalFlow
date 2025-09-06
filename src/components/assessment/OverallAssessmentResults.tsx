import React from 'react'
import { motion } from 'framer-motion'
import { OverallAssessmentResult } from '@/lib/services/OverallAssessmentService'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

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
      manifestations: [],
      unconsciousManifestations: [],
      supportiveMessage: ha?.supportiveMessage || ''
    }

    return { overallAssessmentData: legacyOverall, aiAnalysis: legacyAnalysis }
  }

  const { overallAssessmentData, aiAnalysis } = buildLegacyData(overallAssessment)
  const { summary, allAssessments, assessmentCount, dateRange } = overallAssessmentData

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

  return (
    <div className={`max-w-5xl mx-auto space-y-8 ${className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl mb-6 shadow-lg">
          <span className="material-symbols-outlined text-3xl text-blue-600">psychology</span>
        </div>
        <h1 className="text-4xl font-light text-slate-900 mb-4">Your Personalized Mental Health Profile</h1>
        <p className="text-slate-600 max-w-3xl mx-auto text-lg leading-relaxed">
          A comprehensive, AI-powered analysis of your mental health assessments, designed to help you understand your patterns and take meaningful steps forward.
        </p>
      </motion.div>

      {/* Overall Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-white to-slate-50 rounded-3xl border border-slate-200/60 p-8 shadow-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-light text-slate-900">Your Mental Health Overview</h2>
          <span className={`px-4 py-2 rounded-2xl text-sm font-medium border-2 ${getRiskColor(summary.overallRiskLevel)}`}>
            {summary.overallRiskLevel.charAt(0).toUpperCase() + summary.overallRiskLevel.slice(1)} Level
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-6 bg-white/80 rounded-2xl border border-slate-200/40 shadow-sm">
            <div className="text-3xl font-bold text-slate-900 mb-2">{assessmentCount}</div>
            <div className="text-sm text-slate-600 font-light">Assessments Completed</div>
          </div>
          <div className="text-center p-6 bg-white/80 rounded-2xl border border-slate-200/40 shadow-sm">
            <div className="text-3xl font-bold text-slate-900 mb-2">{summary.averageScore.toFixed(1)}</div>
            <div className="text-sm text-slate-600 font-light">Average Score</div>
          </div>
          <div className="text-center p-6 bg-white/80 rounded-2xl border border-slate-200/40 shadow-sm">
            <div className="text-3xl font-bold text-slate-900 mb-2">
              {Math.ceil((new Date(dateRange.latest).getTime() - new Date(dateRange.earliest).getTime()) / (1000 * 60 * 60 * 24))}
            </div>
            <div className="text-sm text-slate-600 font-light">Days Tracked</div>
          </div>
        </div>

        {aiAnalysis.summary && (
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/60 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                <span className="material-symbols-outlined text-blue-600">insights</span>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-3 text-lg">What I'm Seeing in Your Patterns</h3>
                <p className="text-blue-800 leading-relaxed text-base">{aiAnalysis.summary}</p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Individual Assessment Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-lg"
      >
        <h2 className="text-2xl font-light text-slate-900 mb-6">Your Assessment Results</h2>
        <div className="grid gap-4">
          {Object.entries(allAssessments).map(([assessmentId, data], index) => (
            <motion.div
              key={assessmentId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-2xl border border-slate-200/40 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-slate-600">assessment</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">{data.assessment?.title || assessmentId.toUpperCase()}</h3>
                  <p className="text-slate-600 font-light">Score: {data.score} • {data.level}</p>
                </div>
              </div>
              <span className={`px-4 py-2 rounded-xl text-sm font-medium ${getSeverityColor(data.severity)}`}>
                {data.severity.charAt(0).toUpperCase() + data.severity.slice(1)}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Key Insights */}
      {aiAnalysis.keyInsights && aiAnalysis.keyInsights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl border border-indigo-200/60 p-8 shadow-lg"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-indigo-600 text-xl">lightbulb</span>
            </div>
            <h2 className="text-2xl font-light text-slate-900">Key Insights About Your Patterns</h2>
          </div>
          <div className="space-y-4">
            {aiAnalysis.keyInsights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-start gap-4 p-4 bg-white/80 rounded-2xl border border-indigo-200/40"
              >
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-indigo-600 text-sm font-bold">{index + 1}</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-base">{insight}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Manifestations */}
      {aiAnalysis.manifestations && aiAnalysis.manifestations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-lg"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-600 text-xl">visibility</span>
            </div>
            <h2 className="text-2xl font-light text-slate-900">How This Shows Up in Your Daily Life</h2>
          </div>
          <div className="grid gap-4">
            {aiAnalysis.manifestations.map((manifestation, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-start gap-4 p-4 bg-amber-50/50 rounded-2xl border border-amber-200/40"
              >
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="material-symbols-outlined text-amber-600 text-sm">arrow_forward</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-base">{manifestation}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Unconscious Manifestations */}
      {aiAnalysis.unconsciousManifestations && aiAnalysis.unconsciousManifestations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border border-purple-200/60 p-8 shadow-lg"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-purple-600 text-xl">psychology</span>
            </div>
            <h2 className="text-2xl font-light text-slate-900">Patterns You Might Not Notice</h2>
          </div>
          <div className="grid gap-4">
            {aiAnalysis.unconsciousManifestations.map((manifestation, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-start gap-4 p-4 bg-white/80 rounded-2xl border border-purple-200/40"
              >
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="material-symbols-outlined text-purple-600 text-sm">lightbulb</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-base">{manifestation}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recommendations */}
      {aiAnalysis.overallRecommendations && aiAnalysis.overallRecommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border border-green-200/60 p-8 shadow-lg"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600 text-xl">recommend</span>
            </div>
            <h2 className="text-2xl font-light text-slate-900">Personalized Recommendations for You</h2>
          </div>
          <div className="grid gap-4">
            {aiAnalysis.overallRecommendations.map((recommendation, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-start gap-4 p-4 bg-white/80 rounded-2xl border border-green-200/40"
              >
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-base">{recommendation}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Next Steps */}
      {aiAnalysis.nextSteps && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl border border-orange-200/60 p-8 shadow-lg"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-orange-600 text-xl">trending_up</span>
            </div>
            <h2 className="text-2xl font-light text-slate-900">Your Next Steps</h2>
          </div>
          <div className="p-6 bg-white/80 rounded-2xl border border-orange-200/40">
            <p className="text-slate-700 leading-relaxed text-lg">{aiAnalysis.nextSteps}</p>
          </div>
        </motion.div>
      )}

      {/* Supportive Message */}
      {aiAnalysis.supportiveMessage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl border border-blue-200/60 p-8 shadow-lg"
        >
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0 mt-2">
              <span className="material-symbols-outlined text-blue-600 text-2xl">favorite</span>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-4 text-xl">A Message of Support</h3>
              <p className="text-blue-800 leading-relaxed text-lg">{aiAnalysis.supportiveMessage}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      {onRetake && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
        >
          <button
            onClick={onRetake}
            className="px-8 py-4 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-2xl hover:from-slate-700 hover:to-slate-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span className="material-symbols-outlined mr-2">refresh</span>
            Update Your Assessments
          </button>
          <button
            onClick={() => window.print()}
            className="px-8 py-4 bg-white border-2 border-slate-300 text-slate-700 rounded-2xl hover:border-slate-400 hover:bg-slate-50 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span className="material-symbols-outlined mr-2">print</span>
            Save as PDF
          </button>
        </motion.div>
      )}
    </div>
  )
}

// Loading component for overall assessment
export function OverallAssessmentLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
          <span className="material-symbols-outlined text-2xl text-blue-600">analytics</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Generating Your Overall Assessment</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          We're analyzing all your assessments to provide comprehensive insights...
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
        <LoadingSpinner size="lg" />
        <p className="text-slate-600 mt-4">This may take a moment as we process your complete mental health profile.</p>
      </div>
    </div>
  )
}

export default OverallAssessmentResults
