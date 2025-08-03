import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { UserGrid } from '@/types/game'

type NumberControlsProps = {
  onNumberInput: (num: number) => void
  userGrid: UserGrid
}

export function NumberControls({
  onNumberInput,
  userGrid,
}: NumberControlsProps) {
  // Count occurrences of each number in the grid
  const numberCounts = new Array(10).fill(0)
  userGrid.forEach((row) => {
    row.forEach((cell) => {
      if (cell.value) {
        numberCounts[cell.value]++
      }
    })
  })

  return (
    <div
      className="grid grid-cols-5 gap-4 mt-4"
      role="toolbar"
      aria-label="Number input"
    >
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
        const isDisabled = numberCounts[num] >= 9
        return (
          <Card
            key={num}
            className={cn(
              'w-10 h-10 flex items-center justify-center transition-colors',
              isDisabled
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer hover:bg-primary/20'
            )}
            role="button"
            tabIndex={isDisabled ? -1 : 0}
            aria-label={`Input number ${num}`}
            aria-disabled={isDisabled}
            onClick={() => !isDisabled && onNumberInput(num)}
            onKeyDown={(e) => {
              if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault()
                onNumberInput(num)
              }
            }}
          >
            {num}
          </Card>
        )
      })}
    </div>
  )
}
