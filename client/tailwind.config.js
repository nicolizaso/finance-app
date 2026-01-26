/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base: Slate 900
        void: '#0f172a',
        
        // Cards: Slate 800
        surface: '#1e293b',
        
        // Interaction: Slate 700
        surfaceHighlight: '#334155',
        
        // Borders: Slate 700
        border: '#334155',
        
        // Primary: Indigo 500
        primary: '#6366f1',
        primaryHover: '#4f46e5',
        
        // Violet Palette for Gradients
        violet: {
          500: '#8b5cf6',
          600: '#7c3aed',
        },

        // Accents
        success: '#10b981', // Emerald 500
        error: '#f43f5e',   // Rose 500

        // Text
        textMain: '#f8fafc', // Slate 50
        textMuted: '#94a3b8', // Slate 400
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px -5px rgba(99, 102, 241, 0.3)', // Indigo glow
        'card': '0 8px 30px rgba(0, 0, 0, 0.3)',
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
