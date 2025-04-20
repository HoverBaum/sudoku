import { CellCoord, SumSudokuPuzzle } from '@/types/game'
import { useMemo } from 'react'

type CellBorder = {
  startCoord: CellCoord
  endCoord: CellCoord
  direction: 'left' | 'right' | 'up' | 'down'
}

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

export const useCagePaths = (
  puzzle: SumSudokuPuzzle,
  cellPositions: Map<string, CellPosition>
): CageBoundary[] => {
  return useMemo(() => {
    const { cages } = puzzle
    const cagePaths = cages.flatMap((cage) => {
      const { cells } = cage
      // Check each cell for each direction. If the neighbor cell is not in the cage, add a border.
      const cellBorders: CellBorder[] = cells.flatMap((cell) => {
        const { row, col } = cell
        const borders: CellBorder[] = []

        // Check left
        if (col > 0 && !cells.some((c) => c.row === row && c.col === col - 1)) {
          borders.push({ startCoord: cell, endCoord: cell, direction: 'left' })
        }
        // Check right
        if (col < 8 && !cells.some((c) => c.row === row && c.col === col + 1)) {
          borders.push({ startCoord: cell, endCoord: cell, direction: 'right' })
        }
        // Check up
        if (row > 0 && !cells.some((c) => c.row === row - 1 && c.col === col)) {
          borders.push({ startCoord: cell, endCoord: cell, direction: 'up' })
        }
        // Check down
        if (row < 8 && !cells.some((c) => c.row === row + 1 && c.col === col)) {
          borders.push({ startCoord: cell, endCoord: cell, direction: 'down' })
        }

        return borders
      })

      // Merge borders that are next to each other.
      const mergedBorders: CellBorder[] = []
      cellBorders.forEach((border) => {
        let existingBorder: CellBorder | undefined
        // Depending on the borders direction, find the existing border to merge with.
        switch (border.direction) {
          case 'left':
            existingBorder = mergedBorders.find(
              (b) =>
                b.direction === 'left' &&
                b.startCoord.row === border.startCoord.row &&
                b.startCoord.col === border.startCoord.col - 1
            )
            break
          case 'right':
            existingBorder = mergedBorders.find(
              (b) =>
                b.direction === 'right' &&
                b.startCoord.row === border.startCoord.row &&
                b.startCoord.col === border.startCoord.col + 1
            )
            break
          case 'up':
            existingBorder = mergedBorders.find(
              (b) =>
                b.direction === 'up' &&
                b.startCoord.row === border.startCoord.row - 1 &&
                b.startCoord.col === border.startCoord.col
            )
            break
          case 'down':
            existingBorder = mergedBorders.find(
              (b) =>
                b.direction === 'down' &&
                b.startCoord.row === border.startCoord.row + 1 &&
                b.startCoord.col === border.startCoord.col
            )
            break
        }
        // If an existing border is found, merge the end coordinates.
        // Otherwise, add the new border to the merged borders.
        if (existingBorder) {
          existingBorder.endCoord = border.endCoord
        } else {
          mergedBorders.push(border)
        }
      })

      // Convert merged borders to SVG path data
      const cagePaths = mergedBorders.map((border) => {
        const { startCoord, endCoord } = border
        const startPos = cellPositions.get(
          `${startCoord.row}-${startCoord.col}`
        )
        const endPos = cellPositions.get(`${endCoord.row}-${endCoord.col}`)

        if (!startPos || !endPos) return ''

        // Create the path, based on the direction of the border
        let path = ''
        switch (border.direction) {
          case 'left':
            path = `M${startPos.left},${startPos.top} L${endPos.left},${endPos.top}`
            break
          case 'right':
            path = `M${startPos.right},${startPos.top} L${endPos.right},${endPos.top}`
            break
          case 'up':
            path = `M${startPos.left},${startPos.top} L${endPos.left},${endPos.bottom}`
            break
          case 'down':
            path = `M${startPos.left},${startPos.bottom} L${endPos.left},${endPos.bottom}`
            break
        }
        console.log('path', path)
        return path
      })

      return {
        id: cage.id || 'missing_id',
        paths: cagePaths,
      }
    })
    return cagePaths
  }, [puzzle, cellPositions])
}
