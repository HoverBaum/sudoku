import { CellCoord, SumSudokuPuzzle } from '@/types/game'
import { useMemo } from 'react'

const INSET = 4

type CellBorder = {
  coord: CellCoord
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

// Check each cell for each direction. If the neighbor cell is not in the cage, add a border.
const findCellBorders = (cells: CellCoord[]): CellBorder[] =>
  cells.flatMap((cell) => {
    const { row, col } = cell
    const borders: CellBorder[] = []

    // Check left
    if (
      col === 0 ||
      (col > 0 && !cells.some((c) => c.row === row && c.col === col - 1))
    ) {
      borders.push({ coord: cell, direction: 'left' })
    }
    // Check right
    if (
      col === 8 ||
      (col < 8 && !cells.some((c) => c.row === row && c.col === col + 1))
    ) {
      borders.push({ coord: cell, direction: 'right' })
    }
    // Check up
    if (
      row === 0 ||
      (row > 0 && !cells.some((c) => c.row === row - 1 && c.col === col))
    ) {
      borders.push({ coord: cell, direction: 'up' })
    }
    // Check down
    if (
      row === 8 ||
      (row < 8 && !cells.some((c) => c.row === row + 1 && c.col === col))
    ) {
      borders.push({ coord: cell, direction: 'down' })
    }

    return borders
  })

const cellCoordToId = (cell: CellCoord): string => {
  const { row, col } = cell
  return `${row}-${col}`
}

type Point = {
  x: number
  y: number
}

type CornerIdentifier =
  | 'top-left'
  | 'top-right'
  | 'bottom-right'
  | 'bottom-left'

const cellCoordToPoint = (
  coord: CellCoord,
  cellPositions: Map<string, CellPosition>,
  corner: CornerIdentifier
): Point | null => {
  const cellId = cellCoordToId(coord)
  const position = cellPositions.get(cellId)
  if (!position) {
    throw Error(`No position for ${cellId}`)
  }

  if (corner === 'top-left')
    return {
      x: position.left + INSET,
      y: position.top + INSET,
    }
  if (corner === 'top-right')
    return {
      x: position.right - INSET,
      y: position.top + INSET,
    }
  if (corner === 'bottom-right')
    return {
      x: position.right - INSET,
      y: position.bottom - INSET,
    }
  if (corner === 'bottom-left')
    return {
      x: position.left + INSET,
      y: position.bottom - INSET,
    }

  return null
}

const innerCornerPoint = (
  cellPositions: Map<string, CellPosition>,
  currentBorder: CellBorder,
  nextBorder: CellBorder
): Point | undefined => {
  const currentPos = cellPositions.get(cellCoordToId(currentBorder.coord))
  const nextPos = cellPositions.get(cellCoordToId(nextBorder.coord))
  if (currentPos && nextPos) {
    if (currentBorder.direction === 'up' && nextBorder.direction === 'left') {
      return {
        x: nextPos.left + INSET,
        y: currentPos.top + INSET,
      }
    }

    if (currentBorder.direction === 'right' && nextBorder.direction === 'up') {
      return {
        x: currentPos.right - INSET,
        y: nextPos.top + INSET,
      }
    }

    if (
      currentBorder.direction === 'down' &&
      nextBorder.direction === 'right'
    ) {
      return {
        x: nextPos.right - INSET,
        y: currentPos.bottom - INSET,
      }
    }

    if (currentBorder.direction === 'left' && nextBorder.direction === 'down') {
      return {
        x: currentPos.left + INSET,
        y: nextPos.bottom - INSET,
      }
    }
  }
  return undefined
}

/**
 * Find the next border to use.
 * We assume that from each border currently visited there should only be one valid case to continue to.
 * This should be assured by the cage generation.
 */
const nextCellClockwise = (
  oldCellBorder: CellBorder,
  cellBorders: CellBorder[]
): CellBorder | undefined => {
  let nextCellBorder = undefined
  const coord = oldCellBorder.coord
  if (oldCellBorder.direction === 'up') {
    /**
     * Cases:
     * We continue to right in straight line →
     * We go up with a left border on cell up and right ↗
     * We stay with a right border on same cel ·
     */
    const upBorderToRight = cellBorders.find(
      (border) =>
        border.direction === 'up' &&
        border.coord.col === coord.col + 1 &&
        border.coord.row === coord.row
    )
    if (upBorderToRight) nextCellBorder = upBorderToRight
    const leftBorderUpwardsAndRight = cellBorders.find(
      (border) =>
        border.direction === 'left' &&
        border.coord.col === coord.col + 1 &&
        border.coord.row === coord.row - 1
    )
    if (leftBorderUpwardsAndRight) nextCellBorder = leftBorderUpwardsAndRight
    const rightBorderSamePosition = cellBorders.find(
      (border) =>
        border.direction === 'right' &&
        border.coord.col === coord.col &&
        border.coord.row === coord.row
    )
    if (rightBorderSamePosition) nextCellBorder = rightBorderSamePosition
  } else if (oldCellBorder.direction === 'right') {
    /**
     * Cases:
     * We continue to down in straight line ↓
     * We stay with a bottom border on same cell ·
     * We go right with a top border on cell to the right and down ↘
     */
    const rightBorderBelow = cellBorders.find(
      (border) =>
        border.direction === 'right' &&
        border.coord.col === coord.col &&
        border.coord.row === coord.row + 1
    )
    if (rightBorderBelow) nextCellBorder = rightBorderBelow
    const bottomBorderSamePosition = cellBorders.find(
      (border) =>
        border.direction === 'down' &&
        border.coord.col === coord.col &&
        border.coord.row === coord.row
    )
    if (bottomBorderSamePosition) nextCellBorder = bottomBorderSamePosition
    const topBorderToRight = cellBorders.find(
      (border) =>
        border.direction === 'up' &&
        border.coord.col === coord.col + 1 &&
        border.coord.row === coord.row + 1
    )
    if (topBorderToRight) nextCellBorder = topBorderToRight
  } else if (oldCellBorder.direction === 'down') {
    /**
     * Cases:
     * We continue to left in straight line ←
     * We go down with a right border on cell below and left ↙
     * We stay with a left border on same cell ·
     */
    const downBorderToLeft = cellBorders.find(
      (border) =>
        border.direction === 'down' &&
        border.coord.col === coord.col - 1 &&
        border.coord.row === coord.row
    )
    if (downBorderToLeft) nextCellBorder = downBorderToLeft
    const rightBorderDownwardsAndLeft = cellBorders.find(
      (border) =>
        border.direction === 'right' &&
        border.coord.col === coord.col - 1 &&
        border.coord.row === coord.row + 1
    )
    if (rightBorderDownwardsAndLeft)
      nextCellBorder = rightBorderDownwardsAndLeft
    const leftBorderSamePosition = cellBorders.find(
      (border) =>
        border.direction === 'left' &&
        border.coord.col === coord.col &&
        border.coord.row === coord.row
    )
    if (leftBorderSamePosition) nextCellBorder = leftBorderSamePosition
  } else if (oldCellBorder.direction === 'left') {
    /**
     * Cases:
     * We continue to up in straight line ↑
     * We stay with a top border on same cell ·
     * We go left with a bottom border on cell to the left and up ↖
     */
    const leftBorderAbove = cellBorders.find(
      (border) =>
        border.direction === 'left' &&
        border.coord.col === coord.col &&
        border.coord.row === coord.row - 1
    )
    if (leftBorderAbove) nextCellBorder = leftBorderAbove
    const topBorderSamePosition = cellBorders.find(
      (border) =>
        border.direction === 'up' &&
        border.coord.col === coord.col &&
        border.coord.row === coord.row
    )
    if (topBorderSamePosition) nextCellBorder = topBorderSamePosition
    const bottomBorderToLeftAndUp = cellBorders.find(
      (border) =>
        border.direction === 'down' &&
        border.coord.col === coord.col - 1 &&
        border.coord.row === coord.row - 1
    )
    if (bottomBorderToLeftAndUp) nextCellBorder = bottomBorderToLeftAndUp
  }
  return nextCellBorder
}

export const useCagePath = (
  puzzle: SumSudokuPuzzle,
  cellPositions: Map<string, CellPosition>
): CageBoundary[] => {
  return useMemo(() => {
    if (cellPositions.size === 0) return []
    const { cages } = puzzle
    const cagePaths = cages.flatMap((cage) => {
      const { cells } = cage
      let cellBorders: CellBorder[] = findCellBorders(cells)
      cellBorders.sort((a, b) => sortCornerCells(a.coord, b.coord))
      // .sort((a) => {
      //   if (a.direction === 'up') return -1
      //   return 1
      // })

      /**
       * We move clockwise from the top left most corner (thanks sorting) around the entire cage.
       */
      let currentCellBorder: CellBorder | undefined = cellBorders[0]
      const initialCellBorder = currentCellBorder

      const points: Point[] = []
      if (currentCellBorder) {
        const point = cellCoordToPoint(
          currentCellBorder.coord,
          cellPositions,
          'top-left'
        )
        if (point) points.push(point)
      }
      while (currentCellBorder) {
        cellBorders = cellBorders.filter(
          (border) => border !== currentCellBorder
        )
        let corner: CornerIdentifier | undefined
        if (currentCellBorder.direction === 'up') {
          corner = 'top-right'
        } else if (currentCellBorder.direction === 'right') {
          corner = 'bottom-right'
        } else if (currentCellBorder.direction === 'down') {
          corner = 'bottom-left'
        } else if (currentCellBorder.direction === 'left') {
          corner = 'top-left'
        }
        if (!corner)
          throw Error(
            `No corner found for ${JSON.stringify(currentCellBorder)}`
          )
        const point = cellCoordToPoint(
          currentCellBorder.coord,
          cellPositions,
          corner
        )
        if (!point)
          throw Error(`No point for ${JSON.stringify(currentCellBorder)}`)
        points.push(point)

        const nextCellBorder = nextCellClockwise(currentCellBorder, cellBorders)

        // Elongate current line if this is an internal corner.
        const cornerPoint = innerCornerPoint(
          cellPositions,
          currentCellBorder,
          // Because we move around and have forgotten the fir border, we manually add it here.
          nextCellBorder || initialCellBorder
        )
        if (cornerPoint) {
          points.push(cornerPoint)
        }

        currentCellBorder = nextCellBorder
      }

      // Now we have all points going in a clockwise direction.
      const path =
        `M${points[0].x} ${points[0].y} ` +
        points.slice(1).reduce((acc, point) => {
          return acc + `L${point.x} ${point.y} `
        }, '') +
        'Z'

      return {
        id: cage.id || 'MISSING_ID',
        paths: [path],
      }
    })
    return cagePaths
  }, [puzzle, cellPositions])
}
