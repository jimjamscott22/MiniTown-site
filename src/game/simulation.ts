import type { ConstructionStage } from './types'

export function getBuildingStage(ageSeconds: number): ConstructionStage {
  if (ageSeconds < 5) return 'foundation'
  if (ageSeconds < 11) return 'frame'
  return 'complete'
}

export function levelForAge(ageSeconds: number): number {
  return ageSeconds >= 30 ? 2 : 1
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
