# Sum Sudoku (Killer Sudoku) – Frontend Specification

A fully client-side Sum Sudoku web app. Users can play puzzles generated from a seed and difficulty combination. Their progress is saved locally and shareable via URL. No backend required.

Component library: **Shadcn UI** (https://ui.shadcn.com/)

---

## ✨ Features

- Deterministic puzzle generation from seed + difficulty
- Fully client-side (React + TypeScript + Shadcn UI)
- LocalStorage for progress persistence
- URL-based puzzle sharing
- Pencil marks / note mode
- Difficulty selection
- Responsive, modern UI

---

## 📦 Data Structures

### `CellCoord`
```ts
type CellCoord = { row: number; col: number }; // 0-indexed
```

### `Cage`
```ts
type Cage = {
  sum: number;
  cells: CellCoord[];
  id?: string;
};
```

### `SumSudokuPuzzle`
```ts
type SumSudokuPuzzle = {
  seed: string;
  difficulty: "easy" | "medium" | "hard";
  cages: Cage[];
  solution?: number[][]; // Optional, 9x9 grid of digits 1-9
};
```

### `UserCell` and `UserGrid`
```ts
type UserCell = {
  value?: number;
  notes?: number[];
};

type UserGrid = UserCell[][]; // 9x9
```

### `UserProgress`
```ts
type UserProgress = {
  puzzleSeed: string;
  difficulty: "easy" | "medium" | "hard";
  grid: UserGrid;
  lastUpdated: number;
};
```

---

## ✅ User Stories & Tasks

### Puzzle Generation
- [x] As a user, I want to enter a custom seed and choose a difficulty to generate a puzzle.
- [x] As a user, I want to click a button to generate a random puzzle.
- [x] As a dev, I want `generatePuzzle(seed, difficulty)` to produce a valid, reproducible puzzle.
- [ ] As a dev, I want cage generation to result in a logically solvable puzzle without guessing.
- [x] As a dev, I want to visually debug generated puzzles (implemented via PuzzleDebugger).

### Puzzle Solving
- [x] As a user, I want to click cells and type numbers (1–9).
- [x] As a user, I want to switch to note mode and enter multiple notes per cell.
- [x] As a user, I want to erase a cell or clear its notes.
- [x] As a user, I want to see visual cage borders and sums.
- [x] As a user, I want duplicate values and cage sum issues to be optionally highlighted.
- [x] As a user, I want to check if my solution is correct.

### UI: Puzzle Selector
- [x] As a user, I want a sidebar or modal to:
  - [x] Enter a seed manually
  - [x] Choose a difficulty (easy, medium, hard)
  - [x] Generate a random puzzle
  - [x] Start a puzzle via "Play" button
- [x] Use Shadcn `Input`, `Select`, `Button`, `Dialog` for this UI

### State Persistence
- [x] As a user, I want my progress to auto-save to localStorage.
- [x] As a user, I want my progress restored on reload for the same puzzle.
- [x] As a dev, I want to store progress in `localStorage` using `sumSudoku:progress:<seed>:<difficulty>`.

### Puzzle Sharing
- [x] As a user, I want to copy a link to share my current puzzle and progress.
- [x] As a dev, I want to encode `UserGrid` into a compact URL-safe format.
- [x] As a dev, I want to support URL format:
  ```
  /?seed=abc123&difficulty=medium&state=<encodedGrid>
  ```
- [x] As a user, I want shared links to override localStorage state.

### Validation
- [x] As a dev, I want `validateGrid(grid, puzzle)` to check:
  - [x] Rows, columns, 3x3 boxes
  - [x] Cage sums
  - [x] No duplicates within a cage

---

## 🧱 Architecture

### Core Functions
- [x] `generatePuzzle(seed: string, difficulty: Difficulty): SumSudokuPuzzle`
- [x] `validateGrid(grid: UserGrid, puzzle: SumSudokuPuzzle): boolean`
- [x] `saveProgress(progress: UserProgress): void`
- [x] `loadProgress(seed: string, difficulty: Difficulty): UserProgress | null`
- [x] `encodeGrid(grid: UserGrid): string`
- [x] `decodeGrid(str: string): UserGrid`

---

## 🧩 UI Components (with Shadcn UI)

### Puzzle Selector
- `Input` for seed
- `Select` for difficulty
- `Button` to generate
- `Dialog` or `Sheet` for settings overlay

### Grid & Cells
- Grid layout with 9x9 cells
- Each `Cell` should handle:
  - Single number
  - Note mode
  - Highlighting for cages, conflicts, and errors
- Cage borders drawn dynamically (canvas overlay or CSS)

### Toolbar
- Buttons:
  - 1–9 (input)
  - Note toggle
  - Erase
  - Undo/redo (optional)
  - Check solution
  - Share

### Share Link
- Input + copy button (`Input`, `Button`, `Toast` for feedback)

---

## 🧪 Testing Stories

### Unit Tests
- [x] Test `generatePuzzle()` for deterministic output
- [x] Test cage creation logic (basic coverage)
- [x] Test `validateGrid()` with correct and incorrect boards
- [x] Test `encodeGrid()` and `decodeGrid()` roundtrip
- [ ] Test advanced cage properties (logical solvability)

### UI Tests
- [x] Render puzzle from seed+difficulty
- [x] Input numbers, notes, erase
- [x] Switch to and from note mode
- [ ] Test share link copying and URL state
- [ ] Test LocalStorage persistence
- [ ] Test URL parameter handling

### Accessibility
- [x] Ensure all interactive elements are keyboard-accessible
- [x] Use proper labels and aria attributes for form controls

---

## 🧪 Tech Stack

- React + TypeScript
- Tailwind CSS + Shadcn UI
- Zustand or `useReducer` for state
- LocalStorage for progress
- `lz-string` (or similar) for URL compression
- Vite or Next.js (static output mode)

---

## ✍️ Example Puzzle URL

```
/?seed=ocean123&difficulty=hard&state=LZCompressedGrid
```

---
