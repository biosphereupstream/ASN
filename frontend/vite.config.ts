import { sveltekit } from '@sveltejs/kit/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  build: { target: 'es2022' },
  server: {
    proxy: {
      // The coverage checker fetches same-origin /api/*; in dev those go to the
      // ElysiaJS backend (PRD §10). Path is preserved — backend routes live under /api.
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: false
      }
    }
  }
})
