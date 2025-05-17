import { defineConfig } from 'vite';

// Vite config for multi-page HTML/JS project
export default defineConfig({
  base: '/',                 // base path for production
  root: 'src',               // source folder for entry HTML and JS
  publicDir: '../public',    // public assets folder
  build: {
    outDir: '../dist',       // output directory for built files
    emptyOutDir: true,       // clean output dir before build
    rollupOptions: {
      input: {
        main: 'src/index.html',
        createProfile: 'src/create-profile.html',
        carousel: 'src/carousel.html',
        home: 'src/home.html',
        profile: 'src/profile.html',
        editProfile: 'src/edit-profile.html',
        styles: 'src/styles.css',
        signin: 'src/signin.html',
        confirmProfile: 'src/confirm-profile.html',
        changePassword: 'src/change-password.html',
        forgotPassword: 'src/forgot-password.html'
      },
    },
  },
  server: {
    port: 3000,              // dev server port
    open: true               // open in browser on start
  }
});
