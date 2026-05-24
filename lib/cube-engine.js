export const FACE_COLORS = [
  '#1B3C30', // 0 pine deep
  '#B0C0B0', // 1 pine sage
  '#EDEAE0', // 2 stone paper
  '#C9BFA8', // 3 stone warm
  '#7A5E30', // 4 earth mid
  '#C5A975', // 5 earth pale
]

export const FACE_SPEC = [
  { key: 'front', chapter: 'CH.00', colorIdx: 0 },
  { key: 'right', chapter: 'CH.01', colorIdx: 1 },
  { key: 'bottom', chapter: 'CH.02', colorIdx: 2 },
  { key: 'back', chapter: 'CH.03', colorIdx: 3 },
  { key: 'left', chapter: 'CH.04', colorIdx: 4 },
  { key: 'top', chapter: 'CH.05', colorIdx: 5 },
]

export const DARK_FACE_IDXS = new Set([0, 4])

const SEQUENCE = [
  { axis: 'Y', angle: -90 },
  { axis: 'X', angle: -90 },
  { axis: 'Y', angle: -90 },
  { axis: 'X', angle: -90 },
  { axis: 'Y', angle: -90 },
]

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

function scrambleColorsFor(faceIdx) {
  const target = FACE_COLORS[faceIdx]
  const others = FACE_COLORS.filter((_, i) => i !== faceIdx)
  const out = new Array(9)
  let s = faceIdx * 2654435761 + 17
  const rand = () => {
    s = (s * 1664525 + 1013904223) | 0
    return ((s >>> 0) % 1000000) / 1000000
  }
  for (let i = 0; i < 9; i++) {
    if (i === 4) {
      out[i] = target
      continue
    }
    let pick
    for (let tries = 0; tries < 12; tries++) {
      pick = others[Math.floor(rand() * others.length)]
      const leftSame = i % 3 > 0 && out[i - 1] === pick
      const aboveSame = i >= 3 && out[i - 3] === pick
      if (!leftSame && !aboveSame) break
    }
    out[i] = pick
  }
  return out
}

export const SCRAMBLES = FACE_SPEC.map((_, i) => scrambleColorsFor(i))

export function cubeRotation(p) {
  const parts = []
  for (let k = 0; k < SEQUENCE.length; k++) {
    const a = k + 0.5
    const b = k + 1
    let t = (p - a) / (b - a)
    t = clamp(t, 0, 1)
    if (t === 0) continue
    const eased = easeInOut(t)
    const angle = SEQUENCE[k].angle * eased
    parts.unshift(`rotate${SEQUENCE[k].axis}(${angle.toFixed(2)}deg)`)
  }
  return parts.join(' ')
}

export function faceSolvedness(faceIdx, p) {
  return clamp((p - faceIdx) / 0.5, 0, 1)
}

export function lineProgress(lineIdx, solvedness) {
  const a = lineIdx / 3
  const b = (lineIdx + 1) / 3
  return clamp((solvedness - a) / (b - a), 0, 1)
}

export { easeInOut }
