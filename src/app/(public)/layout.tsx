'use client'

import { AuthProvider } from '@/components/providers/AuthProvider'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-brand-green-50 via-white to-brand-green-100">
        {children}
      </div>
    </AuthProvider>
  )
}
