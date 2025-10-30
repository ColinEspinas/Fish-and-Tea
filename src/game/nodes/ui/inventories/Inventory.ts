import type { InputSystem } from '../../../../packages/inputs/nodes/InputSystem'
import type { RenderSystem } from '../../../../packages/pixi/nodes/RenderSystem'
import type { Cell } from '../../combat/grid/cells/Cell'
import type { CursorSystem } from '../../cursor/CursorSystem'
import type { RunSystem } from '../../RunSystem'
import type { UiSystem } from '../UiSystem'
import { InnerNode } from '@ineka/engine'
import { TextStyle } from 'pixi.js'
import { lerp } from '../../../../packages/basic/utils/lerp'
import { Transform } from '../../../../packages/basic/utils/Transform'
import { Vector2 } from '../../../../packages/math/utils/vectors'
import { Graphics2D } from '../../../../packages/pixi/nodes/Graphics2D'
import { Text2D } from '../../../../packages/pixi/nodes/Text2D'
import { CellDisplay } from '../CellDisplay'

export class Inventory extends InnerNode {
  protected _renderSystem = this.engine.systems.get('render') as RenderSystem
  protected _inputSystem = this.engine.systems.get('inputs') as InputSystem
  protected _runSystem = this.engine.systems.get('run') as RunSystem
  protected _cursorSystem = this.engine.systems.get('cursor') as CursorSystem
  protected _uiSystem = this.engine.systems.get('ui') as UiSystem

  public transform: Transform = new Transform()
  public title: string = 'Test Inventory'

  protected _titleText: Text2D
  protected _background: Graphics2D

  protected _cellDisplays: CellDisplay[] = []
  protected _visibleCellDisplayIndexes: number[] = []
  protected _spacing: number = 25
  protected _sideMargin: number = 50
  protected _maxCellDisplays: number = 0
  protected _maxDisplaySize: Vector2
  protected _offset: number = 0

  protected _backgroundAlpha: number = 0.6

  protected _needTransition: boolean = false
  protected _state: 'open' | 'closed' = 'closed'
  protected _duration: number = 0.2
  protected _elapsed: number = 0

  public get isOpen(): boolean {
    return this._state === 'open'
  }

  constructor(parent: InnerNode, title: string, cells: [typeof Cell, number][]) {
    super(parent)
    this.title = title

    this._maxDisplaySize = new Vector2(
      this._renderSystem.getSize().x - 100,
      this._renderSystem.getSize().y,
    )

    this._titleText = new Text2D(this, this.title, new TextStyle({
      fontFamily: 'monogram',
      fill: 'white',
      fontSize: 36,
    }))
    this._titleText.write.anchor.set(0.5, 0)
    this._titleText.write.zIndex = 1001
    this._titleText.transform.position = new Vector2(
      this._renderSystem.getCenter().x,
      -50, // Start off-screen
    )

    this._background = new Graphics2D(this)
    this._background.draw.alpha = 0
    this._background.draw.zIndex = 1000

    this.add(this._background)
    this.add(this._titleText)

    this.updateCells(cells)
  }

  protected onStep(delta: number): void {
    let accumulatedWidth = 0
    this._maxCellDisplays = 0
    while (accumulatedWidth < this._maxDisplaySize.x) {
      accumulatedWidth += 200 + this._spacing
      if (accumulatedWidth > this._maxDisplaySize.x) {
        break
      }
      this._maxCellDisplays++
    }

    if (this._inputSystem.mouseWheelDelta.y !== 0) {
      this._offset += this._inputSystem.mouseWheelDelta.y / 100
      this._offset = Math.max(0, Math.min(this._offset, this._cellDisplays.length - this._maxCellDisplays))
    }

    const firstInvisibleCellDisplay = this._cellDisplays[this._visibleCellDisplayIndexes[0] - 1]
    if (firstInvisibleCellDisplay && firstInvisibleCellDisplay.selectable.selected) {
      this._offset = Math.max(0, this._offset - 1)
    }
    const lastInvisibleCellDisplay = this._cellDisplays[this._visibleCellDisplayIndexes[this._visibleCellDisplayIndexes.length - 1] + 1]
    if (lastInvisibleCellDisplay && lastInvisibleCellDisplay.selectable.selected) {
      this._offset = Math.min(this._cellDisplays.length - this._maxCellDisplays, this._offset + 1)
    }

    const screenCenter = this._renderSystem.getCenter()
    const screenSize = this._renderSystem.getSize()

    this._titleText.write.text = this.title

    this._background.draw.clear()
    this._background.draw.rect(0, 0, screenSize.x, screenSize.y)
    this._background.draw.fill('black')

    this._maxDisplaySize = new Vector2(
      this._renderSystem.getSize().x - this._sideMargin * 2,
      this._renderSystem.getSize().y,
    )

    this._visibleCellDisplayIndexes = this._cellDisplays.map((_, index) => index).slice(this._offset, this._offset + this._maxCellDisplays)
    for (const [index, cellDisplay] of this._cellDisplays.entries()) {
      if (this._state === 'open') {
        cellDisplay.visible = true
      }
      else if (this._state === 'closed') {
        cellDisplay.visible = false
      }
      const totalSpacing = cellDisplay.transform.size.x + this._spacing
      cellDisplay.transform.position = new Vector2(
        lerp(
          cellDisplay.transform.position.x,
          (screenCenter.x + index * totalSpacing - (this._visibleCellDisplayIndexes.length - 1) * totalSpacing / 2) - cellDisplay.transform.size.x / 2 - this._offset * totalSpacing,
          0.1,
        ),
        screenCenter.y - cellDisplay.transform.size.y / 2,
      )
    }

    if (this._needTransition) {
      if (this._state === 'open') {
        this._elapsed += delta
        const progress = Math.min(this._elapsed / this._duration, 1)

        // Fade in the background
        this._background.draw.alpha = progress * this._backgroundAlpha
        // Move title text to the top center
        this._titleText.transform.position = new Vector2(
          screenCenter.x,
          lerp(this._titleText.transform.position.y, 50, 0.1),
        )

        if (progress === 1) {
          this._needTransition = false
        }
      }
      else if (this._state === 'closed') {
        this._elapsed += delta
        const progress = Math.min(this._elapsed / this._duration, 1)

        // Fade out the background
        this._background.draw.alpha = (1 - progress) * this._backgroundAlpha
        // Move title text off screen top center
        this._titleText.transform.position = new Vector2(
          screenCenter.x,
          lerp(this._titleText.transform.position.y, -50, 0.1),
        )

        if (progress === 1) {
          this._needTransition = false
        }
      }
    }
  }

  public open(): void {
    if (this._state === 'open')
      return
    this._needTransition = true
    this._state = 'open'
    this._elapsed = 0
    this._uiSystem.openMenu('inventory')
    this._cursorSystem.forceSelection = false
    this._cursorSystem.enableOnlyGroup('inventory')
  }

  public close(): void {
    if (this._state === 'closed')
      return
    this._needTransition = true
    this._state = 'closed'
    this._elapsed = 0
    this._uiSystem.closeMenu()
    this._cursorSystem.disableGroup('inventory')
    this._cursorSystem.unselect()
  }

  public updateCells(cells: [typeof Cell, number][]): void {
    for (const [cell, count] of cells) {
      const existingDisplay = this._cellDisplays.find(display => display.cell === cell)
      if (existingDisplay) {
        existingDisplay.count = count
      }
      else {
        const cellDisplay = new CellDisplay(this, cell, count)
        cellDisplay.visible = false // Initially hidden
        this._cellDisplays.push(cellDisplay)
        this.add(cellDisplay)
      }
    }
    // Remove displays for cells that are no longer present
    this._cellDisplays = this._cellDisplays.filter((display) => {
      return cells.some(([cell]) => display.cell === cell)
    })
  }
}
