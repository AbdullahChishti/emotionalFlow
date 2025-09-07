'use client'

import { useState } from 'react'
import { useAuth } from '@/stores/authStore'
import { FlowManager } from '@/lib/services/FlowManager'
import { AssessmentResult } from '@/types'
import { useRouter } from 'next/navigation'

export function TestAssessmentCompletion() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const createTestResults = (): Record<string, AssessmentResult> => {
    return {
      phq9: {
        score: 12,
        level: 'Moderate',
        severity: 'moderate',
        description: 'Your PHQ-9 score indicates moderate depression symptoms. This suggests you may be experiencing persistent feelings of sadness, loss of interest in activities, and other depressive symptoms that are affecting your daily life.',
        recommendations: [
          'Consider speaking with a mental health professional',
          'Engage in regular physical exercise',
          'Maintain a consistent sleep schedule',
          'Practice stress reduction techniques like meditation'
        ],
        insights: [
          'You may be experiencing persistent low mood',
          'Daily activities might feel more difficult than usual',
          'Sleep and appetite patterns may be disrupted'
        ],
        nextSteps: [
          'Schedule an appointment with a therapist or counselor',
          'Consider discussing your symptoms with your primary care physician',
          'Reach out to trusted friends or family for support'
        ],
        manifestations: [
          'Difficulty getting out of bed in the morning',
          'Less enjoyment in activities you usually love',
          'Feeling emotionally disconnected from friends',
          'Trouble concentrating at work or school'
        ],
        responses: {
          'phq9_1': 2,
          'phq9_2': 1,
          'phq9_3': 2,
          'phq9_4': 1,
          'phq9_5': 2,
          'phq9_6': 1,
          'phq9_7': 2,
          'phq9_8': 1,
          'phq9_9': 0
        }
      },
      gad7: {
        score: 8,
        level: 'Mild',
        severity: 'mild',
        description: 'Your GAD-7 score indicates mild anxiety symptoms. You may be experiencing some worry and nervousness, but these symptoms are manageable with proper coping strategies.',
        recommendations: [
          'Practice deep breathing exercises',
          'Try progressive muscle relaxation',
          'Limit caffeine intake',
          'Maintain regular exercise routine'
        ],
        insights: [
          'You may experience occasional worry about future events',
          'Physical symptoms of anxiety might be present but mild',
          'Daily functioning is mostly maintained'
        ],
        nextSteps: [
          'Learn and practice anxiety management techniques',
          'Monitor your anxiety levels daily',
          'Consider mindfulness or meditation apps'
        ],
        manifestations: [
          'Occasional racing thoughts about worries',
          'Mild physical tension or restlessness',
          'Some difficulty turning off worrying thoughts'
        ],
        responses: {
          'gad7_1': 1,
          'gad7_2': 1,
          'gad7_3': 1,
          'gad7_4': 1,
          'gad7_5': 1,
          'gad7_6': 1,
          'gad7_7': 2
        }
      }
    }
  }

  const handleTestCompletion = async () => {
    if (!user) {
      setMessage('❌ Please log in first')
      return
    }

    setLoading(true)
    setMessage('🔄 Processing test assessment...')

    try {
      const testResults = createTestResults()
      
      console.log('🧪 Creating test assessment results:', testResults)
      
      // Use FlowManager to process the results (same as real assessment completion)
      await FlowManager.completeAssessmentFlow(testResults, user.id)
      
      setMessage('✅ Test assessment completed successfully!')
      
      // Navigate to results page after a short delay
      setTimeout(() => {
        router.push('/results')
      }, 1000)
      
    } catch (error) {
      console.error('❌ Test assessment failed:', error)
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleClearData = () => {
    try {
      localStorage.removeItem('assessmentResults')
      localStorage.removeItem('userProfile')
      setMessage('🗑️ Cleared cached assessment data')
    } catch (error) {
      setMessage('❌ Failed to clear data')
    }
  }

  if (!user) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Please log in to test assessment completion</p>
      </div>
    )
  }

  return (
    <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
      <h3 className="text-lg font-semibold text-blue-900">🧪 Debug: Test Assessment Completion</h3>
      
      <p className="text-sm text-blue-700">
        This will create mock assessment results and process them through the complete flow,
        then navigate to the results page.
      </p>
      
      <div className="flex flex-col gap-3">
        <button
          onClick={handleTestCompletion}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : '🚀 Run Test Assessment'}
        </button>
        
        <button
          onClick={handleClearData}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          🗑️ Clear Cached Data
        </button>
        
        <button
          onClick={() => router.push('/results')}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          📊 Go to Results Page
        </button>
      </div>
      
      {message && (
        <div className="p-3 bg-white border border-blue-300 rounded-lg">
          <p className="text-sm">{message}</p>
        </div>
      )}
      
      <div className="text-xs text-blue-600">
        <p><strong>User ID:</strong> {user.id}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>
    </div>
  )
}
