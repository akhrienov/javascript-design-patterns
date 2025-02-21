import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    mockReset: true,
    testTimeout: 10000,
    hookTimeout: 10000,
    watch: false,
    include: ['**/*.spec.js'],
    exclude: ['node_modules', 'dist'],
  },
});
