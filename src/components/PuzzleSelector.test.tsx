import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PuzzleSelector } from './PuzzleSelector'

describe('PuzzleSelector', () => {
  test('opens dialog on button click', async () => {
    const user = userEvent.setup()
    render(<PuzzleSelector onPuzzleSelect={() => {}} />)

    await user.click(screen.getByRole('button', { name: /new puzzle/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  test('allows manual seed input', async () => {
    const onPuzzleSelect = vi.fn()
    const user = userEvent.setup()
    render(<PuzzleSelector onPuzzleSelect={onPuzzleSelect} />)

    await user.click(screen.getByRole('button', { name: /new puzzle/i }))
    await user.type(screen.getByLabelText(/puzzle seed/i), 'test123')
    await user.click(screen.getByRole('button', { name: /play/i }))

    expect(onPuzzleSelect).toHaveBeenCalledWith('test123', 'medium')
  })

  test('uses random seed if none provided', async () => {
    const onPuzzleSelect = vi.fn()
    const user = userEvent.setup()
    render(<PuzzleSelector onPuzzleSelect={onPuzzleSelect} />)

    await user.click(screen.getByRole('button', { name: /new puzzle/i }))
    await user.click(screen.getByRole('button', { name: /play/i }))

    expect(onPuzzleSelect).toHaveBeenCalled()
    const [seed] = onPuzzleSelect.mock.calls[0]
    expect(seed).toMatch(/^[a-z0-9]{6}$/)
  })

  test('shows loading state during puzzle generation', async () => {
    const onPuzzleSelect = vi.fn(
      () => new Promise((resolve) => setTimeout(resolve, 50))
    )
    const user = userEvent.setup()
    render(<PuzzleSelector onPuzzleSelect={onPuzzleSelect} />)

    await user.click(screen.getByRole('button', { name: /new puzzle/i }))
    await user.click(screen.getByRole('button', { name: /play/i }))

    expect(
      screen.getByRole('button', { name: /generating/i })
    ).toBeInTheDocument()
  })
})
