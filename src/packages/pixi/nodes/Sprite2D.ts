import type { AssetName } from '../../asset-loading'
import type { AssetSystem } from '../../asset-loading/nodes/AssetSystem'
import type { Asset } from '../../asset-loading/types/Asset'
import type { TreeNodeWithTransform } from '../../basic/types/nodes'
import type { SceneSystem } from './SceneSystem'
import { OuterNode } from '@ineka/engine'
import { Sprite, Texture } from 'pixi.js'
import { Vector2 } from '../../math/utils/vectors'
import { RenderSystem } from './RenderSystem'

export class Sprite2D extends OuterNode {
  protected _assetSystem: AssetSystem = this.engine.systems.get('assets') as AssetSystem
  protected _sceneSystem = this.engine.systems.get('scenes') as SceneSystem
  protected _renderSystem = this.engine.systems.get('render') as RenderSystem

  protected _sprite!: Sprite
  protected _texture!: Asset
  public position!: Vector2
  public size!: Vector2
  public rotation!: number
  public anchor!: Vector2 | number

  protected _renderOnActiveScene!: boolean
  protected _useParentTransform!: boolean

  public get display(): Sprite {
    return this._sprite
  }

  constructor(parent: TreeNodeWithTransform, assetName: AssetName, options?: {
    position?: Vector2
    size?: Vector2
    rotation?: number
    anchor?: Vector2 | number
    renderOnActiveScene?: boolean
    useParentTransform?: boolean
  }) {
    super(parent)
    this._texture = this._assetSystem.assets.get(assetName)!
    this._sprite = Sprite.from(this._texture.filepath)
    this.position = options?.position || Vector2.ZERO.clone()
    this.size = options?.size || Vector2.ONE.clone()
    this.rotation = options?.rotation || 0
    this.anchor = options?.anchor || Vector2.ZERO.clone()
    this._renderOnActiveScene = options?.renderOnActiveScene ?? true
    if (parent.transform) {
      this._useParentTransform = options?.useParentTransform ?? true
    }
    this.setPixiSpriteProperties()
  }

  protected setPixiSpriteProperties(): void {
    if (this._useParentTransform) {
      const parent = this.parent as TreeNodeWithTransform
      this.position = parent.transform!.position.clone()
      this.size = parent.transform!.size.clone()
      this.rotation = parent.transform!.rotation
    }
    this._sprite.position.set(this.position.x, this.position.y)
    this._sprite.setSize(this.size.x, this.size.y)
    this._sprite.rotation = this.rotation
    if (typeof this.anchor === 'number') {
      this._sprite.anchor.set(this.anchor)
    }
    else {
      this._sprite.anchor.set(this.anchor.x, this.anchor.y)
    }
  }

  public changeTexture(assetName: AssetName): void {
    this._texture = this._assetSystem.assets.get(assetName)!
    this._sprite.texture = Texture.from(this._texture.filepath)
  }

  protected onLoad(): void {
    if (this._renderOnActiveScene) {
      this._sceneSystem.activeScene?.stage.addChild(this._sprite)
    } else {
      this._renderSystem.globalContainer.addChild(this._sprite)
    }
  }

  protected onStep(_: number): void {
    this.setPixiSpriteProperties()
  }

  protected onUnload(): void {
    if (this._renderOnActiveScene) {
      this._sceneSystem.activeScene?.stage.removeChild(this._sprite)
    } else {
      this._renderSystem.globalContainer.removeChild(this._sprite)
    }
  }
}
