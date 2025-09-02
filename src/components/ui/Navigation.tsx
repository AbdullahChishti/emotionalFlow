'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import Link from 'next/navigation'
import { usePathname } from 'next/navigation'

interface NavigationProps {
  className?: string
}

export function Navigation({ className = '' }: NavigationProps) {
  const { user } = useAuth()
  const pathname = usePathname()

  if (!user) {
    return null
  }

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/'
    },
    {
      name: 'Check-in',
      href: '/check-in'
    },
    {
      name: 'Therapy',
      href: '/session'
    },
    {
      name: 'Meditation',
      href: '/meditation'
    },
    {
      name: 'Progress',
      href: '/dashboard'
    }
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">MindWell</span>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center space-x-8">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {item.name}
                  </button>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
