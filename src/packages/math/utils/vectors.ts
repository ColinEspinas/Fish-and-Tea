import type { Matrix } from 'mathjs'
import { add, cross, divide, dot, matrix, multiply, norm, subtract } from 'mathjs'

export class Vector2 {
  static readonly UP = new Vector2(0, -1)
  static readonly DOWN = new Vector2(0, 1)
  static readonly LEFT = new Vector2(-1, 0)
  static readonly RIGHT = new Vector2(1, 0)
  static readonly ZERO = new Vector2(0, 0)
  static readonly ONE = new Vector2(1, 1)

  protected _matrix: Matrix

  constructor(x: number = 0, y: number = 0) {
    this._matrix = matrix([x, y])
  }

  get x(): number { return this._matrix.get([0]) }
  get y(): number { return this._matrix.get([1]) }

  set x(value: number) { this._matrix.set([0], value) }
  set y(value: number) { this._matrix.set([1], value) }

  add(v: Vector2): Vector2 {
    const result = add(this._matrix, v._matrix)
    return new Vector2(result.get([0]), result.get([1]))
  }

  subtract(v: Vector2): Vector2 {
    const result = subtract(this._matrix, v._matrix)
    return new Vector2(result.get([0]), result.get([1]))
  }

  scale(scalar: number): Vector2 {
    const result = multiply(this._matrix, scalar)
    return new Vector2(result.get([0]), result.get([1]))
  }

  dot(v: Vector2): number {
    return dot(this._matrix, v._matrix) as number
  }

  cross(v: Vector2): number {
    const result = cross(this._matrix, v._matrix)
    return (result as number[][])[0][0]
  }

  magnitude(): number {
    return norm(this._matrix) as number
  }

  normalize(): Vector2 {
    const mag = this.magnitude()
    if (mag === 0)
      return new Vector2()
    const result = divide(this._matrix, mag) as Matrix
    return new Vector2(result.get([0]), result.get([1]))
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y)
  }

  toString(): string {
    return `Vector2(${this.x}, ${this.y})`
  }
}
