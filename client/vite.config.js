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
      workbox: {
        maximumFileSizeToCacheInBytes: 5000000,
      },
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
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
      }
    })
  ],
})