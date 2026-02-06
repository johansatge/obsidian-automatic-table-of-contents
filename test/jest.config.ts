import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Config } from 'jest'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const config: Config = {
  testMatch: [path.join(__dirname, '**/*.test.ts')],
  testTimeout: 1000,
  rootDir: path.join(__dirname, '..'),
  collectCoverageFrom: ['src/**/*.ts', '!src/obsidian.ts'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 76,
      functions: 35,
      lines: 54,
      statements: 54,
    },
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
}

export default config
