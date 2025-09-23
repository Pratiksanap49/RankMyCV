import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Enforce case-sensitive module resolution
    caseSensitive: true
  },
  server: {
    // Enforce case-sensitive routing during development
    fs: {
      caseSensitive: true
    }
  }
})
