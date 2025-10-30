import type { Fighter } from '../combat/dungeon/Fighter'
import { InnerNode } from '@ineka/engine'
import { TextStyle } from 'pixi.js'
import { Transform } from '../../../packages/basic/utils/Transform'
import { Vector2 } from '../../../packages/math/utils/vectors'
import { Text2D } from '../../../packages/pixi/nodes/Text2D'

export class DamageIndicator extends InnerNode {
  public transform: Transform = new Transform()
  protected _text: Text2D
  protected _fighter: Fighter

  protected _damage: number = 0
  protected _duration: number = 1
  protected _elapsed: number = 0

  protected _state: 'active' | 'inactive' = 'inactive'

  constructor(parent: Fighter) {
    super(parent)
    this._fighter = parent

    this._text = new Text2D(this, '', new TextStyle({
      fontFamily: 'monogram',
      fill: 'rgba(255, 0, 0, 0)',
      fontSize: 36,
      fontWeight: 'bold',
    }))
    this._text.write.anchor.set(0.5, 0)
    this.add(this._text)
  }

  protected onStep(delta: number): void {
    this.transform.position = this._fighter.transform.position.clone().add(new Vector2(
      this._fighter.transform.size.x / 2,
      this._fighter.transform.size.y,
    ))
    this._text.transform.position = this.transform.position.clone()
    if (this._state === 'active') {
      this._elapsed += delta
      const yOffset = Math.sin(this._elapsed * 2) * 10
      this._text.transform.position.y = this.transform.position.y - yOffset
      const alpha = Math.max(0, 1 - (this._elapsed / this._duration))
      this._text.write.style.fill = `rgba(255, 0, 0, ${alpha})`
      this._text.write.text = `${this._damage}`
      if (this._elapsed >= this._duration) {
        this._state = 'inactive'
      }
    } else {
      this._text.write.text = ''
    }
  }

  public showDamage(damage: number): void {
    this._damage = damage
    this._elapsed = 0
    this._state = 'active'
  }
}
