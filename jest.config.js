module.exports = {
    preset: 'undefined',
    coverageDirectory: './coverage',
    testEnvironment: 'node',
    collectCoverageFrom: [
      'src/**/*.js',
      '!src/app.js',
      '!src/server.js',
      '!src/models/*.js',
      '!src/tests/**'
    ],
    setupFilesAfterEnv: ['./jest.setup.js'],
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    }
  };