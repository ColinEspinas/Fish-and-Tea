import type { TextStyle } from 'pixi.js'
import type { TreeNodeWithTransform } from '../../basic/types/nodes'
import type { RenderSystem } from './RenderSystem'
import type { SceneSystem } from './SceneSystem'
import { OuterNode } from '@ineka/engine'
import { Text } from 'pixi.js'
import { Transform } from '../../basic/utils/Transform'
import { Vector2 } from '../../math/utils/vectors'

export class Text2D extends OuterNode {
  protected _sceneSystem = this.engine.systems.get('scenes') as SceneSystem
  protected _renderSystem = this.engine.systems.get('render') as RenderSystem

  protected _text!: Text
  protected _renderOnActiveScene: boolean = false
  public transform: Transform = new Transform()

  public get write(): Text {
    return this._text
  }

  constructor(parent: TreeNodeWithTransform, text: string, style: TextStyle, options?: {
    position?: Vector2
    size?: Vector2
    rotation?: number
    renderOnActiveScene?: boolean
  }) {
    super(parent)
    this.transform.position = options?.position || Vector2.ZERO.clone()
    this.transform.rotation = options?.rotation || 0

    this._text = new Text({ text, style })
    this._renderOnActiveScene = options?.renderOnActiveScene ?? true
    this.setPixiTextProperties()
  }

  protected setPixiTextProperties(): void {
    this._text.position.set(this.transform.position.x, this.transform.position.y)
    // this._text.setSize(this.transform.size.x, this.transform.size.y)
    this._text.rotation = this.transform.rotation
  }

  protected onLoad(): void {
    if (this._renderOnActiveScene) {
      this._sceneSystem.activeScene?.stage.addChild(this._text)
    }
    else {
      this._renderSystem.globalContainer.addChild(this._text)
    }
  }

  protected onStep(_: number): void {
    this.setPixiTextProperties()
  }

  protected onUnload(): void {
    if (this._renderOnActiveScene) {
      this._sceneSystem.activeScene?.stage.removeChild(this._text)
    }
    else {
      this._renderSystem.globalContainer.removeChild(this._text)
    }
  }
}
