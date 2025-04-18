import { describe, test, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSudokuControls } from './use-sudoku-controls'
import type { UserGrid } from '@/types/game'

describe('useSudokuControls', () => {
  const createMockGrid = (): UserGrid =>
    Array(9)
      .fill(null)
      .map(() =>
        Array(9)
          .fill(null)
          .map(() => ({ value: undefined, notes: [] }))
      )

  test('initializes with default state', () => {
    const { result } = renderHook(() =>
      useSudokuControls(createMockGrid(), vi.fn())
    )

    expect(result.current.isNoteMode).toBe(false)
    expect(result.current.selectedCell).toBeNull()
  })

  test('handles cell selection', () => {
    const { result } = renderHook(() =>
      useSudokuControls(createMockGrid(), vi.fn())
    )

    act(() => {
      result.current.handleCellClick({ row: 1, col: 1 })
    })

    expect(result.current.selectedCell).toEqual({ row: 1, col: 1 })
  })

  test('handles number input in normal mode', () => {
    const onCellUpdate = vi.fn()
    const { result } = renderHook(() =>
      useSudokuControls(createMockGrid(), onCellUpdate)
    )

    act(() => {
      result.current.handleCellClick({ row: 1, col: 1 })
    })

    act(() => {
      result.current.handleNumberInput(5)
    })

    expect(onCellUpdate).toHaveBeenCalledWith({ row: 1, col: 1 }, 5, [])
  })

  test('handles number input in notes mode', () => {
    const onCellUpdate = vi.fn()
    const { result } = renderHook(() =>
      useSudokuControls(createMockGrid(), onCellUpdate)
    )

    act(() => {
      result.current.handleCellClick({ row: 1, col: 1 })
    })

    act(() => {
      result.current.setIsNoteMode(true)
    })

    act(() => {
      result.current.handleNumberInput(5)
    })

    expect(onCellUpdate).toHaveBeenCalledWith({ row: 1, col: 1 }, undefined, [
      5,
    ])
  })

  test('toggles numbers in notes mode', () => {
    const mockGrid = createMockGrid()
    mockGrid[1][1] = { value: undefined, notes: [5] }
    const onCellUpdate = vi.fn()

    const { result } = renderHook(() =>
      useSudokuControls(mockGrid, onCellUpdate)
    )

    act(() => {
      result.current.handleCellClick({ row: 1, col: 1 })
    })

    act(() => {
      result.current.setIsNoteMode(true)
    })

    act(() => {
      result.current.handleNumberInput(5) // Should remove 5 from notes
    })

    expect(onCellUpdate).toHaveBeenCalledWith({ row: 1, col: 1 }, undefined, [])
  })

  test('toggles numbers in normal mode', () => {
    const mockGrid = createMockGrid()
    mockGrid[1][1] = { value: 5, notes: [] }
    const onCellUpdate = vi.fn()

    const { result } = renderHook(() =>
      useSudokuControls(mockGrid, onCellUpdate)
    )

    act(() => {
      result.current.handleCellClick({ row: 1, col: 1 })
    })

    act(() => {
      result.current.handleNumberInput(5) // Should remove 5
    })

    expect(onCellUpdate).toHaveBeenCalledWith({ row: 1, col: 1 }, undefined, [])
  })
})
