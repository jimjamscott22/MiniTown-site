import { getWalkerPosition } from '../game/simulation'
import type { Building, Resident } from '../game/types'

export function WorldEntities({
  residents,
  buildings,
  hour,
  minuteInHour,
}: {
  residents: Resident[]
  buildings: Building[]
  hour: number
  minuteInHour: number
}) {
  const completeBuildings = buildings.filter((building) => building.stage === 'complete')
  const people = residents.slice(0, 10)
  const cars = completeBuildings.filter((building) => building.zone === 'workspace').slice(0, 4)

  return <div className="world-entities" aria-hidden="true">
    {people.map((resident, index) => {
      const pos = getWalkerPosition(resident, hour, minuteInHour, completeBuildings)
      const atWork = resident.workId && hour >= 8 && hour < 17
      const atShop = resident.shopId && hour >= 17 && hour < 19
      return <span
        key={resident.id}
        className={`person p${index % 5} sim-linked ${atWork ? 'at-work' : atShop ? 'at-shop' : 'at-home'}`}
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          transition: 'left 2.8s ease, top 2.8s ease',
        } as React.CSSProperties}
      ><i /></span>
    })}
    {cars.map((building, index) => {
      const pos = {
        x: building.x * 132 + 20,
        y: building.y * 104 + 72 + index * 8,
      }
      return <span
        key={`car-${building.id}`}
        className={`car car-${index % 3} sim-linked`}
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          '--delay': `${-index * 4.3}s`,
        } as React.CSSProperties}
      ><i /></span>
    })}
  </div>
}
