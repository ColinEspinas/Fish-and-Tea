import type { Asset } from '../../../../packages/asset-loading/types/Asset'
import type { Fighter } from '../dungeon/Fighter'
import { Move } from './Move'

export class DefenseMove extends Move {
  public readonly NAME: string = 'Defense'

  protected _duration: number = 1
  protected _value: number

  protected _icon: Asset = this._assetSystem.assets.get('image:shield-filled')!

  public get displayValue(): string {
    return `${this._value * this._fighter.dexterity}`
  }

  constructor(parent: Fighter, amount: number = 1) {
    super(parent)
    this._value = amount
  }

  protected draw(): void {}

  public beforeAction(): void {}

  public afterAction(): void {
    this._fighter.shield += this._value * this._fighter.dexterity
  }
}
