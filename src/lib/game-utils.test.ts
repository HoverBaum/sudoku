import { describe, test, expect } from 'vitest'
import { generatePuzzle, validateGrid, createEmptyGrid } from './game-utils'
import type { SumSudokuPuzzle, UserGrid } from '@/types/game'

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
})
