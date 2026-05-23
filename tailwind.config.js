/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50:  '#f0f9f4',
          100: '#dcf0e5',
          200: '#bbe0cd',
          300: '#8bc8aa',
          400: '#56a87f',
          500: '#338c61',
          600: '#1a6b3c',   // brand primary
          700: '#155730',
          800: '#124526',
          900: '#0f3820',
        },
        earth: {
          50:  '#fdf8f0',
          100: '#faeede',
          200: '#f3d9b5',
          300: '#e9be82',
          400: '#dc9c4d',
          500: '#c97f2a',   // accent gold
          600: '#a8651e',
          700: '#834e1a',
          800: '#6a3f1a',
          900: '#573419',
        },
        clay: '#f5ede0',
        smoke: '#f7f9f8',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 2px 12px rgba(26,107,60,0.08)',
        'card-hover': '0 8px 32px rgba(26,107,60,0.16)',
        glow: '0 0 24px rgba(26,107,60,0.25)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-up':   'fadeUp 0.5s ease both',
        'fade-in':   'fadeIn 0.4s ease both',
        'slide-in':  'slideIn 0.35s ease both',
        'pulse-slow':'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:  { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'none' } },
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideIn: { from: { opacity: 0, transform: 'translateX(-16px)' }, to: { opacity: 1, transform: 'none' } },
      },
    },
  },
  plugins: [],
}
