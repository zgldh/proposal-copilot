import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron/simple';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        // Entry point for the Main Process (Backend)
        entry: path.join(__dirname, 'src/main/main.ts'),
        vite: {
          build: {
            // Output directory for main process
            outDir: path.join(__dirname, 'dist-electron/main'),
            rollupOptions: {
              // Ensure Node built-ins are not bundled
              external: ['electron']
            }
          }
        }
      },
      preload: {
        // Entry point for the Preload Script
        input: path.join(__dirname, 'src/preload/index.ts'),
        vite: {
          build: {
            outDir: path.join(__dirname, 'dist-electron/preload'),
            rollupOptions: {
              external: ['electron']
            }
          }
        }
      },
    }),
  ],
  // Renderer configuration
  root: 'src/renderer',
  base: './', // Ensure relative paths for Electron loading
  build: {
    outDir: path.join(__dirname, 'dist-electron/renderer'),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
});
