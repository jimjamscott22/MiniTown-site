import { BriefcaseBusiness, HardHat, House, Store, Users } from 'lucide-react'
import { activityAtBuilding, buildingEconomyLabel, buildingIncome } from '../game/simulation'
import type { Building, Resident } from '../game/types'

const TITLES = {
  residential: ['Cedar Cottage', 'Maple House', 'Willow Home'],
  shop: ['Brew & Co.', 'Daily Goods', 'Petals & Co.'],
  workspace: ['Design Studio', 'Maker Workshop', 'Town Office'],
}

export function Inspector({
  building,
  residents,
  hour,
  happinessReasons,
}: {
  building: Building | null
  residents: Resident[]
  hour: number
  happinessReasons: string[]
}) {
  if (!building) return null
  const people = residents.filter((resident) => resident.homeId === building.id || resident.workId === building.id || resident.shopId === building.id).slice(0, 4)
  const Icon = building.stage !== 'complete' ? HardHat : building.zone === 'residential' ? House : building.zone === 'shop' ? Store : BriefcaseBusiness
  const economy = buildingEconomyLabel(building, people.length)
  const incomeValue = buildingIncome(building, people.length)

  return <aside className="inspector">
    <div className={`inspector-icon ${building.zone}`}><Icon /></div>
    <div className="inspector-heading"><span>{TITLES[building.zone][building.variant]}</span><small>{building.stage === 'complete' ? `Level ${building.level}` : 'Under construction'}</small></div>
    <div className="inspector-status"><span className="pulse-dot" />{building.stage === 'complete' ? economy : building.stage === 'frame' ? 'The timber frame is going up' : 'The foundation is being poured'}</div>
    {building.stage === 'complete' ? <>
      {incomeValue > 0 ? <div className="inspector-economy"><strong>+${incomeValue}/hr</strong><span>{building.zone === 'residential' ? 'Population income' : building.zone === 'shop' ? 'Retail + mood boost' : 'Jobs for residents'}</span></div> : null}
      <div className="occupancy"><Users /> <span>{people.length || 'No'} {building.zone === 'residential' ? 'residents' : 'visitors'} here</span></div>
      <div className="people-list">{people.length ? people.map((person) => <div key={person.id}><span className="avatar">{person.name[0]}</span><span><strong>{person.name}</strong><small>{activityAtBuilding(person, building.id, hour)}</small></span></div>) : <p>Waiting for the town to grow.</p>}</div>
      <div className="inspector-mood"><small>Town mood</small><span>{happinessReasons[0]}</span></div>
    </> : <div className="build-progress"><span style={{ width: building.stage === 'frame' ? '68%' : '28%' }} /></div>}
  </aside>
}
