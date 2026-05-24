'use client'

import { useLayoutEffect, useRef } from 'react'
import {
  DARK_FACE_IDXS,
  FACE_SPEC,
  SCRAMBLES,
  FACE_COLORS,
  cubeRotation,
  easeInOut,
  faceSolvedness,
  lineProgress,
} from '../../lib/cube-engine'

function Face({ spec, faceIdx, solvedness }) {
  const isCol = faceIdx % 2 === 1
  const cells = SCRAMBLES[faceIdx]
  const target = FACE_COLORS[faceIdx]
  const labelClass = DARK_FACE_IDXS.has(faceIdx) ? 'light-label' : 'dark-label'

  const lines = []
  for (let l = 0; l < 3; l++) {
    const lp = lineProgress(l, solvedness)
    const eased = easeInOut(lp)
    const angle = eased * 180
    const rot = isCol ? `rotateY(${angle}deg)` : `rotateX(${angle}deg)`

    const cellIdxs = isCol ? [l, l + 3, l + 6] : [l * 3, l * 3 + 1, l * 3 + 2]

    lines.push(
      <div className="twist-line" key={l} style={{ transform: rot }}>
        {cellIdxs.map((ci) => {
          const isCenter = ci === 4
          const frontColor = cells[ci]
          return (
            <div className="sticker" key={ci}>
              <div
                className={`panel front ${labelClass}`}
                style={{ '--c': frontColor }}
              >
                {isCenter && <span className="label">{spec.chapter}</span>}
              </div>
              <div
                className={`panel back ${labelClass}`}
                style={{ '--c': target }}
              >
                {isCenter && <span className="label">{spec.chapter}</span>}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={`face ${spec.key} ${isCol ? 'col-twist' : 'row-twist'}`}>
      {lines}
    </div>
  )
}

export default function Cube({ progress, loading, scrollSettled }) {
  const cubeRef = useRef(null)

  useLayoutEffect(() => {
    if (loading) return
    const el = cubeRef.current
    if (!el) return
    const rot = cubeRotation(progress)
    el.style.transform = `translateZ(calc(var(--cube-size) * -0.5)) ${rot}`
  }, [progress, loading])

  const breathing = !loading && scrollSettled

  return (
    <div className={`cube-wrap${breathing ? ' is-breathing' : ''}`}>
      <div ref={cubeRef} className={`cube${loading ? ' is-loading' : ''}`}>
        {FACE_SPEC.map((spec, i) => (
          <Face
            key={spec.key}
            spec={spec}
            faceIdx={i}
            solvedness={faceSolvedness(i, progress)}
          />
        ))}
      </div>
    </div>
  )
}

export { faceSolvedness, lineProgress, FACE_SPEC }
