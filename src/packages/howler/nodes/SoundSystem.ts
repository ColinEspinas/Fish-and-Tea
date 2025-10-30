import type { Engine } from '@ineka/engine'
import { OuterNode } from '@ineka/engine'
import { Howler } from 'howler'

export class SoundSystem extends OuterNode {
  constructor(parent: Engine) {
    super(parent)
  }

  public changeVolume(volume: number) {
    Howler.volume(volume)
  }
}
