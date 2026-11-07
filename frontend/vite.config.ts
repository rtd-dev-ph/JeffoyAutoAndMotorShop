import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  // Set VITE_BASE (e.g. "/JeffoyAutoAndMotorShop/") for GitHub Pages project sites.
  base: process.env.VITE_BASE || '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    // Proxy API requests to the ASP.NET Core backend during development.
    proxy: {
      '/api': {
        target: 'http://localhost:5122',
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: 'http://localhost:5122',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
