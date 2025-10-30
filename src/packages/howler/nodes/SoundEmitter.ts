import type { TreeNode } from '@ineka/engine'
import type { AssetName } from '../../asset-loading'
import type { AssetSystem } from '../../asset-loading/nodes/AssetSystem'
import { OuterNode } from '@ineka/engine'

export class SoundEmitter extends OuterNode {
  protected _assetSystem: AssetSystem = this.engine.systems.get('assets') as AssetSystem
  protected _sound!: Howl

  public get sound() {
    return this._sound
  }

  constructor(parent: TreeNode, assetName: AssetName) {
    super(parent)
    const asset = this._assetSystem.assets.get(assetName)
    if (!asset || !asset.sound) {
      throw new Error(`Sound asset ${assetName} not found`)
    }
    this._sound = asset.sound
  }
}
