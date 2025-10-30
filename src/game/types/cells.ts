import type { Vector2 } from '../../packages/math/utils/vectors'
import type { CellType } from '../data/cells/cells'

export interface CellParams { index: number, position: Vector2, size: Vector2 }

export interface CellDisplayData {
  name: string
  types: CellType[]
  description: string
}
