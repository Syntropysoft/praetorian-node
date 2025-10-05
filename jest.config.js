module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.config.*',
    '!src/cli/templates/**',
    '!examples/**',
    '!tests/**',
    '!**/*.config.*',
    '!.stryker-tmp/**',
    '!reports/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'json', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 10000,
  verbose: true,
  clearMocks: true,
  restoreMocks: true
}; 