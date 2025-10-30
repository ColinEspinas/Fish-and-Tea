import { randomInt } from 'mathjs'
import type { Asset } from '../../../../packages/asset-loading/types/Asset'
import type { Fighter } from '../dungeon/Fighter'
import { PoisonCell } from '../grid/cells/PoisonCell'
import { Move } from './Move'

export class PoisonTrapMove extends Move {
  public readonly NAME: string = 'Poison Trap'

  protected _duration: number = 0.2
  protected _needTarget: boolean = true
  protected _icon: Asset = this._assetSystem.assets.get('image:sword')!

  public get displayValue(): string {
    return `${this._value}`
  }

  constructor(parent: Fighter, amount: number = 1) {
    super(parent)
    this._value = amount
  }

  protected draw(): void {}

  public beforeAction(): void {}

  public afterAction(): void {
    this._combatSystem.grid.setCell(randomInt(5, 10), PoisonCell)
  }
}
