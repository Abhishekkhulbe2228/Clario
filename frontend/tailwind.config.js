/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2563eb', // Electric Royal Blue (matches logo chat dots & 'i' dot)
          600: '#1d4ed8', // Primary action / button color
          700: '#1e40af', // Hover state
          800: '#1e3a8a',
          900: '#172554',
          950: '#0b1638',
        },
        violet: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6', // Twilight Violet (matches logo bottom curve & star)
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        azure: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8', // Sky highlight on C top arc
          500: '#0ea5e9', // Lower sparkle star
          600: '#0284c7',
        },
        navy: {
          50:  '#f2f6fd',
          100: '#e2ebfa',
          700: '#1c2744',
          800: '#121c33',
          900: '#0a1531', // Exact deep obsidian navy from logo wordmark
          950: '#060d21', // Darkest background with subtle blue depth
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'typing': 'typing 1.2s steps(3) infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseSoft: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.5 } },
        typing: { '0%': { content: '.' }, '33%': { content: '..' }, '66%': { content: '...' } },
      }
    },
  },
  plugins: [],
}
