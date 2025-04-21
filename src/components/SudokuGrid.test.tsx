import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SudokuGrid } from './SudokuGrid'
import type { SumSudokuPuzzle, UserGrid } from '@/types/game'

describe('SudokuGrid', () => {
  const mockPuzzle: SumSudokuPuzzle = {
    seed: 'test',
    difficulty: 'medium',
    cages: [
      {
        cells: [
          { row: 0, col: 0 },
          { row: 0, col: 1 },
        ],
        sum: 7,
        id: '1',
      },
    ],
    solution: Array(9)
      .fill(null)
      .map(() => Array(9).fill(0)),
    preFilledCells: [],
  }

  const mockGrid: UserGrid = Array(9)
    .fill(null)
    .map(() =>
      Array(9)
        .fill(null)
        .map(() => ({ value: undefined, notes: [] }))
    )

  test('renders grid with correct number of cells', () => {
    render(
      <SudokuGrid
        puzzle={mockPuzzle}
        userGrid={mockGrid}
        onCellUpdate={() => {}}
      />
    )

    // Should have 81 cells (9x9)
    const cells = screen.getAllByRole('gridcell')
    expect(cells).toHaveLength(81)
  })

  test('selects cell on click', async () => {
    const user = userEvent.setup()
    render(
      <SudokuGrid
        puzzle={mockPuzzle}
        userGrid={mockGrid}
        onCellUpdate={() => {}}
      />
    )

    const cell = screen.getAllByRole('gridcell')[0]
    await user.click(cell)
    expect(cell).toHaveAttribute('aria-selected', 'true')
  })

  test('updates cell value on number input', async () => {
    const onCellUpdate = vi.fn()
    const user = userEvent.setup()

    render(
      <SudokuGrid
        puzzle={mockPuzzle}
        userGrid={mockGrid}
        onCellUpdate={onCellUpdate}
      />
    )

    // Select first cell
    await user.click(screen.getAllByRole('gridcell')[0])

    // Click number 5
    await user.click(screen.getByRole('button', { name: 'Input number 5' }))

    expect(onCellUpdate).toHaveBeenCalledWith({ row: 0, col: 0 }, 5, [])
  })

  test('toggles notes mode', async () => {
    const onCellUpdate = vi.fn()
    const user = userEvent.setup()

    render(
      <SudokuGrid
        puzzle={mockPuzzle}
        userGrid={mockGrid}
        onCellUpdate={onCellUpdate}
      />
    )

    // Enable notes mode
    await user.click(screen.getByRole('radio', { name: /notes mode/i }))

    // Select first cell and input number
    await user.click(screen.getAllByRole('gridcell')[0])
    await user.click(screen.getByRole('button', { name: 'Input number 5' }))

    expect(onCellUpdate).toHaveBeenCalledWith({ row: 0, col: 0 }, undefined, [
      5,
    ])
  })

  test('displays cage sums', () => {
    render(
      <SudokuGrid
        puzzle={mockPuzzle}
        userGrid={mockGrid}
        onCellUpdate={() => {}}
      />
    )

    const cageSum = screen.getByLabelText('Cage sum 7')
    expect(cageSum).toBeInTheDocument()
    expect(cageSum).toHaveTextContent('7')
  })

  test('displays existing values and notes', () => {
    const filledGrid: UserGrid = Array(9)
      .fill(null)
      .map(() =>
        Array(9)
          .fill(null)
          .map(() => ({ value: undefined, notes: [] }))
      )
    filledGrid[0][0] = { value: 5, notes: [] }
    filledGrid[0][1] = { value: undefined, notes: [1, 2, 3] }

    render(
      <SudokuGrid
        puzzle={mockPuzzle}
        userGrid={filledGrid}
        onCellUpdate={() => {}}
      />
    )

    // Check main value
    const valueCell = screen.getByRole('gridcell', { name: /cell 1,1/i })
    expect(valueCell).toHaveTextContent('5')

    // Check notes
    const notesCell = screen.getByRole('gridcell', { name: /cell 1,2/i })
    const notesList = notesCell.querySelector('[role="list"]')
    expect(notesList).toBeInTheDocument()
    expect(notesList).toHaveTextContent('123')
  })
})
