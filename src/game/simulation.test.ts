import { describe, expect, it } from 'vitest'
import { activityForHour, formatGameTime, getBuildingStage, getTimePeriod, levelForAge } from './simulation'

describe('construction and growth', () => {
  it('moves through foundation, frame, and complete stages', () => {
    expect(getBuildingStage(2)).toBe('foundation')
    expect(getBuildingStage(8)).toBe('frame')
    expect(getBuildingStage(14)).toBe('complete')
  })

  it('grows a completed building after it remains active', () => {
    expect(levelForAge(24)).toBe(1)
    expect(levelForAge(34)).toBe(2)
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
})
