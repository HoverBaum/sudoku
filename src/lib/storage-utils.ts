import type { Difficulty, UserProgress } from '@/types/game'
import { createEmptyGrid } from './game-utils'

const STORAGE_PREFIX = 'sumSudoku:progress:'
const DEBUG_MODE_KEY = 'sumSudoku:debugMode'

export function saveProgress(progress: UserProgress): void {
  const key = `${STORAGE_PREFIX}${progress.puzzleSeed}:${progress.difficulty}`
  localStorage.setItem(key, JSON.stringify(progress))
}

export function loadProgress(
  seed: string,
  difficulty: Difficulty
): UserProgress | null {
  const key = `${STORAGE_PREFIX}${seed}:${difficulty}`
  const stored = localStorage.getItem(key)

  if (!stored) return null

  try {
    return JSON.parse(stored) as UserProgress
  } catch {
    return null
  }
}

// For URL sharing
export function encodeGrid(progress: UserProgress): string {
  // Simple base64 encoding for now - can be optimized later
  return btoa(JSON.stringify(progress))
}

export function decodeGrid(encoded: string): UserProgress | null {
  try {
    return JSON.parse(atob(encoded)) as UserProgress
  } catch {
    return null
  }
}

export function createNewProgress(
  seed: string,
  difficulty: Difficulty,
  initialPuzzle?: {
    preFilledCells: { row: number; col: number; value: number }[]
  }
): UserProgress {
  const grid = createEmptyGrid()

  // Initialize pre-filled cells if provided
  if (initialPuzzle?.preFilledCells) {
    for (const cell of initialPuzzle.preFilledCells) {
      grid[cell.row][cell.col] = {
        value: cell.value,
        notes: [],
        isPreFilled: true,
      }
    }
  }

  return {
    puzzleSeed: seed,
    difficulty,
    grid,
    lastUpdated: Date.now(),
  }
}

export function isDebugModeEnabled(): boolean {
  return localStorage.getItem(DEBUG_MODE_KEY) === 'true'
}

export function setDebugMode(enabled: boolean): void {
  localStorage.setItem(DEBUG_MODE_KEY, enabled.toString())
}
