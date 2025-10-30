import type { Asset } from '../../../../packages/asset-loading/types/Asset'
import { StatusEffect } from './StatusEffect'

export class PoisonEffect extends StatusEffect {
  public readonly NAME: string = 'Poison'

  protected _stackable: boolean = true
  protected _stacks: number = 1

  protected _icon: Asset = this._assetSystem.assets.get('image:flask')!

  public turnEndEffect(): void {
    this.fighter.health -= this.stacks
    this.removeStacks(1)
  }
}
