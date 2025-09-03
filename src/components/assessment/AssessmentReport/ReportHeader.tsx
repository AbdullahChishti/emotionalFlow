import React from 'react'

interface ReportHeaderProps {
  title: string
  category: string
  severity: string
  level: string
  className?: string
}

export function ReportHeader({ title, category, severity, level, className = '' }: ReportHeaderProps) {
  const severityColors = {
    normal: 'bg-green-100 text-green-800 border-green-200',
    mild: 'bg-blue-100 text-blue-800 border-blue-200',
    moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    severe: 'bg-orange-100 text-orange-800 border-orange-200',
    critical: 'bg-red-100 text-red-800 border-red-200'
  }

  const getSeverityIcon = (sev: string) => {
    switch (sev) {
      case 'normal': return 'check_circle'
      case 'mild': return 'info'
      case 'moderate': return 'warning_amber'
      case 'severe':
      case 'critical':
        return 'error_outline'
      default:
        return 'info'
    }
  }

  return (
    <div className={`bg-gradient-to-r from-brand-green-50 to-brand-green-100 p-8 border-b border-gray-100 ${className}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {title} Assessment Report
            </h1>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                <span className="material-symbols-outlined text-sm mr-1">category</span>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </span>
              <span 
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                  severityColors[severity as keyof typeof severityColors] || 'bg-gray-100 text-gray-800 border-gray-200'
                }`}
              >
                <span className="material-symbols-outlined text-sm mr-1">
                  {getSeverityIcon(severity)}
                </span>
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-gray-800 border border-gray-200">
                Level: {level}
              </span>
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center w-16 h-16 rounded-xl bg-white/80 shadow-sm">
            <span className="material-symbols-outlined text-3xl text-brand-green-700">
              assessment
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
