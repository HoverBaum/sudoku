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

const sortCornerCells = (a: CellCoord, b: CellCoord) => {
  if (a.row === b.row) {
    return a.col - b.col
  }
  return a.row - b.row
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
        if (
          col === 0 ||
          (col > 0 && !cells.some((c) => c.row === row && c.col === col - 1))
        ) {
          borders.push({ startCoord: cell, endCoord: cell, direction: 'left' })
        }
        // Check right
        if (
          col === 8 ||
          (col < 8 && !cells.some((c) => c.row === row && c.col === col + 1))
        ) {
          borders.push({ startCoord: cell, endCoord: cell, direction: 'right' })
        }
        // Check up
        if (
          row === 0 ||
          (row > 0 && !cells.some((c) => c.row === row - 1 && c.col === col))
        ) {
          borders.push({ startCoord: cell, endCoord: cell, direction: 'up' })
        }
        // Check down
        if (
          row === 8 ||
          (row < 8 && !cells.some((c) => c.row === row + 1 && c.col === col))
        ) {
          borders.push({ startCoord: cell, endCoord: cell, direction: 'down' })
        }

        return borders
      })

      console.log(`Cell borders ${cage.id}`, cellBorders)

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
                b.startCoord.row === border.startCoord.row - 1 &&
                b.startCoord.col === border.startCoord.col
            )
            break
          case 'right':
            existingBorder = mergedBorders.find(
              (b) =>
                b.direction === 'right' &&
                b.startCoord.row === border.startCoord.row - 1 &&
                b.startCoord.col === border.startCoord.col
            )
            break
          case 'up':
            existingBorder = mergedBorders.find(
              (b) =>
                b.direction === 'up' &&
                b.startCoord.row === border.startCoord.row &&
                b.startCoord.col === border.startCoord.col - 1
            )
            break
          case 'down':
            existingBorder = mergedBorders.find(
              (b) =>
                b.direction === 'down' &&
                b.startCoord.row === border.startCoord.row &&
                b.startCoord.col === border.startCoord.col - 1
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
      console.log(`merged Border ${cage.id}`, mergedBorders)

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
            path = `M${startPos.left},${startPos.top} L${endPos.left},${endPos.bottom}`
            break
          case 'right':
            path = `M${startPos.right},${startPos.top} L${endPos.right},${endPos.bottom}`
            break
          case 'up':
            path = `M${startPos.left},${startPos.top} L${endPos.right},${endPos.top}`
            break
          case 'down':
            path = `M${startPos.left},${startPos.bottom} L${endPos.right},${endPos.bottom}`
            break
        }
        return path
      })

      // Corners
      // Find corners so that we can add paths that close those corners.
      // There are four types of corners:
      // 1. Top left corner
      // 2. Top right corner
      // 3. Bottom left corner
      // 4. Bottom right corner
      type CageCorner = {
        cells: CellCoord[]
        direction: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
      }
      const corners: CageCorner[] = []
      cellBorders.forEach((border) => {
        const { startCoord, endCoord, direction } = border
        // Based on direction check for corners.
        if (direction === 'left') {
          // Top right corner
          const bottomBorderToTopLeft = cellBorders.find(
            (b) =>
              b.direction === 'down' &&
              b.endCoord.row === startCoord.row - 1 &&
              b.endCoord.col === startCoord.col - 1
          )
          if (bottomBorderToTopLeft) {
            const corner: CageCorner = {
              cells: [bottomBorderToTopLeft.endCoord, startCoord].sort(
                sortCornerCells
              ),
              direction: 'top-right',
            }
            corners.push(corner)
          }

          // Bottom right corner
          const topBorderToBottomLeft = cellBorders.find(
            (b) =>
              b.direction === 'up' &&
              b.endCoord.row === startCoord.row + 1 &&
              b.endCoord.col === startCoord.col - 1
          )
          if (topBorderToBottomLeft) {
            const corner: CageCorner = {
              cells: [topBorderToBottomLeft.endCoord, startCoord].sort(
                sortCornerCells
              ),
              direction: 'bottom-right',
            }
            corners.push(corner)
          }
        }
      })

      // Create paths for each corner.
      const cornerPaths: string[] = corners.map((corner) => {
        const { cells, direction } = corner
        if (direction === 'top-right') {
          const topLeftCoord = cells[0]
          const bottomRightCoord = cells[1]
          const topLeftPos = cellPositions.get(
            `${topLeftCoord.row}-${topLeftCoord.col}`
          )
          const bottomRightPos = cellPositions.get(
            `${bottomRightCoord.row}-${bottomRightCoord.col}`
          )
          if (!topLeftPos || !bottomRightPos) return ''
          return `M${topLeftPos.right},${topLeftPos.bottom} L${bottomRightPos.left},${topLeftPos.bottom} L${bottomRightPos.left},${bottomRightPos.top}`
        }

        if (direction === 'bottom-right') {
          const topRightCoord = cells[0]
          const bottomLeftCoord = cells[1]
          const topRightPos = cellPositions.get(
            `${topRightCoord.row}-${topRightCoord.col}`
          )
          const bottomLeftPos = cellPositions.get(
            `${bottomLeftCoord.row}-${bottomLeftCoord.col}`
          )
          if (!topRightPos || !bottomLeftPos) return ''
          return `M${topRightPos.left},${topRightPos.bottom} L${topRightPos.left},${bottomLeftPos.top} L${bottomLeftPos.right},${bottomLeftPos.top}`
        }
        return ''
      })

      return {
        id: cage.id || 'missing_id',
        paths: cagePaths.concat(cornerPaths),
      }
    })
    return cagePaths
  }, [puzzle, cellPositions])
}
