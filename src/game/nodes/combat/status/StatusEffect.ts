import type { AssetSystem } from '../../../../packages/asset-loading/nodes/AssetSystem'
import type { Asset } from '../../../../packages/asset-loading/types/Asset'
import type { Fighter } from '../dungeon/Fighter'
import { InnerNode } from '@ineka/engine'

export class StatusEffect extends InnerNode {
  public readonly NAME: string = 'Default'

  protected _assetSystem = this.engine.systems.get('assets') as AssetSystem

  protected _stackable: boolean = false
  protected _stacks: number = 1
  protected _permanent: boolean = false

  protected _icon: Asset = this._assetSystem.assets.get('image:head')!
  public get icon(): Asset { return this._icon }

  public get stacks(): number { return this._stacks }

  public fighter: Fighter

  constructor(parent: Fighter) {
    super(parent)
    this.fighter = parent
  }

  public addStacks(amount: number = 1): void {
    if (this._stackable) {
      this._stacks += amount
      this.stacksAdded(amount)
    }
  }

  public stacksAdded(_amount: number = 1): void {}

  public removeStacks(amount: number = 1): void {
    if (this._stackable) {
      this._stacks -= amount
      this.stacksRemoved(amount)
    }
  }

  public stacksRemoved(_amount: number = 1): void {}

  public turnStartEffect(): void {}

  public turnEndEffect(): void {}

  public needToRemove(): boolean {
    return this._stacks <= 0 && !this._permanent
  }
}
