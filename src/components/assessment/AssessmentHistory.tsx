/**
 * Assessment History Component
 * Displays user's assessment history and progress
 */

'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/providers/AuthProvider'
import AssessmentService, { AssessmentHistoryEntry, AssessmentSessionHistory } from '@/lib/assessment-service'
import { ASSESSMENTS } from '@/data/assessments'
import { glassVariants } from '@/styles/glassmorphic-design-system'

// Material Symbols icons import
import 'material-symbols/outlined.css'

interface AssessmentHistoryProps {
  className?: string
}

export default function AssessmentHistory({ className = '' }: AssessmentHistoryProps) {
  const { user } = useAuth()
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentHistoryEntry[]>([])
  const [sessionHistory, setSessionHistory] = useState<AssessmentSessionHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'assessments' | 'sessions'>('assessments')

  useEffect(() => {
    const loadHistory = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const [history, sessions] = await Promise.all([
          AssessmentService.getAssessmentHistory(user.id),
          AssessmentService.getSessionHistory(user.id)
        ])

        setAssessmentHistory(history)
        setSessionHistory(sessions)
      } catch (error) {
        console.error('Error loading assessment history:', error)
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [user])

  const getAssessmentIcon = (assessmentId: string) => {
    const assessment = ASSESSMENTS[assessmentId]
    if (!assessment) return '📋'
    
    switch (assessment.category) {
      case 'depression': return '😢'
      case 'anxiety': return '😰'
      case 'trauma': return '🩹'
      case 'resilience': return '💪'
      case 'wellbeing': return '✨'
      default: return '📋'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'normal': return 'text-green-600 bg-green-100'
      case 'mild': return 'text-yellow-600 bg-yellow-100'
      case 'moderate': return 'text-orange-600 bg-orange-100'
      case 'severe': return 'text-red-600 bg-red-100'
      case 'critical': return 'text-red-800 bg-red-200'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#335f64' }}></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-12">
          <p className="text-gray-600">Please sign in to view your assessment history.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment History</h2>
        <p className="text-gray-600">
          Track your mental health journey and see how your scores change over time.
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('assessments')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'assessments'
              ? 'text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          style={activeTab === 'assessments' ? { backgroundColor: '#335f64' } : {}}
        >
          Individual Assessments
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'sessions'
              ? 'text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          style={activeTab === 'sessions' ? { backgroundColor: '#335f64' } : {}}
        >
          Assessment Sessions
        </button>
      </div>

      {/* Assessment History Tab */}
      {activeTab === 'assessments' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {assessmentHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Assessments Yet</h3>
              <p className="text-gray-600 mb-6">
                Complete your first assessment to start tracking your mental health journey.
              </p>
              <motion.button
                onClick={() => window.location.href = '/assessments'}
                className="px-6 py-3 text-white rounded-xl transition-colors duration-200"
                style={{ backgroundColor: '#335f64' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Take Assessment
              </motion.button>
            </div>
          ) : (
            <div className="space-y-4">
              {assessmentHistory.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  className={`${glassVariants.panelSizes.medium} p-6`}
                  style={{
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl">{getAssessmentIcon(entry.assessmentId)}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {entry.assessmentTitle}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Completed on {formatDate(entry.takenAt)}
                        </p>
                        <div className="flex items-center space-x-4">
                          <span className="text-2xl font-bold text-gray-900">
                            {entry.score}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(entry.severity)}`}>
                            {entry.level}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {entry.severity.charAt(0).toUpperCase() + entry.severity.slice(1)} Severity
                      </div>
                    </div>
                  </div>
                  
                  {entry.friendlyExplanation && (
                    <div className="mt-4 p-4 bg-white/20 rounded-lg">
                      <p className="text-sm text-gray-700">{entry.friendlyExplanation}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Session History Tab */}
      {activeTab === 'sessions' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {sessionHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Sessions Yet</h3>
              <p className="text-gray-600 mb-6">
                Complete an assessment session to see your session history here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessionHistory.map((session, index) => (
                <motion.div
                  key={session.id}
                  className={`${glassVariants.panelSizes.medium} p-6`}
                  style={{
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {session.sessionName || `${session.sessionType.charAt(0).toUpperCase() + session.sessionType.slice(1)} Assessment`}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Started on {formatDate(session.startedAt)}
                        {session.completedAt && (
                          <span> • Completed on {formatDate(session.completedAt)}</span>
                        )}
                      </p>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                          {session.assessmentCount} assessment{session.assessmentCount !== 1 ? 's' : ''}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          session.status === 'completed' 
                            ? 'text-green-600 bg-green-100'
                            : session.status === 'in_progress'
                            ? 'text-blue-600 bg-blue-100'
                            : 'text-gray-600 bg-gray-100'
                        }`}>
                          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl">
                        {session.status === 'completed' ? '✅' : 
                         session.status === 'in_progress' ? '⏳' : '❌'}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
