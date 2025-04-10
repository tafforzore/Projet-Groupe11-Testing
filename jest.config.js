module.exports = {
    preset: '@shelf/jest-mongodb',
    coverageDirectory: './coverage',
    testEnvironment: 'node',
    collectCoverageFrom: [
      'src/**/*.js',
      '!src/app.js',
      '!src/server.js',
      '!src/models/*.js',
      '!src/tests/**'
    ],
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    }
  };