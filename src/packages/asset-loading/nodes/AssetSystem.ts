import type { AssetName } from '../index'
import type { Asset } from '../types/Asset'
import type { Loader } from '../types/Loader'
import { OuterNode } from '@ineka/engine'

export class AssetSystem extends OuterNode {
  public assets: Map<AssetName, Asset> = new Map()
  protected loaders: { [extension: string]: Loader } = {}

  /**
   * Add a loader to the system for given file extensions.
   * @param {Loader} loader Loader to add.
   * @param {string[]} extensions Extensions that will be loaded with the given loader.
   */
  public addLoader(loader: Loader, extensions: string[]): void {
    extensions.forEach((extension) => {
      this.loaders[extension] = loader
    })
  }

  /**
   * Load assets from files using the system loaders.
   * @param {string | { name: string, path: string }[]} files Files to load.
   * @param {any} options Options to pass to the loaders.
   * @param {(fulfilled: number, rejected: number) => void} progress
   * Function called each time the asset loading progresses.
   * @returns {Promise<(Asset | null)[]>} A promise with all the assets to load
   */
  public async loadFromFiles(
    files: (string | { name: string, path: string })[],
    options: any = {},
    progress?: (fulfilled: number, rejected: number) => void,
  ): Promise<(Asset | null)[]> {
    const assetsToLoad: Promise<Asset>[] = []
    let fulfilledProgress = 0
    let rejectedProgress = 0

    files.forEach((file) => {
      // Use loaders corresponding to the file extension.
      const asset = this.loaders[
        this.getExtension(typeof file === 'string' ? file : file.path)
      ]?.load(file, options)
      // Keep track of loading progress.
      if (progress) {
        asset.then(() => {
          fulfilledProgress++
          progress(fulfilledProgress, rejectedProgress)
        }, () => {
          rejectedProgress++
          progress(fulfilledProgress, rejectedProgress)
        })
      }
      if (asset)
        assetsToLoad.push(asset)
      // TODO: Throw a error when there is no loader for the file's extension.
    })

    // Await loading of all assets.
    const loadedAssets = (await Promise.allSettled(assetsToLoad)).map((assetResult) => {
      if (assetResult.status === 'fulfilled') {
        this.assets.set(assetResult.value.alias ?? assetResult.value.id as any, assetResult.value)
        return assetResult.value
      }
      return null
    }).filter(asset => asset)

    return loadedAssets
  }

  /**
   * Get the extension from a filepath.
   * @param {string} path File path to get the extension from.
   * @returns {string} A file extension
   */
  protected getExtension(path: string): string {
    return path.split('?')[0].split('.').pop() || ''
  }
}
