import type { TreeNode } from '@ineka/engine'
import type { RenderSystem } from '../../../../packages/pixi/nodes/RenderSystem'
import type { RunSystem } from '../../RunSystem'
import type { CombatSystem } from '../CombatSystem'
import type { Enemy } from './enemies/Enemy'
import type { Fighter } from './Fighter'
import { InnerNode } from '@ineka/engine'
import { TextStyle } from 'pixi.js'
import { Transform } from '../../../../packages/basic/utils/Transform'
import { Vector2 } from '../../../../packages/math/utils/vectors'
import { Graphics2D } from '../../../../packages/pixi/nodes/Graphics2D'
import { Text2D } from '../../../../packages/pixi/nodes/Text2D'
import { BasicEnemy } from './enemies/BasicEnemy'
import { StrongEnemy } from './enemies/StrongEnemy'
import { PlayerCharacter } from './PlayerCharacter'

export class Arena extends InnerNode {
  protected _runSystem = this.engine.systems.get('run') as RunSystem
  protected _combatSystem = this.engine.systems.get('combat') as CombatSystem
  protected _renderSystem = this.engine.systems.get('render') as RenderSystem

  public transform: Transform = new Transform()
  protected _background!: Graphics2D
  protected _outline: Graphics2D
  protected _turnText: Text2D
  protected _movePointsText: Text2D

  public player: PlayerCharacter
  public enemies: Enemy[] = []

  constructor(parent: TreeNode, size: Vector2) {
    super(parent)
    this._combatSystem.setArena(this)

    this.transform.size = size.clone()

    this._outline = new Graphics2D(this)

    this.player = new PlayerCharacter(this, 0)

    // TODO: Replace with a more dynamic way to create enemies
    const enemy = new BasicEnemy(this, 0)
    const enemy2 = new StrongEnemy(this, 1)
    const enemy3 = new BasicEnemy(this, 2)

    this.enemies.push(enemy)
    this.enemies.push(enemy2)
    this.enemies.push(enemy3)

    this._turnText = new Text2D(this, 'Your turn', new TextStyle({
      fontFamily: 'monogram',
      fill: 'white',
      fontSize: 30,
    }))

    this._movePointsText = new Text2D(this, 'Move points: 0/3', new TextStyle({
      fontFamily: 'monogram',
      fill: 'white',
      fontSize: 30,
    }))
    this._movePointsText.write.anchor.set(1, 0)

    // Center the arena on the screen
    const screenCenter = this._renderSystem.getCenter()
    this.transform.position = new Vector2(
      screenCenter.x - this.transform.size.x / 2 + 200,
      screenCenter.y - this.transform.size.y / 2,
    )

    this._turnText.transform.position = new Vector2(
      this.transform.position.x + 10,
      this.transform.position.y,
    )

    this._movePointsText.transform.position = new Vector2(
      this.transform.position.x + this.transform.size.x - 10,
      this.transform.position.y + this.transform.size.y - 40,
    )

    this.add(this._outline)
    this.add(this.player)
    this.add(this._turnText)
    this.add(this._movePointsText)
    this.add(enemy)
    this.add(enemy2)
    this.add(enemy3)
  }

  protected onLoad(): void {
    this._combatSystem.actor.subscribe((state) => {
      if (state.matches('enemiesTurn')) {
        this._turnText.write.text = 'Enemy turn'
      }
      else if (state.matches('playerTurn')) {
        this._turnText.write.text = 'Your turn'
      }
    })
  }

  public getPlayerCharacterPosition(): Vector2 {
    return new Vector2(
      this.transform.position.x + 100,
      this.transform.position.y + this.transform.size.y - 50,
    ).add(new Vector2(-this.player.transform.size.x / 2, -this.player.transform.size.y))
  }

  public getEnemyCharacterPosition(fighter: Fighter): Vector2 {
    const index = this.enemies.findIndex(enemy => enemy && enemy.id === fighter.id)

    return new Vector2(
      this.transform.position.x + this.transform.size.x - 100 - 150 * index,
      this.transform.position.y + this.transform.size.y - 175 + 20 * index,
    ).add(new Vector2(-fighter.transform.size.x / 2, -fighter.transform.size.y))
  }

  protected onStep(_: number): void {
    if (this.enemies.every(enemy => !enemy || enemy.isDead())) {
      for (let i = 0; i < 3; i++) {
        this.remove(this.enemies[i]!)
        const enemy = new BasicEnemy(this, i)
        this.add(enemy)
        this.enemies[i] = enemy
      }
    }

    // Center the arena on the screen
    const screenCenter = this._renderSystem.getCenter()
    this.transform.position = new Vector2(
      screenCenter.x - this.transform.size.x / 2 + 200,
      screenCenter.y - this.transform.size.y / 2,
    )

    this._turnText.transform.position = new Vector2(
      this.transform.position.x + 10,
      this.transform.position.y,
    )

    this._movePointsText.transform.position = new Vector2(
      this.transform.position.x + this.transform.size.x - 10,
      this.transform.position.y + this.transform.size.y - 40,
    )

    this._movePointsText.write.text = `Move points: ${this._combatSystem.movePointsLeft}/${this._runSystem.maxMovePoints}`

    this._outline.draw.clear()
    this._outline.draw
      .roundRect(this.transform.position.x, this.transform.position.y, this.transform.size.x, this.transform.size.y, 10)
      .fill({
        color: 'rgb(11, 14, 20)',
      })
  }
}
