import type { CombatSystem } from './CombatSystem'
import type { Cell } from './grid/cells/Cell'
import type { Move } from './moves/Move'
import { OuterNode } from '@ineka/engine'
import { AttackMove } from './moves/AttackMove'
import { DefenseMove } from './moves/DefenseMove'
import { PoisonEffect } from './status/PoisonEffect'

export class MovesSystem extends OuterNode {
  protected _combatSystem = this.engine.systems.get('combat') as CombatSystem

  public addPlayerMovesFromCellTrigger(cellIndex: number): void {
    const cell = this._combatSystem.grid.getCell(cellIndex)
    if (!cell)
      return
    const cellGroup = cell.cellGroup || []
    const cellNameCounts: Record<string, number> = {}
    let accumulatedMovePointModifiers = 0
    for (const index of cellGroup) {
      const cell = this._combatSystem.grid.getCell(index)
      if (!cell)
        continue
      const cellConstructor = cell.constructor as typeof Cell
      const name = cellConstructor.NAME
      cellNameCounts[name] = (cellNameCounts[name] || 0) + 1
      accumulatedMovePointModifiers += cell.movePointModifier
    }

    const moves: Move[] = []
    let needTarget = false
    for (const [name, count] of Object.entries(cellNameCounts)) {
      switch (name) {
        case 'attack:rifle': {
          const move = new AttackMove(this._combatSystem.arena.player, undefined, count)
          moves.push(move)
          break
        }
        case 'defense:basic': {
          const move = new DefenseMove(this._combatSystem.arena.player, count)
          moves.push(move)
          break
        }
        case 'curse:poison': {
          this._combatSystem.arena.player.applyStatusEffect(PoisonEffect, count)
          break
        }

        case 'misc:floor': {
          break
        }
      }

      if (moves.at(-1)?.needTarget) {
        needTarget = true
      }
    }

    this._combatSystem.addPlayerMoves(moves, needTarget, accumulatedMovePointModifiers)
  }
}
