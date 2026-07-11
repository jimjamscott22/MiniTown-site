import type { Building as BuildingType, Resident } from '../game/types'

const LABELS = {
  residential: ['Cedar', 'Maple', 'Willow'],
  shop: ['Brew & Co.', 'Daily Goods', 'Petals'],
  workspace: ['Studio', 'Workshop', 'Office'],
}

interface Props { building: BuildingType; residents: Resident[]; onInspect: (building: BuildingType | null) => void }

export function Building({ building, residents, onInspect }: Props) {
  const occupants = residents.filter((resident) => resident.homeId === building.id || resident.workId === building.id || resident.shopId === building.id)
  const style = { '--x': building.x, '--y': building.y, '--variant': building.variant } as React.CSSProperties
  if (building.stage !== 'complete') return <div className={`building-site ${building.stage}`} style={style} aria-label={`${building.zone} under construction`}>
    <div className="site-pad" />
    {building.stage === 'frame' ? <div className="timber-frame"><i /><i /><i /><i /></div> : null}
    <span>{building.stage === 'frame' ? 'FRAMING' : 'FOUNDATION'}</span>
  </div>

  return <button className={`building ${building.zone} level-${building.level} variant-${building.variant}`} style={style} onMouseEnter={() => onInspect(building)} onMouseLeave={() => onInspect(null)} onFocus={() => onInspect(building)} onBlur={() => onInspect(null)} aria-label={`Inspect ${LABELS[building.zone][building.variant]}`}>
    <span className="building-shadow" />
    <span className="building-body">
      <span className="roof"><i /><i /></span>
      <span className="facade"><i className="window w1" /><i className="window w2" /><i className="door" />{building.zone === 'shop' ? <i className="awning" /> : null}</span>
      <span className="building-label">{LABELS[building.zone][building.variant]}</span>
      {building.level === 2 ? <span className="level-flag">★</span> : null}
      {occupants.length ? <span className="occupied-light" /> : null}
    </span>
  </button>
}
