import type { Block, GridCell } from './types'

export function getDragCells(start: GridCell, end: GridCell): GridCell[] {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const horizontal = Math.abs(dx) >= Math.abs(dy)
  const delta = horizontal ? dx : dy
  const direction = delta === 0 ? 1 : Math.sign(delta)
  const length = Math.min(3, Math.abs(delta) + 1)

  return Array.from({ length }, (_, index) => ({
    x: start.x + (horizontal ? index * direction : 0),
    y: start.y + (horizontal ? 0 : index * direction),
  }))
}

export function canPlaceBlock(
  cells: GridCell[],
  blocks: Block[],
  columns: number,
  rows: number,
): boolean {
  const occupied = new Set(blocks.flatMap((block) => block.cells.map(({ x, y }) => `${x}:${y}`)))
  return cells.length > 0 && cells.length <= 3 && cells.every(({ x, y }) => (
    x >= 0 && y >= 0 && x < columns && y < rows && !occupied.has(`${x}:${y}`)
  ))
}

export function getBlockBounds(cells: GridCell[]) {
  const xs = cells.map((cell) => cell.x)
  const ys = cells.map((cell) => cell.y)
  const x = Math.min(...xs)
  const y = Math.min(...ys)
  return {
    x,
    y,
    width: Math.max(...xs) - x + 1,
    height: Math.max(...ys) - y + 1,
  }
}
