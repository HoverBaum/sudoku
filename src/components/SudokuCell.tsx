import { KeyboardEvent } from 'react'
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
  showCageSum?: boolean
  onClick: (coord: CellCoord) => void
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>, coord: CellCoord) => void
}

export function SudokuCell({
  cell,
  coord,
  cage,
  isSelected,
  cageColor,
  borders,
  showCageSum,
  onClick,
  onKeyDown,
}: SudokuCellProps) {
  return (
    <Card
      className={cn(
        'w-12 h-12 flex items-center justify-center relative cursor-pointer select-none',
        'transition-all duration-200',
        borders.top && 'border-t-2',
        borders.right && 'border-r-2',
        borders.bottom && 'border-b-2',
        borders.left && 'border-l-2',
        isSelected && 'border-primary'
      )}
      style={{
        backgroundColor: cageColor,
      }}
      role="gridcell"
      aria-label={`Cell ${coord.row + 1},${coord.col + 1}`}
      aria-selected={isSelected}
      tabIndex={0}
      onClick={() => onClick(coord)}
      onKeyDown={(e) => onKeyDown(e, coord)}
    >
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
          className="text-3xl font-medium"
          aria-label={`Value ${cell.value}`}
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
}
