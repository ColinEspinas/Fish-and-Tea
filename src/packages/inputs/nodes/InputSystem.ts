import type { Engine } from '@ineka/engine'
import type { RenderSystem } from '../../pixi/nodes/RenderSystem'
import type { CursorStyle } from '../types/cursors'
import type { GamepadAxisKeys, GamepadButtonKeys } from '../types/gamepad'
import type { KeyboardEventKey } from '../types/keys'
import { OuterNode } from '@ineka/engine'
import { Vector2 } from '../../math/utils/vectors'
import { StandardGamepadMapping } from '../types/gamepad'

export class InputSystem extends OuterNode {
  protected _renderSystem = this.engine.systems.get('render') as RenderSystem

  protected _pressedKeys: Map<KeyboardEventKey, boolean> = new Map()
  protected _releasedKeys: Map<KeyboardEventKey, boolean> = new Map()
  protected _downKeys: Map<KeyboardEventKey, boolean> = new Map()

  protected _gamepads: number[] = []
  protected _previousGamepadButtonState: Map<number, Map<number, boolean>> = new Map()

  protected _mousePosition: Vector2 = new Vector2(0, 0)
  protected _previousMousePosition: Vector2 = new Vector2(0, 0)
  protected _mouseWheelDelta: Vector2 = new Vector2(0, 0)
  protected _mouseWheel: Vector2 = new Vector2(0, 0)
  protected _previousMouseWheel: Vector2 = new Vector2(0, 0)

  protected _mousePressed: Map<number, boolean> = new Map()
  protected _mouseWasPressed: Map<number, boolean> = new Map()
  protected _mouseReleased: Map<number, boolean> = new Map()
  protected _mouseDown: Map<number, boolean> = new Map()
  protected _mouseMoved: boolean = false

  protected _pressedToRemoveNextStep: Set<KeyboardEventKey | number> = new Set()
  protected _releasedToRemoveNextStep: Set<KeyboardEventKey | number> = new Set()

  public get mousePosition(): Vector2 {
    return this._mousePosition
  }

  public get mouseWheelDelta(): Vector2 {
    return this._mouseWheelDelta
  }

  public get mouseWheel(): Vector2 {
    return this._mouseWheel
  }

  public get gamepads(): number[] {
    return this._gamepads
  }

  constructor(parent: Engine, options?: { disableContextMenu?: boolean, disablePageRefresh?: boolean }) {
    super(parent)
    if (options?.disableContextMenu)
      this.disableContextMenu()
    if (options?.disablePageRefresh)
      this.disablePageRefresh()

    const connectedGamepads = navigator.getGamepads ? navigator.getGamepads() : []
    this._gamepads = connectedGamepads.filter(g => g).map(g => g!.index)
  }

  protected onLoad(): void {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      this._downKeys.set(<KeyboardEventKey>e.key, true)
      if (!e.repeat) {
        this._pressedKeys.set(<KeyboardEventKey>e.key, true)
      }
    })

    window.addEventListener('keyup', (e: KeyboardEvent) => {
      this._downKeys.set(<KeyboardEventKey>e.key, false)
      this._releasedKeys.set(<KeyboardEventKey>e.key, true)
    })

    window.addEventListener('mousemove', (e: MouseEvent) => {
      const canvas = this._renderSystem.application.canvas
      const rect = canvas.getBoundingClientRect()
      // Mouse position relative to the canvas's CSS size
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Map to logical render coordinates (your internal game size)
      this._mousePosition.x = x * (this._renderSystem.renderSize.x / rect.width)
      this._mousePosition.y = y * (this._renderSystem.renderSize.y / rect.height)
    })

    window.addEventListener('mousedown', (e: MouseEvent) => {
      this._mouseDown.set(e.button, true)
      if (!this._mouseWasPressed.get(e.button)) {
        this._mousePressed.set(e.button, true)
        this._mouseWasPressed.set(e.button, true)
      }
    })

    window.addEventListener('mouseup', (e: MouseEvent) => {
      this._mouseDown.set(e.button, false)
      this._mouseReleased.set(e.button, true)
      this._mouseWasPressed.set(e.button, false)
    })

    window.addEventListener('wheel', (e: WheelEvent) => {
      this._mouseWheelDelta.x = e.deltaX
      this._mouseWheelDelta.y = e.deltaY
      this._mouseWheel.x += e.deltaX
      this._mouseWheel.y += e.deltaY
    })

    window.addEventListener('gamepadconnected', (e: GamepadEvent) => {
      this._gamepads.push(e.gamepad.index)
    })

    window.addEventListener('gamepaddisconnected', (e: GamepadEvent) => {
      this._gamepads.splice(this._gamepads.indexOf(e.gamepad.index), 1)
    })
  }

  protected onStep(_: number): void {
    for (const key of this._pressedToRemoveNextStep) {
      if (typeof key === 'number') {
        this._mousePressed.delete(key)
      }
      else {
        this._pressedKeys.delete(key)
      }
    }

    this._pressedToRemoveNextStep.clear()
    this._pressedToRemoveNextStep = new Set([...this._pressedKeys.keys(), ...this._mousePressed.keys()])

    for (const key of this._releasedToRemoveNextStep) {
      if (typeof key === 'number') {
        this._mouseReleased.delete(key)
      }
      else {
        this._releasedKeys.delete(key)
      }
    }

    this._releasedToRemoveNextStep.clear()
    this._releasedToRemoveNextStep = new Set([...this._releasedKeys.keys(), ...this._mouseReleased.keys()])

    if (this._mousePosition.x !== this._previousMousePosition.x || this._mousePosition.y !== this._previousMousePosition.y) {
      this._mouseMoved = true
    }
    else {
      this._mouseMoved = false
    }
    this._previousMousePosition = this._mousePosition.clone()

    if (this._previousMouseWheel.x === this._mouseWheel.x && this._previousMouseWheel.y === this._mouseWheel.y) {
      this._mouseWheelDelta.x = 0
      this._mouseWheelDelta.y = 0
    }
    this._previousMouseWheel = this._mouseWheel.clone()
  }

  public isKeyPressed(key: KeyboardEventKey): boolean {
    return this._pressedKeys.get(key) ?? false
  }

  public isKeyDown(key: KeyboardEventKey): boolean {
    return this._downKeys.get(key) ?? false
  }

  public isMousePressed(button: number): boolean {
    return this._mousePressed.get(button) ?? false
  }

  public isMouseDown(button: number): boolean {
    return this._mouseDown.get(button) ?? false
  }

  public hasMouseMoved(): boolean {
    return this._mouseMoved
  }

  public setCursor(type: CursorStyle): void {
    this.engine.container.style.cursor = type
  }

  public disableContextMenu(): void {
    document.addEventListener('contextmenu', (e: MouseEvent) => {
      e.preventDefault()
    })
  }

  public disablePageRefresh(): void {
    document.addEventListener('keydown', (event) => {
      if (
        event.key === 'F5'
        || (event.ctrlKey && event.key === 'r')
        || (event.metaKey && event.key === 'r')
      ) {
        event.preventDefault()
      }
    })
  }

  public isGamepadButtonDown(gamepadIndex: number, button: GamepadButtonKeys): boolean {
    const gamepad = navigator.getGamepads()[gamepadIndex]
    const buttonIndex = StandardGamepadMapping.buttons[button]
    if (!gamepad)
      return false
    return gamepad.buttons[buttonIndex].pressed
  }

  public isGamepadButtonPressed(gamepadIndex: number, button: GamepadButtonKeys): boolean {
    const gamepad = navigator.getGamepads()[gamepadIndex]
    const buttonIndex = StandardGamepadMapping.buttons[button]
    if (!gamepad)
      return false
    const currentState = gamepad.buttons[buttonIndex].pressed
    if (!this._previousGamepadButtonState.has(gamepadIndex)) {
      this._previousGamepadButtonState.set(gamepadIndex, new Map())
    }
    const previousState = this._previousGamepadButtonState.get(gamepadIndex)!.get(buttonIndex) ?? false
    this._previousGamepadButtonState.get(gamepadIndex)!.set(buttonIndex, currentState)
    return currentState && !previousState
  }

  public isGamepadButtonReleased(gamepadIndex: number, button: GamepadButtonKeys): boolean {
    const gamepad = navigator.getGamepads()[gamepadIndex]
    const buttonIndex = StandardGamepadMapping.buttons[button]
    if (!gamepad)
      return false
    const currentState = gamepad.buttons[buttonIndex].pressed
    if (!this._previousGamepadButtonState.has(gamepadIndex)) {
      this._previousGamepadButtonState.set(gamepadIndex, new Map())
    }
    const previousState = this._previousGamepadButtonState.get(gamepadIndex)!.get(buttonIndex) ?? false
    this._previousGamepadButtonState.get(gamepadIndex)!.set(buttonIndex, currentState)
    return !currentState && previousState
  }

  public getGamepadAxis(gamepadIndex: number, axis: GamepadAxisKeys): number {
    const gamepad = navigator.getGamepads()[gamepadIndex]
    const axisIndex = StandardGamepadMapping.axis[axis]
    if (!gamepad)
      return 0
    return gamepad.axes[axisIndex]
  }

  public getGamepadButton(gamepadIndex: number, button: GamepadButtonKeys): number {
    const gamepad = navigator.getGamepads()[gamepadIndex]
    const buttonIndex = StandardGamepadMapping.buttons[button]
    if (!gamepad)
      return 0
    return gamepad.buttons[buttonIndex].value
  }
}
