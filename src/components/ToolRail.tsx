import { BriefcaseBusiness, Compass, Hammer, House, Store } from 'lucide-react'
import type { Tool } from '../game/types'

const TOOLS: Array<{ id: Tool; label: string; sub: string; icon: typeof Compass }> = [
  { id: 'explore', label: 'Explore', sub: 'Pan & inspect', icon: Compass },
  { id: 'residential', label: 'Homes', sub: '$400 / plot', icon: House },
  { id: 'shop', label: 'Shops', sub: '$400 / plot', icon: Store },
  { id: 'workspace', label: 'Work', sub: '$400 / plot', icon: BriefcaseBusiness },
  { id: 'bulldoze', label: 'Bulldoze', sub: '50% refund', icon: Hammer },
]

export function ToolRail({ active, onChange }: { active: Tool; onChange: (tool: Tool) => void }) {
  return <nav className="tool-rail" aria-label="Town tools">
    <div className="rail-title">BUILD</div>
    {TOOLS.map(({ id, label, sub, icon: Icon }) => <button key={id} className={`tool-button ${id} ${active === id ? 'active' : ''}`} onClick={() => onChange(id)} aria-pressed={active === id}>
      <Icon /><span><strong>{label}</strong><small>{sub}</small></span>
    </button>)}
  </nav>
}
