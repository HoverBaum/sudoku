import { Card } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

type NumberControlsProps = {
  isNoteMode: boolean
  onNoteModeChange: (isNoteMode: boolean) => void
  onNumberInput: (num: number) => void
}

export function NumberControls({
  isNoteMode,
  onNoteModeChange,
  onNumberInput,
}: NumberControlsProps) {
  return (
    <div className="flex flex-col gap-2" role="group" aria-label="Controls">
      <ToggleGroup
        type="single"
        value={isNoteMode ? 'notes' : 'normal'}
        onValueChange={(val) => onNoteModeChange(val === 'notes')}
        className="mb-2"
        aria-label="Input mode"
      >
        <ToggleGroupItem value="normal" aria-label="Normal mode">
          Normal
        </ToggleGroupItem>
        <ToggleGroupItem value="notes" aria-label="Notes mode">
          Notes
        </ToggleGroupItem>
      </ToggleGroup>

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
    </div>
  )
}
