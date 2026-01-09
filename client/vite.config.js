import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'FinanzApps',
        short_name: 'FinanzApps',
        description: 'Control financiero personal',
        theme_color: '#05040A',
        background_color: '#05040A',
        display: 'standalone', // Esto oculta la barra de URL del navegador
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png', // Vite generará esto si tienes el logo en public, o usa el default
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})