import type { Asset } from '../../../../../packages/asset-loading/types/Asset'
import type { CellType } from '../../../../data/cells/cells'
import type { CellParams } from '../../../../types/cells'
import type { PlayerGrid } from '../PlayerGrid'
import { Vector2 } from '../../../../../packages/math/utils/vectors'
import { Sprite2D } from '../../../../../packages/pixi/nodes/Sprite2D'
import { Cell } from './Cell'

export class PoisonCell extends Cell {
  public static readonly NAME: string = 'curse:poison'
  public static readonly TYPES: CellType[] = ['defense', 'virus']

  protected _triggerSound: Asset = this._assetSystem.assets.get('sound:click')!

  constructor(parent: PlayerGrid, params: CellParams) {
    super(parent, params)
    this._sprite = new Sprite2D(this, 'image:skull', {
      useParentTransform: false,
      size: new Vector2(
        this.transform.size.x - 10,
        this.transform.size.y - 10,
      ),
      anchor: 0.5,
      position: this.getSpritePosition(),
    })
    this.add(this._sprite)
  }
}
