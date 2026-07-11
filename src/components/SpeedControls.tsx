import { Pause, Play, Search, ZoomIn, ZoomOut } from 'lucide-react'

interface Props { speed: number; paused: boolean; onSpeed: (speed: number) => void; onPause: () => void; onZoom: (delta: number) => void }

export function SpeedControls({ speed, paused, onSpeed, onPause, onZoom }: Props) {
  return <div className="bottom-controls">
    <div className="zoom-controls"><Search /><button onClick={() => onZoom(-0.1)} aria-label="Zoom out"><ZoomOut /></button><button onClick={() => onZoom(0.1)} aria-label="Zoom in"><ZoomIn /></button></div>
    <div className="speed-controls">
      <button className={paused ? 'active' : ''} onClick={onPause} aria-label={paused ? 'Resume simulation' : 'Pause simulation'}>{paused ? <Play /> : <Pause />}</button>
      {[1, 2, 4].map((value) => <button key={value} className={!paused && speed === value ? 'active' : ''} onClick={() => onSpeed(value)}>{value}×</button>)}
    </div>
  </div>
}
