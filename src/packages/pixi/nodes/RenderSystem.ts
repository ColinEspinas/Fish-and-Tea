import type { Engine } from '@ineka/engine'
import type { Renderer, WebGPUOptions } from 'pixi.js'
import { OuterNode } from '@ineka/engine'
import { Application, Container } from 'pixi.js'
import { Vector2 } from '../../math/utils/vectors'

export class RenderSystem extends OuterNode {
  protected _application: Application
  public stage?: Container
  public sceneContainer: Container
  public globalContainer: Container

  public renderSize: Vector2

  public get application(): Application { return this._application }
  public get renderer(): Renderer { return this._application.renderer }

  constructor(parent: Engine, stage?: Container) {
    super(parent)
    if (stage) {
      this.stage = stage
    }
    else {
      this.stage = new Container()
    }
    this._application = new Application()
    this.sceneContainer = new Container()
    this.globalContainer = new Container()

    this.renderSize = new Vector2(this.engine.options.width!, this.engine.options.height!)
  }

  public async initRenderer(options?: Partial<WebGPUOptions>): Promise<void> {
    await this._application.init({
      antialias: false,
      autoStart: false,
      resolution: window.devicePixelRatio || 1, // default to device pixel ratio
      autoDensity: true, // and his friend
      width: this.engine.options.width,
      height: this.engine.options.height,
      sharedTicker: false,
      backgroundColor: 'rgb(14, 18, 26)', // default background color
      preference: 'webgpu',
      ...options,
    })

    // call it manually once so we are sure we are the correct size after starting
    this.resize()
  }

  protected onLoad(): void {
    this.engine.container.appendChild(this._application.canvas)
    this.stage?.addChild(this.sceneContainer)
    this.stage?.addChild(this.globalContainer)
  }

  protected onStep(): void {
    this._application.renderer.resolution = window.devicePixelRatio || 1
    this._application.renderer.resize(this.renderSize.x, this.renderSize.y)
    this.resize()

    if (this.stage) {
      this._application.ticker.update(performance.now())
      this._application.stage = this.stage
      this._application.stage.sortableChildren = true
    }
  }

  protected onUnload(): void {
    this.engine.container.removeChild(this._application.canvas)
  }

  public getCenter(): Vector2 {
    return new Vector2(this._application.screen.width / 2, this._application.screen.height / 2)
  }

  public getSize(): Vector2 {
    return new Vector2(this._application.screen.width, this._application.screen.height)
  }

  protected resize(): void {
    // current screen size
    const screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
    const screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)

    // uniform scale for our game
    const scale = Math.min(screenWidth / this.renderSize.x, screenHeight / this.renderSize.y)

    // the "uniformly englarged" size for our game
    const enlargedWidth = Math.floor(scale * this.renderSize.x)
    const enlargedHeight = Math.floor(scale * this.renderSize.y)

    // margins for centering our game
    const horizontalMargin = (screenWidth - enlargedWidth) / 2
    const verticalMargin = (screenHeight - enlargedHeight) / 2

    // now we use css trickery to set the sizes and margins
    this._application.canvas.style.width = `${enlargedWidth}px`
    this._application.canvas.style.height = `${enlargedHeight}px`
    this._application.canvas.style.marginLeft = this._application.canvas.style.marginRight = `${horizontalMargin}px`
    this._application.canvas.style.marginTop = this._application.canvas.style.marginBottom = `${verticalMargin}px`
  }
}
