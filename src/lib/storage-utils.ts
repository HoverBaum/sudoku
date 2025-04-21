import type { Difficulty, UserProgress } from '@/types/game'
import { createEmptyGrid } from './game-utils'

const DEBUG_MODE_KEY = 'sudoku:debugMode'
const ACTIVE_GAME_KEY = 'sumSudoku:activeGame'

function getProgressKey(seed: string, difficulty: Difficulty): string {
  return `sumSudoku:progress:${seed}:${difficulty}`
}

export function saveProgress(progress: UserProgress): void {
  // Save to both the specific key and active game key
  const key = getProgressKey(progress.puzzleSeed, progress.difficulty)
  const data = JSON.stringify(progress)
  localStorage.setItem(key, data)
  localStorage.setItem(ACTIVE_GAME_KEY, data)
}

export function loadProgress(): UserProgress | null {
  // First try to load the active game
  const activeGame = localStorage.getItem(ACTIVE_GAME_KEY)
  if (activeGame) {
    try {
      return JSON.parse(activeGame) as UserProgress
    } catch {
      // If active game is invalid, continue to search other games
    }
  }

  // Look through all localStorage keys to find any matching our format
  let mostRecent: UserProgress | null = null
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('sumSudoku:progress:')) {
      try {
        const stored = localStorage.getItem(key)
        if (stored) {
          const progress = JSON.parse(stored) as UserProgress
          if (!mostRecent || progress.lastUpdated > mostRecent.lastUpdated) {
            mostRecent = progress
          }
        }
      } catch {
        continue
      }
    }
  }

  return mostRecent
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
