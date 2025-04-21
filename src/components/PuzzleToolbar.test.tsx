import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PuzzleToolbar } from './PuzzleToolbar'

describe('PuzzleToolbar', () => {
  test('renders mode toggle and check solution button', () => {
    render(
      <PuzzleToolbar
        isNoteMode={false}
        onNoteModeChange={() => {}}
        onCheckSolution={() => {}}
      />
    )

    expect(
      screen.getByRole('radio', { name: /normal mode/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('radio', { name: /notes mode/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /check solution/i })
    ).toBeInTheDocument()
  })

  test('toggles between normal and notes mode', async () => {
    const onNoteModeChange = vi.fn()
    const user = userEvent.setup()

    render(
      <PuzzleToolbar
        isNoteMode={false}
        onNoteModeChange={onNoteModeChange}
        onCheckSolution={() => {}}
      />
    )

    await user.click(screen.getByRole('radio', { name: /notes mode/i }))
    expect(onNoteModeChange).toHaveBeenCalledWith(true)
  })

  test('calls onCheckSolution when check button is clicked', async () => {
    const onCheckSolution = vi.fn()
    const user = userEvent.setup()

    render(
      <PuzzleToolbar
        isNoteMode={false}
        onNoteModeChange={() => {}}
        onCheckSolution={onCheckSolution}
      />
    )

    await user.click(screen.getByRole('button', { name: /check solution/i }))
    expect(onCheckSolution).toHaveBeenCalled()
  })
})
