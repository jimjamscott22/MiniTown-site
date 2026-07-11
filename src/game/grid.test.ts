import { describe, expect, it } from 'vitest'
import { canPlaceBlock, getBlockBounds, getDragCells } from './grid'
import type { Block, GridCell } from './types'

describe('getDragCells', () => {
  it('returns one to three horizontal cells and clamps longer drags', () => {
    expect(getDragCells({ x: 2, y: 2 }, { x: 7, y: 2 })).toEqual([
      { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 },
    ])
  })

  it('chooses the dominant axis for diagonal pointer movement', () => {
    expect(getDragCells({ x: 4, y: 4 }, { x: 5, y: 7 })).toEqual([
      { x: 4, y: 4 }, { x: 4, y: 5 }, { x: 4, y: 6 },
    ])
  })
})

describe('placement geometry', () => {
  const blocks: Block[] = [{
    id: 'b1', zone: 'residential', cells: [{ x: 2, y: 2 }], createdAt: 0,
  }]

  it('rejects overlapping and out-of-bounds cells', () => {
    expect(canPlaceBlock([{ x: 2, y: 2 }], blocks, 9, 7)).toBe(false)
    expect(canPlaceBlock([{ x: 9, y: 1 }], blocks, 9, 7)).toBe(false)
    expect(canPlaceBlock([{ x: 3, y: 2 }], blocks, 9, 7)).toBe(true)
  })

  it('returns one shared exterior rectangle for a connected block', () => {
    const cells: GridCell[] = [{ x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 }]
    expect(getBlockBounds(cells)).toEqual({ x: 2, y: 3, width: 3, height: 1 })
  })
})
