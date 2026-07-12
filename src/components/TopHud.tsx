import { Coins, Gauge, RotateCcw, Smile, Target, Users } from 'lucide-react'
import type { TownGoal } from '../game/goals'
import { formatGameTime, getTimePeriod } from '../game/simulation'

interface Props {
  money: number
  population: number
  happiness: number
  happinessReasons: string[]
  income: number
  baseIncome: number
  gameMinutes: number
  hour: number
  day: number
  nextGoal: TownGoal | null
  onReset: () => void
}

export function TopHud({
  money, population, happiness, happinessReasons, income, baseIncome,
  gameMinutes, hour, day, nextGoal, onReset,
}: Props) {
  const night = hour < 6 || hour >= 19
  const moodClass = happiness >= 90 ? 'happy-high' : happiness <= 72 ? 'happy-low' : ''
  const incomeNote = income !== baseIncome ? ` (${income > baseIncome ? '+' : ''}${Math.round((income / baseIncome - 1) * 100)}% mood)` : ''

  return <header className="top-hud">
    <div className="brand"><span className="brand-mark">🏡</span><span>MiniTown</span></div>
    <div className="stat"><Users /><span><small>Population</small><strong>{population}</strong></span></div>
    <div className="stat"><Coins /><span><small>Town funds</small><strong>${Math.floor(money).toLocaleString()}</strong></span></div>
    <div className={`stat happiness-stat ${moodClass}`} title={happinessReasons.join(' · ')}>
      <Smile /><span><small>Happiness</small><strong>{happiness}%</strong><em className="happiness-hint">{happinessReasons[0]}</em></span>
    </div>
    <div className="stat income"><Gauge /><span><small>Income</small><strong>+${income}/hr</strong><em className="income-hint">{incomeNote.trim() || 'Mood affects earnings'}</em></span></div>
    {nextGoal ? <div className="stat goal-stat"><Target /><span><small>Next goal</small><strong>{nextGoal.label}</strong><em className="goal-reward">+${nextGoal.reward}</em></span></div> : null}
    <div className="time-block"><span className="sun-moon">{night ? '🌙' : '☀️'}</span><span><strong>{formatGameTime(gameMinutes)}</strong><small>Day {day} · {getTimePeriod(hour)}</small></span></div>
    <button className="icon-button" onClick={onReset} aria-label="Reset town" title="Reset town"><RotateCcw /></button>
  </header>
}
