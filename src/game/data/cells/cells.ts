import type { Cell } from '../../nodes/combat/grid/cells/Cell'
import { RifleCell } from '../../nodes/combat/grid/cells/RifleCell'
import { DefenseCell } from '../../nodes/combat/grid/cells/DefenseCell'
import { EmptyCell } from '../../nodes/combat/grid/cells/EmptyCell'
import { ShieldBlowCell } from '../../nodes/combat/grid/cells/links/ShieldBlowCell'

export const availableCells: (typeof Cell)[] = [
  EmptyCell,
  RifleCell,
  DefenseCell,
  ShieldBlowCell,
]

export type CellType =
  'empty' |
  'attack' |
  'defense' |
  'virus' |
  'utility'