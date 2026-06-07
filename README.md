# Aldemir Konuk — Portfolio

Scroll-driven Rubik's cube portfolio. Three.js cubie-level layer twists, GSAP ScrollTrigger chapter transitions, card overlay content.

**Live:** [aldemirkonuk.com](https://aldemirkonuk.com)

**Flagship project — Read the Floor:** a CV + ML system that renders the value of the floor on basketball footage (who guards whom, the gap, the read, the risk). Lives in `Talent Between the Lines/`. See `mission.md` and `Talent Between the Lines/READ_THE_FLOOR.md`; first prototype in `Talent Between the Lines/prototypes/`.

## Stack

- Next.js (App Router)
- Three.js — real 3×3 cube (`lib/rubik.js`)
- GSAP + ScrollTrigger — chapter transitions
- React — UI shell (`components/portfolio/App.jsx`)

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Scroll to turn the cube through six chapters.

## Structure

```
app/
  page.jsx              → mounts App
  layout.jsx            → fonts + metadata
  globals.css           → Portfolio-3 styles
components/portfolio/
  App.jsx               → canvas, card host, scroll track, chrome
lib/
  rubik.js              → Three.js RubikCube engine
  content.jsx           → CH.00–CH.05 chapter content
```

Design notes: `CLAUDE.md`, `SKILL.md`
