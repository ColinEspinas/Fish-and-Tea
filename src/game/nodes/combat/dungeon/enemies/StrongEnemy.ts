import type { Arena } from '../Arena'
import { Vector2 } from '../../../../../packages/math/utils/vectors'
import { AttackMove } from '../../moves/AttackMove'
import { DefenseMove } from '../../moves/DefenseMove'
import { Enemy } from './Enemy'

export class StrongEnemy extends Enemy {
  public health: number = 50
  public maxHealth: number = 50
  public shield: number = 100

  constructor(parent: Arena, arenaSlot: number) {
    super(parent, arenaSlot)

    this.addAvailableMoves([
      new AttackMove(this, this.arena.player, 10),
      new AttackMove(this, this.arena.player, 20),
      new DefenseMove(this, 10),
    ])

    this._movePatterns.set('default', [0, 2, 1])
    this.setNextMoveFromPattern()

    this.transform.size = new Vector2(150, 100)
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
    ).fill({ color: 'pink' })
  }
}
