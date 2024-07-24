import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import envCompatible from 'vite-plugin-env-compatible';
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    envCompatible(),
    nodePolyfills(),
    dts({
      include: ['./src/**/*.js', './src/**/*.jsx', './src/**/*.ts', './src/**/*.tsx'],
      exclude: ['./node_modules/**', './src/**/*.test.js', './src/**/*.test.jsx', './src/**/*DO-NOT-USE*'],
      outputDir: 'dist',
      insertTypesEntry: true
    }),
  ],
  define: {
    'process.env': process?.env,
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'BuddyLink',
      formats: ["cjs", "es"],
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: ['react'],
      output: {
        globals: {
          react: 'React'
        },
      },
    },
  },
  resolve: {
    alias: {
      src: "/src",
    },
  }
});