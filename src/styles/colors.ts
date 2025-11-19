/**
 * Centralized Color System
 * 
 * This file provides TypeScript access to CSS custom properties.
 * All colors are defined in globals.css as CSS variables.
 * 
 * Usage:
 * import { colors } from '@/styles/colors'
 * 
 * // In inline styles:
 * style={{ background: colors.primary.gradient }}
 * 
 * // In Tailwind (use arbitrary values):
 * className="bg-[var(--color-primary)]"
 */

export const colors = {
  // Primary gradient
  primary: {
    DEFAULT: 'var(--color-primary)',
    dark: 'var(--color-primary-dark)',
    light: 'var(--color-primary-light)',
    gradient: 'var(--gradient-primary)',
    gradientFrom: 'var(--color-primary-gradient-from)',
    gradientMid: 'var(--color-primary-gradient-mid)',
    gradientTo: 'var(--color-primary-gradient-to)',
  },

  // Backgrounds
  background: {
    DEFAULT: 'var(--color-background)',
    white: 'var(--color-background-white)',
    surface: 'var(--color-surface)',
    elevated: 'var(--color-surface-elevated)',
  },

  // Text
  text: {
    primary: 'var(--color-text-primary)',
    secondary: 'var(--color-text-secondary)',
    tertiary: 'var(--color-text-tertiary)',
    inverse: 'var(--color-text-inverse)',
  },

  // Borders
  border: {
    DEFAULT: 'var(--color-border)',
    light: 'var(--color-border-light)',
    primary: 'var(--color-border-primary)',
  },

  // Status
  status: {
    success: 'var(--color-success)',
    successBg: 'var(--color-success-bg)',
    successBorder: 'var(--color-success-border)',
    warning: 'var(--color-warning)',
    warningBg: 'var(--color-warning-bg)',
    warningBorder: 'var(--color-warning-border)',
    error: 'var(--color-error)',
    errorBg: 'var(--color-error-bg)',
    errorBorder: 'var(--color-error-border)',
    info: 'var(--color-info)',
    infoBg: 'var(--color-info-bg)',
    infoBorder: 'var(--color-info-border)',
  },

  // Shadows
  shadow: {
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    xl: 'var(--shadow-xl)',
    primary: 'var(--shadow-primary)',
  },

  // Blur
  blur: {
    sm: 'var(--blur-sm)',
    md: 'var(--blur-md)',
    lg: 'var(--blur-lg)',
    xl: 'var(--blur-xl)',
  },

  // Opacity
  opacity: {
    disabled: 'var(--opacity-disabled)',
    hover: 'var(--opacity-hover)',
    overlay: 'var(--opacity-overlay)',
  },

  // Gradients
  gradient: {
    primary: 'var(--gradient-primary)',
    overlay: 'var(--gradient-overlay)',
  },
} as const

/**
 * Helper function to get a CSS variable value
 * Useful for inline styles that need the actual color value
 */
export function getCSSVar(varName: string): string {
  if (typeof window === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
}

/**
 * Example usage in components:
 * 
 * // Tailwind classes (recommended):
 * <div className="bg-[var(--color-primary)] text-[var(--color-text-inverse)]" />
 * 
 * // Inline styles:
 * <div style={{ background: colors.primary.gradient }} />
 * 
 * // Get computed value:
 * const primaryColor = getCSSVar('--color-primary')
 */
