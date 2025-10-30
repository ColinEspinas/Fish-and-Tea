import type { CombatSystem } from '../CombatSystem'
import { Vector2 } from '../../../../packages/math/utils/vectors'
import { PoisonEffect } from '../status/PoisonEffect'
import { Fighter } from './Fighter'

export class PlayerCharacter extends Fighter {
  protected _combatSystem = this.engine.systems.get('combat') as CombatSystem

  public maxHealth: number = 100
  public health: number = 100
  public shield: number = 0

  protected onLoad(): void {
    super.onLoad()

    this.transform.size = new Vector2(100, 200)
    this.transform.position = this.arena.getPlayerCharacterPosition()

    // TODO: Remove this
    this.applyStatusEffect(PoisonEffect, 3)
    // this.applyStatusEffect(StrengthEffect, 10)

    this.actor.subscribe((state) => {
      if (state.matches('idle')) {
        if (this._availableMoves.length > 0 && this._availableMoves[0].ended) {
          this._availableMoves.shift()
          if (this._availableMoves.length > 0) {
            this.actor.send({ type: 'move.start' })
          }
          else {
            this._combatSystem.actor.send({ type: 'player.next', movesPoints: this._combatSystem.movePointsLeft })
          }
        }
      }

      if (state.matches('move')) {
        if (this._availableMoves.length <= 0) {
          this.actor.send({ type: 'move.end' })
          this._combatSystem.actor.send({ type: 'player.next', movesPoints: this._combatSystem.movePointsLeft })
        }
        else if (!this._availableMoves[0].started) {
          this._availableMoves[0].start()
        }
      }
    })
  }

  protected draw(): void {
    this.transform.position = this.arena.getPlayerCharacterPosition()

    this._graphics.draw.clear()
    this._graphics.draw.rect(
      this.transform.position.x,
      this.transform.position.y,
      this.transform.size.x,
      this.transform.size.y,
    ).fill({ color: 'blue' })
  }

  public setTarget(target: Fighter): void {
    this._availableMoves.forEach((move) => {
      move.setTarget(target)
    })
  }

  public startMoves(): void {
    this._availableMoves.forEach((move) => {
      move.start()
    })
  }
}
