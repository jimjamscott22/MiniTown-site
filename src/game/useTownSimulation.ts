import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { activityForHour, getBuildingStage, levelForAge } from './simulation'
import type { Block, Building, GridCell, Resident, ZoneType } from './types'

const NAMES = ['Maya Brooks', 'Theo Lane', 'Nina Park', 'Eli Harper', 'June Bell', 'Sam Rivera', 'Milo Reed', 'Ava Stone', 'Iris Cole', 'Leo Finch', 'Ada Moss', 'Ben Hart']
const START_MINUTES = 7 * 60 + 30
const START_MONEY = 6200

export function useTownSimulation() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [elapsed, setElapsed] = useState(0)
  const [gameMinutes, setGameMinutes] = useState(START_MINUTES)
  const [money, setMoney] = useState(START_MONEY)
  const [speed, setSpeed] = useState(1)
  const [isPaused, setPaused] = useState(false)
  const lastFrame = useRef<number | null>(null)
  const incomeRef = useRef(0)

  const buildings = useMemo<Building[]>(() => blocks.flatMap((block) => block.cells.map((cell, index) => {
    const age = Math.max(0, elapsed - block.createdAt)
    return {
      ...cell,
      id: `${block.id}-${index}`,
      blockId: block.id,
      zone: block.zone,
      variant: (index + block.id.length) % 3,
      createdAt: block.createdAt,
      stage: getBuildingStage(age),
      level: getBuildingStage(age) === 'complete' ? levelForAge(age) : 1,
    }
  })), [blocks, elapsed])

  const completeBuildings = useMemo(() => buildings.filter((building) => building.stage === 'complete'), [buildings])
  const homes = completeBuildings.filter((building) => building.zone === 'residential')
  const workplaces = completeBuildings.filter((building) => building.zone === 'workspace')
  const shops = completeBuildings.filter((building) => building.zone === 'shop')
  const population = homes.reduce((total, home) => total + (home.level === 2 ? 5 : 3), 0)
  const income = shops.length * 22 + workplaces.length * 34 + population * 2
  incomeRef.current = income

  const residents = useMemo<Resident[]>(() => Array.from({ length: population }, (_, index) => ({
    id: `resident-${index}`,
    name: NAMES[index % NAMES.length],
    homeId: homes[index % Math.max(1, homes.length)]?.id ?? '',
    workId: workplaces.length ? workplaces[index % workplaces.length].id : undefined,
    shopId: shops.length ? shops[index % shops.length].id : undefined,
  })), [population, homes, workplaces, shops])

  useEffect(() => {
    let frame = 0
    const tick = (now: number) => {
      if (lastFrame.current === null) lastFrame.current = now
      const delta = Math.min(0.1, (now - lastFrame.current) / 1000)
      lastFrame.current = now
      if (!isPaused) {
        setElapsed((value) => value + delta * speed)
        setGameMinutes((value) => value + delta * speed * 8)
        setMoney((value) => value + (incomeRef.current / 60) * delta * speed)
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [isPaused, speed])

  const placeBlock = useCallback((zone: ZoneType, cells: GridCell[]) => {
    const cost = cells.length * 400
    if (money < cost) return false
    setMoney((value) => value - cost)
    setBlocks((current) => [...current, {
      id: `block-${Date.now()}-${current.length}`,
      zone,
      cells,
      createdAt: elapsed,
    }])
    return true
  }, [elapsed, money])

  const resetTown = useCallback(() => {
    setBlocks([])
    setElapsed(0)
    setGameMinutes(START_MINUTES)
    setMoney(START_MONEY)
    setSpeed(1)
    setPaused(false)
  }, [])

  const hour = Math.floor((gameMinutes % 1440) / 60)
  const day = Math.floor(gameMinutes / 1440) + 1
  const happiness = Math.max(68, Math.min(97, 82 + shops.length * 2 - Math.max(0, population - workplaces.length * 6)))

  return {
    blocks, buildings, residents, elapsed, gameMinutes, hour, day, money,
    population, happiness, income, speed, isPaused,
    activity: activityForHour(hour),
    setSpeed, togglePause: () => setPaused((value) => !value), placeBlock, resetTown,
  }
}
