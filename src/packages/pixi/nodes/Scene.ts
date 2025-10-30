import type { Engine, TreeNode } from '@ineka/engine'
import { InnerNode } from '@ineka/engine'
import { Container } from 'pixi.js'

export class Scene extends InnerNode {
  private _stage: Container
  private _name: string

  get stage() { return this._stage }
  get name() { return this._name }

  constructor(parent: TreeNode | Engine, name: string) {
    super(parent)
    this._name = name
    this._stage = new Container()
  }
}
