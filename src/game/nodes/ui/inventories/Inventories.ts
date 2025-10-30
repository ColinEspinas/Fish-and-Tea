import type { InputSystem } from '../../../../packages/inputs/nodes/InputSystem'
import type { CombatSystem } from '../../combat/CombatSystem'
import type { RunSystem } from '../../RunSystem'
import { InnerNode } from '@ineka/engine'
import { Inventory } from './Inventory'

export class Inventories extends InnerNode {
  protected _inputSystem = this.engine.systems.get('inputs') as InputSystem
  protected _runSystem = this.engine.systems.get('run') as RunSystem
  protected _combatSystem = this.engine.systems.get('combat') as CombatSystem

  protected _runInventory: Inventory
  protected _discardInventory: Inventory
  protected _remainingInventory: Inventory

  protected _openedInventory: Inventory | null = null

  constructor(parent: InnerNode) {
    super(parent)
    this._runInventory = new Inventory(this, 'Cell Inventory', this._runSystem.uniqueInventoryWithCount)
    this.add(this._runInventory)
    this._discardInventory = new Inventory(this, 'Discarded Cells', this._combatSystem.uniqueDiscardedCellsWithCount)
    this.add(this._discardInventory)
    this._remainingInventory = new Inventory(this, 'Remaining Cells', this._combatSystem.uniqueRemainingCellsWithCount)
    this.add(this._remainingInventory)
  }

  protected onStep(_: number): void {
    this._runInventory.updateCells(this._runSystem.uniqueInventoryWithCount)
    this._discardInventory.updateCells(this._combatSystem.uniqueDiscardedCellsWithCount)
    this._remainingInventory.updateCells(this._combatSystem.uniqueRemainingCellsWithCount)

    if (this._inputSystem.isKeyPressed('i')) {
      if (this._runInventory.isOpen) {
        this._runInventory.close()
        this._openedInventory = null
      }
      else {
        if (this._openedInventory !== null) {
          this._openedInventory.close()
        }
        this._runInventory.open()
        this._openedInventory = this._runInventory
      }
    }
    if (this._inputSystem.isKeyPressed('d')) {
      if (this._discardInventory.isOpen) {
        this._discardInventory.close()
        this._openedInventory = null
      }
      else {
        if (this._openedInventory !== null) {
          this._openedInventory.close()
        }
        this._discardInventory.open()
        this._openedInventory = this._discardInventory
      }
    }
    if (this._inputSystem.isKeyPressed('r')) {
      if (this._remainingInventory.isOpen) {
        this._remainingInventory.close()
        this._openedInventory = null
      }
      else {
        if (this._openedInventory !== null) {
          this._openedInventory.close()
        }
        this._remainingInventory.open()
        this._openedInventory = this._remainingInventory
      }
    }
  }
}
