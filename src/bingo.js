export const SIZE = 5
export const CENTER = Math.floor(SIZE * SIZE / 2)
export const CAPTION_COUNT = SIZE * SIZE - 1

const offsets = Array.from({ length: SIZE }, (_, index) => index)
const lines = [
  ...offsets.map(row => offsets.map(column => row * SIZE + column)),
  ...offsets.map(column => offsets.map(row => row * SIZE + column)),
  offsets.map(index => index * SIZE + index),
  offsets.map(index => index * SIZE + SIZE - 1 - index),
]

export function seedFromSearch(search) {
  return new URLSearchParams(search).get('seed') || null
}

export function createBoard(captions, seed) {
  const shuffled = [...new Set(captions.map(caption => caption.trim()).filter(Boolean))]
  if (shuffled.length < CAPTION_COUNT) {
    throw new Error(`A bingo board needs at least ${CAPTION_COUNT} distinct captions.`)
  }

  // FNV-1a hashes the seed string into the initial 32-bit state for Mulberry32.
  let state = 2166136261
  for (let index = 0; index < seed.length; index++) {
    state = Math.imul(state ^ seed.charCodeAt(index), 16777619)
  }

  for (let index = shuffled.length - 1; index > 0; index--) {
    state = (state + 0x6d2b79f5) | 0
    let value = Math.imul(state ^ (state >>> 15), state | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    const random = ((value ^ (value >>> 14)) >>> 0) / 2 ** 32
    const target = Math.floor(random * (index + 1))
    const caption = shuffled[index]
    shuffled[index] = shuffled[target]
    shuffled[target] = caption
  }

  const board = shuffled.slice(0, CAPTION_COUNT)
  board.splice(CENTER, 0, null)
  return board
}

export function markTile(marked, index) {
  return index === CENTER || marked.has(index) ? marked : new Set([...marked, index])
}

export function completedLines(marked) {
  return lines.filter(line => line.every(index => index === CENTER || marked.has(index)))
}
