import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — tiny, always needed
          react: ['react', 'react-dom', 'react-router-dom'],
          // Animation — large, loaded after paint
          motion: ['framer-motion'],
          // Charts — only used in BiorhythmTool, lazy-loaded
          charts: ['recharts'],
          // Icons — large tree, shared across many components
          icons: ['lucide-react'],
        },
      },
    },
  },
});
