import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Windows: prevents EPERM realpath errors caused by antivirus file locks
    preserveSymlinks: true,
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom') || id.includes('axios')) {
              return 'vendor';
            }
            if (id.includes('react-icons')) {
              return 'icons';
            }
            if (id.includes('react-toastify')) {
              return 'toastify';
            }
            return 'vendor-libs';
          }
          if (id.includes('pages/admin') || id.includes('pages\\admin')) {
            return 'admin-suite';
          }
          if (id.includes('utils/tourImages') || id.includes('utils\\tourImages') || id.includes('api/realTourDataApi') || id.includes('api\\realTourDataApi')) {
            return 'tour-data';
          }
          if (id.includes('utils/codeGraphEngine') || id.includes('utils\\codeGraphEngine') || id.includes('utils/context7Engine') || id.includes('utils\\context7Engine')) {
            return 'agent-engines';
          }
        },
      },
    },
  },
});
