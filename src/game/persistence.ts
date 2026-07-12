import type { Block } from './types'

export const SAVE_KEY = 'minitown-save-v1'

export interface SavedTownState {
  version: 1
  blocks: Block[]
  elapsed: number
  gameMinutes: number
  money: number
  speed: number
  isPaused: boolean
  completedGoals: string[]
}

export function loadSavedTown(): SavedTownState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SavedTownState
    if (parsed.version !== 1 || !Array.isArray(parsed.blocks)) return null
    return parsed
  } catch {
    return null
  }
}

export function saveTown(state: SavedTownState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state))
  } catch {
    // Storage may be unavailable in private browsing.
  }
}

export function clearSavedTown(): void {
  try {
    localStorage.removeItem(SAVE_KEY)
  } catch {
    // Ignore storage errors.
  }
}
