import { useRef, useEffect, type KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'
import type { CellCoord, UserCell, Cage } from '@/types/game'

type SudokuCellProps = {
  cell: UserCell
  coord: CellCoord
  cage?: Cage
  isSelected: boolean
  cageColor?: string
  showCageSum: boolean
  onClick: (coord: CellCoord) => void
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>, coord: CellCoord) => void
  registerCell?: (coord: CellCoord, element: HTMLElement | null) => void
}

export const SudokuCell = ({
  cell,
  coord,
  cage,
  isSelected,
  showCageSum,
  onClick,
  onKeyDown,
  registerCell,
}: SudokuCellProps) => {
  const cellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (registerCell) {
      return registerCell(coord, cellRef.current)
    }
  }, [coord, registerCell])

  return (
    <div
      ref={cellRef}
      data-cell-coord={`${coord.row}-${coord.col}`}
      className={cn(
        'aspect-square w-full flex items-center justify-center relative cursor-pointer select-none transition-colors duration-200 rounded-none bg-background border',
        {
          'bg-foreground/15': isSelected,
        }
      )}
      role="gridcell"
      aria-label={`Cell ${coord.row + 1},${coord.col + 1}${
        cell.isPreFilled ? ' (pre-filled)' : ''
      }`}
      aria-selected={isSelected}
      tabIndex={0}
      onClick={() => !cell.isPreFilled && onClick(coord)}
      onKeyDown={(e) => !cell.isPreFilled && onKeyDown(e, coord)}
    >
      {/* <span className="absolute top-0 left-1">r {coord.row}</span>
      <span className="absolute top-4 left-1">c {coord.col}</span> */}
      {showCageSum && cage && (
        <span
          className="absolute top-[5%] left-[10%] text-[min(2vw,0.75rem)] text-muted-foreground"
          aria-label={`Cage sum ${cage.sum}`}
        >
          {cage.sum}
        </span>
      )}
      {cell.value ? (
        <span
          className={cn(
            'text-[min(6vw,1.75rem)] transition-colors duration-200'
          )}
          aria-label={`Value ${cell.value}${
            cell.isPreFilled ? ' (pre-filled)' : ''
          }`}
        >
          {cell.value}
        </span>
      ) : (cell.notes || []).length > 0 ? (
        <div
          className="grid grid-cols-3 w-full h-full text-[min(2vw,0.7rem)] text-muted-foreground p-[5%]"
          role="list"
          aria-label="Notes"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <div
              key={n}
              role="listitem"
              className={cn('flex items-center justify-center leading-none', {
                invisible: !(cell.notes || []).includes(n),
              })}
            >
              {n}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
