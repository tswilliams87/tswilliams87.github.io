import { defineConfig } from 'vite'

// Vite config for a plain HTML/JS project
export default defineConfig({
  base: '/',
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './index.html',
        createProfile: './create-profile.html',
        carousel: './carousel.html',
        home: './home.html',
        // Add other HTML files as needed
      },
  },
  server: {
    port: 3000,
    open: true
  }

}
})



