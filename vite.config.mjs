import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: 'src/enhance.jsx',
      output: {
        entryFileNames: 'enhance.js',
        chunkFileNames: 'enhance-[name].js',
        assetFileNames: 'enhance-[name][extname]',
      },
    },
  },
});
