'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function SupabaseTest() {
  const [testResults, setTestResults] = useState<any>({})
  const [isRunning, setIsRunning] = useState(false)

  const runTests = async () => {
    setIsRunning(true)
    const results: any = {}

    try {
      // Test 1: Basic connection
      console.log('Testing basic Supabase connection...')
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      results.session = {
        success: !sessionError,
        error: sessionError?.message || null,
        hasSession: !!sessionData.session
      }

      // Test 2: Database connection
      console.log('Testing database connection...')
      const { data: dbData, error: dbError } = await supabase.from('profiles').select('count')
      results.database = {
        success: !dbError,
        error: dbError?.message || null
      }

      // Test 3: Auth state listener
      console.log('Testing auth state listener...')
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state change:', { event, session: !!session })
      })
      
      // Clean up listener after 1 second
      setTimeout(() => {
        subscription.unsubscribe()
      }, 1000)

      results.authListener = { success: true }

    } catch (error: any) {
      results.error = error.message
    }

    setTestResults(results)
    setIsRunning(false)
  }

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 bg-blue-900/90 text-white p-3 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Supabase Test</h3>
      <button 
        onClick={runTests}
        disabled={isRunning}
        className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs mb-2 disabled:opacity-50"
      >
        {isRunning ? 'Testing...' : 'Run Tests'}
      </button>
      <pre className="whitespace-pre-wrap overflow-auto max-h-32 text-xs">
        {JSON.stringify(testResults, null, 2)}
      </pre>
    </div>
  )
}
