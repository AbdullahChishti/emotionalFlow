'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAssessmentStore } from '@/stores/assessmentStore'
import { ASSESSMENTS, ASSESSMENT_CATEGORIES } from '@/data/assessments'
import { supabase } from '@/lib/supabase'

interface AssessmentItem {
  id: string
  title: string
  category: string
  completed: boolean
  lastTaken?: Date
  score?: number
  level?: string
}

interface AssessmentSidebarProps {
  variant?: 'full' | 'compact'
}

export function AssessmentSidebar({ variant = 'full' }: AssessmentSidebarProps) {
  const { userProfile, completedAssessments } = useAssessmentStore()
  const [assessmentItems, setAssessmentItems] = useState<AssessmentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUserAssessments = async () => {
      try {
        const { data: user } = await supabase.auth.getUser()
        if (!user?.user?.id) return

        // Get user's overall assessment profile (for last_assessed)
        const { data: assessmentHistory } = await supabase
          .from('user_assessment_profiles')
          .select('*')
          .eq('user_id', user.user.id)
          .single()

        // Also fetch latest individual assessment results to mark completions
        const { data: resultsData } = await supabase
          .from('assessment_results')
          .select('assessment_id, level, taken_at')
          .eq('user_id', user.user.id)
          .order('taken_at', { ascending: false })

        // Reduce to latest entry per assessment_id
        const latestById: Record<string, { level?: string; taken_at?: string }> = {}
        for (const row of resultsData || []) {
          if (!latestById[row.assessment_id]) {
            latestById[row.assessment_id] = { level: row.level as string, taken_at: row.taken_at as string }
          }
        }

        const items: AssessmentItem[] = Object.entries(ASSESSMENTS).map(([id, assessment]) => {
          const latest = latestById[id]
          return {
            id,
            title: assessment.shortTitle,
            category: assessment.category,
            completed: !!completedAssessments[id] || !!latest,
            lastTaken: latest?.taken_at ? new Date(latest.taken_at) : (assessmentHistory?.last_assessed ? new Date(assessmentHistory.last_assessed) : undefined),
            score: userProfile?.currentSymptoms?.[id as keyof typeof userProfile.currentSymptoms]?.score,
            level: (userProfile?.currentSymptoms?.[id as keyof typeof userProfile.currentSymptoms]?.level as string | undefined) || (latest?.level as string | undefined)
          }
        })

        setAssessmentItems(items)
      } catch (error) {
        console.error('Error loading assessments:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserAssessments()
  }, [userProfile, completedAssessments])

  const groupedAssessments = assessmentItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, AssessmentItem[]>)

  if (isLoading) {
    return (
      <div className={`bg-white/80 backdrop-blur-sm rounded-2xl ${variant === 'compact' ? 'p-4' : 'p-6'} border border-slate-200/60 shadow-sm`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className={`${variant === 'compact' ? 'h-8' : 'h-12'} bg-slate-100 rounded-lg`}></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Compact quick chips for top 3 recent/completed
  if (variant === 'compact') {
    // Prioritize key clinical assessments, then by recency
    const priority = ['ace', 'phq9', 'gad7']
    const idx = (id: string) => {
      const i = priority.indexOf(id)
      return i === -1 ? 99 : i
    }

    const eligible = assessmentItems.filter(a => a.completed || a.level)
    const completed = eligible
      .sort((a, b) => {
        const pa = idx(a.id)
        const pb = idx(b.id)
        if (pa !== pb) return pa - pb
        const ta = a.lastTaken ? a.lastTaken.getTime() : 0
        const tb = b.lastTaken ? b.lastTaken.getTime() : 0
        return tb - ta
      })
      .slice(0, 3)

    return (
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm"
      >
        {/* Header badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm mb-3">
          <span className="material-symbols-outlined text-slate-700 text-sm">verified_user</span>
          <span className="text-[11px] font-medium text-slate-700">Secure access to your assessments</span>
        </div>

        {/* Selected assessments */}
        <div className="flex flex-wrap gap-2">
          {completed.length > 0 ? (
            completed.map(item => (
              <span
                key={item.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 text-xs bg-white text-slate-700 shadow-sm"
                title={`${item.title}${item.level ? ` • ${item.level}` : ''}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${
                  item.level === 'normal' ? 'bg-emerald-500' :
                  item.level === 'mild' ? 'bg-yellow-500' :
                  item.level === 'moderate' ? 'bg-orange-500' : 'bg-red-500'
                }`} />
                <span className="font-medium text-[11px]">{item.title}</span>
                {item.level && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      item.level === 'normal' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      item.level === 'mild' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      item.level === 'moderate' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {item.level}
                  </span>
                )}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-500">No recent assessments yet</span>
          )}
        </div>

        {/* Footer claim */}
        <div className="mt-3 text-[11px] text-slate-600 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px] text-slate-500">lock</span>
          <span>Used to personalize this session.</span>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-sm"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#335f64] to-slate-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-lg">psychology</span>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-lg">MindWell Assessment Access</h3>
            <p className="text-xs text-slate-600">AI-powered insights from your assessments</p>
          </div>
        </div>
        
        {/* Helpful pill */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-full px-4 py-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-sm">verified</span>
            <p className="text-xs text-emerald-700 font-medium">
              Access to your assessments helps MindWell provide tailored psychological feedback and personalized support
            </p>
          </div>
        </div>
      </div>

      {/* Assessment Categories */}
      <div className="space-y-4">
        {Object.entries(groupedAssessments).map(([category, items]) => {
          const categoryInfo = ASSESSMENT_CATEGORIES[category as keyof typeof ASSESSMENT_CATEGORIES]
          if (!categoryInfo) return null

          return (
            <div key={category} className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">{categoryInfo.icon}</span>
                <h4 className="text-sm font-semibold text-slate-700">{categoryInfo.title}</h4>
              </div>
              
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border transition-all duration-200 ${
                      item.completed
                        ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200/60'
                        : 'bg-slate-50 border-slate-200/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          item.completed ? 'bg-emerald-500' : 'bg-slate-300'
                        }`} />
                        <span className="text-sm font-medium text-slate-700">{item.title}</span>
                      </div>
                      {item.completed && (
                        <span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>
                      )}
                    </div>
                    
                    {item.completed && item.level && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-slate-600">Level:</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          item.level === 'normal' ? 'bg-green-100 text-green-700' :
                          item.level === 'mild' ? 'bg-yellow-100 text-yellow-700' :
                          item.level === 'moderate' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {item.level}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Action button */}
      <div className="mt-6 pt-4 border-t border-slate-200/60">
        <button className="w-full py-2.5 px-4 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 text-sm font-medium rounded-lg transition-all duration-200 border border-slate-200/60">
          View Assessment History
        </button>
      </div>
    </motion.div>
  )
}
