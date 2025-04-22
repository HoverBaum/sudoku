import type {
  CellCoord,
  Cage,
  Difficulty,
  SumSudokuPuzzle,
  UserGrid,
} from '@/types/game'

// Seed-based random number generator for deterministic puzzle generation
function mulberry32(a: number) {
  return () => {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return hash
}

// Generate a valid Sudoku solution
function generateSolution(random: () => number): number[][] {
  const grid: number[][] = Array(9)
    .fill(null)
    .map(() => Array(9).fill(0))

  // Fill diagonal 3x3 boxes first (they are independent)
  for (let box = 0; box < 9; box += 3) {
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const idx = Math.floor(random() * nums.length)
        grid[box + i][box + j] = nums[idx]
        nums.splice(idx, 1)
      }
    }
  }

  // Solve the rest using backtracking
  solveSudoku(grid)
  return grid
}

// Check if a number is valid in a position
function isValid(
  grid: number[][],
  row: number,
  col: number,
  num: number
): boolean {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === num) return false
  }

  // Check column
  for (let y = 0; y < 9; y++) {
    if (grid[y][col] === num) return false
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3
  const boxCol = Math.floor(col / 3) * 3
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[boxRow + i][boxCol + j] === num) return false
    }
  }

  return true
}

// Solve the Sudoku grid using backtracking
function solveSudoku(grid: number[][]): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num
            if (solveSudoku(grid)) return true
            grid[row][col] = 0
          }
        }
        return false
      }
    }
  }
  return true
}

// Generate cages around a valid solution
function generateCages(
  solution: number[][],
  random: () => number,
  difficulty: Difficulty,
  offsets?: { offsetRow: number; offsetCol: number }
): Cage[] {
  const cellsInCages = new Set<string>()
  const cages: Cage[] = []
  let cageId = 1

  // Helper to check if a cell is available
  const isCellAvailable = (row: number, col: number) =>
    row >= 0 &&
    row < 9 &&
    col >= 0 &&
    col < 9 &&
    !cellsInCages.has(`${row},${col}`)

  // Helper to mark a cell as used
  const markCellUsed = (row: number, col: number) =>
    cellsInCages.add(`${row},${col}`)

  // Helper to check if adding a cell would create duplicates
  const wouldCreateDuplicates = (
    existingCells: CellCoord[],
    newCell: CellCoord
  ): boolean => {
    const newValue = solution[newCell.row][newCell.col]
    return existingCells.some(
      (cell) => solution[cell.row][cell.col] === newValue
    )
  }

  // Helper to get available neighbors that won't create duplicates
  const getAvailableNeighbors = (
    row: number,
    col: number,
    currentCells: CellCoord[] = []
  ): CellCoord[] => {
    const neighbors: CellCoord[] = []
    if (row > 0 && isCellAvailable(row - 1, col)) {
      const cell = { row: row - 1, col }
      if (!wouldCreateDuplicates(currentCells, cell)) {
        neighbors.push(cell)
      }
    }
    if (row < 8 && isCellAvailable(row + 1, col)) {
      const cell = { row: row + 1, col }
      if (!wouldCreateDuplicates(currentCells, cell)) {
        neighbors.push(cell)
      }
    }
    if (col > 0 && isCellAvailable(row, col - 1)) {
      const cell = { row, col: col - 1 }
      if (!wouldCreateDuplicates(currentCells, cell)) {
        neighbors.push(cell)
      }
    }
    if (col < 8 && isCellAvailable(row, col + 1)) {
      const cell = { row, col: col + 1 }
      if (!wouldCreateDuplicates(currentCells, cell)) {
        neighbors.push(cell)
      }
    }
    return neighbors
  }

  // Helper to find best starting point for a new cage
  const findStartingPoint = (): CellCoord | null => {
    const { offsetRow = 0, offsetCol = 0 } = offsets || {}

    // First try to find cells that have neighbors
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const row = (i + offsetRow) % 9
        const col = (j + offsetCol) % 9
        if (isCellAvailable(row, col)) {
          const neighbors = getAvailableNeighbors(row, col)
          if (neighbors.length > 0) {
            return { row, col }
          }
        }
      }
    }

    // If no cells with valid neighbors found, find any available cell
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const row = (i + offsetRow) % 9
        const col = (j + offsetCol) % 9
        if (isCellAvailable(row, col)) {
          return { row, col }
        }
      }
    }

    return null
  }

  // Difficulty settings
  const maxCageSize =
    difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5

  // Create cages until all cells are used
  while (cellsInCages.size < 81) {
    const startCell = findStartingPoint()
    if (!startCell) break

    // Mark the start cell
    markCellUsed(startCell.row, startCell.col)
    const cageCells = [startCell]

    // Try to grow the cage
    const neighbors = getAvailableNeighbors(
      startCell.row,
      startCell.col,
      cageCells
    )
    if (neighbors.length > 0) {
      // Normal case - we can grow the cage
      const nextCell = neighbors[Math.floor(random() * neighbors.length)]
      cageCells.push(nextCell)
      markCellUsed(nextCell.row, nextCell.col)

      // Try to grow further if possible
      const targetSize = Math.min(
        2 + Math.floor(random() * (maxCageSize - 1)),
        maxCageSize
      )

      // For easy difficulty, strictly enforce max size of 3
      const maxAllowedSize = difficulty === 'easy' ? 3 : maxCageSize

      while (
        cageCells.length < targetSize &&
        cageCells.length < maxAllowedSize
      ) {
        const allNeighbors = cageCells.flatMap((cell) =>
          getAvailableNeighbors(cell.row, cell.col, cageCells)
        )
        if (allNeighbors.length === 0) break

        const nextCell =
          allNeighbors[Math.floor(random() * allNeighbors.length)]
        cageCells.push(nextCell)
        markCellUsed(nextCell.row, nextCell.col)
      }
    } else {
      // Special case - no available neighbors, try to merge with an existing cage
      const adjacentCells = [
        { row: startCell.row - 1, col: startCell.col },
        { row: startCell.row + 1, col: startCell.col },
        { row: startCell.row, col: startCell.col - 1 },
        { row: startCell.row, col: startCell.col + 1 },
      ].filter(
        (n) =>
          n.row >= 0 &&
          n.row < 9 &&
          n.col >= 0 &&
          n.col < 9 &&
          !isCellAvailable(n.row, n.col)
      )

      if (adjacentCells.length === 0) {
        throw new Error('Unable to create a valid cage')
      }

      // Find all adjacent cages that won't create duplicates
      const adjacentCagesWithSizes = adjacentCells
        .map((cell) => {
          const cage = cages.find((c) =>
            c.cells.some(
              (ccell) => ccell.row === cell.row && ccell.col === cell.col
            )
          )
          return { cage, cell }
        })
        .filter(
          (item): item is { cage: Cage; cell: CellCoord } =>
            item.cage !== undefined &&
            !wouldCreateDuplicates(item.cage.cells, startCell)
        )

      if (adjacentCagesWithSizes.length === 0) {
        throw new Error(
          'Cannot merge cell with any adjacent cage without creating duplicates'
        )
      }

      // For easy mode, only allow merging with cages that won't exceed size 3
      if (difficulty === 'easy') {
        const validCages = adjacentCagesWithSizes.filter(
          ({ cage }) => cage.cells.length < 3
        )
        if (validCages.length > 0) {
          const { cage: existingCage } =
            validCages[Math.floor(random() * validCages.length)]
          existingCage.cells.push(startCell)
          existingCage.sum += solution[startCell.row][startCell.col]
          continue
        }
        throw new Error('Cannot create valid cage layout for easy mode')
      }

      // For medium/hard modes, randomly choose any valid adjacent cage
      const { cage: existingCage } =
        adjacentCagesWithSizes[
          Math.floor(random() * adjacentCagesWithSizes.length)
        ]
      existingCage.cells.push(startCell)
      existingCage.sum += solution[startCell.row][startCell.col]
      continue
    }

    // Calculate sum and add the cage
    const sum = cageCells.reduce(
      (acc, cell) => acc + solution[cell.row][cell.col],
      0
    )

    cages.push({
      cells: cageCells,
      sum,
      id: String(cageId++),
    })
  }

  return cages
}

// Generate pre-filled cells for the puzzle based on difficulty
function generatePreFilledCells(
  solution: number[][],
  random: () => number,
  difficulty: Difficulty
): { row: number; col: number; value: number }[] {
  // Return empty array for hardcore mode - no pre-filled cells
  if (difficulty === 'hardcore') return []

  const cells: { row: number; col: number; value: number }[] = []
  // Number of cells to reveal based on difficulty
  const numCells =
    difficulty === 'easy' ? 35 : difficulty === 'medium' ? 25 : 15

  // Create a list of all possible cells
  const allCells = []
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      allCells.push({ row, col, value: solution[row][col] })
    }
  }

  // Randomly select cells to reveal
  while (cells.length < numCells && allCells.length > 0) {
    const idx = Math.floor(random() * allCells.length)
    cells.push(allCells[idx])
    allCells.splice(idx, 1)
  }

  return cells
}

export function generatePuzzle(
  seed: string,
  difficulty: Difficulty
): SumSudokuPuzzle {
  const random = mulberry32(hashCode(seed))
  const solution = generateSolution(random)

  // Try multiple times to generate valid cages with different offsets
  let attempts = 0
  const MAX_ATTEMPTS = 50 // Increased from 20 to give more chances to find valid cages
  let cages: Cage[] | undefined

  while (attempts < MAX_ATTEMPTS && !cages) {
    try {
      // Use attempt number to offset starting position and modify the random function
      const offsetRow = attempts % 3
      const offsetCol = Math.floor(attempts / 3) % 3
      const offsetRandom = () => {
        // Modify random value based on attempt to get different patterns
        const r = random()
        return (r + attempts / MAX_ATTEMPTS) % 1
      }

      cages = generateCages(solution, offsetRandom, difficulty, {
        offsetRow,
        offsetCol,
      })
    } catch (e) {
      attempts++
      console.debug(`Attempt ${attempts}: Failed `, e)
      // Keep trying with different offsets
      continue
    }
  }

  if (!cages) {
    throw new Error('Unable to generate a valid puzzle after multiple attempts')
  }

  const preFilledCells = generatePreFilledCells(solution, random, difficulty)

  return {
    seed,
    difficulty,
    cages,
    solution,
    preFilledCells,
  }
}

// Validate the entire grid
export function validateGrid(
  userGrid: UserGrid,
  puzzle: SumSudokuPuzzle
): boolean {
  type ValidationRule = (grid: UserGrid) => boolean

  const validateRows: ValidationRule = (grid) => {
    for (let row = 0; row < 9; row++) {
      const seen = new Set<number>()
      for (let col = 0; col < 9; col++) {
        const value = grid[row][col].value
        if (value && seen.has(value)) return false
        if (value) seen.add(value)
      }
    }
    return true
  }

  const validateColumns: ValidationRule = (grid) => {
    for (let col = 0; col < 9; col++) {
      const seen = new Set<number>()
      for (let row = 0; row < 9; row++) {
        const value = grid[row][col].value
        if (value && seen.has(value)) return false
        if (value) seen.add(value)
      }
    }
    return true
  }

  const validateBoxes: ValidationRule = (grid) => {
    for (let boxRow = 0; boxRow < 9; boxRow += 3) {
      for (let boxCol = 0; boxCol < 3; boxCol += 3) {
        const seen = new Set<number>()
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            const value = grid[boxRow + i][boxCol + j].value
            if (value && seen.has(value)) return false
            if (value) seen.add(value)
          }
        }
      }
    }
    return true
  }

  const validateCageSums = (
    grid: UserGrid,
    puzzle: SumSudokuPuzzle
  ): boolean => {
    return puzzle.cages.every((cage) => {
      const values = cage.cells.map((cell) => grid[cell.row][cell.col].value)
      const allFilled = values.every((value) => value !== undefined)
      if (!allFilled) return true // Skip incomplete cages

      // Check for duplicates within the cage
      const filledValues = values.filter((v): v is number => v !== undefined)
      const uniqueValues = new Set(filledValues)
      if (uniqueValues.size !== filledValues.length) return false

      // Check sum
      const sum = filledValues.reduce((acc, val) => acc + val, 0)
      return sum === cage.sum
    })
  }

  return (
    validateRows(userGrid) &&
    validateColumns(userGrid) &&
    validateBoxes(userGrid) &&
    validateCageSums(userGrid, puzzle)
  )
}

// Create an empty user grid
export function createEmptyGrid(): UserGrid {
  return Array(9)
    .fill(null)
    .map(() =>
      Array(9)
        .fill(null)
        .map(() => ({ value: undefined, notes: [] }))
    )
}
