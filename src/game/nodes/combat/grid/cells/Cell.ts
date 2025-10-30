import type { AssetSystem } from '../../../../../packages/asset-loading/nodes/AssetSystem'
import type { Asset } from '../../../../../packages/asset-loading/types/Asset'
import type { Sprite2D } from '../../../../../packages/pixi/nodes/Sprite2D'
import type { CellType } from '../../../../data/cells/cells'
import type { CellDisplayData, CellParams } from '../../../../types/cells'
import type { CombatSystem } from '../../CombatSystem'
import type { MovesSystem } from '../../MovesSystem'
import type { PlayerGrid } from '../PlayerGrid'
import { InnerNode } from '@ineka/engine'
import { lerp } from '../../../../../packages/basic/utils/lerp'
import { Transform } from '../../../../../packages/basic/utils/Transform'
import { Vector2 } from '../../../../../packages/math/utils/vectors'
import { Graphics2D } from '../../../../../packages/pixi/nodes/Graphics2D'
import colors from '../../../../data/cells/colors.json'
import { Selectable } from '../../../cursor/Selectable'

export class Cell extends InnerNode {
  public static readonly NAME: string = ''
  public static readonly TYPES: CellType[] = ['empty']

  protected _assetSystem = this.engine.systems.get('assets') as AssetSystem
  protected _combatSystem = this.engine.systems.get('combat') as CombatSystem
  protected _movesSystem = this.engine.systems.get('moves') as MovesSystem

  protected _triggerSound: Asset = this._assetSystem.assets.get('sound:click')!

  protected _grid!: PlayerGrid
  public index!: number

  public transform: Transform = new Transform()
  public targetPosition: Vector2 = new Vector2()

  protected _graphics!: Graphics2D
  protected _sprite!: Sprite2D

  public cellGroup: number[] | null = null
  protected _minCellGroupSize: number = 1
  protected _triggerable: boolean = true
  protected _movePointModifier = 0

  protected _selectable!: Selectable
  protected _selectedBefore: boolean = false

  public get movePointModifier(): number { return this._movePointModifier }
  public get selectable(): Selectable { return this._selectable }

  public get colors(): string[] {
    const types = (this.constructor as typeof Cell).TYPES
    return types.map(type => colors[type])
  }

  constructor(parent: PlayerGrid, params: CellParams) {
    super(parent)
    this._grid = parent
    this.index = params.index
    this.transform.position = params.position.clone()
    this.transform.size = params.size.clone()
    this._graphics = new Graphics2D(this)
    this.add(this._graphics)

    this._selectable = new Selectable(this, () => this.trigger(), { type: 'cell', padding: 5, group: 'grid-preview' })
    this.add(this._selectable)
    this._selectable.active = false
  }

  protected onStep(_: number): void {
    this.targetPosition = this.getCellPositionFromIndex()
    this.transform.position = new Vector2(
      lerp(this.transform.position.x, this.targetPosition.x, 0.1),
      lerp(this.transform.position.y, this.targetPosition.y, 0.1),
    )

    if (!this._selectedBefore && this._selectable.selected) {
      this.selected()
      this._selectedBefore = true
    }
    else if (this._selectedBefore && !this._selectable.selected) {
      this.unselected()
      this._selectedBefore = false
    }

    const selectedCellIndex = this._combatSystem.selectedCell
    let cellGroupSize = 0
    if (selectedCellIndex) {
      cellGroupSize = this.cellGroup?.length || 0
    }

    if (this.index < this._grid.size.x) {
      this.drawFirstRow()
      this.selectable.group = 'grid-preview'
      this.selectable.active = false
    }
    else if (this._combatSystem.isCellInSelectedGroup(this.index) && cellGroupSize >= this._minCellGroupSize) {
      this.drawInCellGroup()
      this.selectable.group = 'grid-cells'
    }
    else {
      this.draw()
      this.selectable.group = 'grid-cells'
    }
  }

  protected getCellPositionFromIndex(): Vector2 {
    return new Vector2(
      this._grid.transform.position.x + (this.transform.size.x + this._grid.cellMargin) * (this.index % this._grid.size.x),
      this._grid.transform.position.y + (this.transform.size.y + this._grid.cellMargin) * Math.floor(this.index / this._grid.size.x),
    )
  }

  protected getSpritePosition(): Vector2 {
    return new Vector2(
      this.transform.position.x + this.transform.size.x / 2,
      this.transform.position.y + this.transform.size.y / 2,
    )
  }

  public dropped(): void { }

  protected drawFirstRow(): void {
    this._graphics.draw.clear()
    this._graphics.draw.chamferRect(
      this.transform.position.x + this.transform.size.x / 4,
      this.transform.position.y + this.transform.size.y / 4,
      this.transform.size.x / 2,
      this.transform.size.y / 2,
      6,
    ).stroke({
      color: this.colors[0],
      width: 4,
      alignment: 1,
    })
    this._graphics.draw.alpha = 0.5

    if (this._sprite && this._sprite.display) {
      this._sprite.display.visible = false
    }
  }

  protected drawSurroundingCellsConnections(): void {
    for (const [index, cellIndex] of this._grid.getSurroundingCellsIndexes(this.index).entries()) {
      if (cellIndex < 0 || cellIndex >= this._grid.size.x * this._grid.size.y)
        continue // Skip invalid indexes
      const cell = this._grid.getCell(cellIndex)
      if (!cell) {
        continue // Skip if the cell is null
      }
      if (cell?.colors[0] === this.colors[0]) {
        continue // Skip cells that are the same as the current cell
      }
      const commonColor = cell?.colors.find(color => this.colors.includes(color))
      if (!commonColor || this.colors[0] === commonColor) {
        continue // Skip cells not in the cell group
      }
      // Draw the circle for the surrounding cell
      switch (index) {
        case 0: {
          const point = [
            this.transform.position.x + this.transform.size.x / 2,
            this.transform.position.y - 5,
          ]
          this._graphics.draw.poly([
            point[0],
            point[1],
            point[0] + 10,
            point[1] + 10,
            point[0] - 10,
            point[1] + 10,

          ]).fill({
            color: commonColor,
          })
          break
        }
        case 1: {
          const point = [
            this.transform.position.x + this.transform.size.x / 2,
            this.transform.position.y + this.transform.size.y + 5,
          ]
          // Pointing down
          this._graphics.draw.poly([
            point[0],
            point[1],
            point[0] + 10,
            point[1] - 10,
            point[0] - 10,
            point[1] - 10,
          ]).fill({
            color: commonColor,
          })
          break
        }
        case 2: {
          const point = [
            this.transform.position.x - 5,
            this.transform.position.y + this.transform.size.y / 2,
          ]
          this._graphics.draw.poly([
            point[0] + 10,
            point[1] - 10,
            point[0],
            point[1],
            point[0] + 10,
            point[1] + 10,
          ]).fill({
            color: commonColor,
          })
          break
        }
        case 3: {
          const point = [
            this.transform.position.x + this.transform.size.x + 5,
            this.transform.position.y + this.transform.size.y / 2,
          ]
          this._graphics.draw.poly([
            point[0] - 10,
            point[1] - 10,
            point[0],
            point[1],
            point[0] - 10,
            point[1] + 10,
          ]).fill({
            color: commonColor,
          })
          break
        }
      }
    }
  }

  protected draw(): void {
    this._graphics.draw.clear()
    this._graphics.draw.roundRect(this.transform.position.x, this.transform.position.y, this.transform.size.x, this.transform.size.y, 6).stroke({
      color: this.colors[0],
      width: 4,
      alignment: 1,
    }).fill({
      color: this.colors[0],
      alpha: 0.1,
    })

    this._graphics.draw.circle(
      this.transform.position.x + this.transform.size.x / 2,
      this.transform.position.y + this.transform.size.y / 2,
      this.transform.size.x / 2 - 4,
    ).fill({
      color: this.colors[0],
      alpha: 0.1,
    })

    this.drawSurroundingCellsConnections()

    // for (const [i, color] of this.colors.slice(1).entries()) {
    //   this._graphics.draw.circle(
    //     this.transform.position.x + i * 10 + 10,
    //     this.transform.position.y + 10,
    //     2,
    //   ).fill({
    //     color,
    //   })
    // }

    this._graphics.draw.alpha = 0.5

    if (this._sprite && this._sprite.display) {
      this._sprite.display.visible = true
      this._sprite.position = this.getSpritePosition()
      this._sprite.display.tint = this.colors[0]
      this._sprite.display.alpha = 0.5
    }
  }

  protected drawInCellGroup(): void {
    this._graphics.draw.clear()
    this._graphics.draw.roundRect(this.transform.position.x, this.transform.position.y, this.transform.size.x, this.transform.size.y, 6).stroke({
      color: this.colors[0],
      width: 4,
      alignment: 1,
    }).fill({
      color: this.colors[0],
      alpha: 0.1,
    })

    this._graphics.draw.circle(
      this.transform.position.x + this.transform.size.x / 2,
      this.transform.position.y + this.transform.size.y / 2,
      this.transform.size.x / 2 - 4,
    ).fill({
      color: this.colors[0],
      alpha: 0.1,
    })

    this.drawSurroundingCellsConnections()

    this._graphics.draw.alpha = 1

    if (this._sprite && this._sprite.display) {
      this._sprite.display.visible = true
      this._sprite.position = this.getSpritePosition()
      this._sprite.display.tint = this.colors[0]
      this._sprite.display.alpha = 1
    }
  }

  protected selected(): void {
    this._combatSystem.selectCell(this.index)
  }

  protected unselected(): void { }

  protected trigger(): void {
    if (!this._triggerable)
      return
    const cellGroupSize = this.cellGroup?.length || 0
    if (cellGroupSize >= this._minCellGroupSize) {
      // this._triggerSound.sound?.play()
      this._movesSystem.addPlayerMovesFromCellTrigger(this.index)
    }
  }

  public static get displayData(): CellDisplayData {
    return {
      name: this.NAME,
      description: 'Test description',
      types: this.TYPES,
    }
  }
}
