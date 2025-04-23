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
import pkg from '../package.json'
import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
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
import { Separator } from './components/ui/separator'

function AppContent() {
  const [puzzle, setPuzzle] = useState<SumSudokuPuzzle | null>(null)
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [isDebugMode, setIsDebugMode] = useState(false)
  const showDebug = isDebugModeEnabled()
  const { toast } = useToast()

  // Load puzzle from URL parameters or localStorage on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const seed = params.get('seed')
    const difficulty = params.get('difficulty') as Difficulty
    const state = params.get('state')

    // First try to load saved progress from localStorage
    const savedProgress = loadProgress()

    if (savedProgress) {
      // If we have saved progress, load its corresponding puzzle
      const savedPuzzle = generatePuzzle(
        savedProgress.puzzleSeed,
        savedProgress.difficulty
      )
      setPuzzle(savedPuzzle)
      setProgress(savedProgress)
      return
    }

    // If no saved progress, then handle URL parameters
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

      // Create new progress if we have puzzle parameters but no state
      setProgress(createNewProgress(seed, difficulty, newPuzzle))
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

  // Handle resetting the current puzzle
  const handleReset = useCallback(() => {
    if (!puzzle) return

    // Create fresh progress for the current puzzle without changing the seed or difficulty
    const newProgress = createNewProgress(
      puzzle.seed,
      puzzle.difficulty,
      puzzle
    )
    setProgress(newProgress)

    toast({
      title: 'Puzzle Reset',
      description: 'The puzzle has been reset to its initial state.',
    })
  }, [puzzle, toast])

  // Handle cell updates
  const handleCellUpdate = useCallback(
    (coord: CellCoord, value?: number, notes?: number[]) => {
      if (!progress || !puzzle) return

      // Get current cell
      const currentCell = progress.grid[coord.row][coord.col]

      // Prevent modifying pre-filled cells
      if (currentCell.isPreFilled) return

      const newGrid = [...progress.grid]

      // If a value is being placed (not just notes), remove that number from notes in affected cells
      if (value !== undefined) {
        // Remove from same row
        for (let col = 0; col < 9; col++) {
          if (col !== coord.col && newGrid[coord.row][col].notes) {
            newGrid[coord.row][col].notes = newGrid[coord.row][
              col
            ].notes?.filter((n) => n !== value)
          }
        }

        // Remove from same column
        for (let row = 0; row < 9; row++) {
          if (row !== coord.row && newGrid[row][coord.col].notes) {
            newGrid[row][coord.col].notes = newGrid[row][
              coord.col
            ].notes?.filter((n) => n !== value)
          }
        }

        // Remove from same 3x3 box
        const boxRow = Math.floor(coord.row / 3) * 3
        const boxCol = Math.floor(coord.col / 3) * 3
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            const row = boxRow + i
            const col = boxCol + j
            if (
              (row !== coord.row || col !== coord.col) &&
              newGrid[row][col].notes
            ) {
              newGrid[row][col].notes = newGrid[row][col].notes?.filter(
                (n) => n !== value
              )
            }
          }
        }

        // Remove from same cage
        const cage = puzzle.cages.find((cage) =>
          cage.cells.some(
            (cell) => cell.row === coord.row && cell.col === coord.col
          )
        )
        if (cage) {
          // Calculate remaining space in cage
          const cageValues = cage.cells.reduce((acc, cell) => {
            const cellValue = newGrid[cell.row][cell.col].value
            return cellValue ? acc + cellValue : acc
          }, 0)
          const remainingSum = cage.sum - cageValues

          // Remove notes that would exceed the remaining sum
          cage.cells.forEach((cell) => {
            if (
              (cell.row !== coord.row || cell.col !== coord.col) &&
              newGrid[cell.row][cell.col].notes
            ) {
              newGrid[cell.row][cell.col].notes = newGrid[cell.row][
                cell.col
              ].notes?.filter((n) => n <= remainingSum)
            }
          })
        }
      }

      // Update the target cell with new value/notes
      newGrid[coord.row][coord.col] = { value, notes: notes || [] }

      const newProgress: UserProgress = {
        ...progress,
        grid: newGrid,
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

  return (
    <div className="min-h-screen flex bg-background">
      <SidebarProvider defaultOpen={false}>
        <Sidebar>
          <SidebarHeader>
            <h2 className="text-lg font-semibold px-4">Sum Sudoku</h2>
          </SidebarHeader>
          <SidebarContent>
            <div className="px-4 space-y-4 w-full">
              <PuzzleSelector onPuzzleSelect={handlePuzzleSelect} />
              <Button
                variant="outline"
                onClick={handleShare}
                className="w-full"
                disabled={!progress || !puzzle}
              >
                Share Puzzle
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                className="w-full"
                disabled={!progress || !puzzle}
              >
                Reset Puzzle
              </Button>
            </div>
          </SidebarContent>
          <SidebarFooter className="px-4">
            <Separator />
            <SidebarGroup>
              <SidebarGroupLabel className="pl-0">Game Info</SidebarGroupLabel>
              <SidebarGroupContent className="text-muted-foreground">
                <SidebarMenu>
                  <SidebarMenuItem>Seed: {puzzle?.seed}</SidebarMenuItem>
                  <SidebarMenuItem>
                    Difficulty: {puzzle?.difficulty}
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Version {pkg.version}
              </p>
              <div className="flex gap-2">
                <InstallPWA />
                <ModeToggle />
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        {!puzzle || !progress ? (
          <main className="flex-1 flex items-center justify-center relative">
            <div className="absolute top-4 left-4 z-50">
              <SidebarTrigger />
            </div>
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <InstallPWA />
            </div>
            <div className="w-fit">
              <PuzzleSelector onPuzzleSelect={handlePuzzleSelect} />
            </div>
          </main>
        ) : (
          <main className="flex-1 flex flex-col relative">
            <div className="p-4 flex items-center z-50 absolute top-0 left-0">
              <SidebarTrigger />
              {showDebug && (
                <Button
                  variant="ghost"
                  onClick={handleToggleDebug}
                  className="ml-4"
                >
                  {isDebugMode ? 'Hide Debug' : 'Debug Mode'}
                </Button>
              )}
            </div>

            {isDebugMode && showDebug && (
              <div className="grid place-items-center py-12">
                <PuzzleDebugger puzzle={puzzle} />
              </div>
            )}

            <div className="flex-1 grid place-items-center">
              <SudokuGrid
                puzzle={puzzle}
                userGrid={progress.grid}
                onCellUpdate={handleCellUpdate}
              />
            </div>
          </main>
        )}

        <Toaster />
      </SidebarProvider>
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
