import type { Actor } from 'xstate'
import type { Move } from '../moves/Move'
import type { StatusEffect } from '../status/StatusEffect'
import type { Arena } from './Arena'
import { InnerNode } from '@ineka/engine'
import { createActor } from 'xstate'
import { Transform } from '../../../../packages/basic/utils/Transform'
import { Vector2 } from '../../../../packages/math/utils/vectors'
import { Graphics2D } from '../../../../packages/pixi/nodes/Graphics2D'
import { seededRandom } from '../../../data/random'
import { fighterMachine } from '../../../machines/Fighter'
import { Selectable } from '../../cursor/Selectable'
import { Healthbar } from '../../ui/Healthbar'
import { DamageIndicator } from '../../ui/DamageIndicator'
import { StatusDisplay } from '../../ui/StatusDisplay'

export class Fighter extends InnerNode {
  public transform: Transform = new Transform()
  protected _graphics: Graphics2D

  public arena: Arena
  public arenaSlot: number

  public actor: Actor<typeof fighterMachine> = createActor(fighterMachine)

  public selectable: Selectable

  public health: number = 10
  public maxHealth: number = 10
  public shield: number = 10
  protected _healthbar: Healthbar
  protected _damageIndicator: DamageIndicator

  public statusEffects: StatusEffect[] = []
  protected _statusDisplay: StatusDisplay

  public strength: number = 1
  public dexterity: number = 1

  protected _availableMoves: Move[] = []
  protected _nextMove: number = 0

  protected _movePatterns: Map<string, number[]> = new Map()
  protected _currentMovePattern: string | null = null
  protected _nextMoveInPattern: number = 0

  constructor(parent: Arena, arenaSlot: number) {
    super(parent)
    this.arena = parent
    this.arenaSlot = arenaSlot

    this.transform.position = this.arena.getEnemyCharacterPosition(this)

    this._graphics = new Graphics2D(this)
    this.add(this._graphics)

    this.selectable = new Selectable(this, () => {}, {
      padding: 50,
      useParentTransform: true,
      type: 'fighter',
    })
    this.add(this.selectable)

    this._healthbar = new Healthbar(this, {
      position: this.transform.position.clone(),
      width: this.transform.size.x,
    })
    this.setHealthbarPosition()
    this.add(this._healthbar)

    this._damageIndicator = new DamageIndicator(this)
    this.add(this._damageIndicator)

    this._statusDisplay = new StatusDisplay(this, {
      position: this.transform.position.clone().add(new Vector2(0, 20)),
    })
    this.setStatusDisplayPosition()
    this.add(this._statusDisplay)

    for (const move of this._availableMoves) {
      this.add(move)
    }
  }

  protected onLoad(): void {
    this.actor.start()
  }

  protected onUnload(): void {
    this.actor.stop()
  }

  protected setHealthbarPosition(): void {
    this._healthbar.transform.position = this.transform.position.clone().add(new Vector2(this.transform.size.x / 2, this.transform.size.y + 20))
    this._healthbar.transform.size.x = this.transform.size.x
  }

  protected setStatusDisplayPosition(): void {
    this._statusDisplay.transform.position = this.transform.position.clone().add(new Vector2(this.transform.size.x + 10, 0))
  }

  protected onStep(_: number): void {
    this.setHealthbarPosition()
    this.setStatusDisplayPosition()

    this.draw()
  }

  protected draw(): void {}

  public takeDamage(damage: number): void {
    if (this.isDead()) {
      return
    }
    this._damageIndicator.showDamage(damage)
    if (this.shield > 0) {
      const shieldDamage = Math.min(this.shield, damage)
      this.shield -= shieldDamage
      damage -= shieldDamage
      if (damage >= 0) {
        if (this.shield === 0) {
          this.shieldBreak()
        }
      }
      if (damage === 0) {
        this.tookShieldDamage(damage)
      }
    }
    if (damage > 0) {
      this.tookHealthDamage(damage)
    }
    this.health = Math.max(0, this.health - damage)
    if (this.isDead()) {
      this.die()
    }
  }

  public heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount)
    this.healed(amount)
  }

  public defend(amount: number): void {
    this.shield += amount
    this.defended()
  }

  public isDead(): boolean {
    return this.health <= 0
  }

  protected die(): void {}

  protected tookHealthDamage(_amount?: number): void {}

  protected tookShieldDamage(_amount?: number): void {}

  protected shieldBreak(): void {}

  protected defended(): void {}

  protected healed(_amount?: number): void {}

  public applyStatusEffect(Effect: typeof StatusEffect, stacks?: number): void {
    if (this.getStatusEffect(Effect)) {
      if (stacks) {
        this.addStatusEffectStack(Effect, stacks)
      }
      return
    }
    const statusEffect = new Effect(this)
    if (stacks) {
      statusEffect.addStacks(Math.max(0, stacks - statusEffect.stacks))
    }
    this.statusEffects.push(statusEffect)
    this.add(statusEffect)
  }

  public addStatusEffectStack(Effect: typeof StatusEffect, amount: number = 1): void {
    const statusEffect = this.getStatusEffect(Effect)
    if (statusEffect) {
      statusEffect.addStacks(amount)
    }
  }

  public removeStatusEffectStack(Effect: typeof StatusEffect, amount: number = 1): void {
    const statusEffect = this.getStatusEffect(Effect)
    if (statusEffect) {
      statusEffect.removeStacks(amount)
    }
  }

  public removeStatusEffect(effect: StatusEffect): void {
    const index = this.statusEffects.findIndex(e => e === effect)
    if (index === -1) {
      return
    }
    const statusEffect = this.statusEffects[index]
    this.statusEffects.splice(index, 1)
    this.remove(statusEffect)
  }

  public getStatusEffect(Effect: typeof StatusEffect): StatusEffect | null {
    return this.statusEffects.find(e => e instanceof Effect) ?? null
  }

  public addAvailableMove(move: Move): void {
    this._availableMoves.push(move)
    this.add(move)
  }

  public addAvailableMoves(moves: Move[]): void {
    for (const move of moves) {
      this.addAvailableMove(move)
    }
  }

  public getNextMove(): Move {
    return this._availableMoves[this._nextMove]
  }

  public setNextMove(index: number): void {
    this._nextMove = index
  }

  public setNextMoveFromPattern(): void {
    if (!this._currentMovePattern) {
      this._currentMovePattern = this.getRandomPattern()
      const currentMovePattern = this._movePatterns.get(this._currentMovePattern)!
      this._nextMoveInPattern = 0
      this._nextMove = currentMovePattern[this._nextMoveInPattern]
    }
    const pattern = this._movePatterns.get(this._currentMovePattern)!
    this._nextMove = pattern[this._nextMoveInPattern]
    this._nextMoveInPattern = this._nextMoveInPattern + 1
    if (this._nextMove === undefined) {
      this._nextMoveInPattern = 0
      this._currentMovePattern = null
      this.setNextMoveFromPattern()
    }
  }

  public getRandomPattern(): string {
    const patterns = Array.from(this._movePatterns.keys())
    return patterns[Math.floor(seededRandom.minmaxInt(0, patterns.length))]
  }
}
