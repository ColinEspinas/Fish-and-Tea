import type { TreeNodeWithTransform } from '../../../packages/basic/types/nodes'
import type { CursorSystem } from './CursorSystem'
import { OuterNode } from '@ineka/engine'
import { Transform } from '../../../packages/basic/utils/Transform'
import { Vector2 } from '../../../packages/math/utils/vectors'

export class Selectable extends OuterNode {
  protected _cursorSystem = this.engine.systems.get('cursor') as CursorSystem

  public transform: Transform = new Transform()
  public padding: number = 0
  protected _useParentTransform: boolean = false

  public selected: boolean = false
  protected _triggerCallback: () => void
  protected _type: string | null
  public group: string | null

  public get active(): boolean { return this._cursorSystem.isSelectableActive(this) }
  public set active(value: boolean) { this._cursorSystem.setActive(this, value) }

  public get type(): string | null { return this._type }

  constructor(parent: TreeNodeWithTransform, triggerCallback: () => void, options?: {
    position?: Vector2
    size?: Vector2
    rotation?: number
    padding?: number
    type?: string
    group?: string
    useParentTransform?: boolean
  }) {
    super(parent)
    this._triggerCallback = triggerCallback
    if (parent.transform) {
      this._useParentTransform = options?.useParentTransform ?? true
    }
    this.transform.position = options?.position || Vector2.ZERO.clone()
    this.transform.size = options?.size || Vector2.ONE.clone()
    this.transform.rotation = options?.rotation || 0
    this.padding = options?.padding || 0
    this._type = options?.type || null
    this.group = options?.group || null
  }

  protected onLoad(): void {
    this._cursorSystem.addSelectable(this)
    this.active = false
  }

  protected onUnload(): void {
    this._cursorSystem.removeSelectable(this)
  }

  protected onStep(_: number): void {
    if (this._useParentTransform) {
      const parent = this.parent as TreeNodeWithTransform
      this.transform.position = parent.transform!.position.clone()
      this.transform.size = parent.transform!.size.clone()
      this.transform.rotation = parent.transform!.rotation

      // Add padding to the size
      this.transform.size.x += this.padding
      this.transform.size.y += this.padding

      // Adjust position based on padding
      this.transform.position.x -= this.padding / 2
      this.transform.position.y -= this.padding / 2
    }
  }

  public setTriggerCallback(callback: () => void): void {
    this._triggerCallback = callback
  }

  public trigger(): void {
    this._triggerCallback()
  }
}
