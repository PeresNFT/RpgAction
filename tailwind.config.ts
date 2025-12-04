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
        primary: {
          green: '#4CAF50',
          blue: '#2196F3',
          orange: '#FF9800',
          purple: '#9C27B0',
          pink: '#E91E63',
          yellow: '#FFEB3B',
          cyan: '#00BCD4',
          brown: '#795548',
          'blue-gray': '#607D8B',
          'deep-orange': '#FF5722',
        },
        dark: {
          bg: '#0a0a0f',
          'bg-secondary': '#11111a',
          'bg-tertiary': '#1a1a2e',
          'bg-card': '#16213e',
          border: '#1e2749',
          'border-light': '#2a3a5a',
          text: '#e0e0e0',
          'text-secondary': '#a0a0b0',
          'text-muted': '#6b6b7a',
        },
        accent: {
          purple: '#6c5ce7',
          'purple-dark': '#5a4fcf',
          blue: '#3742fa',
          'blue-dark': '#2f3542',
          cyan: '#00d2d3',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config
