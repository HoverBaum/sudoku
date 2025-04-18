import { useState, useCallback, KeyboardEvent } from 'react'
import { Card } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import { getCageColor } from '@/lib/color-utils'
import { useTheme } from '@/components/theme-provider'
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
  const [isNoteMode, setIsNoteMode] = useState(false)
  const [selectedCell, setSelectedCell] = useState<CellCoord | null>(null)
  const { theme } = useTheme()
  const isDarkMode =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

  // Create a color map for cages
  const cageColors = puzzle.cages.reduce((acc, cage, index) => {
    acc[cage.id!] = getCageColor(index, isDarkMode)
    return acc
  }, {} as Record<string, string>)

  const handleCellClick = useCallback((coord: CellCoord) => {
    setSelectedCell(coord)
  }, [])

  const handleNumberInput = useCallback(
    (num: number) => {
      if (!selectedCell) return

      if (isNoteMode) {
        const currentNotes =
          userGrid[selectedCell.row][selectedCell.col].notes || []
        const newNotes = currentNotes.includes(num)
          ? currentNotes.filter((n) => n !== num)
          : [...currentNotes, num].sort()
        onCellUpdate(selectedCell, undefined, newNotes)
      } else {
        onCellUpdate(
          selectedCell,
          userGrid[selectedCell.row][selectedCell.col].value === num
            ? undefined
            : num,
          []
        )
      }
    },
    [selectedCell, isNoteMode, userGrid, onCellUpdate]
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
    [selectedCell, handleCellClick, handleNumberInput]
  )

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

  return (
    <div
      className="flex flex-col items-center gap-4"
      role="grid"
      aria-label="Sudoku Grid"
    >
      <div
        className="grid grid-cols-9 gap-0 bg-muted p-1 rounded-lg"
        role="row"
        aria-label="Grid cells"
      >
        {Array(9)
          .fill(null)
          .map((_, row) => (
            <div key={row} role="row">
              {Array(9)
                .fill(null)
                .map((_, col) => {
                  const cell = userGrid[row][col]
                  const cage = getCage(row, col)
                  const borders = getCageBorders(row, col)
                  const isSelected =
                    selectedCell?.row === row && selectedCell?.col === col

                  return (
                    <Card
                      key={`${row}-${col}`}
                      className={cn(
                        'w-12 h-12 flex items-center justify-center relative cursor-pointer select-none',
                        'transition-all duration-200',
                        borders.top && 'border-t-2',
                        borders.right && 'border-r-2',
                        borders.bottom && 'border-b-2',
                        borders.left && 'border-l-2',
                        isSelected && 'bg-primary/20'
                      )}
                      style={{
                        backgroundColor: cage
                          ? cageColors[cage.id!]
                          : undefined,
                      }}
                      role="gridcell"
                      aria-label={`Cell ${row + 1},${col + 1}`}
                      aria-selected={isSelected}
                      tabIndex={0}
                      onClick={() => handleCellClick({ row, col })}
                      onKeyDown={(e) => handleKeyDown(e, { row, col })}
                    >
                      {cage?.cells[0].row === row &&
                        cage?.cells[0].col === col && (
                          <span
                            className="absolute top-0 left-0 text-xs text-muted-foreground"
                            aria-label={`Cage sum ${cage.sum}`}
                          >
                            {cage.sum}
                          </span>
                        )}

                      {cell.value ? (
                        <span
                          className="text-2xl font-medium"
                          aria-label={`Value ${cell.value}`}
                        >
                          {cell.value}
                        </span>
                      ) : (cell.notes || []).length > 0 ? (
                        <div
                          className="grid grid-cols-3 gap-0 p-1 text-xs text-muted-foreground"
                          role="list"
                          aria-label="Notes"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                            <div
                              key={n}
                              className="w-3 h-3 flex items-center justify-center"
                              role="listitem"
                            >
                              {(cell.notes || []).includes(n) ? n : ''}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </Card>
                  )
                })}
            </div>
          ))}
      </div>

      <div className="flex flex-col gap-2" role="group" aria-label="Controls">
        <ToggleGroup
          type="single"
          value={isNoteMode ? 'notes' : 'normal'}
          onValueChange={(val) => setIsNoteMode(val === 'notes')}
          className="mb-2"
          aria-label="Input mode"
        >
          <ToggleGroupItem value="normal" aria-label="Normal mode">
            Normal
          </ToggleGroupItem>
          <ToggleGroupItem value="notes" aria-label="Notes mode">
            Notes
          </ToggleGroupItem>
        </ToggleGroup>

        <div
          className="grid grid-cols-9 gap-1"
          role="toolbar"
          aria-label="Number input"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <Card
              key={num}
              className="w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors"
              role="button"
              tabIndex={0}
              aria-label={`Input number ${num}`}
              onClick={() => handleNumberInput(num)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleNumberInput(num)
                }
              }}
            >
              {num}
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
