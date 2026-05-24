export const CHAPTERS = [
  {
    id: 'CH.00',
    name: 'Entry',
    title: (
      <>
        I read
        <br />
        the <em>floor.</em>
      </>
    ),
    lede: 'I find the gap. I build there.',
    render: () => (
      <>
        <p className="body">
          This portfolio is a Rubik&apos;s cube — six faces, six chapters. Scroll and the cube turns;
          each face solves row by row as the story moves forward. The center sticker is the only
          navigation. No buttons. The cube tells you where you are.
        </p>
        <div className="toc">
          {[
            ['CH.01', 'Who', '03'],
            ['CH.02', 'Work', '03'],
            ['CH.03', 'Craft', '08'],
            ['CH.04', 'Contact', '01'],
            ['CH.05', 'GitHub', '01'],
          ].map(([n, t, c]) => (
            <div className="toc-row" key={n}>
              <span>{n}</span>
              <span className="name">{t}</span>
              <span>{c} pcs</span>
            </div>
          ))}
        </div>
      </>
    ),
  },

  {
    id: 'CH.01',
    name: 'Who',
    title: (
      <>
        Born in Antalya.
        <br />
        <em>Built everywhere.</em>
      </>
    ),
    lede: 'Professional basketball player. Michigan State, 22. Spatial intelligence from birth.',
    render: () => (
      <>
        <p className="body">
          Basketball taught me systems thinking — reading gaps, performing under pressure, finding
          the move before anyone else sees it. That same instinct drives everything I build.
        </p>
        <p className="body">
          Core: passion, intuition, creativity, perspective. My superpower is seeing what others
          walk past. I find the gap before anyone moves toward it.
        </p>
        <p className="body">
          Everything I build carries one question: <em>How was this made, and why?</em>
        </p>
        <dl className="meta-grid">
          <dt>Origin</dt>
          <dd>Antalya, Turkey</dd>
          <dt>Study</dt>
          <dd>Michigan State University</dd>
          <dt>Age</dt>
          <dd>22</dd>
          <dt>Core</dt>
          <dd>Passion · Intuition · Creativity</dd>
        </dl>
      </>
    ),
  },

  {
    id: 'CH.02',
    name: 'Work',
    title: (
      <>
        Selected <em>work.</em>
      </>
    ),
    lede: 'Projects where spatial thinking meets systems.',
    render: () => (
      <div className="projects">
        {[
          {
            idx: '01',
            name: 'Restaurant AI Automation',
            sub: 'Computer vision + kitchen workflow',
            tag: 'AI',
            yr: '2025',
          },
          {
            idx: '02',
            name: 'Bracket Analyzer',
            sub: 'Real-time tournament prediction engine',
            tag: 'Data',
            yr: '2025',
          },
          {
            idx: '03',
            name: 'Spatial Design System',
            sub: 'Interfaces that respond to perspective',
            tag: 'Design',
            yr: '2024',
          },
        ].map((p) => (
          <div className="row" key={p.idx}>
            <span className="idx">{p.idx}</span>
            <span className="name">
              {p.name}
              <span className="sub">{p.sub}</span>
            </span>
            <span className="tag">{p.tag}</span>
            <span className="yr">{p.yr}</span>
          </div>
        ))}
      </div>
    ),
  },

  {
    id: 'CH.03',
    name: 'Craft',
    title: (
      <>
        Skills as a <em>constellation.</em>
      </>
    ),
    lede: 'Nodes connected by curiosity. Each skill a point of light.',
    render: () => (
      <div className="principles">
        {[
          {
            num: 'S.01',
            h: 'React & Next.js',
            p: 'App Router, server components, client interactivity — the foundation for everything I ship.',
          },
          {
            num: 'S.02',
            h: 'GSAP & Motion',
            p: 'Scroll-driven choreography, spring physics, interruptible timelines.',
          },
          {
            num: 'S.03',
            h: '3D & Spatial UI',
            p: 'CSS 3D transforms, Three.js accents, interfaces that exist in space.',
          },
          {
            num: 'S.04',
            h: 'Python & Data',
            p: 'Analysis, automation, the backend logic behind the surface.',
          },
        ].map((p) => (
          <div className="principle" key={p.num}>
            <div className="num">{p.num}</div>
            <h3>{p.h}</h3>
            <p>{p.p}</p>
          </div>
        ))}
      </div>
    ),
  },

  {
    id: 'CH.04',
    name: 'Contact',
    title: (
      <>
        Let&apos;s <em>talk.</em>
      </>
    ),
    lede: 'One sentence. One link. Silence is the design.',
    render: () => (
      <div className="contact">
        <a className="big" href="mailto:aldemirkonuk2004@gmail.com">
          aldemirkonuk2004@gmail.com
        </a>
        <p className="body" style={{ maxWidth: '40ch' }}>
          For project work, a single paragraph is enough — what it is, when it&apos;s needed, and
          any constraint I should know about.
        </p>
        <div className="channels">
          <a href="https://aldemirkonuk.com" target="_blank" rel="noreferrer">
            aldemirkonuk.com
          </a>
          <a href="https://github.com/aldemirkonuk" target="_blank" rel="noreferrer">
            github
          </a>
          <a href="https://linkedin.com/in/aldemirkonuk" target="_blank" rel="noreferrer">
            linkedin
          </a>
        </div>
      </div>
    ),
  },

  {
    id: 'CH.05',
    name: 'GitHub',
    title: (
      <>
        Open <em>source.</em>
      </>
    ),
    lede: 'The back face — discover it by turning the cube all the way through.',
    render: () => (
      <div className="contact">
        <a
          className="big"
          href="https://github.com/aldemirkonuk"
          target="_blank"
          rel="noreferrer"
        >
          github.com/aldemirkonuk
        </a>
        <p className="body" style={{ maxWidth: '44ch' }}>
          Code, experiments, and works in progress. The contribution graph as architectural
          elevation — every commit a line in the drawing.
        </p>
      </div>
    ),
  },
]
