import { Engine } from '@ineka/engine'
import { CombatSystem } from './game/nodes/combat/CombatSystem'
import { MovesSystem } from './game/nodes/combat/MovesSystem'
import { CursorSystem } from './game/nodes/cursor/CursorSystem'
import { ProgressionSystem } from './game/nodes/ProgressionSystem'
import { RunSystem } from './game/nodes/RunSystem'
import createCombatScene from './game/scenes/combat'
import createTestScene from './game/scenes/test'
import { loadAssets } from './packages/asset-loading'
import { AssetSystem } from './packages/asset-loading/nodes/AssetSystem'
import { SoundLoader } from './packages/howler/utils/SoundLoader'
import { InputSystem } from './packages/inputs/nodes/InputSystem'
import { RenderSystem } from './packages/pixi/nodes/RenderSystem'
import { SceneSystem } from './packages/pixi/nodes/SceneSystem'
import { FontLoader } from './packages/pixi/utils/FontLoader'
import { TextureLoader } from './packages/pixi/utils/TextureLoader'
import { UiSystem } from './game/nodes/ui/UiSystem'

const game = new Engine({
  container: '.game',
  resolution: 1,
  width: 1280,
  height: 720,
})

// Systems
const rendererSystem = new RenderSystem(game)
game.systems.set('render', rendererSystem)
await rendererSystem.initRenderer()

const inputSystem = new InputSystem(game, {
  disableContextMenu: true,
  disablePageRefresh: true,
})
game.systems.set('inputs', inputSystem)

const assetSystem = new AssetSystem(game)
game.systems.set('assets', assetSystem)
assetSystem.addLoader(new TextureLoader(), ['png', 'jpg', 'jpeg', 'webp', 'svg'])
assetSystem.addLoader(new SoundLoader(), ['mp3', 'wav', 'ogg'])
assetSystem.addLoader(new FontLoader(), ['ttf', 'woff', 'woff2'])
await loadAssets(assetSystem)

const sceneSystem = new SceneSystem(game)
game.systems.set('scenes', sceneSystem)

const uiSystem = new UiSystem(game)
game.systems.set('ui', uiSystem)

const cursorSystem = new CursorSystem(game)
game.systems.set('cursor', cursorSystem)

const progressionSystem = new ProgressionSystem(game)
game.systems.set('progression', progressionSystem)

const runSystem = new RunSystem(game)
game.systems.set('run', runSystem)

const combatSystem = new CombatSystem(game)
game.systems.set('combat', combatSystem)

const movesSystem = new MovesSystem(game)
game.systems.set('moves', movesSystem)

// Scenes
sceneSystem.addScenes([createCombatScene, createTestScene])
sceneSystem.setActiveScene('combat', false)

try {
  game.run()
}
catch (e) {
  console.error(e)
}
