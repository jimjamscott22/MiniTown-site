import type { Resident } from '../game/types'

export function WorldEntities({ residents }: { residents: Resident[] }) {
  const people = residents.slice(0, 10)
  const cars = residents.slice(0, Math.min(4, Math.ceil(residents.length / 4)))
  return <div className="world-entities" aria-hidden="true">
    {people.map((resident, index) => <span key={resident.id} className={`person p${index % 5}`} style={{ '--delay': `${-index * 1.7}s`, '--lane': index % 4 } as React.CSSProperties}><i /></span>)}
    {cars.map((resident, index) => <span key={`car-${resident.id}`} className={`car car-${index % 3}`} style={{ '--delay': `${-index * 4.3}s`, '--car-lane': index % 3 } as React.CSSProperties}><i /></span>)}
  </div>
}
