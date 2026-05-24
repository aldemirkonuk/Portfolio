'use client'

import { useEffect, useRef, useState } from 'react'

export function useScrollProgress() {
  const [progress, setProgress] = useState(0)
  const [rawProgress, setRawProgress] = useState(0)
  const target = useRef(0)
  const current = useRef(0)
  const rafId = useRef(null)

  useEffect(() => {
    const compute = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max <= 0) return 0
      return (window.scrollY / max) * 6
    }

    const tick = () => {
      const diff = target.current - current.current
      current.current += diff * 0.2
      if (Math.abs(diff) < 0.0006) {
        current.current = target.current
        setProgress(current.current)
        rafId.current = null
        return
      }
      setProgress(current.current)
      rafId.current = requestAnimationFrame(tick)
    }

    const onScroll = () => {
      target.current = compute()
      setRawProgress(target.current)
      if (rafId.current == null) rafId.current = requestAnimationFrame(tick)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [])

  return { progress, rawProgress }
}

export function activeChapterFromProgress(p) {
  return Math.max(0, Math.min(5, Math.floor(p)))
}
