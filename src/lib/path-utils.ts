import type { CageBoundary } from '@/types/game'

type PathCommand = {
  command: string
  x: number
  y: number
}

function parsePathCommands(path: string): PathCommand[] {
  const commands: PathCommand[] = []
  const parts = path.match(/[ML][^ML]*/g) || []

  parts.forEach((part) => {
    const command = part[0]
    const coords = part.slice(1).trim().split(',')
    commands.push({
      command,
      x: parseFloat(coords[0]),
      y: parseFloat(coords[1]),
    })
  })

  return commands
}

function pathCommandsToString(commands: PathCommand[]): string {
  return commands.map((cmd) => `${cmd.command}${cmd.x},${cmd.y}`).join(' ')
}

function arePointsEqual(a: PathCommand, b: PathCommand): boolean {
  const epsilon = 0.0001 // Small tolerance for floating point comparison
  return Math.abs(a.x - b.x) < epsilon && Math.abs(a.y - b.y) < epsilon
}

export function optimizeCagePaths(cage: CageBoundary): CageBoundary {
  const { paths } = cage
  const optimizedPaths = [...paths]
  let didMerge = true

  while (didMerge) {
    didMerge = false

    for (let i = 0; i < optimizedPaths.length; i++) {
      const pathA = optimizedPaths[i]
      if (!pathA) continue

      const commandsA = parsePathCommands(pathA)
      if (commandsA.length === 0) continue

      for (let j = i + 1; j < optimizedPaths.length; j++) {
        const pathB = optimizedPaths[j]
        if (!pathB) continue

        const commandsB = parsePathCommands(pathB)
        if (commandsB.length === 0) continue

        // Check if paths can be merged
        const endA = commandsA[commandsA.length - 1]
        const startB = commandsB[0]
        const endB = commandsB[commandsB.length - 1]
        const startA = commandsA[0]

        if (arePointsEqual(endA, startB)) {
          // Merge B onto end of A
          const mergedCommands = [...commandsA, ...commandsB.slice(1)]
          optimizedPaths[i] = pathCommandsToString(mergedCommands)
          optimizedPaths.splice(j, 1)
          didMerge = true
          break
        } else if (arePointsEqual(endB, startA)) {
          // Merge A onto end of B
          const mergedCommands = [...commandsB, ...commandsA.slice(1)]
          optimizedPaths[i] = pathCommandsToString(mergedCommands)
          optimizedPaths.splice(j, 1)
          didMerge = true
          break
        }
      }

      if (didMerge) break
    }
  }

  return {
    ...cage,
    paths: optimizedPaths,
  }
}
