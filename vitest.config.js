import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      src: fileURLToPath(new URL('./src', import.meta.url)),
      data: fileURLToPath(new URL('./src/data', import.meta.url)),
      logic: fileURLToPath(new URL('./src/logic', import.meta.url)),
      stores: fileURLToPath(new URL('./src/stores', import.meta.url))
    }
  },
  test: { include: ['test/unit/**/*.test.js'], environment: 'node' }
})
