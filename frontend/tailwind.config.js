/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ivory: '#fbfbfa',
        paper: '#ffffff',
        charcoal: {
          DEFAULT: '#18181b',
          light: '#27272a',
          dark: '#09090b',
        },
        graphite: {
          DEFAULT: '#71717a',
          light: '#a1a1aa',
          dark: '#52525b',
        },
        cobalt: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2563eb', // Confident primary cobalt
          600: '#1d4ed8', // Primary action
          700: '#1e40af', // Hover state
          800: '#1e3a8a',
          900: '#172554',
        },
        teal: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488', // Restrained sage/teal secondary accent
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#172554',
        },
        warm: {
          50:  '#fbfbfa',
          100: '#f4f4f1',
          200: '#e5e5e0', // Subtle warm border
          300: '#d4d4cc',
          400: '#a3a398',
          500: '#737367',
          600: '#525247',
          700: '#3f3f37',
          800: '#262621',
          900: '#181815',
        },
        surface: 'var(--surface)',
        'surface-subtle': 'var(--surface-subtle)',
        'border-editorial': 'var(--border)',
        'border-subtle': 'var(--border-subtle)',
        'card-edge': 'var(--border)',
        'card-fill': 'var(--surface)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        editorial: ['Newsreader', 'Georgia', 'serif'],
        display: ['Newsreader', 'Georgia', 'serif'],
        montserrat: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        brand: ['Onest', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'card-subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 4px 12px -2px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'drawer': '-4px 0 24px 0 rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseSoft: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.5 } },
      }
    },
  },
  plugins: [],
}
