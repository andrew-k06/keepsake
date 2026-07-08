import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/keepsake/',
  plugins: [
    react(),
    tailwindcss(),
    // Installable app: Add-to-Home-Screen is the natural home for a product
    // that "lives on this device," and an installed PWA hardens iOS against
    // the 7-day IndexedDB eviction the storage.persist() call also guards.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Keepsake — A warm place for what matters',
        short_name: 'Keepsake',
        description:
          'A digital heirloom binder: your treasures, their stories in your voice, and your wishes — kept for the people you love.',
        theme_color: '#c2603d',
        background_color: '#faf5ec',
        display: 'standalone',
        start_url: '/keepsake/',
        scope: '/keepsake/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Bundled seed photos push chunks past the default 2MB precache limit.
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
    }),
  ],
})
