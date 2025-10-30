import type { Fighter } from '../combat/dungeon/Fighter'
import type { Cell } from '../combat/grid/cells/Cell'
import { InnerNode } from '@ineka/engine'
import { TextStyle } from 'pixi.js'
import { Transform } from '../../../packages/basic/utils/Transform'
import { Vector2 } from '../../../packages/math/utils/vectors'
import { Graphics2D } from '../../../packages/pixi/nodes/Graphics2D'
import { Text2D } from '../../../packages/pixi/nodes/Text2D'
import { Selectable } from '../cursor/Selectable'

export class CellDisplay extends InnerNode {
  public transform: Transform = new Transform()

  protected _nameText: Text2D
  protected _descriptionText: Text2D
  protected _countText: Text2D
  protected _background: Graphics2D

  protected _padding: number = 10
  protected _lineMargin: number = 25

  protected _selectable!: Selectable

  public visible: boolean = true

  public cell: typeof Cell
  public count: number

  public get selectable(): Selectable { return this._selectable }

  constructor(parent: InnerNode, cell: typeof Cell, count: number = 1) {
    super(parent)
    this.cell = cell
    this.count = count

    this.transform.size = new Vector2(200, 300)

    this._nameText = new Text2D(this, '', new TextStyle({
      fontFamily: 'monogram',
      fill: 'white',
      fontSize: 24,
      wordWrap: true,
      wordWrapWidth: this.transform.size.x - this._padding * 2,
      breakWords: true,
      lineHeight: 24,
      align: 'center',
    }))
    this._nameText.write.anchor.set(0.5, 0)
    this._nameText.write.zIndex = 1001

    this._descriptionText = new Text2D(this, '', new TextStyle({
      fontFamily: 'monogram',
      fill: 'white',
      fontSize: 18,
      wordWrap: true,
      wordWrapWidth: this.transform.size.x - this._padding * 2,
      breakWords: true,
      lineHeight: 24,
      align: 'center',
    }))
    this._descriptionText.write.anchor.set(0.5, 0)
    this._descriptionText.write.zIndex = 1001

    this._countText = new Text2D(this, '', new TextStyle({
      fontFamily: 'monogram',
      fill: 'white',
      fontSize: 36,
      align: 'center',
    }))
    this._countText.write.anchor.set(0.5, 0.5)
    this._countText.write.zIndex = 1001

    this._background = new Graphics2D(this)
    this._background.draw.alpha = 1
    this._background.draw.zIndex = 1001

    this.add(this._background)
    this.add(this._nameText)
    this.add(this._descriptionText)
    this.add(this._countText)

    this._selectable = new Selectable(this, () => {}, { type: 'cell-display', padding: 25, group: 'inventory' })
    this.add(this._selectable)
    this._selectable.active = false
  }

  protected onStep(_: number): void {
    if (!this.visible) {
      this._selectable.active = false
      this._nameText.write.visible = false
      this._descriptionText.write.visible = false
      this._countText.write.visible = false
      this._background.draw.visible = false
      return
    }
    else {
      this._selectable.active = true
      this._nameText.write.visible = true
      this._descriptionText.write.visible = true
      this._countText.write.visible = true
      this._background.draw.visible = true
    }

    this._nameText.write.text = this.cell.displayData.name
    this._descriptionText.write.text = this.cell.displayData.description || ''

    this._countText.write.text = this.count > 1 ? `x${this.count}` : ''

    this._nameText.transform.position = new Vector2(
      this.transform.position.x + this.transform.size.x / 2,
      this.transform.position.y + this._padding,
    )

    this._descriptionText.transform.position = new Vector2(
      this.transform.position.x + this.transform.size.x / 2,
      this.transform.position.y + this._nameText.write.height + this._lineMargin,
    )

    this._countText.transform.position = new Vector2(
      this.transform.position.x + this.transform.size.x / 2,
      this.transform.position.y + this.transform.size.y - this._padding - this._countText.write.height / 2,
    )

    this._background.draw.clear()
    this._background.draw.roundRect(
      this.transform.position.x,
      this.transform.position.y,
      this.transform.size.x,
      this.transform.size.y,
      10,
    )
    this._background.draw.fill('rgb(14, 18, 26)')
    this._background.draw.stroke({ color: 'rgba(14, 18, 26, 0.4)', width: 10 })
  }
}
