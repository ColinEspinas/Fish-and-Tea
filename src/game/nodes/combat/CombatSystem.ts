import type { Actor } from 'xstate'
import type { InputSystem } from '../../../packages/inputs/nodes/InputSystem'
import type { CursorSystem } from '../cursor/CursorSystem'
import type { RunSystem } from '../RunSystem'
import type { UiSystem } from '../ui/UiSystem'
import type { Arena } from './dungeon/Arena'
import type { Enemy } from './dungeon/enemies/Enemy'
import type { Fighter } from './dungeon/Fighter'
import type { Cell } from './grid/cells/Cell'
import type { PlayerGrid } from './grid/PlayerGrid'
import type { Move } from './moves/Move'
import { OuterNode } from '@ineka/engine'
import { createActor } from 'xstate'
import { combatMachine } from '../../machines/Combat'
import { EmptyCell } from './grid/cells/EmptyCell'

export class CombatSystem extends OuterNode {
  protected _cursorSystem = this.engine.systems.get('cursor') as CursorSystem
  protected _inputSystem = this.engine.systems.get('inputs') as InputSystem
  protected _runSystem = this.engine.systems.get('run') as RunSystem
  protected _uiSystem = this.engine.systems.get('ui') as UiSystem

  public actor: Actor<typeof combatMachine> = createActor(combatMachine)

  public selectedCell: number | null = null
  public selectedCellGroup: number[] | null = null

  public unselectGroupCellDelay: number = 0

  protected _grid!: PlayerGrid
  protected _arena!: Arena

  public target: Fighter | null = null
  protected _targetActionsQueue: (() => void)[] = []
  protected _lastSelectedCell: number | null = null

  public movePointsLeft: number = 3

  protected _nextMoveCost: number = 1
  protected _currentMovingEnemyIndex: number | null = null
  protected _currentEnemyMove: Move | null = null

  protected _remainingCells: (typeof Cell)[] = []
  public get remainingCells(): (typeof Cell)[] {
    return this._remainingCells
  }

  public get discardedCells(): (typeof Cell)[] {
    const remainingCells = this._remainingCells.filter(cell => cell !== EmptyCell)
    const gridCells = this._grid.cells.filter(cell => cell !== null).map(cell => cell.constructor as typeof Cell)
    const discarded = this._runSystem.cellInventory.slice()
    for (const cell of remainingCells) {
      const index = discarded.indexOf(cell)
      if (index > -1) {
        discarded.splice(index, 1)
      }
    }
    for (const cell of gridCells) {
      const index = discarded.indexOf(cell)
      if (index > -1) {
        discarded.splice(index, 1)
      }
    }

    return discarded
  }

  public get uniqueDiscardedCellsWithCount(): [typeof Cell, number][] {
    const inventoryMap: Map<typeof Cell, number> = new Map()
    this.discardedCells.forEach((cell) => {
      inventoryMap.set(cell, (inventoryMap.get(cell) || 0) + 1)
    })
    return Array.from(inventoryMap.entries())
  }

  public get uniqueRemainingCellsWithCount(): [typeof Cell, number][] {
    const inventoryMap: Map<typeof Cell, number> = new Map()
    this._remainingCells.forEach((cell) => {
      if (cell === EmptyCell) return
      inventoryMap.set(cell, (inventoryMap.get(cell) || 0) + 1)
    })
    return Array.from(inventoryMap.entries())
  }

  public setGrid(grid: PlayerGrid): void {
    this._grid = grid
  }

  public get grid(): PlayerGrid {
    return this._grid
  }

  public setArena(arena: Arena): void {
    this._arena = arena
  }

  public get arena(): Arena {
    return this._arena
  }

  protected onLoad(): void {
    this._remainingCells = this._runSystem.cellInventory.slice()

    this.actor.start()

    this.actor.subscribe((state) => {
      if (state.matches('starting')) {
        this.actor.send({ type: 'combat.start' })
      }

      // Player Turn
      if (state.matches({ playerTurn: 'start' })) {
        this.resetMovePoints()
        this.arena.player.shield = 0
      }

      if (state.matches({ playerTurn: 'grid' })) {
        if (this._lastSelectedCell !== null) {
          const lastSelectedCell = this._grid.getCell(this._lastSelectedCell)!
          if (lastSelectedCell) {
            this._cursorSystem.select(lastSelectedCell.selectable)
          }
        }
        else {
          this._cursorSystem.unselect()
        }
      }

      if (state.matches({ playerTurn: 'targeting' })) {
        const firstEnemy = this._cursorSystem.getGroup('enemies').at(-1)
        if (firstEnemy) {
          this._cursorSystem.select(firstEnemy)
        }

        this._cursorSystem.forceSelection = true
      }

      if (state.matches({ playerTurn: 'move' })) {
        this._cursorSystem.disableGroup('grid-cells')
        this._cursorSystem.disableGroup('enemies')
        this._cursorSystem.unselect()
        this.movePointsLeft -= this._nextMoveCost
        this._nextMoveCost = 1
        this.arena.player.actor.send({ type: 'move.start' })
      }

      // Enemy Turn
      if (state.matches({ enemiesTurn: 'start' })) {
        this._cursorSystem.disableGroup('grid-cells')
        this._cursorSystem.disableGroup('enemies')
        this.actor.send({ type: 'enemies.next' })
        this.arena.enemies.forEach(enemy => enemy.shield = 0)
      }

      if (state.matches({ enemiesTurn: 'moves' })) {
        this._currentMovingEnemyIndex = null
        this._cursorSystem.forceSelection = false
        this._cursorSystem.unselect()
      }

      if (state.matches({ enemiesTurn: 'end' })) {
        this.actor.send({ type: 'combat.next' })
        this.resetRemainingCells()
        this._grid.cells.forEach((cell) => {
          if (cell && cell.constructor === EmptyCell) {
            this._grid.removeCell((<EmptyCell>cell).index)
          }
        }) 
      }
    })

    this.actor.send({ type: 'combat.start' })
  }

  protected onUnload(): void {
    this.actor.stop()
  }

  protected onStep(_: number): void {
    const actorSnapshot = this.actor.getSnapshot()

    // Player Turn
    if (actorSnapshot.matches({ playerTurn: 'start' })) {
      this.actor.send({ type: 'player.next' })
    }
    if (actorSnapshot.matches({ playerTurn: 'end' })) {
      this.actor.send({ type: 'combat.next' })
    }
    if (actorSnapshot.matches({ playerTurn: 'grid' })) {
      this.handleGrid()
    }
    if (actorSnapshot.matches({ playerTurn: 'targeting' })) {
      this.handleTargetting()
    }

    // Enemy Turn
    if (actorSnapshot.matches({ enemiesTurn: 'moves' })) {
      this.handleEnemyMoves()
    }

    // Status
    if (actorSnapshot.matches({ playerTurn: 'startStatus' })) {
      this.handleTurnStartStatus()
    }
    if (actorSnapshot.matches({ playerTurn: 'endStatus' })) {
      this.handleTurnEndStatus()
    }
    if (actorSnapshot.matches({ enemiesTurn: 'startStatus' })) {
      this.handleEnemyStartStatus()
    }
    if (actorSnapshot.matches({ enemiesTurn: 'endStatus' })) {
      this.handleEnemyEndStatus()
    }
  }

  protected handleGrid(): void {
    if (!this._uiSystem.isMenuOpen) {
      this._cursorSystem.forceSelection = true
      this._cursorSystem.enableOnlyGroup('grid-cells')

      if (this._cursorSystem.selected && this._cursorSystem.selected.type === 'cell') {
        if (this._grid && this.selectedCell !== null) {
          const cell = this._grid.getCell(this.selectedCell)
          if (cell) {
            this.selectedCellGroup = cell.cellGroup
          }
        }
      }
      else if (this.unselectGroupCellDelay > 10) {
        this.unselectGroupCellDelay = 0
        this.selectedCellGroup = null
      }
      else if (this.selectedCellGroup) {
        this.unselectGroupCellDelay++
      }
    }
  }

  protected handleTargetting(): void {
    if (!this._uiSystem.isMenuOpen) {
      if (this._inputSystem.isKeyPressed('Escape')) {
        this.actor.send({ type: 'player.cancel' })
      }

      this._cursorSystem.forceSelection = true
      this._cursorSystem.enableOnlyGroup('enemies')

      this._cursorSystem.getGroup('enemies').forEach((selectable) => {
        selectable.setTriggerCallback(() => {
          this.target = <Enemy>selectable.parent
          this.arena.player.setTarget(this.target)
          this.actor.send({ type: 'player.move' })
          this._grid.removeCellGroup(this.selectedCell!)
        })
      })
    }
  }

  protected handleTurnStartStatus(): void {
    this._arena.player.statusEffects.forEach((effect) => {
      effect.turnStartEffect()
      if (effect.needToRemove()) {
        this._arena.player.removeStatusEffect(effect)
      }
    })
    this.actor.send({ type: 'player.next' })
  }

  protected handleTurnEndStatus(): void {
    this._arena.player.statusEffects.forEach((effect) => {
      effect.turnEndEffect()
      if (effect.needToRemove()) {
        this._arena.player.removeStatusEffect(effect)
      }
    })
    this.actor.send({ type: 'player.next' })
  }

  protected handleEnemyMoves(): void {
    this._cursorSystem.disableGroup('grid-cells')
    this._cursorSystem.disableGroup('enemies')
    this._cursorSystem.disableGroup('grid-preview')
    this._cursorSystem.disableGroup('enemies-dead')

    if (this._currentEnemyMove && this._currentEnemyMove?.started) {
      return
    }

    const enemies = this.aliveEnemies()
    const currentMovingEnemyIndex = this._currentMovingEnemyIndex ?? enemies.length - 1
    const currentEnemy = enemies[currentMovingEnemyIndex]

    if (currentEnemy) {
      const move = this._currentEnemyMove ?? currentEnemy.getNextMove()
      if (move.ended) {
        this._currentMovingEnemyIndex = currentMovingEnemyIndex - 1
        this._currentEnemyMove = null
        return
      }
      if (!move.started) {
        this._currentEnemyMove = move
        move.start()
      }
    }
    else if (this._currentMovingEnemyIndex && this._currentMovingEnemyIndex < 0) {
      enemies.forEach(enemy => enemy.setNextMoveFromPattern())
      this._currentMovingEnemyIndex = null
      this._currentEnemyMove = null
      this.actor.send({ type: 'enemies.next' })
    }
  }

  protected handleEnemyStartStatus(): void {
    const enemies = this.aliveEnemies()
    enemies.forEach((enemy) => {
      enemy.statusEffects.forEach((effect) => {
        effect.turnStartEffect()
        if (effect.needToRemove()) {
          enemy.removeStatusEffect(effect)
        }
      })
    })
    this.actor.send({ type: 'enemies.next' })
  }

  protected handleEnemyEndStatus(): void {
    const enemies = this.aliveEnemies()
    enemies.forEach((enemy) => {
      enemy.statusEffects.forEach((effect) => {
        effect.turnEndEffect()
        if (effect.needToRemove()) {
          enemy.removeStatusEffect(effect)
        }
      })
    })
    this.actor.send({ type: 'enemies.next' })
  }

  public aliveEnemies(): Enemy[] {
    return this._arena.enemies.filter(enemy => enemy && !enemy.isDead()) as Enemy[]
  }

  public selectCell(index: number): void {
    this.selectedCell = index
    this._lastSelectedCell = index
  }

  public isCellSelected(index: number): boolean {
    return this.selectedCell === index
  }

  public isCellInSelectedGroup(index: number): boolean {
    return this.selectedCellGroup?.includes(index) ?? false
  }

  public invalidateSelectedCell(): void {
    this.selectedCellGroup = null
    if (this._grid && this.selectedCell !== null) {
      const cell = this._grid.getCell(this.selectedCell)
      if (cell) {
        this._cursorSystem.selectFromPosition(cell.transform.position)
      }
    }
  }

  public useMovePoints(amount: number): void {
    this.movePointsLeft = Math.max(0, this.movePointsLeft - amount)
  }

  public resetMovePoints(): void {
    this.movePointsLeft = this._runSystem.maxMovePoints
  }

  public addPlayerMoves(moves: Move[], needTarget: boolean, movePointModifier: number): void {
    this._nextMoveCost += movePointModifier
    this._arena.player.addAvailableMoves(moves)
    if (!needTarget) {
      this.actor.send({ type: 'player.move' })
      this._grid.removeCellGroup(this.selectedCell!)
    }
    else {
      this.actor.send({ type: 'player.target' })
    }
  }

  public addCellToRemainingCells(cell: typeof Cell, count: number = 1): void {
    for (let i = 0; i < count; i++) {
      this._remainingCells.push(cell)
    }
  }

  public removeCellFromRemainingCells(cell: typeof Cell, count: number = 1): void {
    for (let i = 0; i < count; i++) {
      const index = this._remainingCells.indexOf(cell)
      if (index > -1) {
        this._remainingCells.splice(index, 1)
      }
    }
  }

  public resetRemainingCells(): void {
    this._remainingCells = [...this._remainingCells, ...this.discardedCells].filter(cell => cell !== EmptyCell)
  }
}
