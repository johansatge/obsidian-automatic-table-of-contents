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
        functions: 40,
        lines: 55,
        statements: 55,
      },
    },
  }
}
