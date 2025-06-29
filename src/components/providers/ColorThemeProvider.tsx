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
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('darkPurple')

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

      // Toggle dark class for themes that require it
      if (currentTheme === 'darkPurple') {
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

      // Set all theme CSS variables for themes.css compatibility
      root.style.setProperty('--bg-primary', themeColors.background.primary)
      root.style.setProperty('--bg-secondary', themeColors.background.secondary)
      root.style.setProperty('--bg-tertiary', themeColors.background.tertiary)
      root.style.setProperty('--surface-primary', themeColors.surface.primary)
      root.style.setProperty('--surface-secondary', themeColors.surface.secondary)
      root.style.setProperty('--surface-elevated', themeColors.surface.elevated)
      root.style.setProperty('--surface-shadow', themeColors.surface.shadow)
      root.style.setProperty('--text-secondary', themeColors.text.secondary)
      root.style.setProperty('--text-tertiary', themeColors.text.tertiary)
      root.style.setProperty('--text-inverse', themeColors.text.inverse)
      root.style.setProperty('--button-primary', themeColors.button.primary)
      root.style.setProperty('--button-primary-hover', themeColors.button.primaryHover)
      root.style.setProperty('--button-secondary', themeColors.button.secondary)
      root.style.setProperty('--button-secondary-hover', themeColors.button.secondaryHover)
      root.style.setProperty('--button-disabled', themeColors.button.disabled)
      root.style.setProperty('--border-primary', themeColors.border.primary)
      root.style.setProperty('--border-secondary', themeColors.border.secondary)
      root.style.setProperty('--border-light', themeColors.border.light)
      
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
    const newTheme = currentTheme === 'darkPurple' ? 'purpleSparkle' : 'darkPurple'
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
