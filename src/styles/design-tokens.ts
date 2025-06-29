// EmotionEconomy Design System - Multi-Theme Color Management

// Complete theme definitions
export const themes = {
  therapeutic: {
    name: 'Therapeutic Calm',
    description: 'Soothing colors for emotional wellness',
    colors: {
      backgroundLight: '#FFFDF7',
      primarySurface: '#FFFFFF',
      accent: '#C9B8DB',
      textPrimary: '#4A4A4A',
      secondaryAccent: '#A8C09A',
      
      background: {
        primary: '#FFFDF7',
        secondary: '#F8F7F5',
        tertiary: '#F0F4F7'
      },
      surface: {
        primary: '#FFFFFF',
        secondary: '#F8F7F5',
        elevated: '#FFFFFF',
        shadow: '#E8EEF2'
      },
      text: {
        primary: '#4A4A4A',
        secondary: '#6B6B6B',
        tertiary: '#8A8A8A',
        inverse: '#F5F2ED'
      },
      button: {
        primary: '#C9B8DB',
        primaryHover: '#B8A5D1',
        secondary: '#A8C09A',
        secondaryHover: '#98B088',
        disabled: '#D4DCE6'
      },
      border: {
        primary: '#B8C5E0',
        secondary: '#E8EEF2',
        light: '#F0F4F7'
      },
      status: {
        success: '#B8E4D0',
        warning: '#F5E6D3',
        error: '#F5C6CB',
        info: '#D1ECF1'
      },
      mood: {
        happy: '#F0E68C',
        calm: '#B0E0E6',
        anxious: '#DDA0DD',
        sad: '#D3D3D3',
        angry: '#F0A0A0',
        excited: '#FFB6C1'
      }
    }
  },
  purpleSparkle: {
    name: 'Purple Sparkle',
    description: 'Vibrant purple theme for joyful experiences',
    colors: {
      backgroundLight: '#F8F4FF',
      primarySurface: '#FFFFFF',
      accent: '#800080',
      textPrimary: '#333333',
      secondaryAccent: '#CCCCFF',
      
      background: {
        primary: '#F8F4FF',
        secondary: '#F0E6FF',
        tertiary: '#E8D4FF'
      },
      surface: {
        primary: '#FFFFFF',
        secondary: '#F8F4FF',
        elevated: '#FFFFFF',
        shadow: '#E0D0FF'
      },
      text: {
        primary: '#333333',
        secondary: '#555555',
        tertiary: '#777777',
        inverse: '#FFFFFF'
      },
      button: {
        primary: '#800080',
        primaryHover: '#6A006A',
        secondary: '#CCCCFF',
        secondaryHover: '#B8B8FF',
        disabled: '#D4D4D4'
      },
      border: {
        primary: '#CCCCFF',
        secondary: '#E0D0FF',
        light: '#F0E6FF'
      },
      status: {
        success: '#90EE90',
        warning: '#FFD700',
        error: '#FF6B6B',
        info: '#87CEEB'
      },
      mood: {
        happy: '#FFD700',
        calm: '#E6E6FA',
        anxious: '#DDA0DD',
        sad: '#D8BFD8',
        angry: '#FF69B4',
        excited: '#FF1493'
      }
    }
  },
  darkPurple: {
    name: 'Dark Purple',
    description: 'Dark theme with purple accents',
    colors: {
      backgroundLight: '#0f0f23',
      primarySurface: '#1a1a2e',
      accent: '#a855f7',
      textPrimary: '#e4e4e7',
      secondaryAccent: '#3f3f46',

      background: {
        primary: '#0f0f23',
        secondary: '#27272a',
        tertiary: '#3f3f46'
      },
      surface: {
        primary: '#1a1a2e',
        secondary: '#27272a',
        elevated: '#3f3f46',
        shadow: '#000000'
      },
      text: {
        primary: '#e4e4e7',
        secondary: '#a1a1aa',
        tertiary: '#71717a',
        inverse: '#18181b'
      },
      button: {
        primary: '#a855f7',
        primaryHover: '#9333ea',
        secondary: '#3f3f46',
        secondaryHover: '#52525b',
        disabled: '#27272a'
      },
      border: {
        primary: '#3f3f46',
        secondary: '#27272a',
        light: '#52525b'
      },
      status: {
        success: '#22c55e',
        warning: '#eab308',
        error: '#ef4444',
        info: '#3b82f6'
      },
      mood: {
        happy: '#fbbf24',
        calm: '#8b5cf6',
        anxious: '#a855f7',
        sad: '#6b7280',
        angry: '#ef4444',
        excited: '#ec4899'
      }
    }
  }
} as const

// Legacy color exports for backward compatibility
export const colors = themes.therapeutic.colors

// Spacing system
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px'
} as const

// Typography system
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['Fira Code', 'monospace']
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px'
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  }
} as const

// Border radius system
export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px'
} as const

// Shadow system
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
} as const

// Theme type definitions
export type ThemeName = keyof typeof themes
export type ThemeData = typeof themes[ThemeName]
export type ColorPalette = ThemeData['colors']
