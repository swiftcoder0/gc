/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gc: {
          black: '#0b0b0b',
          charcoal: '#141414',
          surface: '#121212',
          border: '#222222',
          text: '#e8e8e6',
          textMuted: '#8a8a88',
          silver: '#c0c0c0',
          gold: '#F5B800',
          goldGlow: 'rgba(245, 184, 0, 0.5)',
          goldBorder: 'rgba(245, 184, 0, 0.4)',
        },
        gotham: {
          black: '#08080A',
          dark: '#0D0E11',
          card: '#121318',
          cardHover: '#181920',
          border: '#242630',
          borderLight: '#323644',
          charcoal: '#1A1C23',
          muted: '#8A8F9E',
          silver: '#C5C8D4',
          white: '#F5F6FA',
          accent: '#FFFFFF',
          gold: '#C5A880',
          goldLight: '#E8D3B9',
          parchment: '#F6F1E7',
          parchmentDark: '#EDE3D2',
          ink: '#1A1917',
        }
      },
      fontFamily: {
        display: ['Unbounded', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        serif: ['Cinzel', 'Playfair Display', 'serif'],
        editorial: ['Syne', 'sans-serif'],
        script: ['"Great Vibes"', 'cursive'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.08) 0%, transparent 70%)',
        'radial-spotlight': 'radial-gradient(circle at center, rgba(255, 255, 255, 0.05) 0%, transparent 60%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'unroll': 'unroll 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 3s infinite ease-in-out',
        'stamp': 'stamp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        unroll: {
          '0%': { opacity: '0', transform: 'scale(0.94) translateY(30px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        stamp: {
          '0%': { opacity: '0', transform: 'scale(2.5) rotate(-15deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(-5deg)' },
        }
      }
    },
  },
  plugins: [],
}
