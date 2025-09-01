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
