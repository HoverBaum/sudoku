import { useState, useEffect, useCallback, useRef } from 'react'
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

// Improved debounce utility with specific types
const debounce = <Args extends unknown[]>(
  fn: (...args: Args) => void,
  ms = 100
) => {
  let timeoutId: ReturnType<typeof setTimeout>
  return function (this: unknown, ...args: Args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), ms)
  }
}

const hasPositionChanged = (
  oldPos: CellPosition | undefined,
  newPos: CellPosition
): boolean => {
  if (!oldPos) return true
  const threshold = 1 // 1px threshold to avoid floating point issues
  return (
    Math.abs(oldPos.top - newPos.top) > threshold ||
    Math.abs(oldPos.right - newPos.right) > threshold ||
    Math.abs(oldPos.bottom - newPos.bottom) > threshold ||
    Math.abs(oldPos.left - newPos.left) > threshold
  )
}

export const useCellPositions = () => {
  const [cellPositions, setCellPositions] = useState<CellMap>(new Map())
  const positionsRef = useRef<CellMap>(new Map())
  const observerRef = useRef<ResizeObserver | null>(null)

  // Create a debounced update function with a longer delay
  const debouncedSetPositions = useRef(
    debounce(() => {
      setCellPositions(new Map(positionsRef.current))
    }, 500) // Increased from 16ms to 100ms
  ).current

  useEffect(() => {
    observerRef.current = new ResizeObserver(debouncedSetPositions)
    return () => observerRef.current?.disconnect()
  }, [debouncedSetPositions])

  const updatePosition = useCallback(
    (coord: CellCoord, element: HTMLElement) => {
      const rect = element.getBoundingClientRect()
      const positionedParent = findPositionedParent(element)
      const parentRect = positionedParent.getBoundingClientRect()

      const newPosition = {
        top: Math.round(rect.top - parentRect.top),
        right: Math.round(rect.right - parentRect.left),
        bottom: Math.round(rect.bottom - parentRect.top),
        left: Math.round(rect.left - parentRect.left),
      }

      const key = getCellKey(coord)
      const currentPosition = positionsRef.current.get(key)

      // Only update if position has actually changed beyond the threshold
      if (hasPositionChanged(currentPosition, newPosition)) {
        positionsRef.current.set(key, newPosition)
        debouncedSetPositions()
      }
    },
    [debouncedSetPositions]
  )

  const registerCell = useCallback(
    (coord: CellCoord, element: HTMLElement | null) => {
      if (!element || !observerRef.current) return

      observerRef.current.observe(element)
      updatePosition(coord, element)

      return () => {
        observerRef.current?.unobserve(element)
        positionsRef.current.delete(getCellKey(coord))
        debouncedSetPositions()
      }
    },
    [updatePosition, debouncedSetPositions]
  )

  return { positions: cellPositions, registerCell }
}
