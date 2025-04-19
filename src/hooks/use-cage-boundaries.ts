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

type LineSegment = {
  x1: number
  y1: number
  x2: number
  y2: number
  isHorizontal: boolean
}

const BOUNDARY_GAP = 1

// Helper to determine if a position is within grid bounds
const isInBounds = (row: number, col: number) => {
  return row >= 0 && row < 9 && col >= 0 && col < 9
}

// Helper to parse a path segment into line coordinates
const parsePathSegment = (path: string): LineSegment | null => {
  const match = path.match(/M\s*([\d.]+)\s*([\d.]+)\s*[HV]\s*([\d.]+)/)
  if (!match) return null
  
  const [, x1str, y1str, val] = match
  const x1 = parseFloat(x1str)
  const y1 = parseFloat(y1str)
  const isHorizontal = path.includes('H')
  
  return {
    x1,
    y1,
    x2: isHorizontal ? parseFloat(val) : x1,
    y2: isHorizontal ? y1 : parseFloat(val),
    isHorizontal
  }
}

// Helper to merge colinear segments that share endpoints
const mergeSegments = (segments: LineSegment[]): LineSegment[] => {
  const horizontalSegments = segments.filter(s => s.isHorizontal)
  const verticalSegments = segments.filter(s => !s.isHorizontal)

  // Sort segments by y coordinate (horizontal) or x coordinate (vertical)
  const sortAndMerge = (segs: LineSegment[]) => {
    if (segs.length === 0) return []
    
    const isHoriz = segs[0].isHorizontal
    segs.sort((a, b) => {
      // Sort by y for horizontal segments, x for vertical
      const primary = isHoriz ? a.y1 - b.y1 : a.x1 - b.x1
      if (primary !== 0) return primary
      // Secondary sort by start position
      return isHoriz ? a.x1 - b.x1 : a.y1 - b.y1
    })

    const result: LineSegment[] = []
    let current = segs[0]

    for (let i = 1; i < segs.length; i++) {
      const next = segs[i]
      if (isHoriz && current.y1 === next.y1 && 
          (current.x2 === next.x1 || current.x2 + BOUNDARY_GAP * 2 >= next.x1)) {
        // Merge horizontal segments
        current = {
          ...current,
          x2: Math.max(current.x2, next.x2)
        }
      } else if (!isHoriz && current.x1 === next.x1 && 
                 (current.y2 === next.y1 || current.y2 + BOUNDARY_GAP * 2 >= next.y1)) {
        // Merge vertical segments
        current = {
          ...current,
          y2: Math.max(current.y2, next.y2)
        }
      } else {
        result.push(current)
        current = next
      }
    }
    result.push(current)
    return result
  }

  return [...sortAndMerge(horizontalSegments), ...sortAndMerge(verticalSegments)]
}

// Helper to convert a line segment back to SVG path
const segmentToPath = (segment: LineSegment): string => {
  if (segment.isHorizontal) {
    return `M ${segment.x1} ${segment.y1} H ${segment.x2}`
  } else {
    return `M ${segment.x1} ${segment.y1} V ${segment.y2}`
  }
}

export const useCageBoundaries = (
  puzzle: SumSudokuPuzzle,
  cellPositions: Map<string, CellPosition>
): CageBoundary[] => {
  return useMemo(() => {
    return puzzle.cages.map((cage) => {
      const rawPaths: string[] = []
      const cageSet = new Set(cage.cells.map(cell => `${cell.row},${cell.col}`))

      // Define directions and their deltas
      const directions = [
        { name: 'top', dr: -1, dc: 0 },
        { name: 'right', dr: 0, dc: 1 },
        { name: 'bottom', dr: 1, dc: 0 },
        { name: 'left', dr: 0, dc: -1 }
      ]

      // First collect all edge segments
      cage.cells.forEach((cell) => {
        const cellKey = `${cell.row}-${cell.col}`
        const pos = cellPositions.get(cellKey)
        if (!pos) return

        directions.forEach(({ name, dr, dc }) => {
          const neighborRow = cell.row + dr
          const neighborCol = cell.col + dc
          
          const isExposed = !isInBounds(neighborRow, neighborCol) || 
                          !cageSet.has(`${neighborRow},${neighborCol}`)

          if (isExposed) {
            switch (name) {
              case 'top':
                rawPaths.push(`M ${pos.left + BOUNDARY_GAP} ${pos.top} H ${pos.right - BOUNDARY_GAP}`)
                break
              case 'right':
                rawPaths.push(`M ${pos.right} ${pos.top + BOUNDARY_GAP} V ${pos.bottom - BOUNDARY_GAP}`)
                break
              case 'bottom':
                rawPaths.push(`M ${pos.left + BOUNDARY_GAP} ${pos.bottom} H ${pos.right - BOUNDARY_GAP}`)
                break
              case 'left':
                rawPaths.push(`M ${pos.left} ${pos.top + BOUNDARY_GAP} V ${pos.bottom - BOUNDARY_GAP}`)
                break
            }
          }
        })
      })

      // Parse paths into segments, merge them, and convert back to paths
      const segments = rawPaths
        .map(parsePathSegment)
        .filter((s): s is LineSegment => s !== null)
      
      const mergedSegments = mergeSegments(segments)
      const mergedPaths = mergedSegments.map(segmentToPath)

      return {
        id: cage.id!,
        paths: mergedPaths,
      }
    })
  }, [puzzle.cages, cellPositions])
}
