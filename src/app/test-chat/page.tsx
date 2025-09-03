/**
 * Test Chat Page
 * Dedicated page for testing the assessment-enhanced chat system
 */

import React from 'react'
import AssessmentChatTestSuite from '@/components/test/AssessmentChatTestSuite'
import AssessmentEnhancedChat from '@/components/chat/AssessmentEnhancedChat'

export default function TestChatPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Assessment Chat Testing</h1>
          <p className="text-gray-600">
            Test and validate the assessment-enhanced ChatGPT integration
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Suite */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Test Suite</h2>
            <AssessmentChatTestSuite />
          </div>

          {/* Live Chat */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Live Chat Interface</h2>
            <div className="h-[600px] border rounded-lg overflow-hidden">
              <AssessmentEnhancedChat />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
