import type { UserProgress, Difficulty } from '@/types/game'
import { createEmptyGrid } from './game-utils'

const STORAGE_PREFIX = 'sumSudoku:progress:'

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
  difficulty: Difficulty
): UserProgress {
  return {
    puzzleSeed: seed,
    difficulty,
    grid: createEmptyGrid(),
    lastUpdated: Date.now(),
  }
}
