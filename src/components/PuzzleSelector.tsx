import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
  DrawerFooter,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useIsMobile } from '@/hooks/use-mobile'
import { useSidebar } from '@/components/ui/sidebar'
import type { Difficulty } from '@/types/game'

type PuzzleSelectorProps = {
  onPuzzleSelect: (seed: string, difficulty: Difficulty) => void
}

function PuzzleContent({
  seed,
  setSeed,
  difficulty,
  setDifficulty,
  isLoading,
  generateRandomSeed,
  onSubmit,
}: {
  seed: string
  setSeed: (seed: string) => void
  difficulty: Difficulty
  setDifficulty: (difficulty: Difficulty) => void
  isLoading: boolean
  generateRandomSeed: () => void
  onSubmit: (e: React.FormEvent) => Promise<void>
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="seed">Seed</Label>
        <div className="flex gap-2">
          <Input
            id="seed"
            name="seed"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder="Enter seed or generate random"
            disabled={isLoading}
            aria-label="Puzzle seed"
            autoComplete="off"
          />
          <Button
            type="button"
            onClick={generateRandomSeed}
            variant="outline"
            disabled={isLoading}
          >
            Random
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="difficulty">Difficulty</Label>
        <Select
          value={difficulty}
          onValueChange={(value: Difficulty) => setDifficulty(value)}
          disabled={isLoading}
          name="difficulty"
        >
          <SelectTrigger id="difficulty" aria-label="Difficulty">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
            <SelectItem value="hardcore">Hardcore</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Play'}
      </Button>
    </form>
  )
}

export function PuzzleSelector({ onPuzzleSelect }: PuzzleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [seed, setSeed] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [isLoading, setIsLoading] = useState(false)
  const isMobile = useIsMobile()
  const { setOpenMobile, setOpen } = useSidebar()

  const generateRandomSeed = () => {
    const randomSeed = Math.random().toString(36).substring(2, 8)
    setSeed(randomSeed)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const finalSeed = seed || Math.random().toString(36).substring(2, 8)
      await onPuzzleSelect(finalSeed, difficulty)
      setIsOpen(false)
      setOpen(false) // Close the desktop sidebar
      setOpenMobile(false) // Close the mobile sidebar
    } finally {
      setIsLoading(false)
    }
  }

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline" className="w-full">
            New Puzzle
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Start New Puzzle</DrawerTitle>
            <DrawerDescription>
              Choose a difficulty level and optionally enter a seed to generate
              a specific puzzle. The same seed and difficulty will always
              generate the same puzzle.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4">
            <PuzzleContent
              seed={seed}
              setSeed={setSeed}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              isLoading={isLoading}
              generateRandomSeed={generateRandomSeed}
              onSubmit={handleSubmit}
            />
          </div>
          <DrawerFooter className="pt-2">
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          New Puzzle
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start New Puzzle</DialogTitle>
          <DialogDescription>
            Choose a difficulty level and optionally enter a seed to generate a
            specific puzzle. The same seed and difficulty will always generate
            the same puzzle.
          </DialogDescription>
        </DialogHeader>
        <PuzzleContent
          seed={seed}
          setSeed={setSeed}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          isLoading={isLoading}
          generateRandomSeed={generateRandomSeed}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}
