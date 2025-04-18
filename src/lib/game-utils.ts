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
  difficulty: Difficulty
): Cage[] {
  const cellsInCages = new Set<string>()
  const cages: Cage[] = []
  let cageId = 1

  // Helper to check if a cell is available
  const isCellAvailable = (row: number, col: number) =>
    !cellsInCages.has(`${row},${col}`)

  // Helper to mark a cell as used
  const markCellUsed = (row: number, col: number) =>
    cellsInCages.add(`${row},${col}`)

  // Helper to get available neighbors
  const getAvailableNeighbors = (row: number, col: number): CellCoord[] => {
    const neighbors: CellCoord[] = []
    if (row > 0 && isCellAvailable(row - 1, col))
      neighbors.push({ row: row - 1, col })
    if (row < 8 && isCellAvailable(row + 1, col))
      neighbors.push({ row: row + 1, col })
    if (col > 0 && isCellAvailable(row, col - 1))
      neighbors.push({ row, col: col - 1 })
    if (col < 8 && isCellAvailable(row, col + 1))
      neighbors.push({ row, col: col + 1 })
    return neighbors
  }

  // Difficulty settings
  const maxCageSize =
    difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5
  const minCageSize = difficulty === 'easy' ? 2 : 1

  // Create cages until all cells are used
  while (cellsInCages.size < 81) {
    // Find first available cell
    let startCell: CellCoord | null = null
    for (let row = 0; row < 9 && !startCell; row++) {
      for (let col = 0; col < 9 && !startCell; col++) {
        if (isCellAvailable(row, col)) {
          startCell = { row, col }
        }
      }
    }

    if (!startCell) break

    // Create a new cage
    const cageCells: CellCoord[] = [startCell]
    markCellUsed(startCell.row, startCell.col)

    // Randomly grow the cage
    const targetSize = Math.min(
      minCageSize + Math.floor(random() * (maxCageSize - minCageSize + 1)),
      maxCageSize
    )

    while (cageCells.length < targetSize) {
      // Get all available neighbors for the current cage
      const allNeighbors = cageCells.flatMap((cell) =>
        getAvailableNeighbors(cell.row, cell.col)
      )
      if (allNeighbors.length === 0) break

      // Pick a random neighbor
      const nextCell = allNeighbors[Math.floor(random() * allNeighbors.length)]
      cageCells.push(nextCell)
      markCellUsed(nextCell.row, nextCell.col)
    }

    // Calculate the sum based on the solution
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

// Generate a puzzle from a seed and difficulty
export function generatePuzzle(
  seed: string,
  difficulty: Difficulty
): SumSudokuPuzzle {
  const random = mulberry32(hashCode(seed))

  // First generate a valid solution
  const solution = generateSolution(random)

  // Then create cages around it
  const cages = generateCages(solution, random, difficulty)

  return {
    seed,
    difficulty,
    cages,
    solution, // Include solution for validation
  }
}

// Validate if numbers in a 3x3 box are valid (no duplicates)
function validateBox(
  grid: UserGrid,
  startRow: number,
  startCol: number
): boolean {
  const seen = new Set<number>()
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const value = grid[startRow + i][startCol + j].value
      if (value) {
        if (seen.has(value)) return false
        seen.add(value)
      }
    }
  }
  return true
}

// Validate if a cage's sum is correct
function validateCage(grid: UserGrid, cage: Cage): boolean {
  let sum = 0
  const seen = new Set<number>()

  for (const { row, col } of cage.cells) {
    const value = grid[row][col].value
    if (!value) return false
    if (seen.has(value)) return false
    seen.add(value)
    sum += value
  }

  return sum === cage.sum
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
      for (let boxCol = 0; boxCol < 9; boxCol += 3) {
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
      const sum = values.reduce((acc, val) => acc + (val || 0), 0)
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
