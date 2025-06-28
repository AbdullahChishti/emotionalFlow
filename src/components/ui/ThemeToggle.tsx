'use client'

import { Palette, Sparkles } from 'lucide-react'
import { useColorTheme } from '@/components/providers/ColorThemeProvider'

export function ThemeToggle() {
  const { currentTheme, toggleTheme, themeData } = useColorTheme()

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors border border-primary/20"
      title={`Switch to ${currentTheme === 'therapeutic' ? 'Purple Sparkle' : 'Therapeutic'} theme`}
    >
      {currentTheme === 'therapeutic' ? (
        <Sparkles className="w-4 h-4 text-primary" />
      ) : (
        <Palette className="w-4 h-4 text-primary" />
      )}
      <span className="text-sm font-medium text-primary">
        {themeData.name}
      </span>
    </button>
  )
}
