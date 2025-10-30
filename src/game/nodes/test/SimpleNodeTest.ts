import type { TreeNode } from '@ineka/engine'
import type { RenderSystem } from '../../../packages/pixi/nodes/RenderSystem'
import { InnerNode } from '@ineka/engine'
import { TextStyle } from 'pixi.js'
import { Transform } from '../../../packages/basic/utils/Transform'
import { Vector2 } from '../../../packages/math/utils/vectors'
import { Text2D } from '../../../packages/pixi/nodes/Text2D'

export class SimpleNodeTest extends InnerNode {
  protected _renderSystem = this.engine.systems.get('render') as RenderSystem

  public transform: Transform = new Transform()

  protected _text: Text2D

  constructor(parent: TreeNode) {
    super(parent)

    this.transform.position = new Vector2(100, 100)

    this._text = new Text2D(this, 'test', new TextStyle({
      fontFamily: 'Arial',
      fontSize: 24,
      fill: '#ffffff',
      stroke: '#000000',
    }))

    this._text.transform.position = this.transform.position

    this.add(this._text)
  }
}
