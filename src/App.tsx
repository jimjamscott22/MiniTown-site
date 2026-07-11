import { useMemo, useState } from 'react'
import { Inspector } from './components/Inspector'
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
  const inspect = (building: Building | null) => setInspectedId(building?.id ?? null)
  const changeTool = (next: Tool) => {
    setTool(next)
    showNotice(next === 'explore' ? 'Explore mode — nothing will be placed.' : `Drag across up to three plots for a shared ${next} block.`)
  }

  return <main className={`game-shell ${isNight ? 'night' : 'day'}`}>
    <TopHud money={town.money} population={town.population} happiness={town.happiness} income={town.income} gameMinutes={town.gameMinutes} hour={town.hour} day={town.day} onReset={() => { town.resetTown(); setTool('explore'); setInspectedId(null); showNotice('A fresh meadow. What will you build?') }} />
    <ToolRail active={tool} onChange={changeTool} />
    <TownWorld blocks={town.blocks} buildings={town.buildings} residents={town.residents} tool={tool} zoom={zoom} placeBlock={town.placeBlock} onInspect={inspect} onZoom={(delta) => setZoom((value) => Math.max(0.58, Math.min(1.12, value + delta)))} onNotice={showNotice} />
    <Inspector building={inspected} residents={town.residents} activity={town.activity} />
    <SpeedControls speed={town.speed} paused={town.isPaused} onSpeed={(speed) => { town.setSpeed(speed); if (town.isPaused) town.togglePause() }} onPause={town.togglePause} onZoom={(delta) => setZoom((value) => Math.max(0.58, Math.min(1.12, value + delta)))} />
    <div key={noticeKey} className="notice" role="status">{notice}</div>
    <div className="night-wash" aria-hidden="true" />
  </main>
}
