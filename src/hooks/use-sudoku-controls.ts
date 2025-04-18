import { useState, useCallback } from 'react'
import type { CellCoord, UserGrid } from '@/types/game'

export function useSudokuControls(
  userGrid: UserGrid,
  onCellUpdate: (coord: CellCoord, value?: number, notes?: number[]) => void
) {
  const [isNoteMode, setIsNoteMode] = useState(false)
  const [selectedCell, setSelectedCell] = useState<CellCoord | null>(null)

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
        const currentValue = userGrid[selectedCell.row][selectedCell.col].value
        onCellUpdate(selectedCell, currentValue === num ? undefined : num, [])
      }
    },
    [selectedCell, isNoteMode, userGrid, onCellUpdate]
  )

  return {
    isNoteMode,
    setIsNoteMode,
    selectedCell,
    setSelectedCell,
    handleCellClick,
    handleNumberInput,
  }
}
