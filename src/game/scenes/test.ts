/* eslint-disable antfu/top-level-function */
import type { Engine } from '@ineka/engine'
import type { Scene } from '../../packages/pixi/nodes/Scene'
import { createScene } from '../../packages/pixi/utils/scenes'
import { Cursor } from '../nodes/cursor/Cursor'
import { SimpleNodeTest } from '../nodes/test/SimpleNodeTest'

// Name of the scene
const name = 'test'

// Nodes of the scene
const nodes = (scene: Scene) => [
  new Cursor(scene),
  new SimpleNodeTest(scene),
]

export default {
  name,
  nodes,
}
