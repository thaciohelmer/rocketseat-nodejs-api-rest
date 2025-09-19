import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'

export default defineConfig({
  test: {
    env: loadEnv('test', process.cwd(), ''),
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
