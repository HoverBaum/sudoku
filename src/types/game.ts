export type CellCoord = {
  row: number // 0-indexed
  col: number // 0-indexed
}

export type Cage = {
  sum: number
  cells: CellCoord[]
  id?: string
}

export type Difficulty = 'easy' | 'medium' | 'hard'

export type SumSudokuPuzzle = {
  seed: string
  difficulty: Difficulty
  cages: Cage[]
  solution?: number[][] // Optional, 9x9 grid of digits 1-9
}

export type UserCell = {
  value?: number
  notes?: number[]
}

export type UserGrid = UserCell[][] // 9x9

export type UserProgress = {
  puzzleSeed: string
  difficulty: Difficulty
  grid: UserGrid
  lastUpdated: number
}
