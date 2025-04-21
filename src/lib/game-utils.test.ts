import { describe, test, expect } from 'vitest'
import { generatePuzzle, validateGrid, createEmptyGrid } from './game-utils'
import type {
  SumSudokuPuzzle,
  UserGrid,
  CellCoord,
  Difficulty,
} from '@/types/game'

describe('generatePuzzle', () => {
  test('generates deterministic puzzles from the same seed', () => {
    const puzzle1 = generatePuzzle('test123', 'medium')
    const puzzle2 = generatePuzzle('test123', 'medium')
    expect(puzzle1.cages).toEqual(puzzle2.cages)
    expect(puzzle1.solution).toEqual(puzzle2.solution)
  })

  test('generates different puzzles from different seeds', () => {
    const puzzle1 = generatePuzzle('test123', 'medium')
    const puzzle2 = generatePuzzle('test456', 'medium')
    expect(puzzle1.cages).not.toEqual(puzzle2.cages)
    expect(puzzle1.solution).not.toEqual(puzzle2.solution)
  })

  test('respects difficulty settings for cage sizes', () => {
    const easyPuzzle = generatePuzzle('test', 'easy')
    const hardPuzzle = generatePuzzle('test', 'hard')

    // Easy puzzles should have smaller cages
    expect(easyPuzzle.cages.every((cage) => cage.cells.length <= 3)).toBe(true)

    // Hard puzzles can have larger cages
    expect(hardPuzzle.cages.some((cage) => cage.cells.length > 3)).toBe(true)
  })

  test('never generates single-cell cages', () => {
    // Test multiple difficulties and seeds
    const difficulties: Difficulty[] = ['easy', 'medium', 'hard']
    const seeds = ['test1', 'test2', 'test3', 'test4', 'test5']

    for (const difficulty of difficulties) {
      for (const seed of seeds) {
        const puzzle = generatePuzzle(seed, difficulty)
        expect(
          puzzle.cages.every((cage) => cage.cells.length >= 2),
          `Found single-cell cage in ${difficulty} puzzle with seed ${seed}`
        ).toBe(true)
      }
    }
  })

  test('generates connected cages', () => {
    const puzzle = generatePuzzle('test123', 'medium')

    // Helper to check if cells are adjacent
    const areAdjacent = (cell1: CellCoord, cell2: CellCoord) => {
      const rowDiff = Math.abs(cell1.row - cell2.row)
      const colDiff = Math.abs(cell1.col - cell2.col)
      return (
        (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)
      )
    }

    // For each cage, verify that all cells are connected
    puzzle.cages.forEach((cage) => {
      const { cells } = cage
      const visited = new Set<string>()
      const toVisit = [cells[0]]

      // Flood fill from first cell
      while (toVisit.length > 0) {
        const cell = toVisit.pop()!
        const key = `${cell.row},${cell.col}`
        if (!visited.has(key)) {
          visited.add(key)
          // Add all adjacent cells that are in the cage
          cells
            .filter(
              (c) => !visited.has(`${c.row},${c.col}`) && areAdjacent(cell, c)
            )
            .forEach((c) => toVisit.push(c))
        }
      }

      // All cells should have been visited
      expect(visited.size, 'Found disconnected cells in cage').toBe(
        cells.length
      )
    })
  })
})

describe('validateGrid', () => {
  test('validates a correct solution', () => {
    const testPuzzle: SumSudokuPuzzle = {
      seed: 'test',
      difficulty: 'medium',
      cages: [
        {
          sum: 3,
          cells: [
            { row: 0, col: 0 },
            { row: 0, col: 1 },
          ],
          id: '1',
        },
      ],
      solution: [
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
        [4, 5, 6, 7, 8, 9, 1, 2, 3],
        [7, 8, 9, 1, 2, 3, 4, 5, 6],
        [2, 3, 1, 5, 6, 4, 8, 9, 7],
        [5, 6, 4, 8, 9, 7, 2, 3, 1],
        [8, 9, 7, 2, 3, 1, 5, 6, 4],
        [3, 1, 2, 6, 4, 5, 9, 7, 8],
        [6, 4, 5, 9, 7, 8, 3, 1, 2],
        [9, 7, 8, 3, 1, 2, 6, 4, 5],
      ],
      preFilledCells: [],
    }

    const userGrid: UserGrid = testPuzzle.solution!.map((row) =>
      row.map((value) => ({ value, notes: [] }))
    )

    expect(validateGrid(userGrid, testPuzzle)).toBe(true)
  })

  test('detects invalid cage sums', () => {
    const testPuzzle: SumSudokuPuzzle = {
      seed: 'test',
      difficulty: 'medium',
      cages: [
        {
          sum: 3,
          cells: [
            { row: 0, col: 0 },
            { row: 0, col: 1 },
          ],
          id: '1',
        },
      ],
      solution: [
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
        [4, 5, 6, 7, 8, 9, 1, 2, 3],
        [7, 8, 9, 1, 2, 3, 4, 5, 6],
        [2, 3, 1, 5, 6, 4, 8, 9, 7],
        [5, 6, 4, 8, 9, 7, 2, 3, 1],
        [8, 9, 7, 2, 3, 1, 5, 6, 4],
        [3, 1, 2, 6, 4, 5, 9, 7, 8],
        [6, 4, 5, 9, 7, 8, 3, 1, 2],
        [9, 7, 8, 3, 1, 2, 6, 4, 5],
      ],
      preFilledCells: [],
    }

    const userGrid: UserGrid = testPuzzle.solution!.map((row) =>
      row.map((value) => ({ value, notes: [] }))
    )

    // Change values to make cage sum incorrect
    userGrid[0][0].value = 9
    userGrid[0][1].value = 8

    expect(validateGrid(userGrid, testPuzzle)).toBe(false)
  })

  test('detects duplicate values in a row', () => {
    const puzzle = generatePuzzle('test123', 'medium')
    const userGrid: UserGrid = createEmptyGrid()

    // Add duplicate values in a row
    userGrid[0][0].value = 1
    userGrid[0][1].value = 1

    expect(validateGrid(userGrid, puzzle)).toBe(false)
  })

  test('detects duplicate values in a column', () => {
    const puzzle = generatePuzzle('test123', 'medium')
    const userGrid: UserGrid = createEmptyGrid()

    // Add duplicate values in a column
    userGrid[0][0].value = 1
    userGrid[1][0].value = 1

    expect(validateGrid(userGrid, puzzle)).toBe(false)
  })

  test('detects duplicate values in a 3x3 box', () => {
    const puzzle = generatePuzzle('test123', 'medium')
    const userGrid: UserGrid = createEmptyGrid()

    // Add duplicate values in a 3x3 box
    userGrid[0][0].value = 1
    userGrid[1][1].value = 1

    expect(validateGrid(userGrid, puzzle)).toBe(false)
  })

  test('detects duplicate values within a cage', () => {
    const testPuzzle: SumSudokuPuzzle = {
      seed: 'test',
      difficulty: 'medium',
      cages: [
        {
          sum: 8,
          cells: [
            { row: 0, col: 0 },
            { row: 0, col: 1 },
            { row: 0, col: 2 },
          ],
          id: '1',
        },
      ],
      solution: [
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
        [4, 5, 6, 7, 8, 9, 1, 2, 3],
        [7, 8, 9, 1, 2, 3, 4, 5, 6],
        [2, 3, 1, 5, 6, 4, 8, 9, 7],
        [5, 6, 4, 8, 9, 7, 2, 3, 1],
        [8, 9, 7, 2, 3, 1, 5, 6, 4],
        [3, 1, 2, 6, 4, 5, 9, 7, 8],
        [6, 4, 5, 9, 7, 8, 3, 1, 2],
        [9, 7, 8, 3, 1, 2, 6, 4, 5],
      ],
      preFilledCells: [],
    }

    const userGrid: UserGrid = createEmptyGrid()
    // Put duplicate value 4 in the cage
    userGrid[0][0].value = 4
    userGrid[0][1].value = 4
    userGrid[0][2].value = undefined

    expect(validateGrid(userGrid, testPuzzle)).toBe(false)
  })
})

describe('generated puzzle properties', () => {
  test('all cells are included in exactly one cage', () => {
    const puzzle = generatePuzzle('test123', 'medium')
    const coveredCells = new Set<string>()

    // Check that each cell is covered
    puzzle.cages.forEach((cage) => {
      cage.cells.forEach((cell) => {
        const key = `${cell.row},${cell.col}`
        expect(coveredCells.has(key)).toBe(false) // Cell shouldn't be covered yet
        coveredCells.add(key)
      })
    })

    // Check that all cells are covered
    expect(coveredCells.size).toBe(81)
  })

  test('solution is valid according to Sudoku rules', () => {
    const puzzle = generatePuzzle('test123', 'medium')
    const solution = puzzle.solution!

    // Check rows
    for (let row = 0; row < 9; row++) {
      const seen = new Set(solution[row])
      expect(seen.size).toBe(9)
    }

    // Check columns
    for (let col = 0; col < 9; col++) {
      const seen = new Set(solution.map((row) => row[col]))
      expect(seen.size).toBe(9)
    }

    // Check 3x3 boxes
    for (let boxRow = 0; boxRow < 9; boxRow += 3) {
      for (let boxCol = 0; boxCol < 9; boxCol += 3) {
        const seen = new Set()
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            seen.add(solution[boxRow + i][boxCol + j])
          }
        }
        expect(seen.size).toBe(9)
      }
    }
  })

  test('cages never contain duplicate numbers', () => {
    const difficulties: Difficulty[] = ['easy', 'medium', 'hard']
    const seeds = ['test1', 'test2', 'test3']

    for (const difficulty of difficulties) {
      for (const seed of seeds) {
        const puzzle = generatePuzzle(seed, difficulty)

        // Check each cage for duplicates
        puzzle.cages.forEach((cage) => {
          const values = cage.cells.map(
            (cell) => puzzle.solution![cell.row][cell.col]
          )
          const uniqueValues = new Set(values)
          expect(
            uniqueValues.size,
            `Found duplicate numbers in cage with seed ${seed} and difficulty ${difficulty}`
          ).toBe(values.length)
        })
      }
    }
  })

  test('cages sum values match solution', () => {
    const puzzle = generatePuzzle('test123', 'medium')

    puzzle.cages.forEach((cage) => {
      const sum = cage.cells.reduce(
        (acc, cell) => acc + puzzle.solution![cell.row][cell.col],
        0
      )
      expect(sum).toBe(cage.sum)
    })
  })
})
