import type { TreeNode } from '@ineka/engine'
import type { RenderSystem } from '../../../../packages/pixi/nodes/RenderSystem'
import type { CellParams } from '../../../types/cells'
import type { CursorSystem } from '../../cursor/CursorSystem'
import type { RunSystem } from '../../RunSystem'
import type { CombatSystem } from '../CombatSystem'
import type { Cell } from './cells/Cell'
import { InnerNode } from '@ineka/engine'
import { pickRandom, weightedRandom } from '@thi.ng/random'
import { Transform } from '../../../../packages/basic/utils/Transform'
import { Vector2 } from '../../../../packages/math/utils/vectors'
import { seededRandom } from '../../../data/random'
import { EmptyCell } from './cells/EmptyCell'

export class PlayerGrid extends InnerNode {
  protected _renderSystem = this.engine.systems.get('render') as RenderSystem
  protected _runSystem = this.engine.systems.get('run') as RunSystem
  protected _combatSystem = this.engine.systems.get('combat') as CombatSystem
  protected _cursorSystem = this.engine.systems.get('cursor') as CursorSystem

  protected _cells: (Cell | null)[] = []
  public get cells(): (Cell | null)[] { return this._cells }

  protected _size!: Vector2
  protected _cellSize!: Vector2
  protected _cellMargin: number = 5

  public transform: Transform = new Transform()

  public get size(): Vector2 { return this._size }
  public get cellSize(): Vector2 { return this._cellSize }
  public get cellMargin(): number { return this._cellMargin }

  public get isEmpty(): boolean {
    return this._cells.every(cell => cell === null || cell.constructor === EmptyCell)
  }

  constructor(parent: TreeNode, size: Vector2, cellSize: Vector2) {
    super(parent)
    this._size = size
    this._cellSize = cellSize
    this._combatSystem.setGrid(this)
  }

  protected onLoad(): void {
    this.generateEmpty()
    const screenCenter = this._renderSystem.getCenter()
    this.transform.position = new Vector2(
      screenCenter.x - this._size.x * (this._cellSize.x + this._cellMargin) / 2,
      screenCenter.y - this._size.y * (this._cellSize.y + this._cellMargin) / 2,
    )
  }

  protected onStep(_: number): void {
    const screenCenter = this._renderSystem.getCenter()
    this.transform.position = new Vector2(
      screenCenter.x - this._size.x * (this._cellSize.x + this._cellMargin) / 2 - 400,
      screenCenter.y - this._size.y * (this._cellSize.y + this._cellMargin) / 2,
    )

    for (let i = this._cells.length - 1; i >= 0; i--) {
      this.dropCell(i)
    }
    this.generateNewCells()
  }

  protected generateEmpty() {
    for (let i = 0; i < this._size.x; i++) {
      for (let j = 0; j < this._size.y; j++) {
        this._cells.push(null)
      }
    }
  }

  public getPositionFromCellIndex(index: number): Vector2 {
    return new Vector2(
      index % this._size.x,
      Math.floor(index / this._size.x),
    )
  }

  public getCellIndexFromPosition(position: Vector2): number {
    return position.y * this._size.x + position.x
  }

  public getCell(index: number): Cell | null {
    return this._cells[index]
  }

  public getCenterCell(): Cell | null {
    const center = new Vector2(
      Math.floor(this._size.x / 2),
      Math.floor(this._size.y / 2),
    )
    return this._cells[this.getCellIndexFromPosition(center)]
  }

  public getSurroundingCellsIndexes(index: number): number[] {
    return [
      index - this._size.x,
      index + this._size.x,
      index - 1,
      index + 1,
    ]
  }

  public getCellGroup(index: number): number[] {
    if (this._cells[index] === null)
      return [] // Return an empty array if the cell is null

    const directions = [
      new Vector2(0, 0),
      new Vector2(0, -1),
      new Vector2(0, 1),
      new Vector2(-1, 0),
      new Vector2(1, 0),
    ]
    const stack = [index]
    const cellGroup: number[] = []
    while (stack.length > 0) {
      const currentIndex = stack.pop()
      if (currentIndex === undefined)
        continue // Type guard to handle undefined
      const cell = this._cells[currentIndex]
      const cellConstructor = cell?.constructor as typeof Cell
      if (cell && cell.index > this._size.x - 1) {
        const cellPos = this.getPositionFromCellIndex(currentIndex)
        for (const direction of directions) {
          // Test the cell in the direction
          const testedCellPos = new Vector2(
            cellPos.x + direction.x,
            cellPos.y + direction.y,
          )
          // Check if the cell is in the grid
          if (
            testedCellPos.x >= 0
            && testedCellPos.x < this._size.x
            && testedCellPos.y >= 0
            && testedCellPos.y < this._size.y
          ) {
            const testedCellIndex = this.getCellIndexFromPosition(testedCellPos)
            const testedCell = this._cells[testedCellIndex]
            const testedCellConstructor = testedCell?.constructor as typeof Cell
            // Check if the cell is not already in the group and has the same type
            if (
              testedCell
              && !cellGroup.includes(testedCellIndex)
              && testedCellConstructor.TYPES.some(type => cellConstructor.TYPES.includes(type))
              && testedCell.index > this._size.x - 1
            ) {
              cellGroup.push(testedCellIndex)
              stack.push(testedCellIndex)
            }
          }
        }
      }
    }
    return cellGroup
  }

  public setCellGroups(): void {
    for (const c of this._cells) {
      if (c) {
        c.cellGroup = null
      }
    }
    for (const c of this._cells) {
      if (c && c.cellGroup === null) {
        c.cellGroup = this.getCellGroup(c.index)
        for (const cellIndex of c.cellGroup) {
          const cellInGroup = this._cells[cellIndex]
          if (cellInGroup) {
            cellInGroup.cellGroup = c.cellGroup
          }
        }
      }
    }
  }

  public removeCell(index: number): void {
    const cell = this._cells[index]
    if (cell) {
      this._cells[index] = null
      this.remove(cell)
    }
  }

  public setCell(index: number, CellType: typeof Cell): void {
    if (this._cells[index] !== null) {
      this.removeCell(index)
    }
    const cellPos = this.getPositionFromCellIndex(index)
    const cell = new CellType(this, {
      index,
      position: new Vector2(
        this.transform.position.x + cellPos.x * (this._cellSize.x + this._cellMargin),
        this.transform.position.y + cellPos.y * (this._cellSize.y + this._cellMargin),
      ),
      size: this._cellSize,
    })
    this._cells[index] = cell
    this._combatSystem.invalidateSelectedCell()
    const cursorSelected = this._cursorSystem.selected
    if (cursorSelected) {
      const cursorSelectedCell = cursorSelected?.parent as Cell
      if (cursorSelectedCell.index === index) {
        this._cursorSystem.select(cursorSelectedCell.selectable)
      }
    }
    this.add(cell)
    this.setCellGroups()
  }

  protected dropCell(index: number): void {
    const cell = this._cells[index]
    if (cell) {
      const cellPos = this.getPositionFromCellIndex(index)
      const belowCellPos = new Vector2(cellPos.x, cellPos.y + 1)

      // Check if the cell is in the grid
      if (
        belowCellPos.x >= 0
        && belowCellPos.x < this._size.x
        && belowCellPos.y >= 0
        && belowCellPos.y < this._size.y
      ) {
        const belowCellIndex = this.getCellIndexFromPosition(belowCellPos)
        const belowCell = this._cells[belowCellIndex]
        // Check if the cell below is empty
        if (belowCell === null) {
          this._cells[index] = null
          this._cells[belowCellIndex] = cell
          cell.index = belowCellIndex
          this._combatSystem.invalidateSelectedCell()
          const cursorSelected = this._cursorSystem.selected
          if (cursorSelected) {
            const cursorSelectedCell = (cursorSelected?.parent as Cell).index
            if (cursorSelectedCell === belowCellIndex) {
              const cellAtIndex = this.getCell(cursorSelectedCell)
              if (cellAtIndex) {
                this._cursorSystem.select(cellAtIndex.selectable)
              }
            }
          }
          cell.dropped()
        }
      }
    }
  }

  public removeCellGroup(index: number): void {
    const cellGroup = this.getCellGroup(index)
    for (const cellIndex of cellGroup) {
      this.removeCell(cellIndex)
    }
  }

  protected createRandomCell(grid: PlayerGrid, params: CellParams): Cell {
    // Create cell array from the cellsConstructors array
    const cells = Object.values(this._runSystem.cellsWeights).map(([cell]) => cell)
    // Create weight array from the cellsConstructors array
    const weights = Object.values(this._runSystem.cellsWeights).map(([, weight]) => weight)

    const RandomCell = weightedRandom(cells, weights, seededRandom)()
    return new RandomCell(grid, params)

    // const RandomCell = pickRandom(this._combatSystem.remainingCells, seededRandom)
    // this._combatSystem.removeCellFromRemainingCells(RandomCell)
    // const remainingCellsCount = this._combatSystem.remainingCells.length
    // if (remainingCellsCount < 1) {
    //   this._combatSystem.addCellToRemainingCells(EmptyCell)
    // }
    // return new RandomCell(grid, params)
  }

  public generateNewCells(): void {
    for (let i = 0; i < this._size.x; i++) {
      if (this._cells[i] === null) {
        const newCellPos = this.getPositionFromCellIndex(i)
        const cell = this.createRandomCell(this, {
          index: i,
          position: new Vector2(
            this.transform.position.x + newCellPos.x * (this._cellSize.x + this._cellMargin),
            this.transform.position.y + newCellPos.y * (this._cellSize.y + this._cellMargin),
          ),
          size: this._cellSize,
        })
        this._cells[i] = cell
        this.add(cell)
        this.setCellGroups()
      }
    }
  }

  public reset(): void {
    for (let i = 0; i < this._cells.length; i++) {
      this.removeCell(i)
    }
  }
}
