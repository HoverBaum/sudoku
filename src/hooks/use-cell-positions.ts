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

const findPositionedParent = (element: HTMLElement): HTMLElement => {
  let parent = element.parentElement
  while (parent) {
    const position = getComputedStyle(parent).position
    if (position !== 'static') {
      return parent
    }
    parent = parent.parentElement
  }
  return document.body
}

export const useCellPositions = () => {
  const [cellPositions, setCellPositions] = useState<CellMap>(new Map())
  const [observer, setObserver] = useState<ResizeObserver | null>(null)

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      setCellPositions((currentMap) => new Map(currentMap))
    })
    setObserver(resizeObserver)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const registerCell = useCallback(
    (coord: CellCoord, element: HTMLElement | null) => {
      if (!element || !observer) return

      observer.observe(element)

      const updatePosition = () => {
        const rect = element.getBoundingClientRect()
        const positionedParent = findPositionedParent(element)
        const parentRect = positionedParent.getBoundingClientRect()

        setCellPositions((current) =>
          new Map(current).set(getCellKey(coord), {
            top: rect.top - parentRect.top,
            right: rect.right - parentRect.left,
            bottom: rect.bottom - parentRect.top,
            left: rect.left - parentRect.left,
          })
        )
      }

      // Initial position calculation
      updatePosition()

      return () => {
        observer.unobserve(element)
        setCellPositions((current) => {
          const newMap = new Map(current)
          newMap.delete(getCellKey(coord))
          return newMap
        })
      }
    },
    [observer]
  )

  return {
    positions: cellPositions,
    registerCell,
  }
}
