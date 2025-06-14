module.exports = {
  testEnvironment: 'node',
  coverageDirectory: './coverage',
  testTimeout: 30000,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/app.js',
    '!src/server.js',
    '!src/models/*.js',
    '!src/tests/**'
  ],
  testMatch: ['**/src/__tests__/**/*.test.js'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/e2e/',
    '\\.spec\\.ts$', // ignore les fichiers Playwright par convention
  ],
};
