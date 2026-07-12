import type { Building, Resident, ZoneType } from './types'

export type ConstructionStage = import('./types').ConstructionStage

export function getBuildingStage(ageSeconds: number): ConstructionStage {
  if (ageSeconds < 5) return 'foundation'
  if (ageSeconds < 11) return 'frame'
  return 'complete'
}

export function happinessGrowthMultiplier(happiness: number): number {
  const clamped = Math.max(68, Math.min(97, happiness))
  return 0.65 + ((clamped - 68) / 29) * 0.35
}

export function levelForAge(ageSeconds: number, happiness = 82): number {
  const effectiveAge = ageSeconds * happinessGrowthMultiplier(happiness)
  return effectiveAge >= 30 ? 2 : 1
}

export function calculateHappiness(population: number, shops: number, workplaces: number): number {
  return Math.max(68, Math.min(97, 82 + shops * 2 - Math.max(0, population - workplaces * 6)))
}

export function happinessIncomeMultiplier(happiness: number): number {
  const clamped = Math.max(68, Math.min(97, happiness))
  return 0.75 + ((clamped - 68) / 29) * 0.4
}

export function getHappinessReasons(population: number, shops: number, workplaces: number): string[] {
  const reasons: string[] = []
  const jobGap = Math.max(0, population - workplaces * 6)
  if (jobGap > 0) reasons.push(`Need ${Math.ceil(jobGap / 6)} more workplace${Math.ceil(jobGap / 6) === 1 ? '' : 's'} for residents`)
  if (shops === 0 && population > 0) reasons.push('Shops boost town mood')
  if (shops > 0) reasons.push(`Shops lift spirits (+${shops * 2}% from retail)`)
  if (jobGap === 0 && workplaces > 0) reasons.push('Jobs are keeping residents content')
  if (reasons.length === 0) reasons.push('A balanced town keeps everyone smiling')
  return reasons
}

export function calculateBaseIncome(shops: number, workplaces: number, population: number): number {
  return shops * 22 + workplaces * 34 + population * 2
}

export function formatGameTime(totalMinutes: number): string {
  const minutesInDay = ((Math.floor(totalMinutes) % 1440) + 1440) % 1440
  const hour24 = Math.floor(minutesInDay / 60)
  const minute = minutesInDay % 60
  const hour12 = hour24 % 12 || 12
  return `${hour12}:${String(minute).padStart(2, '0')} ${hour24 >= 12 ? 'PM' : 'AM'}`
}

export function getTimePeriod(hour: number): 'Morning' | 'Afternoon' | 'Evening' | 'Night' {
  if (hour >= 6 && hour < 12) return 'Morning'
  if (hour >= 12 && hour < 17) return 'Afternoon'
  if (hour >= 17 && hour < 20) return 'Evening'
  return 'Night'
}

export function activityForHour(hour: number): string {
  if (hour < 6 || hour >= 22) return 'Sleeping'
  if (hour < 8) return 'Walking to work'
  if (hour < 17) return 'At work'
  if (hour < 19) return 'Shopping'
  if (hour < 22) return 'Relaxing at home'
  return 'Sleeping'
}

export function activityForResident(resident: Resident, hour: number): string {
  if (hour < 6 || hour >= 22) return 'Sleeping at home'
  if (hour < 8) return resident.workId ? 'Walking to work' : 'Morning stroll'
  if (hour < 17) return resident.workId ? 'At work' : 'Working from home'
  if (hour < 19) return resident.shopId ? 'Shopping' : 'Running errands'
  if (hour < 22) return 'Relaxing at home'
  return 'Sleeping at home'
}

export function activityAtBuilding(resident: Resident, buildingId: string, hour: number): string {
  const atHome = resident.homeId === buildingId
  const atWork = resident.workId === buildingId
  const atShop = resident.shopId === buildingId

  if (hour < 6 || hour >= 22) return atHome ? 'Sleeping here' : 'Away for the night'
  if (hour < 8) {
    if (atHome) return 'Heading out soon'
    if (atWork) return 'Opening up'
    return 'On the way'
  }
  if (hour < 17) {
    if (atWork) return 'Working here'
    if (atHome) return 'Resting at home'
    if (atShop) return 'Quiet for now'
    return 'Out and about'
  }
  if (hour < 19) {
    if (atShop) return 'Browsing shelves'
    if (atHome) return 'At home'
    if (atWork) return 'Closed for the day'
    return 'Shopping elsewhere'
  }
  if (hour < 22) {
    if (atHome) return 'Relaxing here'
    return 'Heading home'
  }
  return atHome ? 'Sleeping here' : 'Away for the night'
}

export function buildingCapacity(building: Building): number {
  if (building.zone !== 'residential' || building.stage !== 'complete') return 0
  return building.level === 2 ? 5 : 3
}

export function buildingIncome(building: Building, residentsAtBuilding = 0): number {
  if (building.stage !== 'complete') return 0
  if (building.zone === 'shop') return 22
  if (building.zone === 'workspace') return 34
  if (building.zone === 'residential') return residentsAtBuilding * 2
  return 0
}

export function buildingEconomyLabel(building: Building, residentsAtBuilding = 0): string {
  if (building.stage !== 'complete') return 'Under construction'
  if (building.zone === 'residential') {
    const cap = buildingCapacity(building)
    const income = buildingIncome(building, Math.min(residentsAtBuilding, cap))
    return `Houses up to ${cap} residents · +$${income}/hr via population`
  }
  if (building.zone === 'shop') return `Generates +${buildingIncome(building)}/hr · boosts happiness`
  return `Generates +${buildingIncome(building)}/hr · provides jobs`
}

export function getWalkerPosition(
  resident: Resident,
  hour: number,
  minuteInHour: number,
  buildings: Building[],
): { x: number; y: number } {
  const cellW = 132
  const cellH = 104
  const center = (building: Building) => ({
    x: building.x * cellW + cellW / 2,
    y: building.y * cellH + cellH / 2 - 8,
  })
  const find = (id?: string) => buildings.find((building) => building.id === id)
  const home = find(resident.homeId)
  const work = find(resident.workId)
  const shop = find(resident.shopId)
  const fallback = { x: 200 + (resident.id.charCodeAt(9) % 5) * 40, y: 280 + (resident.id.charCodeAt(9) % 3) * 30 }
  const lerp = (a: { x: number; y: number }, b: { x: number; y: number }, t: number) => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  })

  if (!home) return fallback
  const homePos = center(home)

  if (hour < 6 || hour >= 22) return homePos
  if (hour < 8 && work) {
    const t = Math.min(1, ((hour - 6) + minuteInHour / 60) / 2)
    return lerp(homePos, center(work), t)
  }
  if (hour < 17 && work) return center(work)
  if (hour < 19 && shop) {
    const start = work ? center(work) : homePos
    const t = Math.min(1, ((hour - 17) + minuteInHour / 60) / 2)
    return lerp(start, center(shop), t)
  }
  if (hour < 22) return homePos
  return homePos
}

export function zoneAccent(zone: ZoneType): string {
  if (zone === 'residential') return 'res'
  if (zone === 'shop') return 'shop'
  return 'work'
}
