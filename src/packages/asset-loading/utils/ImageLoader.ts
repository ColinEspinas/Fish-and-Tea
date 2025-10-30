import type { Asset } from '../types/Asset'
import type { Loader } from '../types/Loader'
import { nanoid } from 'nanoid'

/**
 * Image loader using an Image element.
 */
export class ImageLoader implements Loader {
  public async load(file: string | { name: string, path: string }) {
    return new Promise<Asset>((resolve) => {
      const image = new Image()
      image.addEventListener('load', () => {
        const id = nanoid()
        // Create the asset.
        const asset: Asset = {
          id,
          filepath: typeof file === 'string' ? file : file.path,
          alias: typeof file === 'string' || !file.name ? id : file.name,
          element: image,
        }
        // Resolve the promise when loaded.
        resolve(asset)
      })
      image.addEventListener('error', (err) => {
        // TODO: Throw a real error when engine errors are done.
        console.error(err)
      })
      // Set image source to the given file.
      image.src = typeof file === 'string' ? file : file.path
    })
  }
}
