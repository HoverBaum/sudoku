import { describe, test, expect } from 'vitest'
import { optimizeCagePaths } from './path-utils'
import type { CageBoundary } from '@/types/game'

describe('path-utils', () => {
  test('should not modify paths that cannot be merged', () => {
    const cage: CageBoundary = {
      id: 'test',
      paths: ['M0,0 L10,0', 'M20,20 L30,20'],
    }

    const result = optimizeCagePaths(cage)
    expect(result.paths).toHaveLength(2)
    expect(result.paths).toEqual(cage.paths)
  })

  test('should merge two paths that share an endpoint', () => {
    const cage: CageBoundary = {
      id: 'test',
      paths: ['M0,0 L10,10', 'M10,10 L20,20'],
    }

    const result = optimizeCagePaths(cage)
    expect(result.paths).toHaveLength(1)
    expect(result.paths[0]).toBe('M0,0 L10,10 L20,20')
  })

  test('should merge multiple paths in sequence', () => {
    const cage: CageBoundary = {
      id: 'test',
      paths: ['M0,0 L10,10', 'M20,20 L30,30', 'M10,10 L20,20'],
    }

    const result = optimizeCagePaths(cage)
    expect(result.paths).toHaveLength(1)
    expect(result.paths[0]).toBe('M0,0 L10,10 L20,20 L30,30')
  })

  test('should handle paths with small floating point differences', () => {
    const cage: CageBoundary = {
      id: 'test',
      paths: ['M0,0 L10.0001,10', 'M10,10 L20,20'],
    }

    const result = optimizeCagePaths(cage)
    expect(result.paths).toHaveLength(1)
  })

  test('should preserve original path commands', () => {
    const cage: CageBoundary = {
      id: 'test',
      paths: [
        'M0,0 L10,10',
        'M10,10 L20,20',
        'M20,20 M30,30', // Path with multiple M commands
      ],
    }

    const result = optimizeCagePaths(cage)
    expect(result.paths.join(' ')).toContain('M')
    expect(result.paths.join(' ')).toContain('L')
  })

  test('should handle empty paths array', () => {
    const cage: CageBoundary = {
      id: 'test',
      paths: [],
    }

    const result = optimizeCagePaths(cage)
    expect(result.paths).toHaveLength(0)
  })

  test('should handle paths with invalid format', () => {
    const cage: CageBoundary = {
      id: 'test',
      paths: ['invalid', 'M0,0 L10,10', 'M10,10 L20,20'],
    }

    const result = optimizeCagePaths(cage)
    expect(result.paths).toBeDefined()
    // The valid paths should still be merged
    expect(result.paths).toContain('M0,0 L10,10 L20,20')
  })
})
