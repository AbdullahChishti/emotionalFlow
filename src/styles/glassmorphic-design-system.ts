/**
 * Glassmorphic Design System for Therapeutic UX
 * Modern glassmorphism with mental health considerations
 */

// Glassmorphic color palette - ethereal and calming
export const glassmorphicPalette = {
  // Primary glass colors with therapeutic tones
  glass: {
    primary: 'rgba(255, 255, 255, 0.25)',      // Soft white glass
    secondary: 'rgba(255, 255, 255, 0.15)',    // Lighter glass
    tertiary: 'rgba(255, 255, 255, 0.1)',      // Very light glass
    accent: 'rgba(16, 185, 129, 0.1)',         // Mint accent glass
  },

  // Background layers for depth
  backgrounds: {
    primary: 'linear-gradient(135deg, rgba(236, 254, 255, 0.8) 0%, rgba(249, 250, 251, 0.6) 100%)',
    secondary: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(248, 250, 252, 0.2) 100%)',
    accent: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.02) 100%)',
  },

  // Therapeutic color accents
  therapeutic: {
    calm: 'rgba(59, 130, 246, 0.15)',          // Soft blue for calm
    peace: 'rgba(16, 185, 129, 0.12)',         // Mint for peace
    warmth: 'rgba(245, 158, 11, 0.1)',         // Amber for warmth
    serenity: 'rgba(139, 92, 246, 0.08)',      // Purple for serenity
    trust: 'rgba(34, 197, 94, 0.12)',          // Green for trust
  },

  // Text colors optimized for glass backgrounds
  text: {
    primary: 'rgba(31, 41, 55, 0.9)',          // Dark gray with transparency
    secondary: 'rgba(75, 85, 99, 0.8)',        // Medium gray
    tertiary: 'rgba(107, 114, 128, 0.7)',      // Light gray
    inverse: 'rgba(255, 255, 255, 0.95)',      // White for dark backgrounds
  },

  // Interactive states
  interactive: {
    hover: 'rgba(255, 255, 255, 0.35)',
    active: 'rgba(255, 255, 255, 0.45)',
    focus: 'rgba(16, 185, 129, 0.2)',
    disabled: 'rgba(156, 163, 175, 0.3)',
  }
}

// Glassmorphic styling utilities
export const glassStyles = {
  // Base glass panel
  panel: `
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    background: ${glassmorphicPalette.glass.primary};
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.08),
      0 1px 0 rgba(255, 255, 255, 0.3) inset;
  `,

  // Floating glass element
  floating: `
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    background: ${glassmorphicPalette.glass.secondary};
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow:
      0 12px 40px rgba(0, 0, 0, 0.12),
      0 2px 0 rgba(255, 255, 255, 0.2) inset,
      0 -1px 0 rgba(0, 0, 0, 0.05) inset;
  `,

  // Subtle glass overlay
  overlay: `
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    background: ${glassmorphicPalette.glass.tertiary};
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow:
      0 4px 16px rgba(0, 0, 0, 0.06),
      0 1px 0 rgba(255, 255, 255, 0.15) inset;
  `,

  // Interactive glass button
  button: `
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    background: ${glassmorphicPalette.glass.primary};
    border: 1px solid rgba(255, 255, 255, 0.25);
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.08),
      0 1px 0 rgba(255, 255, 255, 0.3) inset;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  `,

  // Glass input field
  input: `
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    background: ${glassmorphicPalette.glass.secondary};
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.06),
      0 1px 0 rgba(255, 255, 255, 0.15) inset;
  `
}

// Glassmorphic component variants
export const glassVariants = {
  // Panel sizes
  panelSizes: {
    small: 'p-4 rounded-xl',
    medium: 'p-6 rounded-2xl',
    large: 'p-8 rounded-3xl',
    xl: 'p-10 rounded-3xl'
  },

  // Button variants
  buttonVariants: {
    primary: `${glassStyles.button} text-white bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30`,
    secondary: `${glassStyles.button} text-gray-700 bg-gradient-to-r from-gray-100/20 to-gray-200/20 hover:from-gray-100/30 hover:to-gray-200/30`,
    ghost: `${glassStyles.overlay} text-gray-600 hover:text-gray-800 hover:bg-white/10`,
    danger: `${glassStyles.button} text-red-600 bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30`
  },

  // Input variants
  inputVariants: {
    default: `${glassStyles.input} text-gray-900 placeholder:text-gray-500 focus:border-emerald-300/50 focus:ring-2 focus:ring-emerald-500/20`,
    error: `${glassStyles.input} text-gray-900 border-red-300/50 focus:border-red-400/50 focus:ring-2 focus:ring-red-500/20`,
    success: `${glassStyles.input} text-gray-900 border-emerald-300/50 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-500/20`
  }
}

// Glassmorphic animation presets
export const glassAnimations = {
  // Gentle fade in for glass elements
  fadeInGlass: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.6 }
  },

  // Floating animation for glass panels
  floatIn: {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.5 }
  },

  // Subtle hover effect
  hoverLift: {
    scale: 1.02,
    transition: { duration: 0.3 }
  },

  // Breathing effect for calming elements
  breathe: {
    scale: [1, 1.02, 1],
    opacity: [0.9, 1, 0.9],
    transition: { duration: 4, repeat: Infinity }
  }
}

// Glassmorphic layout utilities
export const glassLayout = {
  // Container styles
  container: `
    relative min-h-screen
    bg-gradient-to-br from-slate-50/80 via-blue-50/60 to-emerald-50/40
    overflow-hidden
  `,

  // Layered background effects
  backgroundLayers: `
    absolute inset-0
    bg-gradient-to-br from-white/20 via-transparent to-emerald-100/10
    backdrop-blur-[100px]
  `,

  // Floating orbs for ambient atmosphere
  ambientOrbs: {
    large: `
      absolute top-20 right-20
      w-96 h-96
      bg-gradient-radial from-emerald-200/20 to-transparent
      rounded-full
      blur-3xl
      animate-pulse
    `,
    medium: `
      absolute bottom-32 left-16
      w-64 h-64
      bg-gradient-radial from-blue-200/15 to-transparent
      rounded-full
      blur-2xl
      animate-pulse
    `,
    small: `
      absolute top-1/2 left-1/3
      w-48 h-48
      bg-gradient-radial from-purple-200/10 to-transparent
      rounded-full
      blur-xl
      animate-pulse
    `
  }
}

// Glassmorphic responsive breakpoints
export const glassBreakpoints = {
  mobile: {
    container: 'p-4',
    panel: 'max-w-sm',
    spacing: 'space-y-4'
  },
  tablet: {
    container: 'p-6',
    panel: 'max-w-md',
    spacing: 'space-y-6'
  },
  desktop: {
    container: 'p-8',
    panel: 'max-w-2xl',
    spacing: 'space-y-8'
  }
}

export default {
  glassmorphicPalette,
  glassStyles,
  glassVariants,
  glassAnimations,
  glassLayout,
  glassBreakpoints
}
