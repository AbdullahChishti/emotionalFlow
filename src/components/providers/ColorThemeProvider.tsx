'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { themes, ThemeName, ThemeData } from '@/styles/design-tokens'

interface ColorThemeContextType {
  currentTheme: ThemeName
  setTheme: (theme: ThemeName) => void
  themeData: ThemeData
  toggleTheme: () => void
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined)

export function useColorTheme() {
  const context = useContext(ColorThemeContext)
  if (context === undefined) {
    throw new Error('useColorTheme must be used within a ColorThemeProvider')
  }
  return context
}

export function ColorThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('therapeutic')

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('emotion-economy-theme')
    if (savedTheme && themes[savedTheme as ThemeName]) {
      setCurrentTheme(savedTheme as ThemeName)
    }
  }, [])

  // Apply theme to document when theme changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // Set data-theme attribute on document element
      document.documentElement.setAttribute('data-theme', currentTheme)

      // Toggle dark class for purple theme to use different Tailwind variables
      if (currentTheme === 'purpleSparkle') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }

      // Apply CSS custom properties to root for Tailwind v4
      const themeColors = themes[currentTheme].colors
      const root = document.documentElement

      // Update Tailwind v4 color variables
      root.style.setProperty('--color-background', themeColors.backgroundLight)
      root.style.setProperty('--color-foreground', themeColors.textPrimary)
      root.style.setProperty('--color-card', themeColors.primarySurface)
      root.style.setProperty('--color-card-foreground', themeColors.textPrimary)
      root.style.setProperty('--color-popover', themeColors.primarySurface)
      root.style.setProperty('--color-popover-foreground', themeColors.textPrimary)
      root.style.setProperty('--color-primary', themeColors.accent)
      root.style.setProperty('--color-primary-foreground', themeColors.text.inverse)
      root.style.setProperty('--color-secondary', themeColors.secondaryAccent)
      root.style.setProperty('--color-secondary-foreground', themeColors.textPrimary)
      root.style.setProperty('--color-muted', themeColors.background.secondary)
      root.style.setProperty('--color-muted-foreground', themeColors.text.secondary)
      root.style.setProperty('--color-accent', themeColors.accent)
      root.style.setProperty('--color-accent-foreground', themeColors.text.inverse)
      root.style.setProperty('--color-border', themeColors.border.primary)
      root.style.setProperty('--color-input', themeColors.border.primary)
      root.style.setProperty('--color-ring', themeColors.accent)

      // Keep legacy variables for backward compatibility
      root.style.setProperty('--bg-light', themeColors.backgroundLight)
      root.style.setProperty('--primary-surface', themeColors.primarySurface)
      root.style.setProperty('--accent', themeColors.accent)
      root.style.setProperty('--text-primary', themeColors.textPrimary)
      root.style.setProperty('--secondary-accent', themeColors.secondaryAccent)
      
      // Add theme class to body for additional styling
      document.body.className = document.body.className.replace(/theme-\w+/g, '')
      document.body.classList.add(`theme-${currentTheme}`)
    }
  }, [currentTheme])

  const setTheme = (theme: ThemeName) => {
    setCurrentTheme(theme)
    localStorage.setItem('emotion-economy-theme', theme)
  }

  const toggleTheme = () => {
    const newTheme = currentTheme === 'therapeutic' ? 'purpleSparkle' : 'therapeutic'
    setTheme(newTheme)
  }

  const value = {
    currentTheme,
    setTheme,
    themeData: themes[currentTheme],
    toggleTheme,
  }

  return (
    <ColorThemeContext.Provider value={value}>
      {children}
    </ColorThemeContext.Provider>
  )
}
