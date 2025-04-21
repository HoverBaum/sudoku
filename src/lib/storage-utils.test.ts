import { describe, test, expect, beforeEach } from 'vitest'
import {
  saveProgress,
  loadProgress,
  encodeGrid,
  decodeGrid,
} from './storage-utils'
import { createEmptyGrid } from './game-utils'
import type { UserProgress } from '@/types/game'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('storage utilities', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  test('saveProgress and loadProgress roundtrip', () => {
    const progress: UserProgress = {
      puzzleSeed: 'test123',
      difficulty: 'medium',
      grid: createEmptyGrid(),
      lastUpdated: Date.now(),
    }

    // Add some values to the grid
    progress.grid[0][0].value = 5
    progress.grid[1][1].notes = [1, 2, 3]

    saveProgress(progress)
    const loaded = loadProgress()

    expect(loaded).toEqual(progress)
  })

  test('loadProgress returns null for non-existent puzzle', () => {
    const loaded = loadProgress()
    expect(loaded).toBeNull()
  })

  test('encodeGrid and decodeGrid roundtrip', () => {
    const progress: UserProgress = {
      puzzleSeed: 'test123',
      difficulty: 'medium',
      grid: createEmptyGrid(),
      lastUpdated: Date.now(),
    }

    // Add some values and notes
    progress.grid[0][0].value = 5
    progress.grid[1][1].notes = [1, 2, 3]
    progress.grid[2][2].value = 9
    progress.grid[3][3].notes = [4, 5, 6]

    const encoded = encodeGrid(progress)
    expect(typeof encoded).toBe('string')

    const decoded = decodeGrid(encoded)
    expect(decoded).toEqual(progress)
  })

  test('decodeGrid handles invalid input', () => {
    const invalid = 'not-valid-base64'
    const result = decodeGrid(invalid)
    expect(result).toBeNull()
  })

  test('storage uses correct key format', () => {
    const progress: UserProgress = {
      puzzleSeed: 'test123',
      difficulty: 'hard',
      grid: createEmptyGrid(),
      lastUpdated: Date.now(),
    }

    saveProgress(progress)

    // Check that localStorage was called with the correct key format
    const key = `sumSudoku:progress:${progress.puzzleSeed}:${progress.difficulty}`
    expect(localStorageMock.getItem(key)).not.toBeNull()
  })
})
