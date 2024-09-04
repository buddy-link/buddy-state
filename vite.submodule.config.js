import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import envCompatible from 'vite-plugin-env-compatible';
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// Only change in this should be the dts_outputDir
export default defineConfig({
  plugins: [
    react(),
    envCompatible(),
    nodePolyfills(),
    dts({
      include: ['./src/**/*.js', './src/**/*.jsx', './src/**/*.ts', './src/**/*.tsx'],
      exclude: ['./node_modules/**', './src/**/*.test.js', './src/**/*.test.jsx', './src/**/*DO-NOT-USE*'],
      outputDir: resolve(__dirname, '../../dist/frontend/buddy-state')
    }),
  ],
  define: {
    'process.env': process?.env,
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'buddy-state',
      formats: ["cjs", "es"],
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        },
        preserveModules: true,
      },
    },
    target: 'node18'
  },
  resolve: {
    alias: {
      src: "/src",
      'buddy-state': '../../dist/frontend/buddy-state/cjs'
    },
  }
});
