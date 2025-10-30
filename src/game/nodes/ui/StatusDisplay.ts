import type { AssetName } from '../../../packages/asset-loading'
import type { Fighter } from '../combat/dungeon/Fighter'
import type { StatusEffect } from '../combat/status/StatusEffect'
import { InnerNode } from '@ineka/engine'
import { TextStyle } from 'pixi.js'
import { Transform } from '../../../packages/basic/utils/Transform'
import { Vector2 } from '../../../packages/math/utils/vectors'
import { Graphics2D } from '../../../packages/pixi/nodes/Graphics2D'
import { Sprite2D } from '../../../packages/pixi/nodes/Sprite2D'
import { Text2D } from '../../../packages/pixi/nodes/Text2D'

export class StatusDisplay extends InnerNode {
  public transform: Transform = new Transform()

  protected _fighter: Fighter
  protected _statusEffects: StatusEffect[] = []

  protected _icons: Sprite2D[] = []
  protected _texts: Text2D[] = []
  protected _graphics: Graphics2D

  protected _itemSize: Vector2 = new Vector2(40, 40)
  protected _iconMargin: number = 15
  protected _itemGap: number = 5

  constructor(parent: Fighter, options?: {
    position?: Vector2
  }) {
    super(parent)
    this._fighter = parent
    this.transform.position = options?.position ?? Vector2.ZERO

    this._graphics = new Graphics2D(this)
    this.add(this._graphics)
  }

  protected onStep(_: number): void {
    this.updateStatusEffects()

    this._graphics.draw.clear()
    this._statusEffects.forEach((_, index) => {
      this._icons[index].position = this.transform.position.clone().add(new Vector2(this._itemSize.x / 2, this._itemSize.y / 2 + (this._itemSize.y + this._itemGap) * index))
      this._texts[index].transform.position = this.transform.position.clone().add(new Vector2(this._itemSize.x, 15 + (this._itemSize.y + this._itemGap) * index))
      this.drawIconBackground(index)
    })
  }

  protected drawIconBackground(index: number): void {
    this._graphics.draw.circle(
      this.transform.position.x + this._itemSize.x / 2,
      this.transform.position.y + this._itemSize.y / 2 + (this._itemSize.y + this._itemGap) * index,
      this._itemSize.x / 2,
    ).fill({
      color: 'rgba(0, 0, 0, 0.8)',
    })
  }

  public updateStatusEffects(): void {
    this._statusEffects = this._fighter.statusEffects

    // Remove excess icons and texts
    this._icons.forEach((icon, index) => {
      if (index >= this._statusEffects.length) {
        this.remove(icon)
      }
    })
    if (this._icons.length > this._statusEffects.length) {
      this._icons.splice(this._statusEffects.length, this._icons.length - this._statusEffects.length)
    }
    this._texts.forEach((text, index) => {
      if (index >= this._statusEffects.length) {
        this.remove(text)
      }
    })
    if (this._texts.length > this._statusEffects.length) {
      this._texts.splice(this._statusEffects.length, this._texts.length - this._statusEffects.length)
    }

    // Create new icons and texts for new status effects
    const newIconsCount = this._statusEffects.length - this._icons.length
    const newTextsCount = this._statusEffects.length - this._texts.length

    for (let i = 0; i < newIconsCount; i++) {
      const icon = new Sprite2D(this, <AssetName> this._statusEffects[this._icons.length + i].icon.alias, {
        size: new Vector2(this._itemSize.x - this._iconMargin, this._itemSize.y - this._iconMargin),
        useParentTransform: false,
        anchor: new Vector2(0.5, 0.5),
      })
      this._icons.push(icon)
      this.add(icon)
    }

    for (let i = 0; i < newTextsCount; i++) {
      const textStyle = new TextStyle({
        fontFamily: 'monogram',
        fill: 'white',
        fontSize: 24,
      })

      const text = new Text2D(this, this._statusEffects[this._texts.length + i].stacks.toString(), textStyle)
      text.write.anchor = new Vector2(0.5, 0)
      this._texts.push(text)
      this.add(text)
    }

    // Update existing icons and texts
    this._statusEffects.forEach((effect, index) => {
      if (this._icons[index]) {
        this._icons[index].changeTexture(<AssetName>effect.icon.alias)
      }
      if (this._texts[index]) {
        this._texts[index].write.text = effect.stacks.toString()
      }
    })

    // this._statusEffects.forEach((effect, index) => {
    //   const icon = new Sprite2D(this, <AssetName>effect.icon.alias, {
    //     size: new Vector2(this._itemSize.x - this._iconMargin, this._itemSize.y - this._iconMargin),
    //     useParentTransform: false,
    //     anchor: new Vector2(0.5, 0.5),
    //   })
    //   this._icons.push(icon)
    //   this.add(icon)

    //   const textStyle = new TextStyle({
    //     fontFamily: 'monogram',
    //     fill: 'white',
    //     fontSize: 24,
    //   })

    //   const text = new Text2D(this, effect.stacks.toString(), textStyle)
    //   text.write.anchor = new Vector2(0.5, 0)
    //   this._texts.push(text)
    //   this.add(text)
    // })
  }
}
