import type { Engine, TreeNode } from '@ineka/engine'
import type { Filter } from 'pixi.js'
import type { SceneConfig } from '../types/scenes'
import type { RenderSystem } from './RenderSystem'
import { OuterNode } from '@ineka/engine'
import { Scene } from './Scene'
import { SceneSwitcher } from './SceneSwither'

type CreateSceneFunction = () => Scene
export class SceneSystem extends OuterNode {
  private _sceneSwitcher: SceneSwitcher
  private _createSceneFunctions: Map<string, CreateSceneFunction> = new Map()

  public get activeScene(): Scene | null {
    return this._sceneSwitcher.activeScene
  }

  constructor(parent: Engine, scenes?: SceneConfig[]) {
    super(parent)
    this._sceneSwitcher = new SceneSwitcher(parent)
    this.engine.rootNode = this._sceneSwitcher
    if (scenes)
      this.addScenes(scenes)
  }

  protected onLoad(): void {
    if (!this._sceneSwitcher.activeScene)
      this.setActiveScene(this._createSceneFunctions.keys().next().value!)
  }

  private hasScene(name: string): boolean {
    return this._createSceneFunctions.has(name)
  }

  public setActiveScene(name: string, load: boolean = true): void {
    const createScene = this._createSceneFunctions.get(name)

    if (createScene) {
      const scene = createScene()
      this._sceneSwitcher.switchTo(scene)
      if (load && this._sceneSwitcher.activeScene) {
        this._sceneSwitcher.activeScene.load()
      }
    }
  }

  private createScene(
    name: string,
    nodes: (scene: Scene) => TreeNode[],
    filters: Filter[] = [],
  ): Scene {
    const scene = new Scene(this._sceneSwitcher, name)
    scene.stage.filters = filters
    for (const node of nodes(scene)) scene.add(node)
    return scene
  }

  public addScenes(scenes: SceneConfig[]): void {
    scenes.forEach(scene => this.addScene(scene))
  }

  public addScene(scene: SceneConfig): void {
    if (!this.hasScene(scene.name)) {
      this._createSceneFunctions.set(
        scene.name,
        () => this.createScene(scene.name, scene.nodes),
      )
    }
    else {
      console.error(`Add Scene: A scene with the name (${scene.name}) already exists`)
    }
  }

  public removeScene(name: string): void {
    const deleted = this._createSceneFunctions.delete(name)
    if (!deleted) {
      console.error(`Remove Scene: Scene ${name} not found`)
    }
  }
}
