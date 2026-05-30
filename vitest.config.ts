import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  test: {
    globals: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './apps/cli'),
      data: resolve(__dirname, './apps/cli/data/index.ts'),
    },
  },
})
