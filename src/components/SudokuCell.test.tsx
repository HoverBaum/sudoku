import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SudokuCell } from './SudokuCell'

describe('SudokuCell', () => {
  const defaultProps = {
    cell: { value: undefined, notes: [] },
    coord: { row: 0, col: 0 },
    isSelected: false,
    borders: { top: true, right: true, bottom: true, left: true },
    onClick: vi.fn(),
    onKeyDown: vi.fn(),
    showCageSum: false,
  }

  test('renders empty cell', () => {
    render(<SudokuCell {...defaultProps} />)
    expect(screen.getByRole('gridcell')).toBeInTheDocument()
  })

  test('renders value', () => {
    render(<SudokuCell {...defaultProps} cell={{ value: 5, notes: [] }} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  test('renders notes', () => {
    render(
      <SudokuCell
        {...defaultProps}
        cell={{ value: undefined, notes: [1, 2, 3] }}
      />
    )
    const notesList = screen.getByRole('list')
    expect(notesList).toBeInTheDocument()
    expect(notesList).toHaveTextContent('123')
  })

  test('renders cage sum', () => {
    render(
      <SudokuCell
        {...defaultProps}
        cage={{ cells: [{ row: 0, col: 0 }], sum: 7, id: '1' }}
        showCageSum={true}
      />
    )
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  test('handles click', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(<SudokuCell {...defaultProps} onClick={onClick} />)

    await user.click(screen.getByRole('gridcell'))
    expect(onClick).toHaveBeenCalledWith({ row: 0, col: 0 })
  })

  test('handles keydown', async () => {
    const onKeyDown = vi.fn()
    const user = userEvent.setup()
    render(<SudokuCell {...defaultProps} onKeyDown={onKeyDown} />)

    const cell = screen.getByRole('gridcell')
    await user.type(cell, '{Enter}')
    expect(onKeyDown).toHaveBeenCalled()
  })
})
