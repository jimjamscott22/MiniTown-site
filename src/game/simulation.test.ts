import { describe, expect, it } from 'vitest'
import { detectCompletedGoals, getNextGoal, TOWN_GOALS } from './goals'
import {
  activityAtBuilding,
  activityForHour,
  activityForResident,
  buildingEconomyLabel,
  buildingIncome,
  calculateHappiness,
  formatGameTime,
  getBuildingStage,
  getHappinessReasons,
  getTimePeriod,
  getWalkerPosition,
  happinessGrowthMultiplier,
  happinessIncomeMultiplier,
  levelForAge,
} from './simulation'
import type { Building, Resident } from './types'

describe('construction and growth', () => {
  it('moves through foundation, frame, and complete stages', () => {
    expect(getBuildingStage(2)).toBe('foundation')
    expect(getBuildingStage(8)).toBe('frame')
    expect(getBuildingStage(14)).toBe('complete')
  })

  it('grows a completed building after it remains active', () => {
    expect(levelForAge(24, 97)).toBe(1)
    expect(levelForAge(34, 97)).toBe(2)
  })

  it('slows growth when happiness is low', () => {
    expect(levelForAge(34, 68)).toBe(1)
    expect(levelForAge(50, 97)).toBe(2)
    expect(happinessGrowthMultiplier(68)).toBeLessThan(happinessGrowthMultiplier(97))
  })
})

describe('happiness economy', () => {
  it('calculates happiness from jobs and shops', () => {
    expect(calculateHappiness(12, 0, 0)).toBeLessThan(82)
    expect(calculateHappiness(12, 2, 2)).toBeGreaterThan(calculateHappiness(12, 0, 2))
  })

  it('scales income with happiness', () => {
    expect(happinessIncomeMultiplier(68)).toBeCloseTo(0.75)
    expect(happinessIncomeMultiplier(97)).toBeCloseTo(1.15)
  })

  it('explains happiness drivers', () => {
    const reasons = getHappinessReasons(12, 0, 1)
    expect(reasons.some((reason) => reason.includes('workplace'))).toBe(true)
  })
})

describe('town time and schedules', () => {
  it('formats a readable twelve-hour clock and period', () => {
    expect(formatGameTime(7 * 60 + 5)).toBe('7:05 AM')
    expect(formatGameTime(21 * 60 + 42)).toBe('9:42 PM')
    expect(getTimePeriod(21)).toBe('Night')
    expect(getTimePeriod(13)).toBe('Afternoon')
  })

  it('gives residents a simple daily routine', () => {
    expect(activityForHour(7)).toBe('Walking to work')
    expect(activityForHour(10)).toBe('At work')
    expect(activityForHour(18)).toBe('Shopping')
    expect(activityForHour(23)).toBe('Sleeping')
  })

  it('tracks per-resident and per-building activity', () => {
    const resident: Resident = {
      id: 'resident-0',
      name: 'Maya Brooks',
      homeId: 'home-1',
      workId: 'work-1',
      shopId: 'shop-1',
    }
    expect(activityForResident(resident, 10)).toBe('At work')
    expect(activityAtBuilding(resident, 'work-1', 10)).toBe('Working here')
    expect(activityAtBuilding(resident, 'home-1', 10)).toBe('Resting at home')
  })
})

describe('building economy labels', () => {
  const building: Building = {
    id: 'home-1',
    blockId: 'block-1',
    x: 1,
    y: 1,
    zone: 'residential',
    variant: 0,
    createdAt: 0,
    stage: 'complete',
    level: 1,
  }

  it('describes residential income through population', () => {
    expect(buildingIncome(building, 3)).toBe(6)
    expect(buildingEconomyLabel(building, 3)).toContain('3 residents')
  })
})

describe('goals', () => {
  it('detects and queues milestones', () => {
    const snapshot = { homes: 1, shops: 0, workplaces: 0, population: 3, money: 6200, day: 1, happiness: 82 }
    const completed = detectCompletedGoals([], snapshot)
    expect(completed.map((goal) => goal.id)).toContain('first-home')
    expect(getNextGoal([], snapshot)?.id).toBe('first-shop')
    expect(TOWN_GOALS.length).toBeGreaterThan(5)
  })
})

describe('walker positions', () => {
  it('anchors walkers to assigned buildings by hour', () => {
    const resident: Resident = {
      id: 'resident-0',
      name: 'Maya Brooks',
      homeId: 'block-1-0',
      workId: 'block-2-0',
    }
    const buildings: Building[] = [
      { id: 'block-1-0', blockId: 'block-1', x: 0, y: 0, zone: 'residential', variant: 0, createdAt: 0, stage: 'complete', level: 1 },
      { id: 'block-2-0', blockId: 'block-2', x: 2, y: 0, zone: 'workspace', variant: 0, createdAt: 0, stage: 'complete', level: 1 },
    ]
    const morningHome = getWalkerPosition(resident, 6, 30, buildings)
    const workHours = getWalkerPosition(resident, 12, 0, buildings)
    expect(morningHome.x).toBeLessThan(workHours.x)
  })
})
