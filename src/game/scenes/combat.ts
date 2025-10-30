/* eslint-disable antfu/top-level-function */
import type { Scene } from '../../packages/pixi/nodes/Scene'
import { Vector2 } from '../../packages/math/utils/vectors'
import { Arena } from '../nodes/combat/dungeon/Arena'
import { PlayerGrid } from '../nodes/combat/grid/PlayerGrid'
import { Cursor } from '../nodes/cursor/Cursor'
import { Inventories } from '../nodes/ui/inventories/Inventories'

// Name of the scene
const name = 'combat'

// Nodes of the scene
const nodes = (scene: Scene) => [
  new PlayerGrid(scene, new Vector2(5, 6), new Vector2(65, 65)),
  new Arena(scene, new Vector2(800, (65 + 5) * 6)),
  new Cursor(scene),
  new Inventories(scene),
]

export default {
  name,
  nodes,
}
