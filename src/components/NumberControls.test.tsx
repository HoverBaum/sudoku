import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NumberControls } from './NumberControls'
import type { UserGrid } from '@/types/game'

describe('NumberControls', () => {
  const createEmptyGrid = (): UserGrid =>
    Array(9)
      .fill(null)
      .map(() =>
        Array(9)
          .fill(null)
          .map(() => ({ value: undefined, notes: [] }))
      )

  test('renders number buttons 1-9', () => {
    render(
      <NumberControls onNumberInput={() => {}} userGrid={createEmptyGrid()} />
    )

    for (let i = 1; i <= 9; i++) {
      expect(
        screen.getByRole('button', { name: `Input number ${i}` })
      ).toBeInTheDocument()
    }
  })

  test('calls onNumberInput when button is clicked', async () => {
    const onNumberInput = vi.fn()
    const user = userEvent.setup()

    render(
      <NumberControls
        onNumberInput={onNumberInput}
        userGrid={createEmptyGrid()}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Input number 5' }))
    expect(onNumberInput).toHaveBeenCalledWith(5)
  })

  test('disables number that has been used 9 times', async () => {
    const onNumberInput = vi.fn()
    const user = userEvent.setup()
    const grid = createEmptyGrid()

    // Add number 5 nine times to the grid
    for (let i = 0; i < 9; i++) {
      grid[i][0].value = 5
    }

    render(<NumberControls onNumberInput={onNumberInput} userGrid={grid} />)

    const button = screen.getByRole('button', { name: 'Input number 5' })
    expect(button).toHaveAttribute('aria-disabled', 'true')

    // Try to click the disabled button
    await user.click(button)
    expect(onNumberInput).not.toHaveBeenCalled()
  })

  test('enables previously full number when a cell is cleared', async () => {
    const onNumberInput = vi.fn()
    const grid = createEmptyGrid()

    // Add number 5 nine times to the grid
    for (let i = 0; i < 9; i++) {
      grid[i][0].value = 5
    }

    const { rerender } = render(
      <NumberControls onNumberInput={onNumberInput} userGrid={grid} />
    )

    // Verify button is disabled
    expect(
      screen.getByRole('button', { name: 'Input number 5' })
    ).toHaveAttribute('aria-disabled', 'true')

    // Clear one cell
    grid[0][0].value = undefined

    // Re-render with updated grid
    rerender(<NumberControls onNumberInput={onNumberInput} userGrid={grid} />)

    // Verify button is now enabled
    expect(
      screen.getByRole('button', { name: 'Input number 5' })
    ).toHaveAttribute('aria-disabled', 'false')
  })
})
