import type { Engine, TreeNode } from '@ineka/engine'
import type { AssetSystem } from '../../asset-loading/nodes/AssetSystem'
import type { SceneSystem } from './SceneSystem'
import type { Sprite2D } from './Sprite2D'
import { InnerNode } from '@ineka/engine'
import { Container } from 'pixi.js'

export class RenderGroup extends InnerNode {
  protected _assetSystem: AssetSystem = this.engine.systems.get('assets') as AssetSystem
  protected _sceneSystem = this.engine.systems.get('scenes') as SceneSystem

  public container: Container

  constructor(parent: TreeNode | Engine, sprites: Sprite2D[]) {
    super(parent)
    this.container = new Container({ isRenderGroup: true })
    this.container.addChild(...sprites.map(s => s.display))
    for (const sprite of sprites) {
      this.add(sprite)
    }
  }

  protected onLoad(): void {
    const sceneSystem = this.engine.systems.get('scenes') as SceneSystem
    sceneSystem.activeScene?.stage.addChild(this.container)
  }

  protected onUnload(): void {
    this._sceneSystem.activeScene?.stage.removeChild(this.container)
    this.container.destroy()
  }
}
