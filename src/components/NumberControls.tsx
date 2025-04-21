import { Card } from '@/components/ui/card'

type NumberControlsProps = {
  onNumberInput: (num: number) => void
}

export function NumberControls({ onNumberInput }: NumberControlsProps) {
  return (
    <div
      className="grid grid-cols-9 gap-1"
      role="toolbar"
      aria-label="Number input"
    >
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <Card
          key={num}
          className="w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors"
          role="button"
          tabIndex={0}
          aria-label={`Input number ${num}`}
          onClick={() => onNumberInput(num)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onNumberInput(num)
            }
          }}
        >
          {num}
        </Card>
      ))}
    </div>
  )
}
