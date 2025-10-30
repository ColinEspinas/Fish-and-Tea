import type { TreeNode } from '@ineka/engine'
import type { InputSystem } from '../../../packages/inputs/nodes/InputSystem'
import type { RenderSystem } from '../../../packages/pixi/nodes/RenderSystem'
import type { SceneSystem } from '../../../packages/pixi/nodes/SceneSystem'
import type { CursorSystem } from './CursorSystem'
import type { Selectable } from './Selectable'
import { InnerNode } from '@ineka/engine'
import { DropShadowFilter } from 'pixi-filters'
import { lerp } from '../../../packages/basic/utils/lerp'
import { Transform } from '../../../packages/basic/utils/Transform'
import { degToRad } from '../../../packages/math/utils/angle'
import { Vector2 } from '../../../packages/math/utils/vectors'
import { Graphics2D } from '../../../packages/pixi/nodes/Graphics2D'
import { Sprite2D } from '../../../packages/pixi/nodes/Sprite2D'

export class Cursor extends InnerNode {
  protected _cursorSystem = this.engine.systems.get('cursor') as CursorSystem
  protected _inputSystem = this.engine.systems.get('inputs') as InputSystem
  protected _sceneSystem = this.engine.systems.get('scenes') as SceneSystem
  protected _renderSystem = this.engine.systems.get('render') as RenderSystem

  protected _graphics: Graphics2D
  protected _mouse: Sprite2D
  public transform: Transform = new Transform()

  protected _isUsingMouse: boolean = false

  constructor(parent: TreeNode) {
    super(parent)
    this._graphics = new Graphics2D(this, {
      renderOnActiveScene: false,
    })
    this.add(this._graphics)
    this._graphics.draw.zIndex = 900
    this._graphics.draw.filters = [new DropShadowFilter({ blur: 5, alpha: 0.8, offset: new Vector2(0, 0) })]

    this._mouse = new Sprite2D(this, 'image:mouse', {
      useParentTransform: false,
      size: new Vector2(30, 30),
      renderOnActiveScene: false,
    })
    this.add(this._mouse)
    this._mouse.display.zIndex = 1000
    this._mouse.display.filters = [new DropShadowFilter({ blur: 0, alpha: 1, offset: new Vector2(-1, 2) })]
    this._mouse.display.tint = 'rgb(254,255,254)'
  }

  protected onLoad(): void {
    this._inputSystem.setCursor('none')
  }

  protected onStep(_: number): void {
    this._graphics.draw.clear()

    if (this._cursorSystem.selected) {
      this.transform.position = new Vector2(
        lerp(this.transform.position.x, this._cursorSystem.selected.transform.position.x, 0.3),
        lerp(this.transform.position.y, this._cursorSystem.selected.transform.position.y, 0.3),
      )
      // this.transform.position = this._cursorSystem.selected.transform.position
      this.transform.size = new Vector2(
        lerp(this.transform.size.x, this._cursorSystem.selected.transform.size.x, 0.1),
        lerp(this.transform.size.y, this._cursorSystem.selected.transform.size.y, 0.1),
      )

      this._graphics.draw.position = this.transform.position

      const padding = this._cursorSystem.selected.padding
      const halfPadding = padding / 2

      // Draw top left corner with arc
      this._graphics.draw.arc(10 + halfPadding, 10 + halfPadding, 10, degToRad(180), degToRad(270)).stroke({
        color: 'rgb(255, 255, 255)',
        width: 4,
        alignment: 0,
      })

      // Draw top right corner with arc
      this._graphics.draw.arc(this.transform.size.x - 10 - halfPadding, 10 + halfPadding, 10, degToRad(270), degToRad(0)).stroke({
        color: 'rgb(255, 255, 255)',
        width: 4,
        alignment: 1,
      })

      // Draw bottom left corner with arc
      this._graphics.draw.arc(10 + halfPadding, this.transform.size.y - 10 - halfPadding, 10, degToRad(90), degToRad(180)).stroke({
        color: 'rgb(255, 255, 255)',
        width: 4,
        alignment: 1,
      })

      // Draw bottom right corner with arc
      this._graphics.draw.arc(this.transform.size.x - 10 - halfPadding, this.transform.size.y - 10 - halfPadding, 10, degToRad(0), degToRad(90)).stroke({
        color: 'rgb(255, 255, 255)',
        width: 4,
        alignment: 1,
      })

      this._graphics.draw.alpha = 0.9
    }

    if (this._inputSystem.gamepads.length > 0) {
      const gamepad = this._inputSystem.gamepads[0]
      if (this._inputSystem.isGamepadButtonPressed(gamepad, 'D_PAD_RIGHT')) {
        this._isUsingMouse = false
        this._cursorSystem.selectFromDirection('right')
      }

      if (this._inputSystem.isGamepadButtonPressed(gamepad, 'D_PAD_LEFT')) {
        this._isUsingMouse = false
        this._cursorSystem.selectFromDirection('left')
      }

      if (this._inputSystem.isGamepadButtonPressed(gamepad, 'D_PAD_UP')) {
        this._isUsingMouse = false
        this._cursorSystem.selectFromDirection('up')
      }

      if (this._inputSystem.isGamepadButtonPressed(gamepad, 'D_PAD_BOTTOM')) {
        this._isUsingMouse = false
        this._cursorSystem.selectFromDirection('down')
      }

      if (this._inputSystem.isGamepadButtonPressed(gamepad, 'BUTTON_BOTTOM')) {
        this._isUsingMouse = false
        this._cursorSystem.selected?.trigger()
      }
    }

    if (this._inputSystem.isKeyPressed('g')) {
      this._cursorSystem.unselect()
      if (this._sceneSystem.activeScene?.name === 'combat') {
        this._sceneSystem.setActiveScene('test')
      }
      else {
        this._sceneSystem.setActiveScene('combat')
      }
    }

    if (
      this._inputSystem.isKeyPressed('d')
      || this._inputSystem.isKeyPressed('ArrowRight')
    ) {
      this._isUsingMouse = false
      this._cursorSystem.selectFromDirection('right')
    }

    if (
      this._inputSystem.isKeyPressed('a')
      || this._inputSystem.isKeyPressed('ArrowLeft')
    ) {
      this._isUsingMouse = false
      this._cursorSystem.selectFromDirection('left')
    }

    if (
      this._inputSystem.isKeyPressed('w')
      || this._inputSystem.isKeyPressed('ArrowUp')
    ) {
      this._isUsingMouse = false
      this._cursorSystem.selectFromDirection('up')
    }

    if (
      this._inputSystem.isKeyPressed('s')
      || this._inputSystem.isKeyPressed('ArrowDown')
    ) {
      this._isUsingMouse = false
      this._cursorSystem.selectFromDirection('down')
    }

    if (this._inputSystem.isKeyPressed(' ')) {
      this._isUsingMouse = false
      this._cursorSystem.selected?.trigger()
    }

    if (this._isUsingMouse) {
      // If mouse is over any selectable object, set it as selected
      this._cursorSystem.selectFromPosition(this._inputSystem.mousePosition)
    }

    if (this._inputSystem.hasMouseMoved() || this._inputSystem.isMousePressed(0)) {
      this._isUsingMouse = true
      // Update cursor position
      this._mouse.position = this._inputSystem.mousePosition.clone()
    }

    if (this.mouseOnSelectable(this._cursorSystem.selected)) {
      if (this._cursorSystem.selected) {
        this._mouse.changeTexture('image:mouse-hand')
        this._mouse.anchor = new Vector2(0.4, 0.1)
      }
    }
    else {
      this._mouse.changeTexture('image:mouse')
      this._mouse.anchor = new Vector2(0.1, 0.1)
    }

    if (
      this._inputSystem.isMousePressed(0)
      && this.mouseOnSelectable(this._cursorSystem.selected)
    ) {
      this._cursorSystem.selected?.trigger()
    }
  }

  protected mouseOnSelectable(selectable: Selectable | null): boolean {
    if (!selectable)
      return false
    return selectable?.transform.contains(this._inputSystem.mousePosition)
  }
}
