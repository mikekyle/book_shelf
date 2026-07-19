import { defineConfig } from 'vitest/config'

// Kept separate from vite.config.ts so the app build uses Vite 8 plugin types
// while tests use the Vite types bundled with Vitest.
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
