import { useEffect, useMemo, useState } from 'react'
import { Inspector } from './components/Inspector'
import { ResumeBanner } from './components/ResumeBanner'
import { SpeedControls } from './components/SpeedControls'
import { ToolRail } from './components/ToolRail'
import { TopHud } from './components/TopHud'
import { TownWorld } from './components/TownWorld'
import { useTownSimulation } from './game/useTownSimulation'
import type { Building, Tool } from './game/types'

export default function App() {
  const town = useTownSimulation()
  const [tool, setTool] = useState<Tool>('explore')
  const [zoom, setZoom] = useState(0.82)
  const [inspectedId, setInspectedId] = useState<string | null>(null)
  const [notice, setNotice] = useState('Explore the meadow or choose a zone to begin.')
  const [noticeKey, setNoticeKey] = useState(0)
  const inspected = useMemo(() => town.buildings.find((building) => building.id === inspectedId) ?? null, [town.buildings, inspectedId])
  const isNight = town.hour < 6 || town.hour >= 19

  const showNotice = (message: string) => { setNotice(message); setNoticeKey((value) => value + 1) }

  useEffect(() => {
    if (!town.goalEvent) return
    showNotice(`Milestone reached: ${town.goalEvent.label}! +$${town.goalEvent.reward}`)
  }, [town.goalEvent])

  const inspect = (building: Building | null) => setInspectedId(building?.id ?? null)
  const changeTool = (next: Tool) => {
    setTool(next)
    if (next === 'explore') showNotice('Explore mode — nothing will be placed.')
    else if (next === 'bulldoze') showNotice('Bulldoze mode — tap a building to remove it for a 50% refund.')
    else showNotice(`Drag across up to three plots for a shared ${next} block.`)
  }

  const handleReset = () => {
    town.resetTown()
    setTool('explore')
    setInspectedId(null)
    showNotice('A fresh meadow. What will you build?')
  }

  return <main className={`game-shell ${isNight ? 'night' : 'day'}`}>
    {town.pendingRestore ? <ResumeBanner onContinue={() => { town.continueSavedTown(); showNotice('Welcome back! Your saved town is ready.') }} onFresh={town.dismissSavedTown} /> : null}
    <TopHud
      money={town.money}
      population={town.population}
      happiness={town.happiness}
      happinessReasons={town.happinessReasons}
      income={town.income}
      baseIncome={town.baseIncome}
      gameMinutes={town.gameMinutes}
      hour={town.hour}
      day={town.day}
      nextGoal={town.nextGoal}
      onReset={handleReset}
    />
    <ToolRail active={tool} onChange={changeTool} />
    <TownWorld
      blocks={town.blocks}
      buildings={town.buildings}
      residents={town.residents}
      tool={tool}
      zoom={zoom}
      hour={town.hour}
      minuteInHour={town.minuteInHour}
      placeBlock={town.placeBlock}
      demolishAtCell={town.demolishAtCell}
      onInspect={inspect}
      onZoom={(delta) => setZoom((value) => Math.max(0.58, Math.min(1.12, value + delta)))}
      onNotice={showNotice}
    />
    <Inspector building={inspected} residents={town.residents} hour={town.hour} happinessReasons={town.happinessReasons} />
    <SpeedControls speed={town.speed} paused={town.isPaused} onSpeed={(speed) => { town.setSpeed(speed); if (town.isPaused) town.togglePause() }} onPause={town.togglePause} onZoom={(delta) => setZoom((value) => Math.max(0.58, Math.min(1.12, value + delta)))} />
    <div key={noticeKey} className="notice" role="status">{notice}</div>
    <div className="night-wash" aria-hidden="true" />
  </main>
}
