import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/shop/visual-search/page.tsx',
    'app/admin/upload/page.tsx',
    'lib/actions/visual-search.ts',
    'lib/actions/upload-product.ts'
  ]
}

export default createJestConfig(config)
