'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function AuthDebugger() {
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    const runDiagnostics = async () => {
      const info: any = {}

      // Check environment variables
      info.env = {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
        nodeEnv: process.env.NODE_ENV
      }

      // Test Supabase connection
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        info.session = {
          hasSession: !!sessionData.session,
          error: sessionError?.message || null
        }
      } catch (err: any) {
        info.session = { error: err.message }
      }

      // Test database connection
      try {
        const { data: dbData, error: dbError } = await supabase.from('profiles').select('count')
        info.database = {
          connected: !dbError,
          error: dbError?.message || null
        }
      } catch (err: any) {
        info.database = { error: err.message }
      }

      setDebugInfo(info)
    }

    runDiagnostics()
  }, [])

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Auth Debug Info</h3>
      <pre className="whitespace-pre-wrap overflow-auto max-h-40">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  )
}
