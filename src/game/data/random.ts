import { Xoshiro128 } from '@thi.ng/random/xoshiro128'

export const randomSeed = [0x12345678, 0x87654321, 0xABCDEF01, 0xFEDCBA98]

export const seededRandom = new Xoshiro128(randomSeed)
