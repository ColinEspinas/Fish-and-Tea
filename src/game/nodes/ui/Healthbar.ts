import type { Fighter } from '../combat/dungeon/Fighter'
import { Engine, InnerNode, TreeNode } from '@ineka/engine'
import { TextStyle } from 'pixi.js'
import { Transform } from '../../../packages/basic/utils/Transform'
import { Vector2 } from '../../../packages/math/utils/vectors'
import { Graphics2D } from '../../../packages/pixi/nodes/Graphics2D'
import { Sprite2D } from '../../../packages/pixi/nodes/Sprite2D'
import { Text2D } from '../../../packages/pixi/nodes/Text2D'

export class Healthbar extends InnerNode {
  public transform: Transform = new Transform()
  protected _parent: Fighter

  protected _bar: Graphics2D
  protected _healthtext: Text2D
  protected _shieldIcon: Sprite2D
  protected _shieldtext: Text2D

  constructor(parent: Fighter, options?: {
    position?: Vector2
    width?: number
  }) {
    super(parent)
    this._parent = parent
    this.transform.position = options?.position ?? Vector2.ZERO
    this.transform.size = new Vector2(options?.width ?? 100, 20)

    this._bar = new Graphics2D(this)
    this.add(this._bar)

    const healthTextStyle = new TextStyle({
      fontFamily: 'monogram',
      fill: 'white',
      fontSize: 18,
    })

    this._healthtext = new Text2D(this, '', healthTextStyle)
    this._healthtext.write.anchor.set(0.5)

    this._shieldIcon = new Sprite2D(this, 'image:shield-filled', {
      size: new Vector2(35, 35),
      anchor: 0.5,
      useParentTransform: false,
    })

    const shieldTextStyle = new TextStyle({
      fontFamily: 'monogram',
      fill: 'black',
      fontSize: 24,
      fontWeight: 'bold',
    })

    this._shieldtext = new Text2D(this, '', shieldTextStyle)
    this._shieldtext.write.anchor.set(0.5)

    this.setBarPosition()

    this.add(this._healthtext)
    this.add(this._shieldIcon)
    this.add(this._shieldtext)
  }

  protected setBarPosition() {
    this._bar.draw.position = new Vector2(
      this.transform.position.x - this.transform.size.x / 2,
      this.transform.position.y - this.transform.size.y / 2,
    )
    this._healthtext.transform.position = new Vector2(
      this.transform.position.x,
      this.transform.position.y - 3,
    )
    this._shieldIcon.position = new Vector2(
      this.transform.position.x - this.transform.size.x / 2 - 5,
      this.transform.position.y - 2,
    )
    this._shieldtext.transform.position = new Vector2(
      this.transform.position.x - this.transform.size.x / 2 - 5,
      this.transform.position.y - this.transform.size.y / 2 + 4,
    )
  }

  protected draw(): void {
    const health = this._parent.health
    const maxHealth = this._parent.maxHealth
    const shield = this._parent.shield

    this.setBarPosition()
    this._bar.draw.clear()
    this._bar.draw.roundRect(
      0,
      0,
      maxHealth / maxHealth * this.transform.size.x,
      this.transform.size.y,
      5,
    ).fill({
      color: 'rgb(49, 61, 90)',
    }).stroke({
      color: 'rgb(49, 61, 90)',
      width: 2,
      alignment: 0,
    })
    this._bar.draw.roundRect(
      0,
      0,
      health / maxHealth * this.transform.size.x,
      this.transform.size.y,
      5,
    ).fill({
      color: 'green',
    })

    this._healthtext.write.text = 'test'
    this._healthtext.write.text = `${health} / ${maxHealth}`

    if (shield <= 0) {
      this._shieldIcon.display.visible = false
      this._shieldtext.write.visible = false
    }
    else {
      this._shieldIcon.display.visible = true
      this._shieldtext.write.visible = true
      this._shieldtext.write.text = shield.toString()
    }
  }

  protected onStep(_: number): void {
    this.draw()
  }
}
