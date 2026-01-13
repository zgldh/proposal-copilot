import { defineConfig } from 'electron-vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { resolve } from 'path'

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    plugins: [svelte()],
    resolve: {
      alias: {
        $lib: resolve(__dirname, 'src/renderer/src/lib'),
        $stores: resolve(__dirname, 'src/renderer/src/stores')
      }
    }
  }
})
