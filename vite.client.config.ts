import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import { gasInlineHtml } from './build/vite-plugin-gas-html';

export default defineConfig({
  root: 'src/client',
  publicDir: '../../public',
  plugins: [gasInlineHtml()],
  resolve: {
    alias: {
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
    },
  },
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
    target: 'es2020',
    minify: false,
    modulePreload: false,
  },
});
