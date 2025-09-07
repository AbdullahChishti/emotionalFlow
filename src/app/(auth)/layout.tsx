'use client'

import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout'
import { usePathname } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/AuthGuard'

function AuthenticatedContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Allow callback page to handle its own logic without layout
  if (pathname.includes('/auth/callback')) {
    return <>{children}</>
  }

  return (
    <AuthenticatedLayout>
      {children}
    </AuthenticatedLayout>
  )
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <AuthenticatedContent>
        {children}
      </AuthenticatedContent>
    </ProtectedRoute>
  )
}

