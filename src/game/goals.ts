export interface GoalSnapshot {
  homes: number
  shops: number
  workplaces: number
  population: number
  money: number
  day: number
  happiness: number
}

export interface TownGoal {
  id: string
  label: string
  reward: number
  check: (snapshot: GoalSnapshot) => boolean
}

export const TOWN_GOALS: TownGoal[] = [
  { id: 'first-home', label: 'Build your first home', reward: 200, check: (s) => s.homes >= 1 },
  { id: 'first-shop', label: 'Open your first shop', reward: 250, check: (s) => s.shops >= 1 },
  { id: 'first-work', label: 'Build a workplace', reward: 250, check: (s) => s.workplaces >= 1 },
  { id: 'pop-12', label: 'Reach 12 residents', reward: 500, check: (s) => s.population >= 12 },
  { id: 'shops-2', label: 'Open 2 shops', reward: 400, check: (s) => s.shops >= 2 },
  { id: 'money-10k', label: 'Reach $10,000 in funds', reward: 600, check: (s) => s.money >= 10000 },
  { id: 'day-3', label: 'Reach Day 3', reward: 500, check: (s) => s.day >= 3 },
  { id: 'workplaces-2', label: 'Build 2 workplaces', reward: 450, check: (s) => s.workplaces >= 2 },
  { id: 'happy-90', label: 'Reach 90% happiness', reward: 350, check: (s) => s.happiness >= 90 },
]

export function getNextGoal(completed: string[], snapshot: GoalSnapshot): TownGoal | null {
  return TOWN_GOALS.find((goal) => !completed.includes(goal.id) && !goal.check(snapshot)) ?? null
}

export function detectCompletedGoals(completed: string[], snapshot: GoalSnapshot): TownGoal[] {
  return TOWN_GOALS.filter((goal) => !completed.includes(goal.id) && goal.check(snapshot))
}
