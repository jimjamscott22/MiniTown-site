export type ZoneType = 'residential' | 'shop' | 'workspace'
export type Tool = 'explore' | ZoneType
export type ConstructionStage = 'foundation' | 'frame' | 'complete'

export interface GridCell { x: number; y: number }

export interface Block {
  id: string
  zone: ZoneType
  cells: GridCell[]
  createdAt: number
}

export interface Building extends GridCell {
  id: string
  blockId: string
  zone: ZoneType
  variant: number
  createdAt: number
  stage: ConstructionStage
  level: number
}

export interface Resident {
  id: string
  name: string
  homeId: string
  workId?: string
  shopId?: string
}

export interface TownResources {
  money: number
  population: number
  happiness: number
  income: number
}
