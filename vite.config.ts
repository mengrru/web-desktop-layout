import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/web-desktop-layout/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    outDir: 'dist'
  }
});
