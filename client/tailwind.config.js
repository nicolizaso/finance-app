/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // FONDO: Neutral Dark
        void: '#022c22',
        
        // TARJETAS: Zinc-900
        surface: '#18181b',
        
        // INTERACCIÓN: Zinc-800
        surfaceHighlight: '#27272a',
        
        // BORDES: Emerald-900
        border: '#064e3b',
        
        // ACCIÓN: Emerald-500
        primary: '#10b981',
        primaryHover: '#34d399',
        
        // TEXTOS & BRILLOS
        neon: '#6ee7b7', // Emerald-300
        textMain: '#ecfdf5', // Emerald-50
        textMuted: '#9ca3af', // Gray-400
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px -5px rgba(16, 185, 129, 0.3)',
        'card': '0 8px 30px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}