import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-green': {
          '50': '#f1f8f1',
          '100': '#e4f0e4',
          '200': '#c9e2c9',
          '300': '#aad3ad',
          '400': '#8cc58f',
          '500': '#6eb671',
          '600': '#58925a',
          '700': '#426d44',
          '800': '#2c492d',
          '900': '#162417',
          '950': '#0b120b',
        },
        'brand-background': '#FFFFFF', // Pure white
        'brand-text-primary': '#2c492d', // Dark, soothing green
        'brand-text-secondary': '#58925a', // Mid-tone green for secondary text
        // Primary colors (Sky blue theme)
        'primary': {
          '50': '#f0f9ff',
          '100': '#e0f2fe',
          '200': '#bae6fd',
          '300': '#7dd3fc',
          '400': '#38bdf8',
          '500': '#0ea5e9',
          '600': '#0284c7',
          '700': '#0369a1',
          '800': '#075985',
          '900': '#0c4a6e',
        },
        // Secondary colors (Slate theme)
        'secondary': {
          '50': '#f8fafc',
          '100': '#f1f5f9',
          '200': '#e2e8f0',
          '300': '#cbd5e1',
          '400': '#94a3b8',
          '500': '#64748b',
          '600': '#475569',
          '700': '#334155',
          '800': '#1e293b',
          '900': '#0f172a',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(to bottom right, #FFFFFF, #F1F8F1)',
      },
      animation: {},
      keyframes: {},
    },
  },
  plugins: [],
}
export default config
