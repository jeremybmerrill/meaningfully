import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        external: ['utf-8-validate', 'bufferutil']
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        external: ['utf-8-validate', 'bufferutil']
      }
    }
  },
  renderer: {
    plugins: [svelte(), tailwindcss()],
    server: {
      fs: {
        allow: [
          resolve(__dirname),
          resolve(__dirname, '../meaningfully-ui') // allow serving fonts in dev mode
        ]
      }
    }
  }
})