'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
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
   Rail — 1A scroll-linked pill dial + chapter list
   Thick chapter ticks with 4 fines between; direction morphs
   the track (stretch origin, caps, width) while scrolling.
   ────────────────────────────────────────────────────────── */
const PILL_FINES = 4; // fine ticks between each chapter line

function buildPillTicks(chapterCount) {
  // Match sketch 1A: N = chapters * (fines+1) so majors land on the
  // same 1/n grid as segFill (0, 1/n, …, 1) — 7 majors for 6 chapters.
  const ticks = [];
  const total = chapterCount * (PILL_FINES + 1);
  for (let i = 0; i <= total; i++) {
    ticks.push({
      top: `${(i / total) * 100}%`,
      major: i % (PILL_FINES + 1) === 0,
    });
  }
  return ticks;
}

function scrollProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
}

function scrollToProgress(t) {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo({ top: Math.max(0, Math.min(1, t)) * max });
}

function Rail({ activeIdx, onJump }) {
  const trackRef = useRef(null);
  const dragCleanupRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [dir, setDir] = useState(0);       // 1 down, -1 up, 0 idle
  const [squish, setSquish] = useState(1);
  const velRef = useRef({ lastT: 0, lastP: 0, dir: 0, timer: null, raf: 0, pending: null });
  const chapterCount = CHAPTERS.length;
  const ticks = useMemo(() => buildPillTicks(chapterCount), [chapterCount]);

  useEffect(() => {
    const tr = velRef.current;
    const onScroll = () => {
      const p = scrollProgress();
      const now = performance.now();
      const dt = Math.max(1, now - tr.lastT);
      const raw = p - tr.lastP;
      const v = Math.abs(raw) / dt;
      const nextSquish = 1 + Math.min(0.22, v * 60);
      const nextDir = Math.abs(raw) < 0.0005 ? tr.dir : (raw > 0 ? 1 : -1);
      tr.lastP = p;
      tr.lastT = now;
      tr.dir = nextDir;
      tr.pending = { p, nextSquish, nextDir };
      clearTimeout(tr.timer);
      if (!tr.raf) {
        tr.raf = requestAnimationFrame(() => {
          tr.raf = 0;
          const m = tr.pending;
          if (!m) return;
          setProgress(m.p);
          setSquish(m.nextSquish);
          setDir(m.nextDir);
        });
      }
      tr.timer = setTimeout(() => {
        tr.dir = 0;
        setSquish(1);
        setDir(0);
      }, 160);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(tr.timer);
      if (tr.raf) cancelAnimationFrame(tr.raf);
      dragCleanupRef.current?.();
    };
  }, []);

  const onPillPointerDown = (e) => {
    const track = trackRef.current;
    if (!track) return;
    // Cache layout once; use offsetHeight so scaleY squish doesn't skew Y map
    const rect = track.getBoundingClientRect();
    const top = rect.top;
    const height = track.offsetHeight || rect.height;
    const apply = (clientY) => {
      scrollToProgress((clientY - top) / height);
    };
    apply(e.clientY);
    const move = (ev) => apply(ev.clientY);
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      dragCleanupRef.current = null;
    };
    dragCleanupRef.current?.();
    dragCleanupRef.current = up;
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  // per-chapter segment fill 0–100 (same 1/n grid as major ticks)
  const segs = Array.from({ length: chapterCount }, (_, i) =>
    Math.max(0, Math.min(1, progress * chapterCount - i))
  );

  const topCapActive = dir < 0;
  const botCapActive = dir > 0 || progress > 0.95;
  const atTop = progress < 0.02;
  const solved = progress > 0.95;
  const moving = dir !== 0;

  return (
    <nav className="rail" aria-label="Chapter index">
      <div className="pill-cap-top-slot">
        <div
          className={
            "pill-cap-top" +
            (topCapActive ? " is-active" : "") +
            (atTop && !topCapActive ? " is-faint" : "")
          }
          style={{
            borderBottomWidth: topCapActive ? 11 : atTop ? 4 : 7,
          }}
        />
      </div>
      <div
        ref={trackRef}
        className={"pill-track" + (moving ? " is-moving" : "")}
        style={{
          transform: `scaleY(${squish})`,
          transformOrigin: dir < 0 ? "bottom center" : "top center",
        }}
        onPointerDown={onPillPointerDown}
        aria-hidden="true"
      >
        {segs.map((f, i) => (
          <div className="pill-seg" key={i}>
            <div className="pill-seg-fill" style={{ height: `${f * 100}%` }} />
          </div>
        ))}
        {ticks.map((tk, i) => {
          const pos = parseFloat(tk.top) / 100;
          const passed = pos <= progress + 0.002;
          const near = Math.abs(pos - progress) < 0.05 && moving;
          return (
            <div
              key={i}
              className={
                "pill-tick" +
                (tk.major ? " is-major" : "") +
                (passed ? " is-passed" : "") +
                (near ? " is-near" : "")
              }
              style={{ top: tk.top }}
            />
          );
        })}
        <div
          className={"pill-lead" + (moving ? " is-hot" : "")}
          style={{ top: `${progress * 100}%` }}
        />
      </div>
      <div className="pill-cap-bot-slot">
        <div
          className={
            "pill-cap-bot" +
            (botCapActive ? " is-active" : "") +
            (solved ? " is-solved" : "")
          }
          style={{
            width: solved ? 15 : botCapActive ? 12 : 7,
            height: solved ? 15 : botCapActive ? 12 : 7,
          }}
        />
      </div>

      <div className="rail-chapters">
        {CHAPTERS.map((c, i) => (
          <button
            key={c.id}
            type="button"
            className={"rail-ch" + (i === activeIdx ? " is-active" : "")}
            onClick={() => onJump(i)}
          >
            <span className="rail-dash" />
            <span className="rail-label">{c.name}</span>
          </button>
        ))}
      </div>
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
  const requestTransitionRef = useRef(null);

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
      requestAnimationFrame(() => {
        ScrollTrigger.refresh()
        // Chase any chapter the visitor scrubbed to during intro/scramble
        const chase = requestTransitionRef.current
        if (chase) chase(targetIdxRef.current)
      })
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

    requestTransitionRef.current = requestTransition

    const triggers = CHAPTERS.map((_, i) =>
      ScrollTrigger.create({
        trigger: `#scroll-${i}`,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => requestTransition(i),
        onEnterBack: () => requestTransition(i),
      })
    )

    return () => {
      requestTransitionRef.current = null
      triggers.forEach((t) => t.kill())
    }
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
