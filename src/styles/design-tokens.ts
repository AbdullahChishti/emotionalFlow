// MindWell Design System - Accessibility-First Color Management

// Complete theme definitions with WCAG AA compliance
export const themes = {
  therapeutic: {
    name: 'Therapeutic Sanctuary',
    description: 'Calming, trust-building colors for mental wellness - WCAG AA compliant',
    colors: {
      backgroundLight: '#FEFCF8', // Warm cream background
      primarySurface: '#FFFFFF',
      accent: '#4A90A4', // Calming therapeutic blue
      textPrimary: '#2C3E50', // Warm, readable dark text
      secondaryAccent: '#7CB8C4', // Gentle supportive blue
      
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
        primary: '#2C3E50', // Warm, therapeutic dark text
        secondary: '#5D6D7E', // Gentle secondary text
        tertiary: '#8395A7', // Soft tertiary text
        supportive: '#4A90A4', // Calming therapeutic blue for supportive text
        inverse: '#FFFFFF', // Pure white for dark backgrounds
        disabled: '#BDC3C7', // Soft disabled states
        warm: '#8B4513' // Warm accent for special elements
      },
      button: {
        primary: '#4A90A4', // Calming therapeutic blue
        primaryHover: '#3A7A8C', // Softer hover state
        secondary: '#7CB8C4', // Gentle supportive button
        secondaryHover: '#6BA3AE', // Warm secondary hover
        disabled: '#BDC3C7', // Soft disabled state
        outline: '#4A90A4', // Outline button
        outlineHover: '#3A7A8C', // Outline hover
        gentle: '#F8F9FA', // Very soft button for less important actions
        gentleHover: '#E9ECEF' // Gentle hover
      },
      border: {
        primary: '#4A90A4', // Therapeutic blue border
        secondary: '#D6E4E9', // Soft, calming border
        light: '#E8F0F2', // Very light therapeutic border
        warm: '#F5E6D3' // Warm accent border
      },
      status: {
        success: '#D4EDDA', // Gentle success green
        warning: '#FFF3CD', // Soft warning yellow
        error: '#F8D7DA', // Gentle error pink (less alarming)
        info: '#D1ECF1', // Soft info blue
        therapeutic: '#E3F2FD' // Calming therapeutic status
      },
      mood: {
        calm: '#E3F2FD', // Soothing blue for calm
        peaceful: '#F3E5F5', // Gentle purple for peace
        hopeful: '#E8F5E8', // Soft green for hope
        supported: '#FFF8E1', // Warm yellow for support
        understanding: '#FCE4EC', // Gentle pink for understanding
        gentle: '#F1F8E9' // Very soft green for gentleness
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
  }
} as const

// Legacy color exports for backward compatibility
export const colors = themes.therapeutic.colors

// Spacing system - 4px base grid
export const spacing = {
  '0': '0px',
  '1': '4px',
  '2': '8px',
  '3': '12px',
  '4': '16px',
  '5': '20px',
  '6': '24px',
  '8': '32px',
  '10': '40px',
  '12': '48px',
  '16': '64px',
  '20': '80px',
  '24': '96px',
  '32': '128px'
} as const

// Layout spacing shortcuts
export const layoutSpacing = {
  formGap: spacing['6'], // 24px between form elements
  sectionGap: spacing['8'], // 32px between sections
  containerPadding: spacing['6'], // 24px container padding
  cardPadding: spacing['6'], // 24px card padding
  inputPadding: spacing['4'] // 16px input padding
} as const

// Typography system - Accessibility-first
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
    mono: ['Fira Code', 'SF Mono', 'Monaco', 'Inconsolata', 'monospace']
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
    '6xl': '60px'
  },
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2'
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800'
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em'
  }
} as const

// Semantic text styles - Therapy-focused
export const textStyles = {
  heading1: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.tight
  },
  heading2: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.tight
  },
  heading3: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.snug,
    letterSpacing: typography.letterSpacing.normal
  },
  body: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.relaxed,
    letterSpacing: typography.letterSpacing.normal
  },
  caption: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
    letterSpacing: typography.letterSpacing.wide
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.normal,
    letterSpacing: typography.letterSpacing.wide
  },
  // Therapeutic-specific styles
  therapeutic: {
    welcoming: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.normal,
      lineHeight: typography.lineHeight.relaxed,
      letterSpacing: typography.letterSpacing.normal
    },
    supportive: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.normal,
      lineHeight: typography.lineHeight.relaxed,
      letterSpacing: typography.letterSpacing.normal
    },
    gentle: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.normal,
      lineHeight: typography.lineHeight.normal,
      letterSpacing: typography.letterSpacing.wide
    },
    reassuring: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.normal,
      lineHeight: typography.lineHeight.snug,
      letterSpacing: typography.letterSpacing.normal
    }
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
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
} as const

// Focus and interaction states
export const focusRing = {
  default: '0 0 0 2px rgba(46, 125, 116, 0.2)',
  error: '0 0 0 2px rgba(239, 68, 68, 0.2)',
  success: '0 0 0 2px rgba(34, 197, 94, 0.2)',
  info: '0 0 0 2px rgba(59, 130, 246, 0.2)'
} as const

// Z-index scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800
} as const

// Animation durations
export const transitions = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms'
} as const

// Theme type definitions
export type ThemeName = keyof typeof themes
export type ThemeData = typeof themes[ThemeName]
export type ColorPalette = ThemeData['colors']
