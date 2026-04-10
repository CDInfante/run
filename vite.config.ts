import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
/** @author Harry Vasanth (harryvasanth.com) */
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: [
        'favicon-32x32.png',
        'favicon-16x16.png',
        'apple-touch-icon.png',
        'amenities.json',
        'ships-funchal.json',
        'trails-madeira.json',
      ],
      manifest: {
        name: 'Run - CDInfante',
        short_name: 'RunCDI',
        description: 'Community info for runners in Madeira & Porto Santo',
        theme_color: '#001e40',
        background_color: '#001e40',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/.*\.json$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'github-data-cache',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^\/.*\.json$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'local-data-cache',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern:
              /^https:\/\/api\.ipma\.pt\/open-data\/forecast\/warnings\/warnings_www\.json/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'ipma-warnings-cache',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 2 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/(api|air-quality-api)\.open-meteo\.com\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'open-meteo-cache',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/wttr\.in\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'wttr-backup-cache',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  // --- NEW BUILD CONFIGURATION FOR CHUNKING ---
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('leaflet') || id.includes('react-leaflet')) {
              return 'vendor-leaflet'
            }
            if (id.includes('framer-motion')) {
              return 'vendor-framer'
            }
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query'
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react'
            }
            return 'vendor-core' // All other dependencies
          }
        },
      },
    },
    // Slightly increase the warning limit since 500kb is quite strict for modern React apps
    chunkSizeWarningLimit: 600,
  },
})
