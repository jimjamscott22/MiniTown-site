import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearSavedTown, loadSavedTown, saveTown, SAVE_KEY } from './persistence'

function createStorage() {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value) },
    removeItem: (key: string) => { store.delete(key) },
  }
}

describe('persistence', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorage())
    clearSavedTown()
  })

  it('saves and loads town state', () => {
    const state = {
      version: 1 as const,
      blocks: [{ id: 'block-1', zone: 'residential' as const, cells: [{ x: 0, y: 0 }], createdAt: 0 }],
      elapsed: 12,
      gameMinutes: 500,
      money: 7000,
      speed: 2,
      isPaused: false,
      completedGoals: ['first-home'],
    }
    saveTown(state)
    expect(loadSavedTown()).toEqual(state)
    expect(localStorage.getItem(SAVE_KEY)).toBeTruthy()
  })

  it('returns null for invalid saves', () => {
    localStorage.setItem(SAVE_KEY, '{bad json')
    expect(loadSavedTown()).toBeNull()
  })
})
