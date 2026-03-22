import type { Config } from 'tailwindcss'

export default {
  content: ['./src/renderer/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        cave: {
          bg:       '#0c0810',
          surface:  '#16101e',
          elevated: '#1e1628',
          border:   '#2e2040',
          gold:     '#c9a255',
          'gold-light': '#e2be7a',
          wine:     '#7c1d2e',
          'wine-light': '#a0243c',
          cream:    '#f0e8dc',
          muted:    '#8a7a8a',
          subtle:   '#3d2f4d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.6)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.4)',
        'gold': '0 0 20px rgba(201,162,85,0.15)',
      },
    },
  },
  plugins: [],
} satisfies Config
