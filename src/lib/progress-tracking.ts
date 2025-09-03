/**
 * Progress Tracking System
 * Tracks user progress and provides assessment-based insights
 */

import { supabase } from './supabase'
import { UserProfile } from '@/data/assessment-integration'

export interface ProgressMetric {
  id: string
  type: 'assessment_score' | 'conversation_sentiment' | 'engagement' | 'recommendation_completion'
  value: number
  timestamp: Date
  metadata?: Record<string, any>
}

export interface ProgressInsight {
  id: string
  type: 'improvement' | 'concern' | 'milestone' | 'recommendation'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  category: string
  timestamp: Date
  actionable: boolean
  actionUrl?: string
}

export interface ProgressReport {
  userId: string
  period: {
    start: Date
    end: Date
  }
  metrics: ProgressMetric[]
  insights: ProgressInsight[]
  trends: {
    overall: 'improving' | 'stable' | 'declining'
    depression: 'improving' | 'stable' | 'declining'
    anxiety: 'improving' | 'stable' | 'declining'
    resilience: 'improving' | 'stable' | 'declining'
  }
  recommendations: string[]
  nextAssessmentDate?: Date
}

export interface ConversationAnalysis {
  sessionId: string
  timestamp: Date
  messageCount: number
  averageSentiment: number // -1 to 1 scale
  emotionalTone: string
  crisisIndicators: string[]
  therapeuticThemes: string[]
  userEngagement: 'low' | 'medium' | 'high'
}

export class ProgressTrackingService {
  /**
   * Track conversation progress
   */
  static async trackConversation(
    userId: string,
    sessionId: string,
    analysis: ConversationAnalysis
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversation_progress')
        .insert({
          user_id: userId,
          session_id: sessionId,
          timestamp: analysis.timestamp.toISOString(),
          message_count: analysis.messageCount,
          average_sentiment: analysis.averageSentiment,
          emotional_tone: analysis.emotionalTone,
          crisis_indicators: analysis.crisisIndicators,
          therapeutic_themes: analysis.therapeuticThemes,
          user_engagement: analysis.userEngagement
        })

      if (error) {
        console.error('Error tracking conversation:', error)
      }
    } catch (error) {
      console.error('Error in trackConversation:', error)
    }
  }

  /**
   * Track recommendation completion
   */
  static async trackRecommendationCompletion(
    userId: string,
    recommendationId: string,
    completed: boolean,
    feedback?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('recommendation_tracking')
        .insert({
          user_id: userId,
          recommendation_id: recommendationId,
          completed: completed,
          feedback: feedback,
          completed_at: completed ? new Date().toISOString() : null
        })

      if (error) {
        console.error('Error tracking recommendation completion:', error)
      }
    } catch (error) {
      console.error('Error in trackRecommendationCompletion:', error)
    }
  }

  /**
   * Generate progress report for user
   */
  static async generateProgressReport(
    userId: string,
    periodDays: number = 30
  ): Promise<ProgressReport> {
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - (periodDays * 24 * 60 * 60 * 1000))

    try {
      // Get conversation data
      const { data: conversations, error: conversationError } = await supabase
        .from('conversation_progress')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())
        .order('timestamp', { ascending: true })

      if (conversationError) {
        console.error('Error fetching conversation data:', conversationError)
      }

      // Get assessment data
      const { data: assessments, error: assessmentError } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('user_id', userId)
        .gte('taken_at', startDate.toISOString())
        .lte('taken_at', endDate.toISOString())
        .order('taken_at', { ascending: true })

      if (assessmentError) {
        console.error('Error fetching assessment data:', assessmentError)
      }

      // Get recommendation tracking data
      const { data: recommendations, error: recommendationError } = await supabase
        .from('recommendation_tracking')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      if (recommendationError) {
        console.error('Error fetching recommendation data:', recommendationError)
      }

      // Process data into metrics
      const metrics = this.processMetrics(conversations || [], assessments || [], recommendations || [])
      
      // Generate insights
      const insights = this.generateInsights(metrics, conversations || [], assessments || [])
      
      // Calculate trends
      const trends = this.calculateTrends(assessments || [], conversations || [])
      
      // Generate recommendations
      const reportRecommendations = this.generateReportRecommendations(insights, trends)

      return {
        userId,
        period: { start: startDate, end: endDate },
        metrics,
        insights,
        trends,
        recommendations: reportRecommendations,
        nextAssessmentDate: this.calculateNextAssessmentDate(assessments || [])
      }
    } catch (error) {
      console.error('Error generating progress report:', error)
      throw error
    }
  }

  /**
   * Process raw data into metrics
   */
  private static processMetrics(
    conversations: any[],
    assessments: any[],
    recommendations: any[]
  ): ProgressMetric[] {
    const metrics: ProgressMetric[] = []

    // Conversation sentiment metrics
    conversations.forEach(conv => {
      metrics.push({
        id: `conv_sentiment_${conv.id}`,
        type: 'conversation_sentiment',
        value: conv.average_sentiment,
        timestamp: new Date(conv.timestamp),
        metadata: {
          sessionId: conv.session_id,
          messageCount: conv.message_count,
          emotionalTone: conv.emotional_tone
        }
      })
    })

    // Assessment score metrics
    assessments.forEach(assessment => {
      metrics.push({
        id: `assessment_${assessment.assessment_id}_${assessment.id}`,
        type: 'assessment_score',
        value: assessment.score,
        timestamp: new Date(assessment.taken_at),
        metadata: {
          assessmentId: assessment.assessment_id,
          level: assessment.level,
          severity: assessment.severity
        }
      })
    })

    // Recommendation completion metrics
    const completedRecommendations = recommendations.filter(r => r.completed)
    metrics.push({
      id: `recommendation_completion_${Date.now()}`,
      type: 'recommendation_completion',
      value: completedRecommendations.length,
      timestamp: new Date(),
      metadata: {
        totalRecommendations: recommendations.length,
        completionRate: recommendations.length > 0 ? completedRecommendations.length / recommendations.length : 0
      }
    })

    return metrics
  }

  /**
   * Generate insights from metrics
   */
  private static generateInsights(
    metrics: ProgressMetric[],
    conversations: any[],
    assessments: any[]
  ): ProgressInsight[] {
    const insights: ProgressInsight[] = []

    // Sentiment trend analysis
    const sentimentMetrics = metrics.filter(m => m.type === 'conversation_sentiment')
    if (sentimentMetrics.length >= 3) {
      const recentSentiment = sentimentMetrics.slice(-3).reduce((sum, m) => sum + m.value, 0) / 3
      const earlierSentiment = sentimentMetrics.slice(0, 3).reduce((sum, m) => sum + m.value, 0) / 3
      
      if (recentSentiment > earlierSentiment + 0.2) {
        insights.push({
          id: `sentiment_improvement_${Date.now()}`,
          type: 'improvement',
          title: 'Improving Emotional Well-being',
          description: 'Your recent conversations show a positive trend in emotional well-being.',
          priority: 'medium',
          category: 'emotional_wellbeing',
          timestamp: new Date(),
          actionable: true
        })
      } else if (recentSentiment < earlierSentiment - 0.2) {
        insights.push({
          id: `sentiment_concern_${Date.now()}`,
          type: 'concern',
          title: 'Emotional Well-being Concern',
          description: 'Your recent conversations suggest you may be struggling. Consider reaching out for support.',
          priority: 'high',
          category: 'emotional_wellbeing',
          timestamp: new Date(),
          actionable: true,
          actionUrl: '/crisis-support'
        })
      }
    }

    // Assessment score trends
    const assessmentMetrics = metrics.filter(m => m.type === 'assessment_score')
    const groupedAssessments = assessmentMetrics.reduce((acc, metric) => {
      const assessmentId = metric.metadata?.assessmentId
      if (!acc[assessmentId]) acc[assessmentId] = []
      acc[assessmentId].push(metric)
      return acc
    }, {} as Record<string, ProgressMetric[]>)

    Object.entries(groupedAssessments).forEach(([assessmentId, assessmentMetrics]) => {
      if (assessmentMetrics.length >= 2) {
        const latest = assessmentMetrics[assessmentMetrics.length - 1]
        const previous = assessmentMetrics[assessmentMetrics.length - 2]
        
        if (latest.value < previous.value) {
          insights.push({
            id: `assessment_improvement_${assessmentId}_${Date.now()}`,
            type: 'improvement',
            title: `${assessmentId.toUpperCase()} Score Improvement`,
            description: `Your ${assessmentId} score has improved from ${previous.value} to ${latest.value}.`,
            priority: 'medium',
            category: 'assessment_progress',
            timestamp: new Date(),
            actionable: false
          })
        } else if (latest.value > previous.value + 2) {
          insights.push({
            id: `assessment_concern_${assessmentId}_${Date.now()}`,
            type: 'concern',
            title: `${assessmentId.toUpperCase()} Score Increase`,
            description: `Your ${assessmentId} score has increased from ${previous.value} to ${latest.value}. Consider additional support.`,
            priority: 'high',
            category: 'assessment_progress',
            timestamp: new Date(),
            actionable: true
          })
        }
      }
    })

    // Engagement insights
    const totalConversations = conversations.length
    if (totalConversations >= 5) {
      insights.push({
        id: `engagement_milestone_${Date.now()}`,
        type: 'milestone',
        title: 'Active Engagement Milestone',
        description: `You've had ${totalConversations} conversations this period, showing great commitment to your mental health.`,
        priority: 'low',
        category: 'engagement',
        timestamp: new Date(),
        actionable: false
      })
    }

    return insights
  }

  /**
   * Calculate trends from data
   */
  private static calculateTrends(assessments: any[], conversations: any[]): ProgressReport['trends'] {
    const trends = {
      overall: 'stable' as const,
      depression: 'stable' as const,
      anxiety: 'stable' as const,
      resilience: 'stable' as const
    }

    // Calculate assessment trends
    const phq9Assessments = assessments.filter(a => a.assessment_id === 'phq9').sort((a, b) => new Date(a.taken_at).getTime() - new Date(b.taken_at).getTime())
    const gad7Assessments = assessments.filter(a => a.assessment_id === 'gad7').sort((a, b) => new Date(a.taken_at).getTime() - new Date(b.taken_at).getTime())
    const cdRiscAssessments = assessments.filter(a => a.assessment_id === 'cd-risc').sort((a, b) => new Date(a.taken_at).getTime() - new Date(b.taken_at).getTime())

    // Depression trend
    if (phq9Assessments.length >= 2) {
      const latest = phq9Assessments[phq9Assessments.length - 1].score
      const previous = phq9Assessments[phq9Assessments.length - 2].score
      trends.depression = latest < previous ? 'improving' : latest > previous ? 'declining' : 'stable'
    }

    // Anxiety trend
    if (gad7Assessments.length >= 2) {
      const latest = gad7Assessments[gad7Assessments.length - 1].score
      const previous = gad7Assessments[gad7Assessments.length - 2].score
      trends.anxiety = latest < previous ? 'improving' : latest > previous ? 'declining' : 'stable'
    }

    // Resilience trend
    if (cdRiscAssessments.length >= 2) {
      const latest = cdRiscAssessments[cdRiscAssessments.length - 1].score
      const previous = cdRiscAssessments[cdRiscAssessments.length - 2].score
      trends.resilience = latest > previous ? 'improving' : latest < previous ? 'declining' : 'stable'
    }

    // Overall trend (weighted average)
    const trendValues = { improving: 1, stable: 0, declining: -1 }
    const overallScore = (trendValues[trends.depression] + trendValues[trends.anxiety] + trendValues[trends.resilience]) / 3
    trends.overall = overallScore > 0.3 ? 'improving' : overallScore < -0.3 ? 'declining' : 'stable'

    return trends
  }

  /**
   * Generate recommendations based on insights and trends
   */
  private static generateReportRecommendations(
    insights: ProgressInsight[],
    trends: ProgressReport['trends']
  ): string[] {
    const recommendations: string[] = []

    // Trend-based recommendations
    if (trends.overall === 'declining') {
      recommendations.push('Consider increasing your engagement with mental health resources and support.')
    } else if (trends.overall === 'improving') {
      recommendations.push('Continue with your current approach - you\'re making great progress!')
    }

    if (trends.depression === 'declining') {
      recommendations.push('Focus on depression management strategies and consider professional support.')
    }

    if (trends.anxiety === 'declining') {
      recommendations.push('Practice anxiety management techniques and consider professional support.')
    }

    if (trends.resilience === 'declining') {
      recommendations.push('Focus on building resilience through coping skills and social support.')
    }

    // Insight-based recommendations
    const highPriorityInsights = insights.filter(i => i.priority === 'high')
    if (highPriorityInsights.length > 0) {
      recommendations.push('Address high-priority concerns identified in your progress report.')
    }

    const improvementInsights = insights.filter(i => i.type === 'improvement')
    if (improvementInsights.length > 0) {
      recommendations.push('Build on the improvements you\'ve made by continuing successful strategies.')
    }

    return recommendations
  }

  /**
   * Calculate next assessment date
   */
  private static calculateNextAssessmentDate(assessments: any[]): Date | undefined {
    if (assessments.length === 0) return undefined

    const latestAssessment = assessments.sort((a, b) => new Date(b.taken_at).getTime() - new Date(a.taken_at).getTime())[0]
    const lastAssessmentDate = new Date(latestAssessment.taken_at)
    
    // Recommend next assessment in 30 days
    const nextAssessmentDate = new Date(lastAssessmentDate.getTime() + (30 * 24 * 60 * 60 * 1000))
    
    return nextAssessmentDate
  }

  /**
   * Get user's progress summary
   */
  static async getProgressSummary(userId: string): Promise<{
    totalConversations: number
    averageSentiment: number
    lastAssessmentDate: Date | null
    nextAssessmentDate: Date | null
    recentTrends: ProgressReport['trends']
    topInsights: ProgressInsight[]
  }> {
    try {
      const report = await this.generateProgressReport(userId, 30)
      
      return {
        totalConversations: report.metrics.filter(m => m.type === 'conversation_sentiment').length,
        averageSentiment: report.metrics
          .filter(m => m.type === 'conversation_sentiment')
          .reduce((sum, m) => sum + m.value, 0) / Math.max(report.metrics.filter(m => m.type === 'conversation_sentiment').length, 1),
        lastAssessmentDate: report.metrics
          .filter(m => m.type === 'assessment_score')
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]?.timestamp || null,
        nextAssessmentDate: report.nextAssessmentDate || null,
        recentTrends: report.trends,
        topInsights: report.insights.slice(0, 3)
      }
    } catch (error) {
      console.error('Error getting progress summary:', error)
      throw error
    }
  }
}

export default ProgressTrackingService
