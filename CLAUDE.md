# Aldemir Konuk — Portfolio CLAUDE.md

Derived from [Andrej Karpathy's guidelines](https://github.com/multica-ai/andrej-karpathy-skills) for LLM coding behavior.
Design system: [taste-skill](https://github.com/Leonxlnx/taste-skill) + [Emil Kowalski](https://emilkowal.ski) principles.
Read SKILL.md before writing any component.

---

## Four Core Principles

### 1. Think Before Coding
- State assumptions explicitly — if uncertain, ask rather than guess
- Present multiple interpretations — don't pick silently when ambiguity exists
- Push back when warranted — if a simpler approach exists, say so
- Stop when confused — name what's unclear and ask for clarification

### 2. Simplicity First
- Minimum code that solves the problem. Nothing speculative.
- No features beyond what was asked
- No abstractions for single-use code
- If 200 lines could be 50, rewrite it
- **Test:** Would a senior engineer say this is overcomplicated? If yes, simplify.

### 3. Surgical Changes
- Touch only what you must. Clean up only your own mess.
- Don't "improve" adjacent code, comments, or formatting
- Match existing style, even if you'd do it differently
- **Test:** Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution
- Define success criteria. Loop until verified.
- For multi-step tasks: `1. [Step] → verify: [check]`

---

## Project Identity

**Owner:** Aldemir Konuk  
**Site:** aldemirkonuk.com | **GitHub:** aldemirkonuk  
**Model:** claude-opus-4-7 at xhigh effort (set in .claude/settings.json)

### Who Aldemir Is
- Born Antalya, Turkey. Mediterranean coast. Spatial intelligence from birth.
- Professional basketball player — taught systems thinking, reading gaps, performing under pressure.
- Michigan State University, 22 years old.
- Core: passion, intuition, creativity, perspective.
- Superpower: sees what others walk past. Finds the gap before anyone moves toward it.
- Everything he builds: the hunger to understand how things were made and why.

### The Opening Statement
> *"I read the floor. I find the gap. I build there."*

---

## Design System (LOCKED — do not improvise)

### Palette — Stone Dust × Pine Teal
```css
--bg:          #EDEAE0   /* stone dust paper */
--surface:     #E3DFD3   /* chalk surface */
--surface-deep:#D5D0C4   /* shadow faces */
--ink:         #1B3C30   /* pine teal — primary text */
--ink-muted:   #3D6355   /* sage muted */
--grid:        #B8B4A8   /* stone grid lines */
--earth:       #7A5E30   /* earth accent — 3 uses per face max */
--edge:        #A09888   /* stone borders */
```

**Palette law:** Pine teal ink (#1B3C30) on stone dust paper (#EDEAE0) = aged architectural drawings, botanical atlases. The earth accent (#7A5E30) bridges warm and cool — used exactly 3 times per face: chapter label, accent rule, twist indicator. Never more. Carbon black or pure amber are banned — they break the stone + pine harmony.

### Typography
- Display: `clamp(3.5rem, 9vw, 9rem)` / weight 300 / tracking -0.03em
- Label: monospace / 0.75rem / tracking 0.12em / uppercase / earth (#7A5E30)
- Body: `clamp(0.95rem, 1.4vw, 1.15rem)` / line-height 1.75 / max 52ch / ink-muted
- Headlines always break across exactly 2 lines. The break is the design.

---

## The Cube — Architecture

### Core Concept
The cube is a 3D object INSIDE the page — visible in full, floating in stone dust space.
Navigation = the cube twists on a different axis each time, then the selected face DIVES toward the camera until it fills the viewport. The visitor enters the face. Content reveals. To move on, the face pulls back, the cube shows itself again, twists, and the next face dives.

This is not a page. It is not a scroll. It is entry into a world.

### Spatial Phases
```
Phase 1 — Exterior:  Full cube visible, floating, breathing (mouse parallax)
Phase 2 — Twist:     Cube rotates on its axis (different axis per chapter)
Phase 3 — Dive:      Selected face scales toward camera, fills viewport
Phase 4 — Interior:  Chapter content. Cube gone or reduced to context hint.
Phase 5 — Retreat:   Face pulls back, cube reappears, ready for next twist.
```

### CSS 3D Structure
```css
.cube-scene { perspective: 1400px; perspective-origin: 50% 45%; }
.cube       { transform-style: preserve-3d; will-change: transform; }
.face       { position: absolute; width: 100vw; height: 100vh; backface-visibility: hidden; }

/* Face positions (half-size = 50vw) */
.face--entry   { transform: translateZ(50vw); }
.face--who     { transform: rotateY( 90deg) translateZ(50vw); }
.face--work    { transform: rotateX(-90deg) translateZ(50vw); }
.face--craft   { transform: rotateY(-90deg) translateZ(50vw); }
.face--contact { transform: rotateX( 90deg) translateZ(50vw); }
.face--github  { transform: rotateY(180deg) translateZ(50vw); }
```

### Twist Sequence (different axis each time — this is what feels like solving)
```
Entry  → Who     : rotateY(-90deg)   back.inOut(1.4)   0.95s
Who    → Work    : rotateX( 90deg)   expo.inOut         0.85s
Work   → Craft   : rotateY( 90deg)   back.inOut(1.2)   0.95s
Craft  → Contact : rotateX(-90deg)   power4.inOut       0.80s
Contact→ GitHub  : rotateY(180deg)   back.inOut(1.6)   1.10s
```

### Opening Sequence (the solve metaphor)
```javascript
// On load: cube appears scrambled — chaos is the default world
gsap.set('.cube', { rotateX: 34, rotateY: -67, rotateZ: 12, scale: 0.7 })
// Solves to Entry face over 1.4s, scales up to full presence, then hovers
gsap.to('.cube', { rotateX: 0, rotateY: 0, rotateZ: 0, scale: 1,
  duration: 1.4, ease: 'back.out(1.7)' })
// After solve: cube breathes (subtle scale pulse, 0.98 → 1.0, 3s loop)
// Invite: Earth-colored line pulses once → "dive in" hint
```

---

## Parallax — 3 Depth Layers Per Face

| Layer | Element | Speed | Z-depth |
|-------|---------|-------|---------|
| 1 | `.face-grid` | 0.3x scroll | recedes |
| 2 | `.face-content` | 1x (natural) | baseline |
| 3 | `.face-accent` (3D geometric) | 1.5x scroll | advances |

Mouse parallax strengths: grid=0.018, content=0.004, accent=0.045

---

## Animation Rules (Emil Kowalski — non-negotiable)

1. **Only `transform` and `opacity`** — never animate layout properties
2. **Spring baseline:** twist stiffness=200/damping=28, hover stiffness=380/damping=30
3. **Durations:** micro=120-200ms, state=200-320ms, twist=850-1100ms
4. **Interruptible:** every tween stored and reversible. Scrolling back reverses the twist.
5. **Easing:** user actions=power3.out, twists=back.inOut(1.4), reveals=expo.out
6. **`will-change: transform`** on .cube, .face, .face-accent
7. **`@media (prefers-reduced-motion)`**: opacity-only crossfade fallback, always
8. **60fps non-negotiable** — test on mid-tier device before shipping

---

## Chapter Map — Experimental Modes

Each face has its own spatial logic. They do not all open the same way.
This is what makes it storytelling, not navigation.

| Face | Chapter | Spatial Mode | Content |
|------|---------|-------------|---------|
| Front | CH.00 Entry | Cube exterior → dive in | "I READ / THE FLOOR." + breathe + dive hint |
| Right | CH.01 Who | Face PEELS — folds back, interior space reveals | 3-sentence manifesto floating in depth |
| Top | CH.02 Work | Face becomes TRANSPARENT WINDOW | Project cards float at different depths |
| Left | CH.03 Craft | Face DISSOLVES into constellation nodes | Skills as connected star map |
| Bottom | CH.04 Contact | All geometry REDUCES to wireframe edges only | One sentence. One link. Silence. |
| Back | CH.05 GitHub | Easter egg: contribution graph as architectural elevation | Unlocked by finding it |

### Spatial Mode Details

**CH.00 Entry** — The full cube in space. Scrambles on load → solves itself → hovers, breathing.
Mouse parallax creates orbital sense. Earth-line pulses. User dives in.

**CH.01 Who** — The face doesn't open like a door. It peels — hinged fold reveals a sparse interior behind it.
Text floats in 3D space inside the cube. No UI chrome. Just volume and words.

**CH.02 Work** — The face becomes slightly frosted glass. As cursor moves, glass clarifies in that region.
Project cards float at different Z-depths — some closer, some receding. Cube edges remain as frame/window.

**CH.03 Craft** — The face shatters (gracefully) into constellation nodes — each skill a point of light.
Cube geometry disassembles entirely. Lines draw between related skills on hover. User is inside a mind.

**CH.04 Contact** — Everything ceases. Cube reduces to 12-edge wireframe skeleton only.
One sentence. One link. The wireframe pulses once, then holds still. Silence is the design.

### Project Cards (Work face)
- Restaurant AI Automation
- Bracket Analyzer
- TBD (Aldemir to specify)

---

## Tech Stack

- **Framework:** Next.js 14 App Router
- **Animations:** GSAP 3 + ScrollTrigger
- **3D scene:** CSS `transform-style: preserve-3d` (the cube itself)
- **Decorative 3D:** Three.js (one geometric accent per face only)
- **Styling:** CSS Modules + CSS custom properties (no Tailwind)
- **Deployment:** Vercel

---

## File Structure

```
/app
  /page.jsx                    — mounts CubeScene, passes chapter components
  /chapters/00-entry/          — Entry.jsx + Entry.module.css
  /chapters/01-who/            — Who.jsx + Who.module.css
  /chapters/02-work/           — Work.jsx + Work.module.css
  /chapters/03-craft/          — Craft.jsx + Craft.module.css
  /chapters/04-contact/        — Contact.jsx + Contact.module.css
  /chapters/05-github/         — GitHub.jsx + GitHub.module.css
/components
  /CubeScene/                  — the 3D cube shell, GSAP scroll wiring
  /CubeFace/                   — single face wrapper (grid + parallax layers)
  /ProjectCard/                — blueprint card with 3D hover
  /ConstellationMap/           — skills as connected nodes
  /ParallaxLayer/              — wraps any element in a parallax depth layer
/lib
  /gsap.js                     — GSAP + ScrollTrigger, client-only
  /three.js                    — Three.js scene helpers
  /spring.js                   — spring physics utilities (lerp, RAF loop)
/styles
  /globals.css                 — CSS custom properties (Warm Trace palette)
  /typography.css              — type scale
  /cube.css                    — 3D scene, faces, perspective rules
```

---

## Karpathy Key Insight

> "LLMs are exceptionally good at looping until they meet specific goals.
> Don't tell it what to do — give it success criteria and watch it go."

These guidelines are working if you see:
- Fewer unnecessary changes in diffs
- Simpler code the first time
- Clarifying questions before implementation, not after mistakes
- Clean, minimal PRs with no drive-by improvements
