import type { Fighter } from '../combat/dungeon/Fighter'
import { InnerNode } from '@ineka/engine'
import { TextStyle } from 'pixi.js'
import { Transform } from '../../../packages/basic/utils/Transform'
import { Vector2 } from '../../../packages/math/utils/vectors'
import { Text2D } from '../../../packages/pixi/nodes/Text2D'

export class NextMoveDisplay extends InnerNode {
  public transform: Transform = new Transform()
  protected _text: Text2D
  protected _fighter: Fighter

  constructor(parent: Fighter) {
    super(parent)
    this._fighter = parent

    this._text = new Text2D(this, '', new TextStyle({
      fontFamily: 'monogram',
      fill: 'white',
      fontSize: 24,
    }))
    this._text.write.anchor.set(0.5, 0)
    this.add(this._text)
  }

  protected onStep(_: number): void {
    this.transform.position = this._fighter.transform.position.clone().add(new Vector2(
      this._fighter.transform.size.x / 2,
      -40,
    ))
    this._text.transform.position = this.transform.position.clone()
    if (this._fighter.isDead()) {
      this._text.write.text = 'Dead'
    }
    else {
      this._text.write.text = `${this._fighter?.getNextMove()?.NAME} (${this._fighter.getNextMove().displayValue})`
    }
  }
}
