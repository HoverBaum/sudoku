import { useMemo } from 'react'
import type { SumSudokuPuzzle } from '@/types/game'

type CellPosition = {
  top: number
  right: number
  bottom: number
  left: number
}

type CageBoundary = {
  id: string
  paths: string[]
}

const BOUNDARY_GAP = 1 // Gap between cells to avoid visual overlapping

export const useCageBoundaries = (
  puzzle: SumSudokuPuzzle,
  cellPositions: Map<string, CellPosition>
): CageBoundary[] => {
  return useMemo(() => {
    return puzzle.cages.map((cage) => {
      const paths: string[] = []

      cage.cells.forEach((cell) => {
        const cellKey = `${cell.row}-${cell.col}`
        const pos = cellPositions.get(cellKey)
        if (!pos) return

        // Check each direction for cage boundaries
        const hasTop = !cage.cells.some(
          (c) => c.row === cell.row - 1 && c.col === cell.col
        )
        const hasRight = !cage.cells.some(
          (c) => c.row === cell.row && c.col === cell.col + 1
        )
        const hasBottom = !cage.cells.some(
          (c) => c.row === cell.row + 1 && c.col === cell.col
        )
        const hasLeft = !cage.cells.some(
          (c) => c.row === cell.row && c.col === cell.col - 1
        )

        // Add line segments where there's a boundary, with small gap adjustments
        if (hasTop) {
          paths.push(
            `M ${pos.left + BOUNDARY_GAP} ${pos.top} H ${
              pos.right - BOUNDARY_GAP
            }`
          )
        }
        if (hasRight) {
          paths.push(
            `M ${pos.right} ${pos.top + BOUNDARY_GAP} V ${
              pos.bottom - BOUNDARY_GAP
            }`
          )
        }
        if (hasBottom) {
          paths.push(
            `M ${pos.left + BOUNDARY_GAP} ${pos.bottom} H ${
              pos.right - BOUNDARY_GAP
            }`
          )
        }
        if (hasLeft) {
          paths.push(
            `M ${pos.left} ${pos.top + BOUNDARY_GAP} V ${
              pos.bottom - BOUNDARY_GAP
            }`
          )
        }
      })

      return {
        id: cage.id!,
        paths,
      }
    })
  }, [puzzle.cages, cellPositions])
}
