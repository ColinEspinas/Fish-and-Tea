import type { HowlOptions } from 'howler'
import type { Asset } from '../../asset-loading/types/Asset'
import type { Loader } from '../../asset-loading/types/Loader'
import { Howl } from 'howler'
import { nanoid } from 'nanoid'

/**
 * Sound loader using Howler.
 */
export class SoundLoader implements Loader {
  public async load(file: string | { name: string, path: string }, options?: HowlOptions) {
    return new Promise<Asset>((resolve) => {
      const howl = new Howl({
        src: [typeof file === 'string' ? file : file.path],
        autoplay: false,
        html5: true,
        preload: 'metadata',
        onload: () => {
          const id = nanoid()
          // Create the asset.
          const asset: Asset = {
            id,
            filepath: typeof file === 'string' ? file : file.path,
            alias: typeof file === 'string' || !file.name ? id : file.name,
            sound: howl,
          }
          // Resolve the promise when loaded.
          resolve(asset)
        },
        onloaderror: (_, err) => {
          // TODO: Throw a real error when engine errors are done.
          console.error(err)
        },
        ...options,
      })
    })
  }
}
