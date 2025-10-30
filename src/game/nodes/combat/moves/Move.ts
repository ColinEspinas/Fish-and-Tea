import type { AssetSystem } from '../../../../packages/asset-loading/nodes/AssetSystem'
import type { Asset } from '../../../../packages/asset-loading/types/Asset'
import { CombatSystem } from '../CombatSystem'
import type { Fighter } from '../dungeon/Fighter'
import { InnerNode } from '@ineka/engine'

export class Move extends InnerNode {
  public readonly NAME: string = 'Default'

  protected _assetSystem = this.engine.systems.get('assets') as AssetSystem
  protected _combatSystem = this.engine.systems.get('combat') as CombatSystem

  protected _icon: Asset = this._assetSystem.assets.get('image:head')!

  protected _fighter: Fighter
  protected _target?: Fighter
  protected _needTarget: boolean = false

  protected _started: boolean = false
  protected _duration: number = 1
  protected _lifetime: number = 0

  protected _value: number = 1

  public get needTarget(): boolean {
    return this._needTarget
  }

  public get displayValue(): string {
    return this._value.toString()
  }

  public get icon(): Asset { return this._icon }

  public get started(): boolean {
    return this._started
  }

  public get ended(): boolean {
    if (this._duration <= this._lifetime) {
      this._lifetime = 0
      return true
    }
    return false
  }

  constructor(parent: Fighter, target?: Fighter) {
    super(parent)
    this._fighter = parent
    this._target = target
  }

  protected onStep(delta: number): void {
    if (this._started) {
      this._lifetime += delta
      this.draw()
      if (this._lifetime >= this._duration) {
        this.afterAction()
        this._started = false
        this._fighter.actor.send({ type: 'move.end' })
      }
    }
  }

  protected draw(): void {}

  public start(): void {
    this._lifetime = 0
    this._started = true
    this.beforeAction()
  }

  public afterAction(): void {}

  public beforeAction(): void {}

  public setTarget(target: Fighter): void {
    this._target = target
  }
}
