/** @author Harry Vasanth (harryvasanth.com) */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      includeAssets: [
        "favicon-32x32.png",
        "favicon-16x16.png",
        "apple-touch-icon.png",
        "amenities.json",
        "ships-funchal.json",
        "trails-madeira.json",
      ],
      manifest: {
        name: "Run - CDInfante",
        short_name: "RunCDI",
        description: "Community info for runners in Madeira & Porto Santo",
        theme_color: "#001e40",
        background_color: "#001e40",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          // 1. GitHub Raw Data (Ships, Trails, Amenities)
          {
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/.*\.json$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "github-data-cache",
              networkTimeoutSeconds: 4, // Fallback to cache after 4 seconds
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // 2. Local Data Fallback (If GitHub is blocked)
          {
            urlPattern: /^\/.*\.json$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "local-data-cache",
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // 3. IPMA Warnings
          {
            urlPattern:
              /^https:\/\/api\.ipma\.pt\/open-data\/forecast\/warnings\/warnings_www\.json/,
            handler: "NetworkFirst",
            options: {
              cacheName: "ipma-warnings-cache",
              networkTimeoutSeconds: 4, // IPMA can be slow, cut it off at 4s
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 2, // 2 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // 4. Open-Meteo (Weather & Air Quality)
          {
            urlPattern: /^https:\/\/(api|air-quality-api)\.open-meteo\.com\/.*/,
            handler: "NetworkFirst",
            options: {
              cacheName: "open-meteo-cache",
              networkTimeoutSeconds: 4,
              expiration: {
                maxEntries: 30, // Higher entries since we fetch multiple locations
                maxAgeSeconds: 60 * 60, // 1 hour
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // 5. Wttr.in (Backup Weather Service)
          {
            urlPattern: /^https:\/\/wttr\.in\/.*/,
            handler: "NetworkFirst",
            options: {
              cacheName: "wttr-backup-cache",
              networkTimeoutSeconds: 4,
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
});
