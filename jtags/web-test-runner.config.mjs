import { playwrightLauncher } from '@web/test-runner-playwright';

export default {
  files: 'src/test/js/**/*.test.js',
  nodeResolve: true,
  browsers: [
    playwrightLauncher({ product: 'chromium' }),
  ],
  testFramework: {
    config: {
      ui: 'bdd',
      timeout: 5000,
    },
  },
  coverageConfig: {
    include: ['src/main/resources/META-INF/resources/js/jtags/**/*.js'],
    exclude: ['**/node_modules/**', '**/test/**'],
    threshold: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
};