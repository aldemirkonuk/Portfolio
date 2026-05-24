# Portfolio Design Skill
# Aldemir Konuk — aldemirkonuk.com
# Derived from: taste-skill (Leonxlnx), Emil Kowalski animation principles, awwwards-level craft

---

## SETTINGS

DESIGN_VARIANCE = 9       # Asymmetric, maximum whitespace, architectural, very modern
MOTION_INTENSITY = 10     # Spring physics, scroll-triggered, magnetic parallax, cube twist
VISUAL_DENSITY = 2        # Spacious, luxury, one hero element per face — never crowded

---

## THE CONCEPT

This portfolio is a Rubik's cube — a full 3D object floating in space.
Visitors see the whole cube. They watch it solve itself. Then they dive into a face.
Each face has its own spatial mode — not all faces open the same way.
Navigation = twist on a different axis + dive into the face. Life is a puzzle. He finds the missing pieces.

The scrambled state on load = the world before he touches it.
The solved state = him.

---

## PALETTE — STONE DUST × PINE TEAL (LOCKED, DO NOT DEVIATE)

```css
:root {
  --bg:          #EDEAE0;   /* stone dust paper — aged, considered */
  --surface:     #E3DFD3;   /* chalk surface */
  --surface-deep:#D5D0C4;   /* shadow faces */
  --ink:         #1B3C30;   /* pine teal — primary text, deep forest */
  --ink-muted:   #3D6355;   /* sage muted — secondary text */
  --grid:        #B8B4A8;   /* stone grid lines */
  --earth:       #7A5E30;   /* earth accent — bridges warm + cool */
  --earth-light: #9A7848;   /* hover state of earth */
  --edge:        #A09888;   /* stone borders */
}
```

**Palette law:** The earth accent (#7A5E30) appears exactly 3 times per face: chapter label, accent rule under headline, dive/twist indicator. Never more. Carbon black and pure orange/amber are banned — they break the stone + pine harmony. Pine teal ink on stone dust paper = aged architectural drawings, Rolex campaign typography, botanical atlases.

---

## TYPOGRAPHY SYSTEM

```css
/* Display — the headline that owns the face */
.t-display {
  font-size: clamp(3.5rem, 9vw, 9rem);
  font-weight: 300;
  line-height: 0.95;
  letter-spacing: -0.03em;
  font-family: 'Arial Narrow', 'Inter', sans-serif;
  color: var(--ink);
}

/* Label — monospaced, small caps energy */
.t-label {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: clamp(0.6rem, 1vw, 0.75rem);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--amber);
}

/* Body — reads like a manifesto, not a bio */
.t-body {
  font-size: clamp(0.95rem, 1.4vw, 1.15rem);
  line-height: 1.75;
  color: var(--ink-muted);
  max-width: 52ch;
}
```

**Typography law:** Headlines break across 2 lines intentionally. Never one long line, never three short ones. The break IS the design.

---

## THE CUBE SYSTEM

### Structure
```
CSS 3D scene:
  .cube-scene  { perspective: 1400px; perspective-origin: 50% 45%; }
  .cube        { transform-style: preserve-3d; will-change: transform; }
  .face        { position: absolute; width: 100vw; height: 100vh; backface-visibility: hidden; }

Face positions (cube half-size = 50vw):
  .face--entry   { transform: translateZ(50vw); }
  .face--who     { transform: rotateY( 90deg) translateZ(50vw); }
  .face--work    { transform: rotateX(-90deg) translateZ(50vw); }
  .face--craft   { transform: rotateY(-90deg) translateZ(50vw); }
  .face--contact { transform: rotateX( 90deg) translateZ(50vw); }
  .face--github  { transform: rotateY(180deg) translateZ(50vw); }
```

### Twist Sequence (each chapter uses a DIFFERENT axis — this is what feels like twisting)
```
Entry  → Who     : rotateY(-90deg)   ease: back.inOut(1.4)   duration: 0.95s
Who    → Work    : rotateX( 90deg)   ease: expo.inOut        duration: 0.85s
Work   → Craft   : rotateY( 90deg)   ease: back.inOut(1.2)   duration: 0.95s
Craft  → Contact : rotateX(-90deg)   ease: power4.inOut      duration: 0.80s
Contact→ GitHub  : rotateY(180deg)   ease: back.inOut(1.6)   duration: 1.10s
```
The axis changes every transition. This feels like a hand solving a cube, not a page scrolling.

### Rubik's 3×3 Grid Overlay (structural, not decorative)
Every face has a faint 3×3 cell grid (33.3vw × 33.3vh cells).
Content snaps to cell intersections. Chapter number lives in cell [0,0]. Title block in cell [2,2].
Grid opacity: 0.12 — felt, not seen.

---

## PARALLAX SYSTEM (3 depth layers per face)

```javascript
// Layer 1 — Grid background (recedes)
gsap.to('.face-grid', {
  y: scrollProgress * -80,      // moves up slower than content
  scale: 0.94,
  ease: 'none',
  scrollTrigger: { scrub: 1.2 }
})

// Layer 2 — Content (natural speed)
// No transform — content stays anchored

// Layer 3 — 3D geometric accent (advances toward viewer)
gsap.to('.face-accent', {
  y: scrollProgress * 60,       // drifts DOWN as page scrolls UP (floats forward)
  rotateZ: scrollProgress * 8,  // slight spin
  ease: 'none',
  scrollTrigger: { scrub: 0.8 }
})
```

### Mouse Parallax (magnetic field per face)
```javascript
// On mousemove within a face:
const LAYERS = [
  { el: '.face-grid',    strength: 0.018, lag: 0.06 },  // barely moves
  { el: '.face-content', strength: 0.004, lag: 0.10 },  // almost still
  { el: '.face-accent',  strength: 0.045, lag: 0.04 },  // leads the cursor
]
// Use lerp(current, target, lag) on RAF — not GSAP ticker — for 60fps guarantee
```

---

## EMIL KOWALSKI ANIMATION RULES (NON-NEGOTIABLE)

### 1. Only animate transform and opacity
NEVER animate: padding, margin, width, height, top, left, font-size, border-width.
These trigger layout recalc and drop frames. Every animation is transform + opacity. Always.

### 2. Spring physics baseline
```javascript
// Page transitions (cube twist)
spring: { stiffness: 200, damping: 28, mass: 0.9 }  // feels like solving

// UI interactions (hover, click feedback)
spring: { stiffness: 380, damping: 30 }              // snappy, immediate

// Parallax drift (follows behind cursor)
spring: { stiffness: 80, damping: 22 }               // fluid, lags naturally

// GSAP equivalents:
twist:     ease: 'back.inOut(1.4)', duration: 0.95
hover:     ease: 'power3.out',      duration: 0.22
parallax:  scrub: 1.2 (continuous)
```

### 3. Duration rules
- Micro-interactions (hover, focus): 120–200ms
- State changes (active, selected): 200–320ms
- Cube twist transitions: 850–1100ms
- Opening sequence: 2400ms total
- NEVER exceed 1200ms for any single animation

### 4. Interruptibility
Every GSAP tween must be reversible mid-play.
Store tween references. On reverse trigger: `tween.reverse()` — never re-create.
The cube must be interruptible: if user scrolls back during a twist, it reverses smoothly.

### 5. Easing selection
- User-triggered actions: `ease-out` / `power3.out` — starts fast, lands soft
- Cube twists: `back.inOut(1.4)` — slight overshoot, mechanical click feel
- Content reveals: `expo.out` — explosive start, long gentle finish
- Parallax: `none` (linear scrub) — physics comes from scrub lag

### 6. Performance — 60fps is non-negotiable
```css
.cube       { will-change: transform; }
.face       { will-change: transform; }
.face-accent{ will-change: transform; }
```
Test on a mid-tier device. If it drops frames: reduce parallax strength, not animation quality.

### 7. Accessibility
```css
@media (prefers-reduced-motion: reduce) {
  .cube { transition: none !important; }
  /* Replace all transforms with opacity-only fades */
  /* Cube faces crossfade instead of twist */
}
```
Always implement this. Always test it.

### 8. Cohesion law
Every animation on the site must feel like it belongs to the same physical world.
The cube has weight. Springs have consistent stiffness. Nothing feels random.
If an animation looks cool in isolation but breaks the feel of the cube: cut it.

---

## OPENING SEQUENCE (the solve metaphor)

On page load, the cube appears scrambled — all faces rotated by chaotic amounts.
It solves itself down to the Entry face over 2.4 seconds.

```javascript
// On load: scramble
gsap.set('.cube', { rotateX: 34, rotateY: -67, rotateZ: 12 })

// Solve timeline
const tl = gsap.timeline({ delay: 0.3 })
tl.to('.cube', {
  rotateX: 0, rotateY: 0, rotateZ: 0,
  duration: 1.4,
  ease: 'back.out(1.7)'   // mechanical settle
})
.to('.face--entry .t-label', { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }, '-=0.3')
.to('.face--entry .t-display', { opacity: 1, y: 0, skewY: 0, duration: 0.7, ease: 'expo.out' }, '-=0.2')
.to('.face--entry .t-body', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')
.to('.scroll-hint', { opacity: 1, duration: 0.4 }, '-=0.1')
```

---

## FACE CONTENT RULES — EXPERIMENTAL MODES

Each face has its own spatial mode. Do NOT make them behave identically. The variety IS the storytelling.

### CH.00 — Entry (Exterior → Dive)
```
Full cube visible in space. Cube appears scrambled → solves over 1.4s → hovers breathing.
After solve: scale pulse 0.98→1.0 on a 3s loop (gsap.to, yoyo: true, repeat: -1).
Earth-line pulses once under the tagline. Invite to dive.
Content: "I READ / THE FLOOR." + 1-line tagline + earth dive-hint indicator.
Dive trigger: click/scroll → cube face scales toward camera (translateZ grows) until it fills viewport.
```

### CH.01 — Who (Peel mode)
```
Face folds open — hinged at left edge, right side swings toward camera like opening a book.
Behind the face: sparse interior space, slightly darker (--surface-deep).
Text floats in 3D inside: 3 sentences, weight 300, no background, just volume.
No grid on this face — the absence of structure IS the design here.
Return: face folds closed, cube retreats, twists.
```

### CH.02 — Work (Window mode)
```
Face is frosted glass (CSS backdrop-filter: blur(2px) on a semi-transparent surface).
As cursor moves, clarity follows — a 120px radius "clear zone" tracks the mouse.
Behind the glass: 2–3 project cards at different Z-depths (translateZ: 40px, 0, -30px).
Cube edges remain visible as the window frame — they ARE the card boundary.
Cards have stone-dust background, pine teal type, earth accent on hover.
```

### CH.03 — Craft (Dissolve mode)
```
Face surface dissolves — particles break away from the face geometry and become skill nodes.
Each node = one skill (React, Next.js, GSAP, Three.js, Python, AI/ML, Node, PostgreSQL).
Nodes float at varying Z-depths, connected by thin edge lines (opacity 0.3).
On hover: related nodes pull closer, connection lines brighten to --earth color.
Cube geometry is GONE — only the constellation remains. User is inside a mind.
```

### CH.04 — Contact (Wireframe mode)
```
All cube faces fade to opacity 0. Only the 12 edges remain — wireframe skeleton.
Earth-colored edges, thin (1px), pulse once, then hold.
Content: one line centered in space. One link. No labels. No chapter number.
The wireframe IS the frame for the content. Silence is the design.
```

### CH.05 — GitHub (Easter egg)
```
Hidden face. Accessed by interacting with the GitHub edge/corner of the cube during Exterior phase.
Contribution graph rendered as architectural elevation — bars as 3D extruded columns.
Height = commit count. Stone dust floor. Pine teal columns. Earth accent for streaks.
```

### Card hover (project cards) — Emil Kowalski standard
```javascript
card.addEventListener('mousemove', (e) => {
  const rect = card.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width  - 0.5  // -0.5 to 0.5
  const y = (e.clientY - rect.top)  / rect.height - 0.5

  gsap.to(card, {
    rotateX: y * -12,   // max 6° tilt
    rotateY: x *  12,
    duration: 0.3,
    ease: 'power3.out'
  })
})
card.addEventListener('mouseleave', () => {
  gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'back.out(1.5)' })
})
```

---

## WHAT MAKES THIS DIFFERENT FROM EVERY OTHER PORTFOLIO

1. The cube exists in space — you see the full object, then enter it
2. Each face has a DIFFERENT spatial mode — peel / window / dissolve / wireframe
3. Each transition uses a different axis — it feels solved, not scrolled
4. The opening solve metaphor: chaos → order → his world
5. Emil Kowalski spring physics: everything has weight and memory
6. Stone Dust × Pine Teal: aged precision in a world of flat dark portfolios
7. The cube is a CHARACTER — it scrambles, solves, breathes, invites

---

## ANTI-PATTERNS — NEVER DO THESE

- ❌ Gradient backgrounds (use flat fills only)
- ❌ Box shadows (use CSS 3D depth instead)
- ❌ Animate more than 2 properties simultaneously on the same element
- ❌ Overflow: hidden on the cube scene (clips the 3D perspective)
- ❌ Z-index hacks (use transform-style: preserve-3d properly)
- ❌ setTimeout for animation sequencing (use GSAP timelines)
- ❌ Animating color (use opacity fade between two colored layers instead)
- ❌ Placeholder text or lorem ipsum — every word is Aldemir's voice
- ❌ Generic icons (draw SVG paths or use none)
- ❌ More than one font family (system stack + one mono)
