import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3003',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          mediapipe: ['@mediapipe/hands', '@mediapipe/camera_utils', '@mediapipe/drawing_utils']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['@mediapipe/hands', '@mediapipe/camera_utils', '@mediapipe/drawing_utils']
  }
});