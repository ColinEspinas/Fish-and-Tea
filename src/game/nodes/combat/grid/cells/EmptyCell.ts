import type { Asset } from '../../../../../packages/asset-loading/types/Asset'
import type { CellType } from '../../../../data/cells/cells'
import type { CellParams } from '../../../../types/cells'
import type { PlayerGrid } from '../PlayerGrid'
import { Cell } from './Cell'

export class EmptyCell extends Cell {
  public static readonly NAME: string = 'misc:empty'
  public static readonly TYPES: CellType[] = ['empty']

  protected _triggerSound: Asset = this._assetSystem.assets.get('sound:click')!

  protected _minCellGroupSize: number = 1

  constructor(parent: PlayerGrid, params: CellParams) {
    super(parent, params)
  }

  protected trigger(): void {
    if (!this._triggerable)
      return
    // this._triggerSound.sound?.play()
    this._grid.removeCell(this.index)
  }
}
