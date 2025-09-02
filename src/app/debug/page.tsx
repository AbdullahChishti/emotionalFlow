'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugPage() {
  const [status, setStatus] = useState('Initializing...')
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testConnection = async () => {
      try {
        setStatus('Testing Supabase connection...')
        
        // Test 1: Get session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) {
          setError(`Session error: ${sessionError.message}`)
          return
        }
        
        setSession(session)
        setStatus('Session retrieved successfully')
        
        if (session?.user) {
          setStatus('Fetching profile...')
          
          // Test 2: Get profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            
          if (profileError && profileError.code !== 'PGRST116') {
            setError(`Profile error: ${profileError.message}`)
            return
          }
          
          setProfile(profileData)
          setStatus('Profile check completed')
        } else {
          setStatus('No user session found')
        }
        
      } catch (err) {
        setError(`Exception: ${err}`)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Page</h1>
        
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <p className="text-lg">{status}</p>
          
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}
          
          <div className="mt-6 space-y-4">
            <div>
              <h3 className="font-semibold">Session:</h3>
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
            
            <div>
              <h3 className="font-semibold">Profile:</h3>
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                {JSON.stringify(profile, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
