import { useMemo, useRef, useState } from 'react'
import { canPlaceBlock, getBlockBounds, getDragCells } from '../game/grid'
import type { Block, Building as BuildingType, GridCell, Resident, Tool, ZoneType } from '../game/types'
import { Building } from './Building'
import { WorldEntities } from './WorldEntities'

const COLS = 9
const ROWS = 6
const CELL_W = 132
const CELL_H = 104

interface Props {
  blocks: Block[]
  buildings: BuildingType[]
  residents: Resident[]
  tool: Tool
  zoom: number
  hour: number
  minuteInHour: number
  placeBlock: (zone: ZoneType, cells: GridCell[]) => boolean
  demolishAtCell: (cell: GridCell) => boolean
  onInspect: (building: BuildingType | null) => void
  onZoom: (delta: number) => void
  onNotice: (message: string) => void
}

function cellHasBlock(cell: GridCell, blocks: Block[]) {
  return blocks.some((block) => block.cells.some(({ x, y }) => x === cell.x && y === cell.y))
}

export function TownWorld({
  blocks, buildings, residents, tool, zoom, hour, minuteInHour,
  placeBlock, demolishAtCell, onInspect, onZoom, onNotice,
}: Props) {
  const [dragStart, setDragStart] = useState<GridCell | null>(null)
  const [dragEnd, setDragEnd] = useState<GridCell | null>(null)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const panStart = useRef<{ clientX: number; clientY: number; x: number; y: number } | null>(null)

  const preview = useMemo(() => dragStart && dragEnd ? getDragCells(dragStart, dragEnd) : [], [dragStart, dragEnd])
  const validPreview = tool !== 'explore' && tool !== 'bulldoze' && preview.length > 0 && canPlaceBlock(preview, blocks, COLS, ROWS)
  const previewKeys = new Set(preview.map(({ x, y }) => `${x}:${y}`))

  const startZoneDrag = (cell: GridCell, event: React.PointerEvent) => {
    if (tool === 'explore') return
    if (tool === 'bulldoze') {
      event.stopPropagation()
      if (!cellHasBlock(cell, blocks)) {
        onNotice('No building here to remove.')
        return
      }
      if (demolishAtCell(cell)) onNotice('Building removed — 50% refund added to town funds.')
      else onNotice('Could not remove that building.')
      return
    }
    event.stopPropagation()
    setDragStart(cell)
    setDragEnd(cell)
  }

  const commitPlacement = () => {
    if (tool !== 'explore' && tool !== 'bulldoze' && preview.length) {
      if (!validPreview) onNotice('That block needs clear, connected land.')
      else if (!placeBlock(tool, preview)) onNotice('Not enough town funds for that block.')
      else onNotice(`${preview.length}-building ${tool} block started!`)
    }
    setDragStart(null)
    setDragEnd(null)
  }

  const startExplore = (event: React.PointerEvent<HTMLDivElement>) => {
    if (tool !== 'explore') return
    panStart.current = { clientX: event.clientX, clientY: event.clientY, x: pan.x, y: pan.y }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const moveExplore = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!panStart.current) return
    setPan({
      x: panStart.current.x + event.clientX - panStart.current.clientX,
      y: panStart.current.y + event.clientY - panStart.current.clientY,
    })
  }

  const cells = Array.from({ length: COLS * ROWS }, (_, index) => ({ x: index % COLS, y: Math.floor(index / COLS) }))

  return <div className={`world-viewport tool-${tool}`} onPointerDown={startExplore} onPointerMove={moveExplore} onPointerUp={() => { panStart.current = null; commitPlacement() }} onPointerCancel={() => { panStart.current = null; setDragStart(null) }} onWheel={(event) => { event.preventDefault(); onZoom(event.deltaY > 0 ? -0.08 : 0.08) }}>
    <div className="sky-haze" />
    <div className="world-camera" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
      <div className="town-board">
        <div className="terrain-texture" />
        <div className="pond"><i /><i /><i /></div>
        <div className="tree-line">{Array.from({ length: 17 }, (_, index) => <i key={index} style={{ '--tree': index } as React.CSSProperties} />)}</div>

        {blocks.map((block) => {
          const bounds = getBlockBounds(block.cells)
          return <div key={`road-${block.id}`} className={`road-frame ${block.zone}`} style={{
            left: bounds.x * CELL_W - 18,
            top: bounds.y * CELL_H - 18,
            width: bounds.width * CELL_W + 36,
            height: bounds.height * CELL_H + 36,
          }}><span className="road-corner tl" /><span className="road-corner tr" /><span className="road-corner bl" /><span className="road-corner br" /></div>
        })}

        <div className="plot-grid">
          {cells.map((cell) => {
            const selected = previewKeys.has(`${cell.x}:${cell.y}`)
            const occupied = cellHasBlock(cell, blocks)
            return <button key={`${cell.x}:${cell.y}`} className={`plot ${selected ? `preview ${validPreview ? 'valid' : 'invalid'} ${tool}` : ''} ${tool === 'bulldoze' && occupied ? 'bulldoze-target' : ''}`} style={{ left: cell.x * CELL_W, top: cell.y * CELL_H }} onPointerDown={(event) => startZoneDrag(cell, event)} onPointerEnter={() => { if (dragStart) setDragEnd(cell) }} aria-label={`Plot ${cell.x + 1}, ${cell.y + 1}`}>
              {selected ? <span className={`ghost-building ghost-${tool}`}><i /><i /></span> : null}
            </button>
          })}
        </div>

        {buildings.map((building) => <Building key={building.id} building={building} residents={residents} onInspect={onInspect} />)}
        <WorldEntities residents={residents} buildings={buildings} hour={hour} minuteInHour={minuteInHour} />

        {preview.length ? <div className={`placement-tip ${validPreview ? 'valid' : 'invalid'}`} style={{ left: Math.min(...preview.map((cell) => cell.x)) * CELL_W + 12, top: Math.max(...preview.map((cell) => cell.y)) * CELL_H + 82 }}>
          <strong>{preview.length}-building block · ${(preview.length * 400).toLocaleString()}</strong><span>{validPreview ? 'Release to build' : 'Choose clear land'}</span>
        </div> : null}

        {!blocks.length ? <div className="empty-town-message"><span>🌱</span><strong>Your little town starts here.</strong><p>Choose a zone, then drag across up to three plots.</p></div> : null}
      </div>
    </div>
    <div className="camera-hint">{tool === 'explore' ? 'Drag to explore · Scroll to zoom' : tool === 'bulldoze' ? 'Tap a building to bulldoze · 50% refund' : 'Drag across 1–3 plots · Roads appear automatically'}</div>
  </div>
}
