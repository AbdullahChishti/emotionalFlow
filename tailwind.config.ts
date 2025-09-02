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
        // Primary colors for consistent theming
        'primary': {
          '50': '#FFFEFB',
          '100': '#FFFDF7',
          '200': '#F8F7F5',
          '300': '#F0F4F7',
          '400': '#E8EEF2',
          '500': '#C9B8DB',
          '600': '#B8A5D1',
          '700': '#A092C7',
          '800': '#887FBD',
          '900': '#6F6BB3',
        },
        // Secondary colors
        'secondary': {
          '50': '#F8F9F8',
          '100': '#F1F5F1',
          '200': '#E4EBE4',
          '300': '#D7E1D7',
          '400': '#C9D7C9',
          '500': '#A8C09A',
          '600': '#98B088',
          '700': '#889F76',
          '800': '#788F64',
          '900': '#687F52',
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
