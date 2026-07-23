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
    chunkSizeWarningLimit: 600,
    reportCompressedSize: false, // faster builds
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core React runtime — always needed, cache forever. `scheduler` is react-dom's
          // internal dependency; without it here it falls into `vendor`, which creates a
          // vendor <-> react-core chunk cycle (Rollup warns "Circular chunk") whose load
          // order can leave `React` undefined at first access in whichever chunk runs first.
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/scheduler/')) return 'react-core';
          if (id.includes('node_modules/react-router-dom') || id.includes('node_modules/react-router/')) return 'router';
          // Animation — large but shared across many pages
          if (id.includes('node_modules/framer-motion')) return 'motion';
          // Charts — only used by BiorhythmTool, load on demand
          if (id.includes('node_modules/recharts') || id.includes('node_modules/victory') || id.includes('node_modules/d3-')) return 'charts';
          // Icons — lucide ships individual files, keep together
          if (id.includes('node_modules/lucide-react')) return 'icons';
          // Everything else in node_modules → vendor
          if (id.includes('node_modules/')) return 'vendor';
        },
        // Stable filenames for better CDN caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
});
