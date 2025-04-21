import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NumberControls } from './NumberControls'

describe('NumberControls', () => {
  test('renders number buttons 1-9', () => {
    render(<NumberControls onNumberInput={() => {}} />)

    for (let i = 1; i <= 9; i++) {
      expect(
        screen.getByRole('button', { name: `Input number ${i}` })
      ).toBeInTheDocument()
    }
  })

  test('calls onNumberInput when button is clicked', async () => {
    const onNumberInput = vi.fn()
    const user = userEvent.setup()

    render(<NumberControls onNumberInput={onNumberInput} />)

    await user.click(screen.getByRole('button', { name: 'Input number 5' }))
    expect(onNumberInput).toHaveBeenCalledWith(5)
  })

  test('calls onNumberInput when Enter key is pressed', async () => {
    const onNumberInput = vi.fn()
    const user = userEvent.setup()

    render(<NumberControls onNumberInput={onNumberInput} />)

    const button = screen.getByRole('button', { name: 'Input number 5' })
    button.focus()
    await user.keyboard('{Enter}')

    expect(onNumberInput).toHaveBeenCalledWith(5)
  })

  test('calls onNumberInput when Space key is pressed', async () => {
    const onNumberInput = vi.fn()
    const user = userEvent.setup()

    render(<NumberControls onNumberInput={onNumberInput} />)

    const button = screen.getByRole('button', { name: 'Input number 5' })
    button.focus()
    await user.keyboard(' ')

    expect(onNumberInput).toHaveBeenCalledWith(5)
  })
})
