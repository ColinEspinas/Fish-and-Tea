import type { Engine } from '@ineka/engine'
import { OuterNode } from '@ineka/engine'

export class UiSystem extends OuterNode {
  protected openedMenu: string = ''
  public get isMenuOpen(): boolean { return this.openedMenu !== '' }

  constructor(parent: Engine) {
    super(parent)
  }

  public openMenu(menuName: string): void {
    this.openedMenu = menuName
  }

  public closeMenu(): void {
    this.openedMenu = ''
  }
}
