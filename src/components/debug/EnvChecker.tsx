'use client'

import { useEffect, useState } from 'react'

export function EnvChecker() {
  const [envStatus, setEnvStatus] = useState<any>({})

  useEffect(() => {
    const checkEnv = () => {
      const status = {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
        nodeEnv: process.env.NODE_ENV || 'undefined',
        skipAuth: process.env.NEXT_PUBLIC_SKIP_AUTH || 'undefined'
      }
      setEnvStatus(status)
    }

    checkEnv()
  }, [])

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed top-4 right-4 bg-red-900/90 text-white p-3 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Environment Check</h3>
      <div className="space-y-1">
        <div>Supabase URL: {envStatus.supabaseUrl}</div>
        <div>Supabase Key: {envStatus.supabaseKey}</div>
        <div>Node Env: {envStatus.nodeEnv}</div>
        <div>Skip Auth: {envStatus.skipAuth}</div>
      </div>
    </div>
  )
}
