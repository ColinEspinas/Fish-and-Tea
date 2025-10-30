import { Vector2 } from '../../math/utils/vectors'

export class Transform {
  public position!: Vector2
  public rotation!: number
  public size!: Vector2

  constructor() {
    this.reset()
  }

  public reset() {
    this.position = Vector2.ZERO.clone()
    this.rotation = 0
    this.size = Vector2.ONE.clone()
  }

  public worldToLocal(position: Vector2) {
    return position.subtract(this.position)
  }

  public localToWorld(position: Vector2) {
    return position.add(this.position)
  }

  public contains(position: Vector2) {
    return (
      position.x >= this.position.x
      && position.x <= this.position.x + this.size.x
      && position.y >= this.position.y
      && position.y <= this.position.y + this.size.y
    )
  }
}
