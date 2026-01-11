import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Agregamos logo.png a los assets importantes
      includeAssets: ['logo.png'], 
      manifest: {
        name: 'FinanzApp',      // <--- Sin S
        short_name: 'FinanzApp', // <--- Sin S
        description: 'Control financiero personal',
        theme_color: '#05040A',
        background_color: '#05040A',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'logo.png', // Usamos tu logo para todos los tamaños por ahora
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo.png', // Lo ideal a futuro es tener versiones resizeadas, pero esto funciona
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})