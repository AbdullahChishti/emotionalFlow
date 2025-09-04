// Centralized Color System for MindWell Therapy App
// All colors should reference this file for consistency

export const colors = {
  // Primary Therapeutic Color - #335f64
  primary: '#335f64',
  primaryHover: '#2a4f52',
  primaryLight: 'rgba(51, 95, 100, 0.1)',
  primaryMedium: 'rgba(51, 95, 100, 0.2)',

  // Secondary Colors for UI Elements
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // Neutral Colors for Text and Backgrounds
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Status Colors
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },

  // Glassmorphic Effects
  glass: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'rgba(255, 255, 255, 0.2)',
    shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  },

  // Therapeutic Specific Colors
  therapeutic: {
    calm: '#e0f2fe',
    peace: '#f3e5f5',
    hope: '#e8f5e8',
    trust: '#fff8e1',
    care: '#fce4ec',
  }
} as const

// Button Styles
export const buttonStyles = {
  primary: {
    backgroundColor: colors.primary,
    color: '#ffffff',
    hoverBackgroundColor: colors.primaryHover,
    border: 'none',
    borderRadius: '0.5rem',
    boxShadow: `0 4px 14px 0 ${colors.primaryLight}`,
  },
  secondary: {
    backgroundColor: colors.secondary[100],
    color: colors.secondary[800],
    hoverBackgroundColor: colors.secondary[200],
    border: `1px solid ${colors.secondary[200]}`,
    borderRadius: '0.5rem',
  },
  outline: {
    backgroundColor: 'transparent',
    color: colors.primary,
    hoverBackgroundColor: colors.primaryLight,
    border: `2px solid ${colors.primary}`,
    borderRadius: '0.5rem',
  }
}

// Typography Colors
export const textColors = {
  primary: colors.secondary[900],
  secondary: colors.secondary[600],
  tertiary: colors.secondary[500],
  inverse: '#ffffff',
  accent: colors.primary,
}

// Background Colors
export const backgroundColors = {
  primary: '#ffffff',
  secondary: colors.secondary[50],
  accent: colors.primaryLight,
  glass: colors.glass.background,
}

// Border Colors
export const borderColors = {
  light: colors.secondary[200],
  medium: colors.secondary[300],
  accent: colors.primary,
}

// Shadow Colors
export const shadowColors = {
  sm: `0 1px 2px 0 ${colors.primaryLight}`,
  md: `0 4px 6px -1px ${colors.primaryLight}`,
  lg: `0 10px 15px -3px ${colors.primaryLight}`,
  xl: `0 20px 25px -5px ${colors.primaryLight}`,
}
