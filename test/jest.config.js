const path = require('node:path')

module.exports = async () => {
  return {
    testMatch: [path.join(__dirname, '**/*.test.js')],
    testTimeout: 1000,
    rootDir: path.join(__dirname, '..'),
    collectCoverageFrom: ['src/**/*.js', '!src/obsidian.js'],
    coverageDirectory: 'coverage',
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 35,
        lines: 54,
        statements: 54,
      },
    },
  }
}
