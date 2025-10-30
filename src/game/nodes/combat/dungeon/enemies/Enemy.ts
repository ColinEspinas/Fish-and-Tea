import type { Arena } from '../Arena'
import { NextMoveDisplay } from '../../../ui/NextMoveDisplay'
import { Fighter } from '../Fighter'

export class Enemy extends Fighter {
  protected _nextMoveDisplay: NextMoveDisplay

  constructor(parent: Arena, arenaSlot: number) {
    super(parent, arenaSlot)

    this._nextMoveDisplay = new NextMoveDisplay(this)
    this.add(this._nextMoveDisplay)
  }

  protected onLoad(): void {
    super.onLoad()
    this.selectable.group = 'enemies'
  }

  protected draw(): void {}

  public die(): void {
    this.selectable.group = 'enemies-dead'
  }
}
