import type { Arena } from '../Arena'
import { Vector2 } from '../../../../../packages/math/utils/vectors'
import { AttackMove } from '../../moves/AttackMove'
import { DefenseMove } from '../../moves/DefenseMove'
import { PoisonTrapMove } from '../../moves/PoisonTrapMove'
import { Enemy } from './Enemy'

export class BasicEnemy extends Enemy {
  public health: number = 16
  public maxHealth: number = 16
  public shield: number = 0

  constructor(parent: Arena, arenaSlot: number) {
    super(parent, arenaSlot)

    this.addAvailableMoves([
      new PoisonTrapMove(this, 1),
      new AttackMove(this, this.arena.player, 6),
      new AttackMove(this, this.arena.player, 10),
      new DefenseMove(this, 3),
    ])

    this._movePatterns.set('default', [0, 2, 1])
    this.setNextMoveFromPattern()

    this.transform.size = new Vector2(100, 200)
    this.transform.position = this.arena.getEnemyCharacterPosition(this)
  }

  protected draw(): void {
    // Set position from bottom center of the transform
    this.transform.position = this.arena.getEnemyCharacterPosition(this)

    this._graphics.draw.clear()
    this._graphics.draw.rect(
      this.transform.position.x,
      this.transform.position.y,
      this.transform.size.x,
      this.transform.size.y,
    ).fill({ color: 'red' })
  }
}
