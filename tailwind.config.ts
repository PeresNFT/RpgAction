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
