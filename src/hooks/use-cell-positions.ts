import { useState, useEffect, useCallback } from 'react'
import type { CellCoord } from '@/types/game'

type CellPosition = {
  top: number
  right: number
  bottom: number
  left: number
}

type CellMap = Map<string, CellPosition>

const getCellKey = (coord: CellCoord) => `${coord.row}-${coord.col}`

export const useCellPositions = () => {
  const [cellPositions, setCellPositions] = useState<CellMap>(new Map())

  const updateAllPositions = useCallback(() => {
    const gridContainer = document.querySelector('[data-grid-container]')
    if (!gridContainer) return

    const containerRect = gridContainer.getBoundingClientRect()
    const newPositions = new Map<string, CellPosition>()

    const cells = gridContainer.querySelectorAll('[data-cell-coord]')
    cells.forEach((cell) => {
      const coordAttr = cell.getAttribute('data-cell-coord')
      if (!coordAttr) return

      const [row, col] = coordAttr.split('-').map(Number)
      const rect = cell.getBoundingClientRect()

      newPositions.set(getCellKey({ row, col }), {
        top: Math.round(rect.top - containerRect.top),
        right: Math.round(rect.right - containerRect.left),
        bottom: Math.round(rect.bottom - containerRect.top),
        left: Math.round(rect.left - containerRect.left),
      })
    })

    setCellPositions(newPositions)
  }, [])

  useEffect(() => {
    const gridContainer = document.querySelector('[data-grid-container]')
    if (!gridContainer) return

    // Initial position calculation
    updateAllPositions()

    // Set up resize observer
    const observer = new ResizeObserver(() => {
      updateAllPositions()
    })

    observer.observe(gridContainer)

    return () => {
      observer.disconnect()
    }
  }, [updateAllPositions])

  return {
    positions: cellPositions,
    // Keep registerCell in the API for backwards compatibility, but it's now a no-op
    registerCell: () => undefined,
  }
}
