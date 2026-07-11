import { Coins, Gauge, RotateCcw, Smile, Users } from 'lucide-react'
import { formatGameTime, getTimePeriod } from '../game/simulation'

interface Props {
  money: number; population: number; happiness: number; income: number
  gameMinutes: number; hour: number; day: number; onReset: () => void
}

export function TopHud({ money, population, happiness, income, gameMinutes, hour, day, onReset }: Props) {
  const night = hour < 6 || hour >= 19
  return <header className="top-hud">
    <div className="brand"><span className="brand-mark">🏡</span><span>MiniTown</span></div>
    <div className="stat"><Users /><span><small>Population</small><strong>{population}</strong></span></div>
    <div className="stat"><Coins /><span><small>Town funds</small><strong>${Math.floor(money).toLocaleString()}</strong></span></div>
    <div className="stat"><Smile /><span><small>Happiness</small><strong>{happiness}%</strong></span></div>
    <div className="stat income"><Gauge /><span><small>Income</small><strong>+${income}/hr</strong></span></div>
    <div className="time-block"><span className="sun-moon">{night ? '🌙' : '☀️'}</span><span><strong>{formatGameTime(gameMinutes)}</strong><small>Day {day} · {getTimePeriod(hour)}</small></span></div>
    <button className="icon-button" onClick={onReset} aria-label="Reset town" title="Reset town"><RotateCcw /></button>
  </header>
}
