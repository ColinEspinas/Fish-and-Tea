import type { Engine } from '@ineka/engine'
import type { Cell } from '../nodes/combat/grid/cells/Cell'
import { OuterNode } from '@ineka/engine'
import { DefenseCell } from './combat/grid/cells/DefenseCell'
import { ShieldBlowCell } from './combat/grid/cells/links/ShieldBlowCell'
import { RifleCell } from './combat/grid/cells/RifleCell'

export class RunSystem extends OuterNode {
  public playerHealth: number = 100
  public playerMaxHealth: number = 100

  public maxMovePoints: number = 3

  public cellInventory: (typeof Cell)[] = [
    ...Array.from({ length: 10 }, () => RifleCell),
    ...Array.from({ length: 10 }, () => DefenseCell),
    ...Array.from({ length: 2 }, () => ShieldBlowCell),
  ]

  constructor(parent: Engine) {
    super(parent)
  }

  public addCellToInventory(cell: typeof Cell, count: number = 1): void {
    for (let i = 0; i < count; i++) {
      this.cellInventory.push(cell)
    }
  }

  public removeCellFromInventory(cell: typeof Cell, count: number = 1): void {
    for (let i = 0; i < count; i++) {
      const index = this.cellInventory.indexOf(cell)
      if (index > -1) {
        this.cellInventory.splice(index, 1)
      }
    }
  }

  public getInventoryCount(cell: typeof Cell): number {
    return this.cellInventory.filter(c => c === cell).length
  }

  public get uniqueInventoryTypes(): typeof Cell[] {
    return Array.from(new Set(this.cellInventory))
  }

  public get uniqueInventoryWithCount(): [typeof Cell, number][] {
    const inventoryMap: Map<typeof Cell, number> = new Map()
    this.cellInventory.forEach((cell) => {
      inventoryMap.set(cell, (inventoryMap.get(cell) || 0) + 1)
    })
    return Array.from(inventoryMap.entries())
  }

  protected _initialCellsWeights: { [key: string]: [typeof Cell, number] } = {
    [RifleCell.NAME]: [RifleCell, 1],
    [DefenseCell.NAME]: [DefenseCell, 1],
  }

  protected _currentCellsWeights: { [key: string]: [typeof Cell, number] } = { ...this._initialCellsWeights }

  public get initialCellsWeights(): { [key: string]: [typeof Cell, number] } {
    return this._initialCellsWeights
  }

  public get cellsWeights(): { [key: string]: [typeof Cell, number] } {
    return this._currentCellsWeights
  }

  public changeCellWeight(cell: typeof Cell, amount: number = 1): void {
    this._currentCellsWeights[cell.NAME] = [cell, this._currentCellsWeights[cell.NAME][1] + amount]
  }

  public resetCellsWeights(): void {
    this._currentCellsWeights = { ...this._initialCellsWeights }
  }
}
