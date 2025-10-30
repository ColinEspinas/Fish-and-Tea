import type { Asset } from '../../../../packages/asset-loading/types/Asset'
import { StatusEffect } from './StatusEffect'

export class StrengthEffect extends StatusEffect {
  public readonly NAME: string = 'Strength'

  protected _bonusPerStack: number = 1
  protected _stackable: boolean = true
  protected _stacks: number = 1

  protected _icon: Asset = this._assetSystem.assets.get('image:sword')!

  protected onLoad(): void {
    this.fighter.strength += this._bonusPerStack
  }

  public stacksAdded(amount: number): void {
    this.fighter.strength += amount * this._bonusPerStack
  }

  public stacksRemoved(amount: number): void {
    this.fighter.strength -= amount * this._bonusPerStack
  }

  protected onUnload(): void {
    this.fighter.strength -= this.stacks * this._bonusPerStack
  }
}
