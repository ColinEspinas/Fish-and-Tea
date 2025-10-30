import type { Asset } from '../../../../packages/asset-loading/types/Asset'
import type { Fighter } from '../dungeon/Fighter'
import { Move } from './Move'

export class AttackMove extends Move {
  public readonly NAME: string = 'Attack'

  protected _duration: number = 0.2
  protected _needTarget: boolean = true
  protected _icon: Asset = this._assetSystem.assets.get('image:sword')!

  public get displayValue(): string {
    return `${this._value * this._fighter.strength}`
  }

  constructor(parent: Fighter, target?: Fighter, damage: number = 1) {
    super(parent, target)
    this._value = damage
  }

  protected draw(): void {}

  public beforeAction(): void {}

  public afterAction(): void {
    this._target?.takeDamage(this._value * this._fighter.strength)
  }
}
