export interface Asset {
  /**
   * Asset's ID, generate it with [nanoid](https://github.com/ai/nanoid).
   */
  id: string
  /**
   * Asset's filepath.
   */
  filepath: string
  /**
   * Asset's alias/name.
   */
  alias?: string
  /**
   * Element used to load the asset.
   */
  element?: HTMLElement
  /**
   * Stringified content.
   */
  content?: string
  /**
   * Howl object
   */
  sound?: Howl
}
