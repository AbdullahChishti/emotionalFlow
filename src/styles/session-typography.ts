/**
 * Therapeutic Typography System
 * Optimized for mental health UX with calming, readable text styles
 */

// Font families prioritized for mental health context
export const therapeuticFonts = {
  // Primary font - Clean, readable, non-aggressive
  primary: 'font-sans',
  // Normal font weight for regular text
  normal: 'font-normal',
  // Light font weight for calming elements
  light: 'font-light',
  // Medium font weight for buttons
  medium: 'font-medium',
  // Semibold font weight for emphasis
  semibold: 'font-semibold',
  // Special font for calming elements
  calming: 'font-light',
  // Supportive font for encouragement
  supportive: 'font-medium',
  // Monospace for code-like elements (rare in therapeutic context)
  monospace: 'font-mono'
}

// Typography scale optimized for mental health readability
export const therapeuticTypography = {
  // Display text - Large, welcoming
  display: {
    large: 'text-4xl font-light text-neutral-900 tracking-tight leading-tight',
    medium: 'text-3xl font-light text-neutral-800 tracking-tight leading-tight',
    small: 'text-2xl font-light text-neutral-800 tracking-tight leading-snug'
  },

  // Headlines - Clear hierarchy without being aggressive
  headline: {
    h1: 'text-2xl font-light text-neutral-900 tracking-tight',
    h2: 'text-xl font-medium text-neutral-800 tracking-tight',
    h3: 'text-lg font-medium text-neutral-700 tracking-tight',
    h4: 'text-base font-semibold text-neutral-700 tracking-tight'
  },

  // Body text - Optimized for therapeutic conversations
  body: {
    large: 'text-lg leading-relaxed text-neutral-700 font-normal',
    regular: 'text-base leading-relaxed text-neutral-700 font-normal',
    small: 'text-sm leading-relaxed text-neutral-600 font-normal',
    caption: 'text-xs leading-normal text-neutral-500 font-medium uppercase tracking-wide'
  },

  // Interactive text - Clear and reassuring
  interactive: {
    primary: 'text-base font-medium text-emerald-600 hover:text-emerald-700',
    secondary: 'text-base font-medium text-neutral-600 hover:text-neutral-700',
    danger: 'text-base font-medium text-red-600 hover:text-red-700',
    disabled: 'text-base font-medium text-neutral-400 cursor-not-allowed'
  },

  // Message text - Optimized for conversation flow
  message: {
    user: 'text-sm leading-relaxed text-white font-normal',
    ai: 'text-sm leading-relaxed text-neutral-900 font-normal',
    system: 'text-sm leading-relaxed text-amber-800 font-normal',
    timestamp: 'text-xs text-neutral-500 font-normal'
  },

  // Special therapeutic styles
  therapeutic: {
    // Calming - Reduces visual stress
    calming: 'font-light tracking-wide text-neutral-600',
    // Supportive - Builds confidence
    supportive: 'font-medium text-emerald-700',
    // Gentle - Soft and non-threatening
    gentle: 'font-normal text-neutral-500 italic',
    // Encouraging - Warm and motivating
    encouraging: 'font-medium text-amber-700'
  },

  // Status and feedback text
  status: {
    success: 'text-sm font-medium text-emerald-700',
    warning: 'text-sm font-medium text-amber-700',
    error: 'text-sm font-medium text-red-700',
    info: 'text-sm font-medium text-blue-700'
  },

  // Accessibility text - High contrast and readable
  accessibility: {
    highContrast: 'text-neutral-900 font-medium',
    large: 'text-lg font-normal leading-relaxed',
    screenReader: 'sr-only' // For screen reader only content
  }
}

// Text sizing utilities for responsive design
export const responsiveText = {
  // Responsive headline scaling
  responsiveHeadline: {
    mobile: 'text-xl',
    tablet: 'text-2xl',
    desktop: 'text-3xl'
  },

  // Responsive body text scaling
  responsiveBody: {
    mobile: 'text-sm',
    tablet: 'text-base',
    desktop: 'text-lg'
  },

  // Message text responsive scaling
  responsiveMessage: {
    mobile: 'text-xs',
    tablet: 'text-sm',
    desktop: 'text-sm'
  }
}

// Line height optimizations for readability
export const lineHeights = {
  tight: 'leading-tight',     // 1.25 - Headlines
  snug: 'leading-snug',       // 1.375 - Subheadings
  normal: 'leading-normal',   // 1.5 - Body text
  relaxed: 'leading-relaxed', // 1.625 - Therapeutic content
  loose: 'leading-loose'      // 2 - Special calming content
}

// Letter spacing for therapeutic effect
export const letterSpacing = {
  tight: 'tracking-tight',    // -0.025em - Headlines
  normal: 'tracking-normal',  // 0 - Body text
  wide: 'tracking-wide',      // 0.025em - Calming elements
  wider: 'tracking-wider',    // 0.05em - Special emphasis
  widest: 'tracking-widest'   // 0.1em - Very calming
}

// Font weight system for emotional communication
export const fontWeights = {
  light: 'font-light',        // 300 - Calming, non-aggressive
  normal: 'font-normal',      // 400 - Balanced, readable
  medium: 'font-medium',      // 500 - Supportive, encouraging
  semibold: 'font-semibold',  // 600 - Important information
  bold: 'font-bold'          // 700 - Critical alerts (use sparingly)
}

// Text decoration utilities
export const textDecorations = {
  underline: 'underline decoration-emerald-600 decoration-2 underline-offset-2',
  strikethrough: 'line-through',
  none: 'no-underline'
}

// Text alignment for therapeutic layout
export const textAlignment = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify'
}

// Special text effects for therapeutic elements
export const therapeuticEffects = {
  // Soft glow for affirmations
  affirmationGlow: 'drop-shadow-[0_0_2px_rgba(139,92,246,0.5)]',
  // Subtle text shadow for depth
  subtleShadow: 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]',
  // Gradient text for special elements
  gradientText: 'bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent',
  // Outline text for accessibility
  outlineText: 'text-transparent bg-clip-text bg-neutral-900 border border-current'
}

// Combined style presets for common UI elements
export const typographyPresets = {
  // Session header
  sessionTitle: `${therapeuticTypography.headline.h1} ${therapeuticFonts.calming}`,
  sessionSubtitle: `${therapeuticTypography.body.caption} ${therapeuticFonts.supportive}`,

  // Chat messages
  userMessage: `${therapeuticTypography.message.user} ${therapeuticFonts.normal}`,
  aiMessage: `${therapeuticTypography.message.ai} ${therapeuticFonts.normal}`,
  systemMessage: `${therapeuticTypography.message.system} ${therapeuticFonts.supportive}`,

  // Buttons and CTAs
  primaryButton: `${therapeuticTypography.interactive.primary} ${therapeuticFonts.supportive}`,
  secondaryButton: `${therapeuticTypography.interactive.secondary} ${therapeuticFonts.normal}`,
  dangerButton: `${therapeuticTypography.interactive.danger} ${therapeuticFonts.medium}`,

  // Affirmations and support text
  affirmation: `${therapeuticTypography.therapeutic.calming} ${therapeuticEffects.affirmationGlow}`,
  supportText: `${therapeuticTypography.therapeutic.supportive} ${therapeuticFonts.supportive}`,
  gentleReminder: `${therapeuticTypography.therapeutic.gentle} ${therapeuticFonts.light}`,

  // Status indicators
  successStatus: `${therapeuticTypography.status.success} ${therapeuticFonts.medium}`,
  warningStatus: `${therapeuticTypography.status.warning} ${therapeuticFonts.medium}`,
  errorStatus: `${therapeuticTypography.status.error} ${therapeuticFonts.semibold}`
}

export default {
  therapeuticFonts,
  therapeuticTypography,
  responsiveText,
  lineHeights,
  letterSpacing,
  fontWeights,
  textDecorations,
  textAlignment,
  therapeuticEffects,
  typographyPresets
}
