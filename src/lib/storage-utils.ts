import type { Difficulty, UserProgress } from '@/types/game'
import { createEmptyGrid } from './game-utils'

export const DEBUG_MODE_KEY = 'sudoku:debugMode'
const ACTIVE_GAME_KEY = 'sudoku:activeGame'

export function saveProgress(progress: UserProgress): void {
  // Save to both the specific key and active game key
  const data = JSON.stringify(progress)
  localStorage.setItem(ACTIVE_GAME_KEY, data)
}

export function loadProgress(): UserProgress | null {
  // First try to load the active game
  const activeGame = localStorage.getItem(ACTIVE_GAME_KEY)
  if (activeGame) {
    try {
      return JSON.parse(activeGame) as UserProgress
    } catch {
      return null
    }
  }
  return null
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

// Clear active game progress
export function clearActiveGame(): void {
  localStorage.removeItem(ACTIVE_GAME_KEY)
}

export function createNewProgress(
  seed: string,
  difficulty: Difficulty,
  initialPuzzle?: {
    preFilledCells: { row: number; col: number; value: number }[]
  }
): UserProgress {
  // Clear any existing active game first
  clearActiveGame()

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

  const progress = {
    puzzleSeed: seed,
    difficulty,
    grid,
    lastUpdated: Date.now(),
  }

  // Save the new progress immediately
  saveProgress(progress)

  return progress
}

export function isDebugModeEnabled(): boolean {
  return localStorage.getItem(DEBUG_MODE_KEY) === 'true'
}

export function setDebugMode(enabled: boolean): void {
  localStorage.setItem(DEBUG_MODE_KEY, enabled.toString())
}
