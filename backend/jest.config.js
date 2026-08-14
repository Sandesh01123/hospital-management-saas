module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  moduleNameMapper: {
    '^.*/lib/supabaseClient$': '<rootDir>/src/__tests__/__mocks__/supabaseClient.ts'
  },
  setupFiles: ['dotenv/config']
}
