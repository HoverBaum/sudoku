import { useCallback, KeyboardEvent, useMemo } from 'react'
import { getCageColor } from '@/lib/color-utils'
import { useSudokuControls } from '@/hooks/use-sudoku-controls'
import { useCellPositions } from '@/hooks/use-cell-positions'
import { useDarkMode } from '@/hooks/use-dark-mode'
import { SudokuCell } from './SudokuCell'
import { NumberControls } from './NumberControls'
import type { SumSudokuPuzzle, UserGrid, CellCoord } from '@/types/game'
import { useCagePaths } from '@/hooks/useCagePaths'

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
  const isDarkMode = useDarkMode()

  const {
    isNoteMode,
    setIsNoteMode,
    selectedCell,
    setSelectedCell,
    handleCellClick,
    handleNumberInput,
  } = useSudokuControls(userGrid, onCellUpdate)

  const { positions, registerCell } = useCellPositions()
  const cageBoundaries = useCagePaths(puzzle, positions)
  console.log(cageBoundaries)

  const memoizedPuzzle = useMemo(() => puzzle, [puzzle])

  const getCage = useCallback(
    (row: number, col: number) => {
      return memoizedPuzzle.cages.find((cage) =>
        cage.cells.some((cell) => cell.row === row && cell.col === col)
      )
    },
    [memoizedPuzzle]
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
    <div className="flex flex-col gap-4">
      <div className="relative w-fit" data-sudoku-grid>
        <div
          className="relative grid grid-cols-3 gap-2 bg-muted rounded-lg p-4"
          role="row"
          aria-label="Grid cells"
          data-grid-container
        >
          <svg
            className="absolute inset-0 pointer-events-none z-10"
            style={{ overflow: 'visible' }}
            width="100%"
            height="100%"
          >
            {cageBoundaries.map((boundary) => (
              <g key={boundary.id}>
                <path
                  d={boundary.paths.join(' ')}
                  className="stroke-foreground stroke-2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="4 3"
                  fill="none"
                />
              </g>
            ))}
          </svg>
          {Array(3)
            .fill(null)
            .map((_, gridRow) => (
              <div key={`row-${gridRow}`} className="contents">
                {Array(3)
                  .fill(null)
                  .map((_, gridCol) => (
                    <div
                      key={`grid-${gridRow}-${gridCol}`}
                      className="grid grid-cols-3 gap-2 p-1"
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
                                      cage
                                        ? getCageColor(
                                            puzzle.cages.indexOf(cage),
                                            isDarkMode
                                          )
                                        : undefined
                                    }
                                    borders={{
                                      top: false,
                                      right: false,
                                      bottom: false,
                                      left: false,
                                    }}
                                    showCageSum={
                                      cage?.cells[0].row === row &&
                                      cage?.cells[0].col === col
                                    }
                                    onClick={handleCellClick}
                                    onKeyDown={handleKeyDown}
                                    registerCell={registerCell}
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
      </div>

      <NumberControls
        isNoteMode={isNoteMode}
        onNoteModeChange={setIsNoteMode}
        onNumberInput={handleNumberInput}
      />
    </div>
  )
}
