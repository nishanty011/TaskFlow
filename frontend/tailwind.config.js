/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1', // Indigo primary
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // TaskFlow standard status colors from plan
        status: {
          assigned: {
            bg: '#f1f5f9',
            text: '#475569',
            border: '#cbd5e1'
          },
          in_progress: {
            bg: '#eff6ff',
            text: '#1d4ed8',
            border: '#bfdbfe'
          },
          submitted: {
            bg: '#fffbeb',
            text: '#b45309',
            border: '#fde68a'
          },
          under_review: {
            bg: '#fdf4ff',
            text: '#86198f',
            border: '#f5d0fe'
          },
          changes_requested: {
            bg: '#fef2f2',
            text: '#b91c1c',
            border: '#fecaca'
          },
          completed: {
            bg: '#f0fdf4',
            text: '#15803d',
            border: '#bbf7d0'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-hover': '0 12px 40px 0 rgba(31, 38, 135, 0.12)',
        'glow-brand': '0 0 25px -5px rgba(99, 102, 241, 0.35)',
      }
    },
  },
  plugins: [],
}
