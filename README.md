# Aldemir Konuk — Portfolio

A 3D spatial portfolio experience built with Next.js, GSAP, and CSS 3D transforms. The cube is a navigation metaphor: twist to explore, dive to enter each chapter.

**Live:** [aldemirkonuk.com](https://aldemirkonuk.com)  
**Design:** [CLAUDE.md](./CLAUDE.md)

## The Concept

Six chapters live on the six faces of a 3D cube floating in space:

- **CH.00 — Entry** — The front face. Scrambles on load → solves → breathes → ready to dive.
- **CH.01 — Who** — The right face. Interior manifesto about identity and perspective.
- **CH.02 — Work** — The top face. Projects float at different depths behind frosted glass.
- **CH.03 — Craft** — The left face. Skills as constellation nodes, lines connecting them.
- **CH.04 — Contact** — The bottom face. Wireframe-only. One message, one link, silence.
- **CH.05 — GitHub** — The back face. Contribution graph as architectural elevation.

Each chapter has its own spatial mode and animation language. It's not a page. It's entry into a world.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Animations:** GSAP 3 + ScrollTrigger
- **3D:** CSS `transform-style: preserve-3d`
- **Styling:** CSS Modules + CSS custom properties
- **Deployment:** Vercel
- **Design System:** Stone Dust × Pine Teal palette (see CLAUDE.md)

## Getting Started

### Install dependencies
```bash
npm install
```

### Run dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production
```bash
npm run build
npm start
```

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
/lib
  /gsap.js                     — GSAP + ScrollTrigger, client-only
/styles
  /globals.css                 — CSS custom properties (Stone Dust × Pine Teal)
  /typography.css              — type scale
  /cube.css                    — 3D scene, faces, perspective rules
CLAUDE.md                       — design spec, principles, architecture
```

## Design Principles

Read [CLAUDE.md](./CLAUDE.md) for the complete design spec.

**Core:**
1. Think before coding
2. Simplicity first
3. Surgical changes
4. Goal-driven execution

**Palette:** Stone Dust (#EDEAE0) + Pine Teal (#1B3C30)  
**Typography:** Display (3.5rem–9rem), Label (0.6rem–0.75rem), Body (0.95rem–1.15rem)  
**Animation:** transform + opacity only, 60fps on mid-tier devices

## Deployment

### Deploy to Vercel

1. Push this repo to GitHub: `github.com/aldemirkonuk/portfolio`
2. Connect to Vercel at [vercel.com](https://vercel.com)
3. Link your GitHub repo
4. Set environment: production
5. Deploy

### Connect custom domain

1. In Vercel project settings, go to **Domains**
2. Add `aldemirkonuk.com`
3. Follow instructions to update DNS at your registrar

## Notes

- **Reduced motion:** All animations respect `prefers-reduced-motion` with opacity-only fallbacks
- **Parallax:** Grid, content, and accent layers move at different speeds
- **3D Support:** Graceful fallback to 2D on older browsers via `@supports`
- **Performance:** CSS transforms only (no layout thrashing), will-change hints, 60fps target

---

**Built by Aldemir Konuk**  
I read the floor. I find the gap. I build there.
