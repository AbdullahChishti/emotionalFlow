// Design tokens for MindWell dashboard
export const spacing = {
  4: '4px',
  8: '8px',
  12: '12px',
  16: '16px',
  24: '24px',
  32: '32px',
} as const;

export const radius = {
  sm: '8px',
  md: '16px',
  lg: '24px',
} as const;

export const elevation = {
  card: 'shadow-[0_2px_12px_rgba(0,0,0,0.06)]',
} as const;

export const colors = {
  // Primary brand colors
  accent: '#5B7CFF',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#EF4444',

  // Surface colors
  surfaces: {
    bg: '#F7F8FA',
    card: '#FFFFFF',
    text: '#0F172A',
    subtext: '#475569',
  },

  // Severity colors for chips
  severity: {
    low: '#DCFCE7', // green-100
    moderate: '#FEF3C7', // yellow-100
    high: '#FEE2E2', // red-100
  },
} as const;

// Typography scale
export const typography = {
  h1: {
    size: '32px',
    weight: '600', // semibold
    lineHeight: '1.2',
  },
  h2: {
    size: '22px',
    weight: '600', // semibold
    lineHeight: '1.3',
  },
  body: {
    size: '16px',
    weight: '400', // regular
    lineHeight: '1.6',
  },
  caption: {
    size: '13px',
    weight: '400', // regular
    lineHeight: '1.5',
  },
} as const;

// Focus styles for accessibility
export const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

// Button sizing
export const buttonSizes = {
  sm: {
    height: '36px',
    padding: '8px 16px',
    fontSize: '14px',
  },
  md: {
    height: '44px',
    padding: '12px 24px',
    fontSize: '16px',
  },
  lg: {
    height: '52px',
    padding: '16px 32px',
    fontSize: '18px',
  },
} as const;
