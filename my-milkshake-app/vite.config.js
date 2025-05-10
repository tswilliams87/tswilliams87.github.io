import { defineConfig } from 'vite'

// Vite config for a plain HTML/JS project
export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    open: true
  }
})
