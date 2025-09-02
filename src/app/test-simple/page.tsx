'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function TestSimplePage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        console.log('Starting simple test...')
        
        // Simple timeout to prevent hanging
        const timeout = setTimeout(() => {
          console.log('Timeout reached, setting loading to false')
          setLoading(false)
        }, 5000)

        const { data: { session }, error } = await supabase.auth.getSession()
        
        clearTimeout(timeout)
        
        if (error) {
          setError(error.message)
        } else {
          setUser(session?.user || null)
        }
        
        setLoading(false)
        console.log('Simple test completed')
        
      } catch (err) {
        console.error('Simple test error:', err)
        setError(String(err))
        setLoading(false)
      }
    }

    init()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Simple Test Page</h1>
        
        <div className="bg-white rounded-lg p-6 shadow">
          {error ? (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <strong>Error:</strong> {error}
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-4">Success!</h2>
              <p>User: {user ? user.email : 'No user'}</p>
              <p>Loading completed successfully.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
