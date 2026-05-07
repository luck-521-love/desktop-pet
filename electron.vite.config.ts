import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/main',
      rollupOptions: {
        external: ['electron', 'active-win', 'mock-aws-s3', 'aws-sdk', 'nock']
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/preload'
    }
  },
  renderer: {
    plugins: [react()],
    publicDir: resolve('pets'),
    build: {
      outDir: 'out/renderer'
    },
    resolve: {
      alias: {
        '@': resolve('src/renderer')
      }
    }
  }
})
