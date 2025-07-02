// Theme-aware utility functions and classes
import { themes, ThemeName } from './design-tokens'

// CSS class generators using CSS custom properties
export const themeClasses = {
  // Background classes
  background: {
    primary: 'bg-[var(--color-background)]',
    secondary: 'bg-[var(--color-background-secondary)]',
    tertiary: 'bg-[var(--color-background-tertiary)]',
  },
  
  // Surface classes
  surface: {
    primary: 'bg-[var(--color-surface)]',
    secondary: 'bg-[var(--color-surface-secondary)]',
    elevated: 'bg-[var(--color-surface-elevated)]',
  },
  
  // Text classes
  text: {
    primary: 'text-[var(--color-foreground)]',
    secondary: 'text-[var(--color-foreground-secondary)]',
    tertiary: 'text-[var(--color-foreground-tertiary)]',
    inverse: 'text-[var(--color-foreground-inverse)]',
  },
  
  // Border classes
  border: {
    primary: 'border-[var(--color-border)]',
    secondary: 'border-[var(--color-border-secondary)]',
    light: 'border-[var(--color-border-light)]',
  },
  
  // Button classes
  button: {
    primary: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-primary-foreground)]',
    secondary: 'bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-hover)] text-[var(--color-secondary-foreground)]',
    ghost: 'hover:bg-[var(--color-background-secondary)] text-[var(--color-foreground)]',
    outline: 'border border-[var(--color-border)] hover:bg-[var(--color-background-secondary)] text-[var(--color-foreground)]',
  },
  
  // Status classes
  status: {
    success: 'text-[var(--color-success)]',
    warning: 'text-[var(--color-warning)]',
    error: 'text-[var(--color-error)]',
    info: 'text-[var(--color-info)]',
  },
  
  // Typography classes
  typography: {
    // Font sizes
    xs: 'text-[var(--font-size-xs)]',
    sm: 'text-[var(--font-size-sm)]',
    base: 'text-[var(--font-size-base)]',
    lg: 'text-[var(--font-size-lg)]',
    xl: 'text-[var(--font-size-xl)]',
    '2xl': 'text-[var(--font-size-2xl)]',
    '3xl': 'text-[var(--font-size-3xl)]',
    '4xl': 'text-[var(--font-size-4xl)]',
    '5xl': 'text-[var(--font-size-5xl)]',
    '6xl': 'text-[var(--font-size-6xl)]',
    '7xl': 'text-[var(--font-size-7xl)]',
    '8xl': 'text-[var(--font-size-8xl)]',
    
    // Font weights
    extralight: 'font-[var(--font-weight-extralight)]',
    light: 'font-[var(--font-weight-light)]',
    normal: 'font-[var(--font-weight-normal)]',
    medium: 'font-[var(--font-weight-medium)]',
    semibold: 'font-[var(--font-weight-semibold)]',
    bold: 'font-[var(--font-weight-bold)]',
    
    // Line heights
    tight: 'leading-[var(--line-height-tight)]',
    snug: 'leading-[var(--line-height-snug)]',
    normalLeading: 'leading-[var(--line-height-normal)]',
    relaxed: 'leading-[var(--line-height-relaxed)]',
    loose: 'leading-[var(--line-height-loose)]',
    
    // Letter spacing
    tighter: 'tracking-[var(--letter-spacing-tighter)]',
    tightTracking: 'tracking-[var(--letter-spacing-tight)]',
    normalTracking: 'tracking-[var(--letter-spacing-normal)]',
    wide: 'tracking-[var(--letter-spacing-wide)]',
    wider: 'tracking-[var(--letter-spacing-wider)]',
    widest: 'tracking-[var(--letter-spacing-widest)]',
  },
  
  // Spacing classes
  spacing: {
    xs: 'p-[var(--spacing-xs)]',
    sm: 'p-[var(--spacing-sm)]',
    md: 'p-[var(--spacing-md)]',
    lg: 'p-[var(--spacing-lg)]',
    xl: 'p-[var(--spacing-xl)]',
    '2xl': 'p-[var(--spacing-2xl)]',
    '3xl': 'p-[var(--spacing-3xl)]',
  },
  
  // Border radius classes
  radius: {
    sm: 'rounded-[var(--radius-sm)]',
    md: 'rounded-[var(--radius-md)]',
    lg: 'rounded-[var(--radius-lg)]',
    xl: 'rounded-[var(--radius-xl)]',
    '2xl': 'rounded-[var(--radius-2xl)]',
    full: 'rounded-[var(--radius-full)]',
  },
  
  // Shadow classes
  shadow: {
    sm: 'shadow-[var(--shadow-sm)]',
    md: 'shadow-[var(--shadow-md)]',
    lg: 'shadow-[var(--shadow-lg)]',
    xl: 'shadow-[var(--shadow-xl)]',
    '2xl': 'shadow-[var(--shadow-2xl)]',
    inner: 'shadow-[var(--shadow-inner)]',
    none: 'shadow-[var(--shadow-none)]',
  },
  
  // Animation classes
  transition: {
    fast: 'duration-[var(--duration-fast)]',
    normal: 'duration-[var(--duration-normal)]',
    slow: 'duration-[var(--duration-slow)]',
    slower: 'duration-[var(--duration-slower)]',
    
    apple: 'ease-[var(--easing-apple)]',
    bounce: 'ease-[var(--easing-bounce)]',
  },
}

// Component preset classes
export const componentClasses = {
  // Hero section
  hero: {
    container: `${themeClasses.background.primary} min-h-screen`,
    title: `${themeClasses.typography['5xl']} md:${themeClasses.typography['7xl']} ${themeClasses.typography.extralight} ${themeClasses.text.primary} ${themeClasses.typography.tight} ${themeClasses.typography.tightTracking}`,
    subtitle: `${themeClasses.typography.xl} md:${themeClasses.typography['2xl']} ${themeClasses.text.secondary} ${themeClasses.typography.light} ${themeClasses.typography.relaxed}`,
    accent: `w-1 h-16 ${themeClasses.background.primary} mx-auto mb-12`,
  },
  
  // Header
  header: {
    container: `${themeClasses.background.primary} border-b ${themeClasses.border.light}`,
    logo: `${themeClasses.typography.xl} ${themeClasses.typography.light} ${themeClasses.text.primary} ${themeClasses.typography.wide}`,
    nav: `${themeClasses.text.secondary} hover:${themeClasses.text.primary} ${themeClasses.transition.normal} ${themeClasses.typography.light}`,
  },
  
  // Buttons
  button: {
    primary: `${themeClasses.button.primary} ${themeClasses.radius.full} ${themeClasses.transition.slow} ${themeClasses.typography.light} ${themeClasses.typography.lg} ${themeClasses.typography.wide} overflow-hidden`,
    secondary: `${themeClasses.button.secondary} ${themeClasses.radius.full} ${themeClasses.transition.slow} ${themeClasses.typography.light}`,
    ghost: `${themeClasses.button.ghost} ${themeClasses.radius.md} ${themeClasses.transition.normal}`,
  },
  
  // Cards
  card: {
    base: `${themeClasses.surface.primary} ${themeClasses.radius.lg} ${themeClasses.shadow.md} ${themeClasses.border.light} border`,
    elevated: `${themeClasses.surface.elevated} ${themeClasses.radius.xl} ${themeClasses.shadow.lg}`,
  },
  
  // Feature sections
  feature: {
    container: `${themeClasses.background.primary}`,
    title: `${themeClasses.typography['4xl']} md:${themeClasses.typography['5xl']} ${themeClasses.typography.extralight} ${themeClasses.text.primary}`,
    description: `${themeClasses.typography.xl} ${themeClasses.text.secondary} ${themeClasses.typography.light}`,
    indicator: `w-2 h-2 ${themeClasses.radius.full} ${themeClasses.background.primary}`,
  },
  
  // Footer
  footer: {
    container: `${themeClasses.background.primary} border-t ${themeClasses.border.light}`,
    text: `${themeClasses.text.tertiary} ${themeClasses.typography.light} ${themeClasses.typography.sm} ${themeClasses.typography.wide}`,
  },
}

// Utility function to combine classes
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

// Theme-aware style generator
export function getThemeStyles(themeName: ThemeName) {
  const theme = themes[themeName]
  return {
    colors: theme.colors,
    cssVars: {
      '--color-background': theme.colors.background.primary,
      '--color-foreground': theme.colors.text.primary,
      '--color-primary': theme.colors.button.primary,
      '--color-secondary': theme.colors.button.secondary,
      // Add more as needed
    }
  }
}

// Animation presets
export const animations = {
  fadeIn: 'animate-in fade-in duration-[var(--duration-slow)]',
  slideUp: 'animate-in slide-in-from-bottom-4 duration-[var(--duration-slow)] ease-[var(--easing-apple)]',
  slideDown: 'animate-in slide-in-from-top-4 duration-[var(--duration-slow)] ease-[var(--easing-apple)]',
  scaleIn: 'animate-in zoom-in-95 duration-[var(--duration-normal)] ease-[var(--easing-bounce)]',
}
