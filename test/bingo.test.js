import assert from 'node:assert/strict'
import { test } from 'node:test'
import { CAPTION_COUNT, CENTER, completedLines, createBoard, markTile, seedFromSearch } from '../src/bingo.js'
import { captions } from '../src/captions.js'

test('the URL picks a board using a string seed', () => {
  assert.equal(seedFromSearch('?other=x&seed=0007'), '0007')
  assert.equal(seedFromSearch('?seed=party%20%26%20friends'), 'party & friends')
  assert.equal(seedFromSearch('?seed=0'), '0')
  assert.equal(seedFromSearch('?seed='), null)
  assert.equal(seedFromSearch('?other=x'), null)
})

test('a seed reproduces a board and different seeds can change the layout', () => {
  const board = createBoard(captions, 'party')
  assert.deepEqual(createBoard([...captions], 'party'), board)
  assert.notDeepEqual(createBoard(captions, 'afterparty'), board)
})

test('shared seeds preserve the shuffle order across releases', () => {
  const numberedCaptions = Array.from({ length: CAPTION_COUNT }, (_, index) => String(index))
  assert.deepEqual(createBoard(numberedCaptions, 'party'), [
    '20', '6', '13', '23', '15',
    '10', '0', '21', '7', '8',
    '3', '12', null, '16', '2',
    '18', '11', '14', '22', '19',
    '4', '9', '1', '17', '5',
  ])
})

test('the board has 24 unique captions around the image space and leaves source text intact', () => {
  const original = [...captions]
  const board = createBoard(captions, 'layout')
  const boardCaptions = board.filter(caption => caption !== null)
  assert.equal(board.length, 25)
  assert.equal(board[CENTER], null)
  assert.equal(new Set(boardCaptions).size, CAPTION_COUNT)
  assert.ok(boardCaptions.every(caption => original.includes(caption)))
  assert.deepEqual(captions, original)
})

test('blank and duplicate captions cannot fill a board', () => {
  const tooFew = [...captions.slice(0, 23), ' ', ` ${captions[0]} `]
  assert.throws(() => createBoard(tooFew, 'party'), /at least 24 distinct captions/)
})

test('a mark is permanent within the current game and the center is already free', () => {
  const fresh = new Set()
  const marked = markTile(fresh, 4)
  assert.deepEqual(marked, new Set([4]))
  assert.equal(markTile(marked, 4), marked)
  assert.equal(markTile(marked, CENTER), marked)
  assert.equal(fresh.size, 0)
})

test('empty boards and incomplete lines do not win', () => {
  assert.deepEqual(completedLines(new Set()), [])
  assert.deepEqual(completedLines(new Set([0, 1, 2, 3, 6, 18])), [])
})

test('full horizontal and vertical lines win', () => {
  assert.deepEqual(completedLines(new Set([0, 1, 2, 3, 4])), [[0, 1, 2, 3, 4]])
  assert.deepEqual(completedLines(new Set([3, 8, 13, 18, 23])), [[3, 8, 13, 18, 23]])
})

test('the image completes lines that pass through the center', () => {
  const linesWithCenter = [
    [10, 11, 12, 13, 14],
    [2, 7, 12, 17, 22],
    [0, 6, 12, 18, 24],
    [4, 8, 12, 16, 20],
  ]
  for (const line of linesWithCenter) {
    const marked = new Set(line.filter(index => index !== CENTER))
    assert.deepEqual(completedLines(marked), [line])
  }
})

test('the board can complete several lines at once and has twelve total', () => {
  const marked = new Set([0, 1, 2, 3, 5, 10, 15, 20])
  assert.equal(completedLines(marked).length, 1)
  assert.equal(completedLines(markTile(marked, 4)).length, 2)
  assert.equal(completedLines(new Set(Array.from({ length: 25 }, (_, index) => index))).length, 12)
})
