'use client'

import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CHAPTERS } from '../../lib/content'
import { RubikCube, CHAPTER_TO_FACE } from '../../lib/rubik'

gsap.registerPlugin(ScrollTrigger)

/* ──────────────────────────────────────────────────────────
   Chrome — top corners + lockup
   ────────────────────────────────────────────────────────── */
function Chrome({ activeIdx }) {
  return (
    <>
      <div className="chrome">
        <div className="lockup">
          ALDEMIR KONUK <b>·</b> STUDIO INDEX <b>·</b> 2026
        </div>
        <div className="right">
          <span>aldemirkonuk.com</span>
          <span>{String(activeIdx).padStart(2, "0")} / 05</span>
        </div>
      </div>
      <div className="crop tl"></div>
      <div className="crop tr"></div>
      <div className="crop bl"></div>
      <div className="crop br"></div>
    </>
  );
}

/* ──────────────────────────────────────────────────────────
   Twist indicator — bottom center, shows what the cube is doing.
   This is the THIRD earth-accent use on the page.
   ────────────────────────────────────────────────────────── */
function TwistIndicator({ state, activeIdx }) {
  const labelMap = {
    idle:     "IDLE",
    twisting: "LAYER TWIST",
    reorient: "PRESENT FACE",
    solving:  "SCRAMBLING\u2026",
    intro:    "BOOT",
  };
  const face = CHAPTER_TO_FACE[activeIdx];
  return (
    <div className="twist-indicator">
      <span>FACE · {face}</span>
      <span className="kind">{labelMap[state] || state}</span>
      <span>{CHAPTERS[activeIdx].id}</span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Rail — chapter ticks, click to jump
   ────────────────────────────────────────────────────────── */
function Rail({ activeIdx, onJump }) {
  return (
    <nav className="rail">
      {CHAPTERS.map((c, i) => (
        <div
          key={c.id}
          className={"tick" + (i === activeIdx ? " is-active" : "")}
          onClick={() => onJump(i)}
        >
          <span className="num">{c.id}</span>
          <span className="bar"></span>
          <span>{c.name}</span>
        </div>
      ))}
    </nav>
  );
}

/* ──────────────────────────────────────────────────────────
   Card host — fixed overlay where the active chapter card lives
   The card itself is the only visible chapter content; new
   chapters swap by fading the card out and back in around the
   cube transition.
   ────────────────────────────────────────────────────────── */
function CardHost({ activeIdx, busy }) {
  const c = CHAPTERS[activeIdx];
  const cls = "card " + (busy ? "is-hidden" : "is-active");
  return (
    <div className="card-host">
      <div className={cls}>
        <div className="eyebrow">
          <span>{c.id} — {c.name}</span>
          <span className="rule"></span>
          <span className="count">{String(activeIdx + 1).padStart(2, "0")} / 06</span>
        </div>
        <h1>{c.title}</h1>
        {c.lede && <p className="lede">{c.lede}</p>}
        {c.render()}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   App
   ────────────────────────────────────────────────────────── */
function App() {
  const canvasRef = useRef(null);
  const cubeRef = useRef(null);

  // chapter the cube is presenting RIGHT NOW (or animating toward)
  const [activeIdx, setActiveIdx] = useState(0);
  // "intro" → "idle" → "twisting"/"reorient" → "idle"
  const [state, setState] = useState("intro");
  // refs that the ScrollTrigger callbacks read so we always see fresh values
  const stateRef = useRef("intro");
  const activeIdxRef = useRef(0);
  const targetIdxRef = useRef(0);

  const setStateBoth = (s) => { stateRef.current = s; setState(s); };

  /* ── boot Three.js cube + scramble/solve intro ── */
  useEffect(() => {
    if (!canvasRef.current) return

    const cube = new RubikCube(canvasRef.current)
    cubeRef.current = cube

    let alive = true

    ;(async () => {
      setStateBoth('intro')
      document.querySelector('.intro-veil')?.classList.add('is-gone')

      await new Promise((r) => setTimeout(r, 700))
      if (!alive) return

      setStateBoth('solving')
      await cube.animatedScramble(0.34)
      if (!alive) return

      setStateBoth('idle')
      cube.startBreathing()
      requestAnimationFrame(() => ScrollTrigger.refresh())
    })()

    return () => {
      alive = false
      cube.dispose()
    }
  }, [])

  /* ── ScrollTrigger: one per chapter section ──
     Discrete tween chain — not scrubbed pixel-by-pixel. Honors every
     chapter scrolled past; queue steps one chapter at a time. Catch-up
     mode shortens durations when more than one chapter behind. */
  useEffect(() => {
    const cube = cubeRef.current
    if (!cube) return

    let processing = false

    const processQueue = async () => {
      if (processing) return
      if (stateRef.current === 'intro' || stateRef.current === 'solving') return
      if (activeIdxRef.current === targetIdxRef.current) return
      processing = true

      while (activeIdxRef.current !== targetIdxRef.current) {
        const step = targetIdxRef.current > activeIdxRef.current ? 1 : -1
        const next = activeIdxRef.current + step
        const behind = Math.abs(targetIdxRef.current - activeIdxRef.current)
        const twistDur    = behind > 1 ? 0.42 : 0.75
        const reorientDur = behind > 1 ? 0.38 : 0.65

        setStateBoth('twisting')
        await cube.goToChapter(activeIdxRef.current, next, { twistDur, reorientDur })
        activeIdxRef.current = next
        setActiveIdx(next)
      }
      setStateBoth('idle')
      processing = false
    }

    const requestTransition = (idx) => {
      targetIdxRef.current = idx
      processQueue()
    }

    const triggers = CHAPTERS.map((_, i) =>
      ScrollTrigger.create({
        trigger: `#scroll-${i}`,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => requestTransition(i),
        onEnterBack: () => requestTransition(i),
      })
    )

    return () => triggers.forEach((t) => t.kill())
  }, [])

  /* ── click-to-jump from rail ── */
  const onJump = (i) => {
    const el = document.getElementById(`scroll-${i}`);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: y + 1, behavior: "smooth" });
  };

  const busy = state !== "idle";
  const introDone = state !== "intro" && state !== "solving";

  return (
    <>
      <Chrome activeIdx={activeIdx} />
      <Rail activeIdx={activeIdx} onJump={onJump} />

      {/* fixed full-viewport canvas for the cube */}
      <div className="cube-stage">
        <canvas ref={canvasRef} className="cube-canvas"></canvas>
      </div>

      {/* card overlay — fixed over the cube */}
      {introDone && <CardHost activeIdx={activeIdx} busy={busy} />}

      {/* twist indicator */}
      {introDone && <TwistIndicator state={state} activeIdx={activeIdx} />}

      {/* scroll cue — only on entry chapter */}
      <div className={"scroll-cue" + (activeIdx === 0 && introDone ? "" : " is-hidden")}>
        <span className="line"></span>
        <span>scroll to turn</span>
      </div>

      {/* invisible scroll track that drives the ScrollTriggers above */}
      <div className="scroll-track">
        {CHAPTERS.map((_, i) => (
          <div key={i} id={`scroll-${i}`} className="scroll-section"></div>
        ))}
      </div>

      {/* boot veil — fades out before the scramble animation plays */}
      <div className="intro-veil">
        <div className="label">
          <span className="pulse"></span>
        </div>
      </div>
    </>
  );
}

export default App;
