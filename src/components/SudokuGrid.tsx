import { useCallback, KeyboardEvent } from 'react'
import { useTheme } from '@/components/theme-provider'
import { getCageColor } from '@/lib/color-utils'
import { useSudokuControls } from '@/hooks/use-sudoku-controls'
import { SudokuCell } from './SudokuCell'
import { NumberControls } from './NumberControls'
import type { SumSudokuPuzzle, UserGrid, CellCoord } from '@/types/game'

type SudokuGridProps = {
  puzzle: SumSudokuPuzzle
  userGrid: UserGrid
  onCellUpdate: (coord: CellCoord, value?: number, notes?: number[]) => void
}

export function SudokuGrid({
  puzzle,
  userGrid,
  onCellUpdate,
}: SudokuGridProps) {
  const { theme } = useTheme()
  const isDarkMode =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

  const {
    isNoteMode,
    setIsNoteMode,
    selectedCell,
    setSelectedCell,
    handleCellClick,
    handleNumberInput,
  } = useSudokuControls(userGrid, onCellUpdate)

  // Create a color map for cages
  const cageColors = puzzle.cages.reduce((acc, cage, index) => {
    acc[cage.id!] = getCageColor(index, isDarkMode)
    return acc
  }, {} as Record<string, string>)

  const getCage = useCallback(
    (row: number, col: number) => {
      return puzzle.cages.find((cage) =>
        cage.cells.some((cell) => cell.row === row && cell.col === col)
      )
    },
    [puzzle.cages]
  )

  const getCageBorders = useCallback(
    (row: number, col: number) => {
      const cage = getCage(row, col)
      if (!cage) return { top: true, right: true, bottom: true, left: true }

      return {
        top: !cage.cells.some((c) => c.row === row - 1 && c.col === col),
        right: !cage.cells.some((c) => c.row === row && c.col === col + 1),
        bottom: !cage.cells.some((c) => c.row === row + 1 && c.col === col),
        left: !cage.cells.some((c) => c.row === row && c.col === col - 1),
      }
    },
    [getCage]
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>, coord: CellCoord) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleCellClick(coord)
        return
      }

      const num = parseInt(e.key)
      if (!isNaN(num) && num >= 1 && num <= 9) {
        e.preventDefault()
        handleCellClick(coord)
        handleNumberInput(num)
      }

      // Arrow key navigation
      if (selectedCell) {
        let newRow = selectedCell.row
        let newCol = selectedCell.col

        switch (e.key) {
          case 'ArrowUp':
            newRow = Math.max(0, newRow - 1)
            break
          case 'ArrowDown':
            newRow = Math.min(8, newRow + 1)
            break
          case 'ArrowLeft':
            newCol = Math.max(0, newCol - 1)
            break
          case 'ArrowRight':
            newCol = Math.min(8, newCol + 1)
            break
          default:
            return
        }

        e.preventDefault()
        setSelectedCell({ row: newRow, col: newCol })
      }
    },
    [selectedCell, handleCellClick, handleNumberInput, setSelectedCell]
  )

  return (
    <div
      className="flex flex-col items-center gap-4"
      role="grid"
      aria-label="Sudoku Grid"
    >
      <div
        className="grid grid-cols-3 gap-2 bg-muted rounded-lg p-4"
        role="row"
        aria-label="Grid cells"
      >
        {Array(3)
          .fill(null)
          .map((_, gridRow) => (
            <div key={`row-${gridRow}`} className="contents">
              {Array(3)
                .fill(null)
                .map((_, gridCol) => (
                  <div
                    key={`grid-${gridRow}-${gridCol}`}
                    className="grid grid-cols-3 gap-1 p-1 bg-background/50 rounded"
                  >
                    {Array(3)
                      .fill(null)
                      .map((_, cellRow) => (
                        <div key={`subrow-${cellRow}`} className="contents">
                          {Array(3)
                            .fill(null)
                            .map((_, cellCol) => {
                              const row = gridRow * 3 + cellRow
                              const col = gridCol * 3 + cellCol
                              const cell = userGrid[row][col]
                              const cage = getCage(row, col)
                              const borders = getCageBorders(row, col)
                              const isSelected =
                                selectedCell?.row === row &&
                                selectedCell?.col === col

                              return (
                                <SudokuCell
                                  key={`${row}-${col}`}
                                  cell={cell}
                                  coord={{ row, col }}
                                  cage={cage}
                                  isSelected={isSelected}
                                  cageColor={
                                    cage ? cageColors[cage.id!] : undefined
                                  }
                                  borders={borders}
                                  showCageSum={
                                    cage?.cells[0].row === row &&
                                    cage?.cells[0].col === col
                                  }
                                  onClick={handleCellClick}
                                  onKeyDown={handleKeyDown}
                                />
                              )
                            })}
                        </div>
                      ))}
                  </div>
                ))}
            </div>
          ))}
      </div>

      <NumberControls
        isNoteMode={isNoteMode}
        onNoteModeChange={setIsNoteMode}
        onNumberInput={handleNumberInput}
      />
    </div>
  )
}
