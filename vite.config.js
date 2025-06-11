import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/calculatrix-romana/',
  build: {
    outDir: 'dist'
  },
  test: {
    environment: 'jsdom'
  }
}) 