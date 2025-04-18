import '@testing-library/jest-dom/vitest'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Extend Vitest's expect with Testing Library's matchers
expect.extend({})

// Run cleanup after each test case
afterEach(() => {
  cleanup()
})
