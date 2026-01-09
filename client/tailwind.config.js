/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // FONDO: Un violeta tan oscuro que parece negro, para contraste infinito.
        void: '#06030c',
        
        // TARJETAS: Violeta profundo, ligeramente desaturado para no cansar la vista.
        surface: '#110a1f',
        
        // INTERACCIÓN: Un tono más claro para inputs y hovers.
        surfaceHighlight: '#1d1233',
        
        // BORDES: Sutiles, para separar sin líneas duras.
        border: '#2e1a4f',
        
        // ACCIÓN: El color principal vibrante.
        primary: '#7c3aed', // Violet-600
        primaryHover: '#6d28d9', // Violet-700
        
        // TEXTOS & BRILLOS
        neon: '#d8b4fe', // Violet-300
        textMain: '#f3e8ff', // Violet-100
        textMuted: '#a78bfa', // Violet-400
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px -5px rgba(124, 58, 237, 0.3)',
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