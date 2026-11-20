import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { CAPTION_COUNT, CENTER, completedLines, createBoard, markTile, seedFromSearch } from './bingo.js'
import { captions } from './captions.js'
import centerImage from './center.jpg'
import './styles.css'

function getBoardUrl() {
  const url = new URL(window.location.href)
  if (!seedFromSearch(url.search)) {
    const [random] = crypto.getRandomValues(new Uint32Array(1))
    url.searchParams.set('seed', random.toString(36))
    window.history.replaceState(window.history.state, '', url)
  }
  return url
}

function Fanfare() {
  return (
    <div className="fanfare" aria-hidden="true">
      <strong>BINGO!</strong>
      {Array.from({ length: 24 }, (_, index) => {
        const angle = index * Math.PI / 12
        const distance = 8 + index % 5
        return (
          <span key={index} style={{
            '--x': `${Math.cos(angle) * distance}em`,
            '--y': `${Math.sin(angle) * distance}em`,
            '--spin': `${index * 37}deg`,
          }} />
        )
      })}
    </div>
  )
}

function App({ board, boardUrl, seed }) {
  const [marked, setMarked] = useState(() => new Set())
  const [shareState, setShareState] = useState('idle')
  const lines = completedLines(marked)
  const winningTiles = new Set(lines.flat())

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(boardUrl)
      setShareState('copied')
    } catch {
      setShareState('manual')
    }
  }

  return (
    <main className="game">
      <section className="intro" aria-labelledby="title">
        <span className="sparkle" aria-hidden="true">✦</span>
        <h1 id="title"><span>Madziowe</span>{' '}<span>BINGO!</span></h1>
        <p className="instructions">Mark a square when it happens. Get five in a row, column, or diagonal to call bingo.</p>

        <div className="board-tools">
          <div className="progress">
            <label htmlFor="marked-count">Squares marked <strong>{marked.size} / {CAPTION_COUNT}</strong></label>
            <progress id="marked-count" value={marked.size} max={CAPTION_COUNT} />
          </div>
          <div className="share">
            <p className="seed">Board seed <code>{seed}</code></p>
            <button type="button" className="copy" onClick={copyLink}>
              Copy board link
            </button>
            <span className="sr-only" role="status">{shareState === 'copied' ? 'Board link copied.' : ''}</span>
            {shareState === 'copied' && <p className="share-feedback" aria-hidden="true">Link copied!</p>}
            {shareState === 'manual' && (
              <input
                className="share-url"
                aria-label="Board link"
                value={boardUrl}
                readOnly
                onFocus={event => event.currentTarget.select()}
              />
            )}
          </div>
        </div>
      </section>

      <section className="play" aria-label="Bingo board">
        <div className="card">
          <div className="letters" aria-hidden="true">
            {[...'BINGO'].map(letter => <span key={letter}>{letter}</span>)}
          </div>
          <div className="tiles">
            {board.map((caption, index) => {
              const winning = winningTiles.has(index)
              if (index === CENTER) {
                return (
                  <div className="tile center" data-winning={winning} key={index}>
                    <img src={centerImage} alt="A purple-lit disco ball" />
                    <span>Free space</span>
                  </div>
                )
              }

              const selected = marked.has(index)
              return (
                <button
                  type="button"
                  className="tile caption"
                  key={index}
                  aria-pressed={selected}
                  aria-disabled={selected}
                  data-winning={winning}
                  onClick={() => setMarked(previous => markTile(previous, index))}
                >
                  <span className="indicator" aria-hidden="true">{selected ? '✓' : ''}</span>
                  {caption}
                </button>
              )
            })}
          </div>
          {lines.length > 0 && <Fanfare key={lines.length} />}
        </div>
        <p className="board-note" role="status">
          {lines.length > 0
            ? `Bingo! ${lines.length} ${lines.length === 1 ? 'line' : 'lines'} complete.`
            : 'Refresh the page to clear your marks.'}
        </p>
      </section>
    </main>
  )
}

const boardUrl = getBoardUrl()
const seed = seedFromSearch(boardUrl.search)
createRoot(document.getElementById('root')).render(
  <App board={createBoard(captions, seed)} boardUrl={boardUrl.href} seed={seed} />,
)
