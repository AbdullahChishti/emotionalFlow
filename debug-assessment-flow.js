// Debug script to test assessment result saving
// Run with: node debug-assessment-flow.js

console.log('🔍 Testing Assessment Flow...')

// Mock assessment result for testing
const mockResult = {
  phq9: {
    score: 12,
    level: 'Moderate',
    severity: 'moderate',
    description: 'Your score indicates moderate depression symptoms.',
    recommendations: ['Consider therapy', 'Regular exercise', 'Sleep hygiene'],
    insights: ['Pattern of negative thinking', 'Low energy levels'],
    nextSteps: ['Schedule appointment with therapist'],
    manifestations: ['Difficulty concentrating', 'Loss of interest'],
    responses: {
      'q1': 2,
      'q2': 1,
      'q3': 2,
      'q4': 1,
      'q5': 2,
      'q6': 1,
      'q7': 2,
      'q8': 1,
      'q9': 0
    }
  }
}

console.log('📋 Mock assessment result:')
console.log(JSON.stringify(mockResult, null, 2))

// Test localStorage
try {
  if (typeof window !== 'undefined') {
    localStorage.setItem('assessmentResults', JSON.stringify(mockResult))
    console.log('✅ localStorage test successful')
  } else {
    console.log('⚠️ No window object (Node.js environment)')
  }
} catch (error) {
  console.error('❌ localStorage test failed:', error)
}

console.log('✅ Debug script completed')
