import type { Engine, TreeNode } from '@ineka/engine'
import type { AssetSystem } from '../../asset-loading/nodes/AssetSystem'
import type { RenderSystem } from './RenderSystem'
import type { Scene } from './Scene'
import type { SceneSystem } from './SceneSystem'
import { InnerNode } from '@ineka/engine'
import { Graphics2D } from './Graphics2D'

export class SceneSwitcher extends InnerNode {
  protected _renderSystem = this.engine.systems.get('render') as RenderSystem
  protected _assetSystem = this.engine.systems.get('assets') as AssetSystem
  protected _sceneSystem = this.engine.systems.get('scenes') as SceneSystem

  public activeScene: Scene | null = null
  protected _nextScene: Scene | null = null
  protected _nextTransitionState: 'in' | 'out' = 'in'
  protected needTransition: boolean = false

  protected _transitionState: 'in' | 'out' | 'none' = 'none'
  protected _transitionDuration: number = 0.5
  protected _transitionLifetime: number = 0
  public transitionMask: Graphics2D

  constructor(parent: TreeNode | Engine) {
    super(parent)

    this.transitionMask = new Graphics2D(this, {
      renderOnActiveScene: false
    })
    this.transitionMask.draw.zIndex = 1000 // Ensure the mask is on top of everything else
    this.add(this.transitionMask)
  }

  public switchTo(scene: Scene) {
    this._nextScene = scene
    this.needTransition = true
    if (this.activeScene) {
      this._nextTransitionState = 'out'
    } else {
      this.transitionToNextScene()
      this._nextTransitionState = 'in'
    }
    this._transitionLifetime = 0
    this._transitionState = this._nextTransitionState
  }

  public transitionToNextScene(): void {
    if (this._nextScene) {
      if (this.activeScene) {
        this.activeScene?.unload()
        this.remove(this.activeScene)
      }
      this.activeScene = this._nextScene
      this._renderSystem.sceneContainer.removeChildren()
      this._renderSystem.sceneContainer.addChild(this.activeScene.stage)
      this._nextScene = null
      this.add(this.activeScene)
    }
  }

  protected onStep(delta: number): void {
    if (this.needTransition) {
      this._transitionLifetime += delta
      if (this._transitionLifetime >= this._transitionDuration && this._transitionState === 'out') {
        this._transitionLifetime = 0
        this.transitionToNextScene()
        this._transitionState = 'in'
      }
      else if (this._transitionLifetime >= this._transitionDuration && this._transitionState === 'in') {
        this._transitionLifetime = 0
        this.needTransition = false
        this._transitionState = 'none'
      }
    }
    if (this._transitionState === 'in') {
      this.transitionMask.draw.clear()
      const renderSize = this._renderSystem.getSize()
      this.transitionMask.draw.rect(0, 0, renderSize.x, renderSize.y)
      this.transitionMask.draw.fill('black')
      this.transitionMask.draw.alpha = 1 - (this._transitionLifetime / this._transitionDuration)
    } else if (this._transitionState === 'out') {
      this.transitionMask.draw.clear()
      const renderSize = this._renderSystem.getSize()
      this.transitionMask.draw.rect(0, 0, renderSize.x, renderSize.y)
      this.transitionMask.draw.fill('black')
      this.transitionMask.draw.alpha = this._transitionLifetime / this._transitionDuration
    }
  }
}

// const progress = this._transitionLifetime / this._transitionDuration
//           this.transitionMask.draw.clear()
//           const renderSize = this._renderSystem.getSize()
//           this.transitionMask.draw.rect(0, 0, renderSize.x, renderSize.y)
//           this.transitionMask.draw.fill('black')
//           this.transitionMask.draw.alpha = progress