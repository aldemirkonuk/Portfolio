'use client'

import { useEffect, useState } from 'react'
import { CHAPTERS } from '../../lib/chapters'
import Cube, { FACE_SPEC, faceSolvedness, lineProgress } from './Cube'
import { activeChapterFromProgress, useScrollProgress } from './useScrollProgress'

function Chrome({ activeIdx }) {
  return (
    <>
      <div className="chrome">
        <div className="lockup">
          ALDEMIR KONUK <b>·</b> PORTFOLIO <b>·</b> 2026
        </div>
        <div className="right">
          <span>EST. ANTALYA, TR</span>
          <span>{String(activeIdx).padStart(2, '0')} / 05</span>
          <span>MSU &apos;26</span>
        </div>
      </div>
      <div className="crop tl" />
      <div className="crop tr" />
      <div className="crop bl" />
      <div className="crop br" />
    </>
  )
}

function Rail({ activeIdx, onJump }) {
  return (
    <nav className="rail">
      {CHAPTERS.map((c, i) => (
        <div
          key={c.id}
          className={`tick${i === activeIdx ? ' is-active' : ''}`}
          onClick={() => onJump(i)}
          onKeyDown={(e) => e.key === 'Enter' && onJump(i)}
          role="button"
          tabIndex={0}
        >
          <span className="num">{c.id}</span>
          <span className="bar" style={{ width: i === activeIdx ? 28 : 16 }} />
          <span>{c.name}</span>
        </div>
      ))}
    </nav>
  )
}

function TwistIndicator({ activeIdx, progress }) {
  const solved = faceSolvedness(activeIdx, progress)
  const faceKey = FACE_SPEC[activeIdx].key.toUpperCase()
  const kind = activeIdx % 2 === 1 ? 'COL' : 'ROW'
  return (
    <div className="twist-indicator">
      <span className="face-name">FACE · {faceKey}</span>
      <div className="bars">
        {[0, 1, 2].map((l) => {
          const lp = lineProgress(l, solved)
          return (
            <span
              className="bar"
              key={l}
              style={{ '--fill': `${(lp * 100).toFixed(1)}%` }}
            />
          )
        })}
      </div>
      <span className="kind">
        {kind}·{(solved * 100).toFixed(0)}%
      </span>
    </div>
  )
}

function ScrollCue({ visible }) {
  return (
    <div className={`scroll-cue${visible ? '' : ' is-hidden'}`}>
      <span className="line" />
      <span>scroll to turn</span>
    </div>
  )
}

export default function PortfolioApp() {
  const { progress, rawProgress } = useScrollProgress()
  const [loading, setLoading] = useState(true)
  const activeIdx = activeChapterFromProgress(progress)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1700)
    return () => clearTimeout(t)
  }, [])

  const distToFace = Math.abs(progress - Math.round(progress))
  const localSolved = faceSolvedness(activeIdx, progress)
  const scrollSettled = !loading && distToFace < 0.04 && localSolved > 0.98

  const onJump = (i) => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    const y = (i / 6) * max
    window.scrollTo({ top: y, behavior: 'smooth' })
  }

  return (
    <>
      <Chrome activeIdx={activeIdx} />
      <Rail activeIdx={activeIdx} onJump={onJump} />
      <ScrollCue visible={rawProgress < 0.15} />

      <div className="frame">
        <div className="stage">
          <Cube progress={progress} loading={loading} scrollSettled={scrollSettled} />
          <TwistIndicator activeIdx={activeIdx} progress={progress} />
        </div>

        <div className="chapters">
          {CHAPTERS.map((c, i) => {
            const dist = progress - i
            const isActive = dist >= -0.18 && dist < 0.62
            return (
              <section
                key={c.id}
                className={`chapter${isActive ? ' is-active' : ''}`}
                data-screen-label={`${c.id} ${c.name}`}
              >
                <div className="eyebrow">
                  <span>
                    {c.id} — {c.name}
                  </span>
                  <span className="rule" />
                  <span className="count">{String(i + 1).padStart(2, '0')} / 06</span>
                </div>
                <h1>{c.title}</h1>
                <p className="lede">{c.lede}</p>
                {c.render()}
              </section>
            )
          })}
          <div style={{ height: '60vh' }} />
        </div>
      </div>
    </>
  )
}
