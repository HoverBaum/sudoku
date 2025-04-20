import { useRef, useEffect, type KeyboardEvent } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { CellCoord, UserCell, Cage } from '@/types/game'

type SudokuCellProps = {
  cell: UserCell
  coord: CellCoord
  cage?: Cage
  isSelected: boolean
  cageColor?: string
  borders: {
    top: boolean
    right: boolean
    bottom: boolean
    left: boolean
  }
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
  cageColor,
  borders,
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
    <Card
      ref={cellRef}
      className={cn(
        'w-12 h-12 flex items-center justify-center relative',
        'focus:outline-none focus:ring-2 focus:ring-ring',
        'cursor-pointer select-none transition-colors duration-200',
        {
          'border-t-2': borders.top,
          'border-r-2': borders.right,
          'border-b-2': borders.bottom,
          'border-l-2': borders.left,
          'bg-accent': isSelected,
        }
      )}
      style={{ backgroundColor: cageColor }}
      role="gridcell"
      aria-label={`Cell ${coord.row + 1},${coord.col + 1}${
        cell.isPreFilled ? ' (pre-filled)' : ''
      }`}
      aria-selected={isSelected}
      tabIndex={0}
      onClick={() => !cell.isPreFilled && onClick(coord)}
      onKeyDown={(e) => !cell.isPreFilled && onKeyDown(e, coord)}
    >
      {/* <span className="absolute top-0 left-0">row: {coord.row}</span>
      <span className="absolute top-4 left-0">col: {coord.col}</span>
      <span className="absolute top-8 left-0">{cageColor?.substring(3)}</span> */}
      {showCageSum && cage && (
        <span
          className="absolute top-0.5 left-1 text-sm text-muted-foreground"
          aria-label={`Cage sum ${cage.sum}`}
        >
          {cage.sum}
        </span>
      )}

      {cell.value ? (
        <span
          className={cn('text-3xl transition-colors duration-200', {
            'underline underline-offset-4': cell.isPreFilled, // Bold + underline for pre-filled numbers
          })}
          aria-label={`Value ${cell.value}${
            cell.isPreFilled ? ' (pre-filled)' : ''
          }`}
        >
          {cell.value}
        </span>
      ) : (cell.notes || []).length > 0 ? (
        <div
          className="grid grid-cols-3 gap-0.5 p-1.5 text-sm text-muted-foreground"
          role="list"
          aria-label="Notes"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <div
              key={n}
              role="listitem"
              className={cn('flex items-center justify-center', {
                invisible: !(cell.notes || []).includes(n),
              })}
            >
              {n}
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  )
}
