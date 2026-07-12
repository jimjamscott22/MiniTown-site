import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { detectCompletedGoals, getNextGoal } from './goals'
import { clearSavedTown, loadSavedTown, saveTown, type SavedTownState } from './persistence'
import {
  activityForHour,
  calculateBaseIncome,
  calculateHappiness,
  getBuildingStage,
  getHappinessReasons,
  happinessIncomeMultiplier,
  levelForAge,
} from './simulation'
import type { Block, Building, GridCell, Resident, ZoneType } from './types'

const NAMES = ['Maya Brooks', 'Theo Lane', 'Nina Park', 'Eli Harper', 'June Bell', 'Sam Rivera', 'Milo Reed', 'Ava Stone', 'Iris Cole', 'Leo Finch', 'Ada Moss', 'Ben Hart']
const START_MINUTES = 7 * 60 + 30
const START_MONEY = 6200
const PLOT_COST = 400
const BULLDOZE_REFUND_RATE = 0.5

export interface GoalEvent {
  id: string
  label: string
  reward: number
}

function createInitialState() {
  return {
    blocks: [] as Block[],
    elapsed: 0,
    gameMinutes: START_MINUTES,
    money: START_MONEY,
    speed: 1,
    isPaused: false,
    completedGoals: [] as string[],
  }
}

function applySavedState(saved: SavedTownState) {
  return {
    blocks: saved.blocks,
    elapsed: saved.elapsed,
    gameMinutes: saved.gameMinutes,
    money: saved.money,
    speed: saved.speed,
    isPaused: saved.isPaused,
    completedGoals: saved.completedGoals,
  }
}

export function useTownSimulation() {
  const pendingSave = useRef<SavedTownState | null>(loadSavedTown())
  const [pendingRestore, setPendingRestore] = useState<SavedTownState | null>(() => pendingSave.current)
  const [state, setState] = useState(createInitialState)
  const [goalEvent, setGoalEvent] = useState<GoalEvent | null>(null)
  const lastFrame = useRef<number | null>(null)
  const incomeRef = useRef(0)
  const goalEventTimer = useRef<number | null>(null)

  const { blocks, elapsed, gameMinutes, money, speed, isPaused, completedGoals } = state

  const hour = Math.floor((gameMinutes % 1440) / 60)
  const minuteInHour = Math.floor(gameMinutes % 60)
  const day = Math.floor(gameMinutes / 1440) + 1

  const provisionalHomes = useMemo(() => blocks.flatMap((block) => (
    block.zone === 'residential' ? block.cells.map((cell, index) => {
      const age = Math.max(0, elapsed - block.createdAt)
      const stage = getBuildingStage(age)
      return stage === 'complete' ? { level: levelForAge(age, 82) } : null
    }).filter(Boolean) : []
  )), [blocks, elapsed]) as Array<{ level: number }>

  const provisionalPopulation = provisionalHomes.reduce((total, home) => total + (home.level === 2 ? 5 : 3), 0)
  const provisionalShops = blocks.filter((block) => block.zone === 'shop' && getBuildingStage(Math.max(0, elapsed - block.createdAt)) === 'complete').length
  const provisionalWorkplaces = blocks.filter((block) => block.zone === 'workspace' && getBuildingStage(Math.max(0, elapsed - block.createdAt)) === 'complete').length
  const happiness = calculateHappiness(provisionalPopulation, provisionalShops, provisionalWorkplaces)

  const buildings = useMemo<Building[]>(() => blocks.flatMap((block) => block.cells.map((cell, index) => {
    const age = Math.max(0, elapsed - block.createdAt)
    const stage = getBuildingStage(age)
    return {
      ...cell,
      id: `${block.id}-${index}`,
      blockId: block.id,
      zone: block.zone,
      variant: (index + block.id.length) % 3,
      createdAt: block.createdAt,
      stage,
      level: stage === 'complete' ? levelForAge(age, happiness) : 1,
    }
  })), [blocks, elapsed, happiness])

  const completeBuildings = useMemo(() => buildings.filter((building) => building.stage === 'complete'), [buildings])
  const homes = completeBuildings.filter((building) => building.zone === 'residential')
  const workplaces = completeBuildings.filter((building) => building.zone === 'workspace')
  const shops = completeBuildings.filter((building) => building.zone === 'shop')
  const population = homes.reduce((total, home) => total + (home.level === 2 ? 5 : 3), 0)
  const happinessReasons = getHappinessReasons(population, shops.length, workplaces.length)
  const baseIncome = calculateBaseIncome(shops.length, workplaces.length, population)
  const income = Math.round(baseIncome * happinessIncomeMultiplier(happiness))
  incomeRef.current = income

  const residents = useMemo<Resident[]>(() => Array.from({ length: population }, (_, index) => ({
    id: `resident-${index}`,
    name: NAMES[index % NAMES.length],
    homeId: homes[index % Math.max(1, homes.length)]?.id ?? '',
    workId: workplaces.length ? workplaces[index % workplaces.length].id : undefined,
    shopId: shops.length ? shops[index % shops.length].id : undefined,
  })), [population, homes, workplaces, shops])

  const nextGoal = useMemo(() => getNextGoal(completedGoals, {
    homes: homes.length,
    shops: shops.length,
    workplaces: workplaces.length,
    population,
    money,
    day,
    happiness,
  }), [completedGoals, homes.length, shops.length, workplaces.length, population, money, day, happiness])

  useEffect(() => {
    let frame = 0
    const tick = (now: number) => {
      if (lastFrame.current === null) lastFrame.current = now
      const delta = Math.min(0.1, (now - lastFrame.current) / 1000)
      lastFrame.current = now
      if (!isPaused && !pendingRestore) {
        setState((current) => ({
          ...current,
          elapsed: current.elapsed + delta * speed,
          gameMinutes: current.gameMinutes + delta * speed * 8,
          money: current.money + (incomeRef.current / 60) * delta * speed,
        }))
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [isPaused, speed, pendingRestore])

  useEffect(() => {
    const snapshot = {
      homes: homes.length,
      shops: shops.length,
      workplaces: workplaces.length,
      population,
      money,
      day,
      happiness,
    }
    const newlyCompleted = detectCompletedGoals(completedGoals, snapshot)
    if (!newlyCompleted.length) return

    const totalReward = newlyCompleted.reduce((sum, goal) => sum + goal.reward, 0)
    const latest = newlyCompleted[newlyCompleted.length - 1]
    setState((current) => ({
      ...current,
      completedGoals: [...current.completedGoals, ...newlyCompleted.map((goal) => goal.id)],
      money: current.money + totalReward,
    }))
    setGoalEvent({ id: latest.id, label: latest.label, reward: totalReward })
    if (goalEventTimer.current) window.clearTimeout(goalEventTimer.current)
    goalEventTimer.current = window.setTimeout(() => setGoalEvent(null), 5000)
  }, [homes.length, shops.length, workplaces.length, population, money, day, happiness, completedGoals])

  useEffect(() => {
    if (pendingRestore) return
    const handle = window.setInterval(() => {
      saveTown({
        version: 1,
        blocks,
        elapsed,
        gameMinutes,
        money,
        speed,
        isPaused,
        completedGoals,
      })
    }, 5000)
    return () => window.clearInterval(handle)
  }, [blocks, elapsed, gameMinutes, money, speed, isPaused, completedGoals, pendingRestore])

  useEffect(() => {
    if (pendingRestore) return
    const persist = () => {
      saveTown({
        version: 1,
        blocks,
        elapsed,
        gameMinutes,
        money,
        speed,
        isPaused,
        completedGoals,
      })
    }
    window.addEventListener('beforeunload', persist)
    return () => window.removeEventListener('beforeunload', persist)
  }, [blocks, elapsed, gameMinutes, money, speed, isPaused, completedGoals, pendingRestore])

  const placeBlock = useCallback((zone: ZoneType, cells: GridCell[]) => {
    const cost = cells.length * PLOT_COST
    if (money < cost) return false
    setState((current) => ({
      ...current,
      money: current.money - cost,
      blocks: [...current.blocks, {
        id: `block-${Date.now()}-${current.blocks.length}`,
        zone,
        cells,
        createdAt: elapsed,
      }],
    }))
    return true
  }, [elapsed, money])

  const demolishAtCell = useCallback((cell: GridCell) => {
    const block = blocks.find((candidate) => candidate.cells.some(({ x, y }) => x === cell.x && y === cell.y))
    if (!block) return false
    const refund = Math.floor(block.cells.length * PLOT_COST * BULLDOZE_REFUND_RATE)
    setState((current) => ({
      ...current,
      money: current.money + refund,
      blocks: current.blocks.filter((candidate) => candidate.id !== block.id),
    }))
    return true
  }, [blocks])

  const resetTown = useCallback(() => {
    clearSavedTown()
    setState(createInitialState())
    setGoalEvent(null)
    setPendingRestore(null)
    lastFrame.current = null
  }, [])

  const continueSavedTown = useCallback(() => {
    if (!pendingRestore) return
    setState(applySavedState(pendingRestore))
    setPendingRestore(null)
    lastFrame.current = null
  }, [pendingRestore])

  const dismissSavedTown = useCallback(() => {
    clearSavedTown()
    setPendingRestore(null)
  }, [])

  const setSpeed = useCallback((nextSpeed: number) => {
    setState((current) => ({ ...current, speed: nextSpeed }))
  }, [])

  const togglePause = useCallback(() => {
    setState((current) => ({ ...current, isPaused: !current.isPaused }))
  }, [])

  const clearGoalEvent = useCallback(() => setGoalEvent(null), [])

  return {
    blocks,
    buildings,
    residents,
    elapsed,
    gameMinutes,
    hour,
    minuteInHour,
    day,
    money,
    population,
    happiness,
    happinessReasons,
    baseIncome,
    income,
    speed,
    isPaused,
    activity: activityForHour(hour),
    nextGoal,
    completedGoals,
    goalEvent,
    pendingRestore,
    setSpeed,
    togglePause,
    placeBlock,
    demolishAtCell,
    resetTown,
    continueSavedTown,
    dismissSavedTown,
    clearGoalEvent,
  }
}
