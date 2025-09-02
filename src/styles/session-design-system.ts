/**
 * SessionScreen Therapeutic Design System
 * Optimized for mental health UX with calming colors and supportive interactions
 */

// Therapeutic Color Palette - Warm, supportive colors for mental health context
export const therapeuticPalette = {
  // Primary colors - Warm and supportive
  primary: {
    50: '#f0fdf4',   // Very light green - calming background
    100: '#dcfce7',  // Light green - subtle highlights
    500: '#22c55e',  // Supportive green - user actions, CTAs
    600: '#16a34a',  // Deeper green - hover states
    700: '#15803d',  // Dark green - active states
  },

  // Neutral colors - Non-threatening and readable
  neutral: {
    50: '#fafafa',   // Softest background
    100: '#f5f5f4',  // Message bubble background
    200: '#e5e5e5',  // Subtle borders
    300: '#d4d4d4',  // Input borders
    400: '#a3a3a3',  // Secondary text
    500: '#737373',  // Body text
    600: '#525252',  // Primary text
    700: '#404040',  // Headings
    800: '#262626',  // Strong headings
    900: '#171717',  // Highest contrast
  },

  // Emotional state indicators - Calming and informative
  emotional: {
    calm: '#3b82f6',      // Soft blue for calm states
    anxious: '#f59e0b',   // Warm amber for anxiety
    overwhelmed: '#ef4444', // Gentle red for overwhelm
    hopeful: '#8b5cf6',   // Soft purple for hope
    sad: '#06b6d4',       // Cyan for sadness (less aggressive than blue)
    angry: '#f97316',     // Orange for anger (warmer than red)
  },

  // Semantic colors for specific UI elements
  semantic: {
    success: '#22c55e',   // Green for positive actions
    warning: '#f59e0b',   // Amber for gentle warnings
    error: '#ef4444',     // Red for errors (use sparingly)
    info: '#3b82f6',      // Blue for informational content
  },

  // Special colors for therapeutic elements
  therapeutic: {
    presence: '#8b5cf6',      // Purple for listener presence
    affirmation: '#f0f9ff',   // Very light blue for affirmations
    emergency: '#dc2626',     // Red for emergency (high contrast)
    calming: '#ecfdf5',       // Mint green for calming elements
  }
}

// Message styling system
export const messageStyling = {
  user: {
    background: 'bg-emerald-600',
    hoverBackground: 'hover:bg-emerald-700',
    text: 'text-white',
    border: 'rounded-br-sm',
    shadow: 'shadow-emerald-500/20',
    maxWidth: 'max-w-sm md:max-w-md',
  },
  ai: {
    background: 'bg-neutral-100',
    hoverBackground: 'hover:bg-neutral-200',
    text: 'text-neutral-900',
    border: 'border border-neutral-200 rounded-bl-sm',
    shadow: 'shadow-neutral-500/10',
    maxWidth: 'max-w-sm md:max-w-md',
  },
  system: {
    background: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border border-amber-200 rounded-lg',
    shadow: 'shadow-amber-500/10',
    maxWidth: 'max-w-md',
  },
  emergency: {
    background: 'bg-red-50',
    text: 'text-red-900',
    border: 'border-2 border-red-200 rounded-lg',
    shadow: 'shadow-red-500/20',
    maxWidth: 'max-w-lg',
  }
}

// Layout configuration for different screen sizes
export const layoutConfig = {
  desktop: {
    chatFlex: 'flex-[2]',      // 66% width for chat
    presenceFlex: 'flex-[1]',  // 33% width for presence
    minPresence: '320px',
    maxPresence: '400px',
    orientation: 'horizontal' as const,
  },
  tablet: {
    chatFlex: 'flex-[3]',      // 60% width for chat
    presenceFlex: 'flex-[2]',  // 40% width for presence
    minPresence: '280px',
    maxPresence: '360px',
    orientation: 'horizontal' as const,
  },
  mobile: {
    chatFlex: 'flex-[4]',      // 80% width for chat
    presenceFlex: 'flex-[1]',  // 20% width for presence
    minPresence: '240px',
    maxPresence: '320px',
    orientation: 'vertical' as const,
  }
}

// Animation presets optimized for mental health context
export const therapeuticAnimations = {
  // Gentle, non-jarring transitions
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.6 }
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8 }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5 }
  },
  // Special animations for emotional content
  affirmationFade: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 1.5 }
  },
  messageSlide: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.4 }
  }
}

// Reduced motion alternatives for accessibility
export const reducedMotionAlternatives = {
  fadeIn: { opacity: 1 },
  slideUp: { opacity: 1, transform: 'none' },
  scaleIn: { opacity: 1, transform: 'none' },
  affirmationFade: { opacity: 1, transform: 'none' },
  messageSlide: { opacity: 1, transform: 'none' }
}

// Shadow system for therapeutic depth
export const therapeuticShadows = {
  subtle: 'shadow-neutral-500/10',
  message: 'shadow-neutral-500/5',
  card: 'shadow-neutral-500/15',
  modal: 'shadow-neutral-500/25',
  emergency: 'shadow-red-500/20'
}

// Border radius system for calming aesthetics
export const therapeuticRadii = {
  subtle: 'rounded-md',
  message: 'rounded-lg',
  card: 'rounded-xl',
  modal: 'rounded-2xl',
  full: 'rounded-full'
}

// Spacing system optimized for mental health readability
export const therapeuticSpacing = {
  // Content spacing
  messageGap: 'space-y-4',
  sectionGap: 'space-y-6',
  componentGap: 'gap-4',

  // Padding scales
  tight: 'p-3',
  comfortable: 'p-4',
  relaxed: 'p-6',
  spacious: 'p-8',

  // Margin scales
  small: 'm-2',
  medium: 'm-4',
  large: 'm-6'
}

export default {
  therapeuticPalette,
  messageStyling,
  layoutConfig,
  therapeuticAnimations,
  reducedMotionAlternatives,
  therapeuticShadows,
  therapeuticRadii,
  therapeuticSpacing
}
