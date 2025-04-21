import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

type PuzzleToolbarProps = {
  isNoteMode: boolean
  onNoteModeChange: (isNoteMode: boolean) => void
  onCheckSolution: () => void
}

export function PuzzleToolbar({
  isNoteMode,
  onNoteModeChange,
  onCheckSolution,
}: PuzzleToolbarProps) {
  return (
    <div className="flex justify-between items-center gap-4 mb-4">
      <ToggleGroup
        type="single"
        value={isNoteMode ? 'notes' : 'normal'}
        onValueChange={(val) => onNoteModeChange(val === 'notes')}
        aria-label="Input mode"
      >
        <ToggleGroupItem value="normal" aria-label="Normal mode">
          Normal
        </ToggleGroupItem>
        <ToggleGroupItem value="notes" aria-label="Notes mode">
          Notes
        </ToggleGroupItem>
      </ToggleGroup>

      <Button
        variant="outline"
        size="sm"
        onClick={onCheckSolution}
        className="gap-2"
      >
        <Check className="h-4 w-4" />
        Check Solution
      </Button>
    </div>
  )
}
