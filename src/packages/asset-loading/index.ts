import type { AssetSystem } from './nodes/AssetSystem'
import { assets } from '../../game/data/assets'

export type AssetName = (typeof assets)[number]['name']

export async function loadAssets(assetSystem: AssetSystem) {
  await assetSystem.loadFromFiles(assets as any)
}
