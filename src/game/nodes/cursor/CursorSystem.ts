import type { InputSystem } from '../../../packages/inputs/nodes/InputSystem'
import type { Selectable } from './Selectable'
import { OuterNode } from '@ineka/engine'
import { Vector2 } from '../../../packages/math/utils/vectors'

export class CursorSystem extends OuterNode {
  protected _inputSystem = this.engine.systems.get('inputs') as InputSystem

  protected _selectables = new Set<Selectable>()
  protected _selected: Selectable | null = null
  protected _lastSelected: Selectable | null = null
  protected _selectablesState: Record<string, boolean> = {}

  public forceSelection: boolean = false

  protected _maximumSelectionAngle: number = 180

  public get selected(): Selectable | null { return this._selected }

  public addSelectable(selectable: Selectable): void {
    this._selectables.add(selectable)
  }

  public removeSelectable(selectable: Selectable): void {
    this._selectables.delete(selectable)
  }

  public getActiveSelectables(): Set<Selectable> {
    return new Set([...this._selectables].filter(selectable => this._selectablesState[selectable.id] ?? false))
  }

  public isSelectableActive(selectable: Selectable): boolean {
    return this._selectablesState[selectable.id] ?? false
  }

  public setActive(selectable: Selectable, active: boolean): void {
    if (selectable.selected && !active) {
      this.unselect()
    }
    this._selectablesState[selectable.id] = active
  }

  public select(selectable: Selectable): void {
    if (this._selected) {
      this.unselect()
    }
    this._selected = selectable
    selectable.selected = true
  }

  public unselect(): void {
    if (this._selected) {
      this._lastSelected = this._selected
      this._selected.selected = false
      this._selected = null
    }
  }

  public getGroup(group: string): Selectable[] {
    return [...this._selectables].filter(selectable => selectable.group === group)
  }

  public disableGroup(group: string): void {
    for (const selectable of this._selectables) {
      if (selectable.group === group) {
        this.setActive(selectable, false)
      }
    }
  }

  public enableGroup(group: string): void {
    for (const selectable of this._selectables) {
      if (selectable.group === group) {
        this.setActive(selectable, true)
      }
    }
  }

  public enableOnlyGroup(group: string): void {
    for (const selectable of this._selectables) {
      if (selectable.group === group) {
        this.setActive(selectable, true)
      }
      else {
        this.setActive(selectable, false)
      }
    }
  }

  public enableOnlyGroups(groups: string[]): void {
    for (const selectable of this._selectables) {
      if (!selectable.group)
        return
      if (groups.includes(selectable.group)) {
        this.setActive(selectable, true)
      }
      else {
        this.setActive(selectable, false)
      }
    }
  }

  public disableAllSelectables(selectables: Selectable[]): void {
    for (const selectable of selectables) {
      this.setActive(selectable, false)
    }
  }

  public disableAllSelectablesExcept(except: Selectable[]): void {
    for (const selectable of this._selectables) {
      if (!except.includes(selectable)) {
        this.setActive(selectable, false)
      }
    }
  }

  protected findNearestFromDirection(direction: 'up' | 'down' | 'left' | 'right'): Selectable | null {
    const activeSelectables = this.getActiveSelectables()
    if (activeSelectables.size === 0)
      return null

    if (!this._selected) {
      return this._lastSelected || [...activeSelectables][0]
    }

    let nearestSelectable = null
    let nearestDistance = new Vector2(Infinity, Infinity)
    for (const selectable of activeSelectables) {
      if (selectable === this._selected)
        continue
      let distance = new Vector2(0, 0)
      // Get nearest selectable from direction based on distance and maximum angle
      if (direction === 'up') {
        distance = selectable.transform.position.clone().subtract(this._selected.transform.position)
        if (distance.y < 0 && Math.abs(distance.x) < this._maximumSelectionAngle) {
          if (distance.magnitude() < nearestDistance.magnitude()) {
            nearestSelectable = selectable
            nearestDistance = distance
          }
        }
      }
      if (direction === 'down') {
        distance = selectable.transform.position.clone().subtract(this._selected.transform.position)
        if (distance.y > 0 && Math.abs(distance.x) < this._maximumSelectionAngle) {
          if (distance.magnitude() < nearestDistance.magnitude()) {
            nearestSelectable = selectable
            nearestDistance = distance
          }
        }
      }
      if (direction === 'left') {
        distance = selectable.transform.position.clone().subtract(this._selected.transform.position)
        if (distance.x < 0 && Math.abs(distance.y) < this._maximumSelectionAngle) {
          if (distance.magnitude() < nearestDistance.magnitude()) {
            nearestSelectable = selectable
            nearestDistance = distance
          }
        }
      }
      if (direction === 'right') {
        distance = selectable.transform.position.clone().subtract(this._selected.transform.position)
        if (distance.x > 0 && Math.abs(distance.y) < this._maximumSelectionAngle) {
          if (distance.magnitude() < nearestDistance.magnitude()) {
            nearestSelectable = selectable
            nearestDistance = distance
          }
        }
      }
    }
    return nearestSelectable
  }

  public selectFromDirection(direction: 'up' | 'down' | 'left' | 'right'): void {
    const nearestSelectable = this.findNearestFromDirection(direction)
    if (nearestSelectable) {
      this.select(nearestSelectable)
    }
  }

  public selectFromPosition(position: Vector2): void {
    const activeSelectables = this.getActiveSelectables()
    if (activeSelectables.size === 0)
      return

    for (const selectable of activeSelectables) {
      if (selectable.transform.contains(position)) {
        this.select(selectable)
        return
      }
      else if (!this.forceSelection) {
        this.unselect()
      }
    }
  }

  public selectNearestFromPosition(position: Vector2): void {
    const activeSelectables = this.getActiveSelectables()
    if (activeSelectables.size === 0)
      return

    let nearestSelectable = null
    let nearestDistance = new Vector2(Infinity, Infinity)
    for (const selectable of activeSelectables) {
      const distance = selectable.transform.position.clone().subtract(position)
      if (distance.magnitude() < nearestDistance.magnitude()) {
        nearestSelectable = selectable
        nearestDistance = distance
      }
    }
    if (nearestSelectable) {
      this.select(nearestSelectable)
    }
  }
}
