import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NumberControls } from './NumberControls'

describe('NumberControls', () => {
  const defaultProps = {
    isNoteMode: false,
    onNoteModeChange: vi.fn(),
    onNumberInput: vi.fn(),
  }

  test('renders number buttons', () => {
    render(<NumberControls {...defaultProps} />)
    ;[1, 2, 3, 4, 5, 6, 7, 8, 9].forEach((num) => {
      expect(
        screen.getByRole('button', { name: `Input number ${num}` })
      ).toBeInTheDocument()
    })
  })

  test('handles number input', async () => {
    const onNumberInput = vi.fn()
    const user = userEvent.setup()
    render(<NumberControls {...defaultProps} onNumberInput={onNumberInput} />)

    await user.click(screen.getByRole('button', { name: 'Input number 5' }))
    expect(onNumberInput).toHaveBeenCalledWith(5)
  })

  test('toggles note mode', async () => {
    const onNoteModeChange = vi.fn()
    const user = userEvent.setup()
    render(
      <NumberControls {...defaultProps} onNoteModeChange={onNoteModeChange} />
    )

    await user.click(screen.getByRole('radio', { name: /notes mode/i }))
    expect(onNoteModeChange).toHaveBeenCalledWith(true)
  })

  test('renders correct mode state', () => {
    render(<NumberControls {...defaultProps} isNoteMode={true} />)
    expect(screen.getByRole('radio', { name: /notes mode/i })).toHaveAttribute(
      'aria-checked',
      'true'
    )
    expect(screen.getByRole('radio', { name: /normal mode/i })).toHaveAttribute(
      'aria-checked',
      'false'
    )
  })
})
