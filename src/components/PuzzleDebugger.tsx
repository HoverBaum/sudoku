import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { SumSudokuPuzzle } from '@/types/game'

type PuzzleDebuggerProps = {
  puzzle: SumSudokuPuzzle
}

export function PuzzleDebugger({ puzzle }: PuzzleDebuggerProps) {
  const [selectedTab, setSelectedTab] = useState<'solution' | 'cages'>(
    'solution'
  )

  // Create a color map for cages
  const cageColors = puzzle.cages.reduce((acc, cage, index) => {
    const hue = (index * 137.508) % 360 // Golden angle to distribute colors
    acc[cage.id!] = `hsl(${hue}, 70%, 85%)`
    return acc
  }, {} as Record<string, string>)

  // Find which cage a cell belongs to
  const getCage = (row: number, col: number) =>
    puzzle.cages.find((cage) =>
      cage.cells.some((cell) => cell.row === row && cell.col === col)
    )

  return (
    <div className="flex flex-col gap-4 p-4">
      <Tabs
        value={selectedTab}
        onValueChange={(v) => setSelectedTab(v as typeof selectedTab)}
      >
        <TabsList>
          <TabsTrigger value="solution">Solution</TabsTrigger>
          <TabsTrigger value="cages">Cages</TabsTrigger>
        </TabsList>

        <TabsContent value="solution" className="mt-4">
          <div className="grid grid-cols-9 gap-0 bg-muted p-1 rounded-lg">
            {Array(9)
              .fill(null)
              .map((_, row) =>
                Array(9)
                  .fill(null)
                  .map((_, col) => {
                    const cage = getCage(row, col)
                    return (
                      <Card
                        key={`${row}-${col}`}
                        className={cn(
                          'w-12 h-12 flex items-center justify-center relative',
                          'text-xl font-medium'
                        )}
                        style={{
                          backgroundColor: cage
                            ? cageColors[cage.id!]
                            : undefined,
                        }}
                      >
                        {puzzle.solution?.[row][col]}
                      </Card>
                    )
                  })
              )}
          </div>
        </TabsContent>

        <TabsContent value="cages" className="mt-4">
          <div className="space-y-4">
            {puzzle.cages.map((cage) => (
              <div
                key={cage.id}
                className="flex items-center gap-4"
                style={{ backgroundColor: cageColors[cage.id!] }}
              >
                <div className="p-2 rounded">
                  <span className="font-medium">Sum: {cage.sum}</span>
                  <span className="ml-4">
                    Cells:{' '}
                    {cage.cells.map((c) => `(${c.row},${c.col})`).join(', ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
