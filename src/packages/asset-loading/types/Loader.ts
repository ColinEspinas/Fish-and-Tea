import type { Asset } from './Asset'

export interface Loader {
  /**
   * Loads the file and returns an asset.
   * @async
   * @param {string | { name: string, path: string }} file File to load.
   * @virtual
   */
  load: (file: string | { name: string, path: string }, options?: any) => Promise<Asset>
}
