import type { TreeNode } from '@ineka/engine'
import type { Scene } from '../nodes/Scene'

export interface SceneConfig {
  name: string
  nodes: (scene: Scene) => TreeNode[]
}
