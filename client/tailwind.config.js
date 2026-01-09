/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Monocromática Violeta Oscuro
        void: '#05040A',       // Fondo Absoluto
        surface: '#110E1B',    // Tarjetas Bento
        surfaceHighlight: '#1A1626', // Hover
        border: '#2E2442',     // Bordes sutiles
        primary: '#7C3AED',    // Violeta Vibrante (Botones)
        primaryDark: '#5B21B6',
        neon: '#D8B4FE',       // Textos destacados/Glow
        textMain: '#E9D5FF',   // Texto principal
        textMuted: '#9CA3AF',  // Texto secundario
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' }
        }
      }
    },
  },
  plugins: [],
}