import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Rendered DOM regression config (Slice 4E.2) — intentionally narrow. It exists ONLY to run the
// focused React Testing Library specs under src/ (currently the Owner Meaning Capture composer).
// `include` is scoped to src/**/*.test.{js,jsx} so vitest never picks up the existing node
// guard/route tests in scripts/ (those are standalone `node` scripts that call process.exit).
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.js'],
    include: ['src/**/*.test.{js,jsx}'],
    css: false,
  },
})
