import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import { gasEntrypoints } from './build/vite-plugin-gas-entrypoints';

export default defineConfig({
  plugins: [
    gasEntrypoints(['doGet', 'onOpen', 'showSidebar', 'getRuntimeInfo', 'ping', 'logRuntimeInfo']),
  ],
  resolve: {
    alias: {
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    target: 'es2020',
    minify: false,
    sourcemap: false,
    copyPublicDir: false,
    lib: {
      entry: 'src/server/index.ts',
      name: 'AppsScriptBundle',
      formats: ['iife'],
      fileName: () => 'Code.js',
    },
  },
});
