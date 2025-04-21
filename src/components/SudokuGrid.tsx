import { useCallback, KeyboardEvent, useMemo } from 'react'
import { useSudokuControls } from '@/hooks/use-sudoku-controls'
import { useCellPositions } from '@/hooks/use-cell-positions'
import { useDarkMode } from '@/hooks/use-dark-mode'
import { SudokuCell } from './SudokuCell'
import { NumberControls } from './NumberControls'
import { PuzzleToolbar } from './PuzzleToolbar'
import { Separator } from './ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { validateGrid } from '@/lib/game-utils'
import type { SumSudokuPuzzle, UserGrid, CellCoord, Cage } from '@/types/game'
import { useCagePaths } from '@/hooks/useCagePaths'

type SudokuSubGridProps = {
  gridRow: number
  gridCol: number
  userGrid: UserGrid
  puzzle: SumSudokuPuzzle
  selectedCell: CellCoord | null
  isDarkMode: boolean
  getCage: (row: number, col: number) => Cage | undefined
  handleCellClick: (coord: CellCoord) => void
  handleKeyDown: (e: KeyboardEvent<HTMLDivElement>, coord: CellCoord) => void
  registerCell:
    | ((coord: CellCoord, element: HTMLElement | null) => void)
    | undefined
}

const SudokuSubGrid = ({
  gridRow,
  gridCol,
  userGrid,
  selectedCell,
  getCage,
  handleCellClick,
  handleKeyDown,
  registerCell,
}: SudokuSubGridProps) => {
  return (
    <div
      key={`grid-${gridRow}-${gridCol}`}
      className="grid grid-cols-3"
      data-subgrid={`${gridRow}-${gridCol}`}
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
                  selectedCell?.row === row && selectedCell?.col === col

                return (
                  <SudokuCell
                    key={`${row}-${col}`}
                    cell={cell}
                    coord={{ row, col }}
                    cage={cage}
                    isSelected={isSelected}
                    showCageSum={
                      cage?.cells[0].row === row && cage?.cells[0].col === col
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
  )
}

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
  const { toast } = useToast()

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

  const memoizedPuzzle = useMemo(() => puzzle, [puzzle])

  const getCage = useCallback(
    (row: number, col: number): Cage | undefined => {
      return memoizedPuzzle.cages.find((cage) =>
        cage.cells.some((cell) => cell.row === row && cell.col === col)
      )
    },
    [memoizedPuzzle]
  )

  const handleCheckSolution = useCallback(() => {
    const isGridComplete = userGrid.every((row) =>
      row.every((cell) => cell.value !== undefined)
    )

    if (!isGridComplete) {
      toast({
        title: 'Incomplete Grid',
        description: 'Please fill out all cells before checking the solution.',
      })
      return
    }

    const isValid = validateGrid(userGrid, puzzle)
    toast({
      title: isValid ? 'Congratulations! 🎉' : 'Not quite right',
      description: isValid
        ? "You've solved the puzzle correctly!"
        : 'Keep trying, there are some mistakes.',
    })
  }, [userGrid, puzzle, toast])

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
      <PuzzleToolbar
        isNoteMode={isNoteMode}
        onNoteModeChange={setIsNoteMode}
        onCheckSolution={handleCheckSolution}
      />
      <div
        className="relative w-full max-w-[min(calc(100vw-2rem),500px)] mx-auto px-2 sm:px-4"
        data-sudoku-grid
      >
        <div
          className="relative grid grid-cols-3 gap-0 aspect-square"
          role="row"
          aria-label="Grid cells"
          data-grid-container
        >
          {/* Vertical separators */}
          <Separator
            orientation="vertical"
            className="absolute left-[33.33%] h-[105%]! -translate-x-1/2 z-[5] bg-foreground/75 w-[1px]! sm:w-[1.5px]! md:w-[2px]! -mt-[2.5%]"
          />
          <Separator
            orientation="vertical"
            className="absolute left-[66.66%] h-[105%]! -translate-x-1/2 z-[5] bg-foreground/75 w-[1px]! sm:w-[1.5px]! md:w-[2px]! -mt-[2.5%]"
          />

          {/* Horizontal separators */}
          <Separator
            orientation="horizontal"
            className="absolute top-[33.33%] w-[105%]! -translate-y-1/2 z-[5] bg-foreground/75 h-[1px]! sm:h-[1.5px]! md:h-[2px]! -ml-[2.5%]"
          />
          <Separator
            orientation="horizontal"
            className="absolute top-[66.66%] w-[105%]! -translate-y-1/2 z-[5] bg-foreground/75 h-[1px]! sm:h-[1.5px]! md:h-[2px]! -ml-[2.5%]"
          />

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
                  className="stroke-foreground/50 stroke-[1px] sm:stroke-[1.5px] md:stroke-2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="3 2"
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
                    <SudokuSubGrid
                      key={`${gridRow}-${gridCol}`}
                      gridRow={gridRow}
                      gridCol={gridCol}
                      userGrid={userGrid}
                      puzzle={puzzle}
                      selectedCell={selectedCell}
                      isDarkMode={isDarkMode}
                      getCage={getCage}
                      handleCellClick={handleCellClick}
                      handleKeyDown={handleKeyDown}
                      registerCell={registerCell}
                    />
                  ))}
              </div>
            ))}
        </div>
      </div>

      <NumberControls onNumberInput={handleNumberInput} />
    </div>
  )
}
