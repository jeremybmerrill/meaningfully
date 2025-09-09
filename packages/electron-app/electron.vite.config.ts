import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        external: ['utf-8-validate', 'bufferutil'],
        input: resolve(__dirname, 'src/main/index.ts')
      }
    },
    resolve: {
      alias: {
        '@meaningfully/core': resolve(__dirname, '../../packages/core')
      }
    }

  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        external: ['utf-8-validate', 'bufferutil'],
        input: resolve(__dirname, 'src/preload/index.ts')
      }
    }
  },
  renderer: {
    plugins: [svelte(), tailwindcss()],
    root: resolve(__dirname, 'src/renderer'),
    build: {
      rollupOptions: {
        input: 'src/renderer/index.html',
      }
    },
    resolve: {
      alias: {
        '@meaningfully/core': resolve(__dirname, '../../packages/core'),
      }
    }
  }
})
