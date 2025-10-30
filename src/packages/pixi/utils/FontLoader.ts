import type { Asset } from '../../asset-loading/types/Asset'
import type { Loader } from '../../asset-loading/types/Loader'
import { nanoid } from 'nanoid'
import { Assets } from 'pixi.js'

/**
 * Texture loader using Pixi Assets utilities.
 */
export class FontLoader implements Loader {
  public async load(file: string | { name: string, path: string }) {
    return new Promise<Asset>((resolve) => {
      Assets.load(typeof file === 'string' ? file : file.path).then(() => {
        const id = nanoid()

        const asset: Asset = {
          id,
          filepath: typeof file === 'string' ? file : file.path,
          alias: typeof file === 'string' || !file.name ? id : file.name,
        }
        // Resolve the promise when loaded.
        resolve(asset)
      }).catch((err) => {
        // TODO: Throw a real error when engine errors are done.
        console.error(err)
      })
    })
  }
}
