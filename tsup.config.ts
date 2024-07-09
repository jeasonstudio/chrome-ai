import { defineConfig } from 'tsup';

export default defineConfig([
  {
    dts: true,
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    sourcemap: true,
  },
  {
    dts: true,
    entry: {
      polyfill: 'src/polyfill/index.ts',
    },
    format: ['cjs', 'esm', 'iife'],
    sourcemap: true,
  },
]);
