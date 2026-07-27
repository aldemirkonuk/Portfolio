'use client'

export const CHAPTERS = [
  /* ── CH.00 — Entry ──────────────────────────────────────── */
  {
    id: "CH.00",
    name: "Entry",
    face: "F",
    title: <>I read the <em>floor</em>.</>,
    lede: "A studio practice in interfaces, products, and the spaces in between.",
    render: () => (
      <>
        <p className="body">
          Aldemir Konuk. Designer and engineer working at the seam where research,
          interaction, and architecture meet. The cube is the index — scroll to turn it.
        </p>
      </>
    ),
  },

  /* ── CH.01 — Who ────────────────────────────────────────── */
  {
    id: "CH.01",
    name: "Who",
    face: "R",
    title: <>A three-sentence <em>manifesto</em>.</>,
    lede: null,
    render: () => (
      <div className="manifesto">
        <div className="line">I treat constraints as the material — the shape of the brief is the shape of the work.</div>
        <div className="line">I write code and draw lines with the same hand; the tools are the same conversation.</div>
        <div className="line">I ship what holds up six months later, not what photographs well on Tuesday.</div>
      </div>
    ),
  },

  /* ── CH.02 — Work ────────────────────────────────────────── */
  {
    id: "CH.02",
    name: "Work",
    face: "U",
    title: <>Selected <em>projects</em>.</>,
    lede: "Four pieces from the last two years.",
    render: () => (
      <div className="projects">
        {[
          { idx: "01", name: "Restaurant AI",      sub: "Operations copilot · MVP → series A", yr: "2025" },
          { idx: "02", name: "Selfhive", href: "https://selfhive.aldemirkonuk.com", sub: "Autonomous agent company", yr: "2026" },
          { idx: "03", name: "Konuk Type Studio",  sub: "Two display families, in progress",   yr: "2024" },
          { idx: "04", name: "Şehir Maps",         sub: "Civic wayfinding system",             yr: "2024" },
        ].map((p) => (
          <div className="row" key={p.idx}>
            <span className="idx">{p.idx}</span>
            <span className="name">
              {p.href
                ? <a className="proj-link" href={p.href} target="_blank" rel="noopener noreferrer">{p.name}</a>
                : p.name}
              <span className="sub">{p.sub}</span>
            </span>
            <span className="yr">{p.yr}</span>
          </div>
        ))}
      </div>
    ),
  },

  /* ── CH.03 — Craft ──────────────────────────────────────── */
  {
    id: "CH.03",
    name: "Craft",
    face: "L",
    title: <>A small <em>constellation</em>.</>,
    lede: "Tools and surfaces I keep close to hand.",
    render: () => (
      <div className="craft">
        {[
          ["Typography", true],
          ["Next.js", true],
          ["Three.js", true],
          ["Figma", false],
          ["GSAP", true],
          ["React", true],
          ["Swift", false],
          ["Letterpress", false],
          ["Field photography", false],
          ["Editorial direction", false],
          ["Systems thinking", true],
          ["Risograph", false],
        ].map(([s, core], i) => (
          <span key={i} className={"skill" + (core ? " is-core" : "")}>{s}</span>
        ))}
      </div>
    ),
  },

  /* ── CH.04 — Contact ────────────────────────────────────── */
  {
    id: "CH.04",
    name: "Contact",
    face: "D",
    title: <>Let's <em>talk</em>.</>,
    lede: "Studio inquiries open through October.",
    render: () => (
      <>
        <a className="contact-link" href="mailto:hello@aldemirkonuk.com">
          hello@aldemirkonuk.com
        </a>
        <p className="body" style={{ marginTop: 16 }}>
          A single paragraph is enough — what it is, when it's needed, and any
          constraint I should know about. I reply to everything within a week.
        </p>
      </>
    ),
  },

  /* ── CH.05 — GitHub (easter egg / back face) ─────────────── */
  {
    id: "CH.05",
    name: "GitHub",
    face: "B",
    title: <>The <em>back</em> of the cube.</>,
    lede: "You found it. Two years of small commits.",
    render: () => (
      <>
        <div className="grid-contrib">
          {Array.from({ length: 20 * 7 }).map((_, i) => {
            // deterministic pseudo-random density
            const s = Math.sin(i * 0.41) * 10000;
            const r = s - Math.floor(s);
            let cls = "cell";
            if (r > 0.85) cls += " l3";
            else if (r > 0.62) cls += " l2";
            else if (r > 0.35) cls += " l1";
            return <span key={i} className={cls}></span>;
          })}
        </div>
        <a
          className="contact-link"
          style={{ fontSize: "20px" }}
          href="https://github.com/"
          target="_blank"
          rel="noopener"
        >
          github.com/aldemirkonuk
        </a>
      </>
    ),
  },
];
