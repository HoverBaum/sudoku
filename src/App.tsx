import { useEffect, useState, useCallback } from 'react'
import { PuzzleSelector } from '@/components/PuzzleSelector'
import { SudokuGrid } from '@/components/SudokuGrid'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Toaster } from '@/components/ui/sonner'
import { PuzzleDebugger } from '@/components/PuzzleDebugger'
import { ThemeProvider } from '@/components/theme-provider'
import { ModeToggle } from '@/components/mode-toggle'
import { InstallPWA } from '@/components/install-pwa'
import type {
  CellCoord,
  Difficulty,
  SumSudokuPuzzle,
  UserProgress,
} from '@/types/game'
import { generatePuzzle } from '@/lib/game-utils'
import {
  loadProgress,
  saveProgress,
  createNewProgress,
  encodeGrid,
  decodeGrid,
  isDebugModeEnabled,
} from '@/lib/storage-utils'

function AppContent() {
  const [puzzle, setPuzzle] = useState<SumSudokuPuzzle | null>(null)
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [isDebugMode, setIsDebugMode] = useState(false)
  const showDebug = isDebugModeEnabled()
  const { toast } = useToast()

  // Load puzzle from URL parameters on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const seed = params.get('seed')
    const difficulty = params.get('difficulty') as Difficulty
    const state = params.get('state')

    if (seed && difficulty) {
      const newPuzzle = generatePuzzle(seed, difficulty)
      setPuzzle(newPuzzle)

      if (state) {
        const decodedProgress = decodeGrid(state)
        if (decodedProgress) {
          setProgress(decodedProgress)
          return
        }
      }

      // If no state in URL or invalid, try loading from localStorage
      const savedProgress = loadProgress()
      if (savedProgress) {
        setProgress(savedProgress)
      } else {
        setProgress(createNewProgress(seed, difficulty, newPuzzle))
      }
    }
  }, [])

  // Handle starting a new puzzle
  const handlePuzzleSelect = useCallback(
    (seed: string, difficulty: Difficulty) => {
      const newPuzzle = generatePuzzle(seed, difficulty)
      setPuzzle(newPuzzle)

      // Create fresh progress for the new puzzle
      setProgress(createNewProgress(seed, difficulty, newPuzzle))

      // Update URL
      const params = new URLSearchParams()
      params.set('seed', seed)
      params.set('difficulty', difficulty)
      window.history.pushState({}, '', `?${params.toString()}`)
    },
    []
  )

  // Handle cell updates
  const handleCellUpdate = useCallback(
    (coord: CellCoord, value?: number, notes?: number[]) => {
      if (!progress || !puzzle) return

      // Get current cell
      const currentCell = progress.grid[coord.row][coord.col]

      // Prevent modifying pre-filled cells
      if (currentCell.isPreFilled) return

      const newProgress: UserProgress = {
        ...progress,
        grid: progress.grid.map((row, r) =>
          row.map((cell, c) =>
            r === coord.row && c === coord.col
              ? { value, notes: notes || [] }
              : cell
          )
        ),
        lastUpdated: Date.now(),
      }

      setProgress(newProgress)
      saveProgress(newProgress)
    },
    [progress, puzzle]
  )

  // Handle sharing
  const handleShare = useCallback(() => {
    if (!puzzle || !progress) return

    const params = new URLSearchParams()
    params.set('seed', puzzle.seed)
    params.set('difficulty', puzzle.difficulty)
    params.set('state', encodeGrid(progress))

    const url = `${window.location.origin}${
      window.location.pathname
    }?${params.toString()}`
    navigator.clipboard.writeText(url)

    toast({
      title: 'Link Copied!',
      description: 'Share this link to let others try your puzzle progress.',
    })
  }, [puzzle, progress, toast])

  const handleToggleDebug = useCallback(() => {
    const newDebugState = !isDebugMode
    setIsDebugMode(newDebugState)
  }, [isDebugMode])

  if (!puzzle || !progress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <InstallPWA />
          <ModeToggle />
        </div>
        <PuzzleSelector onPuzzleSelect={handlePuzzleSelect} />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-background px-4">
      <div className="w-full max-w-3xl flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-2">
          <PuzzleSelector onPuzzleSelect={handlePuzzleSelect} />
          <Button variant="outline" onClick={handleShare}>
            Share Puzzle
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {showDebug && (
            <Button variant="ghost" onClick={handleToggleDebug}>
              {isDebugMode ? 'Hide Debug' : 'Debug Mode'}
            </Button>
          )}
          <InstallPWA />
          <ModeToggle />
        </div>
      </div>

      {isDebugMode && showDebug && <PuzzleDebugger puzzle={puzzle} />}

      <div className="flex-1 flex flex-col items-center justify-center -mt-8">
        <SudokuGrid
          puzzle={puzzle}
          userGrid={progress.grid}
          onCellUpdate={handleCellUpdate}
        />
      </div>

      <Toaster />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="sum-sudoku-theme">
      <AppContent />
    </ThemeProvider>
  )
}
