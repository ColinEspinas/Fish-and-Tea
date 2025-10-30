import type { TreeNodeWithTransform } from '../../basic/types/nodes'
import type { RenderSystem } from './RenderSystem'
import type { SceneSystem } from './SceneSystem'
import { OuterNode } from '@ineka/engine'
import { Graphics } from 'pixi.js'

export class Graphics2D extends OuterNode {
  protected _sceneSystem = this.engine.systems.get('scenes') as SceneSystem
  protected _renderSystem = this.engine.systems.get('render') as RenderSystem

  protected _graphics!: Graphics
  protected _renderOnActiveScene: boolean = false

  public get draw(): Graphics {
    return this._graphics
  }

  constructor(parent: TreeNodeWithTransform, options?: {
    renderOnActiveScene?: boolean
  }) {
    super(parent)
    this._graphics = new Graphics()
    this._renderOnActiveScene = options?.renderOnActiveScene ?? true
  }

  protected onLoad(): void {
    if (this._renderOnActiveScene) {
      this._sceneSystem.activeScene?.stage.addChild(this._graphics)
    }
    else {
      this._renderSystem.globalContainer.addChild(this._graphics)
    }
  }

  protected onUnload(): void {
    if (this._renderOnActiveScene) {
      this._sceneSystem.activeScene?.stage.removeChild(this._graphics)
    }
    else {
      this._renderSystem.globalContainer.removeChild(this._graphics)
    }
  }
}
