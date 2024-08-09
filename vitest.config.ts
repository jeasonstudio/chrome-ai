import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      // you can include other reporters, but 'json-summary' is required, json is recommended
      reporter: ['text', 'json-summary', 'json'],
      // If you want a coverage reports even if your tests are failing, include the reportOnFailure option
      reportOnFailure: true,
      include: ['src/**/*.ts'],
      exclude: ['src/polyfill/*', 'src/global.d.ts'], // TODO@jeasonstudio: finish the polyfill tests
    },
  },
});
