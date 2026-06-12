'use client'
import { useEffect, useState, useRef } from 'react'
import { loadWasm } from './wasm'
import styles from './page.module.css'

/* ── data ── */
const SKILLS = [
  { name: 'C',           seed: 1, base: 82, cat: 'Languages'   },
  { name: 'Python',      seed: 2, base: 74, cat: 'Languages'   },
  { name: 'TypeScript',  seed: 3, base: 68, cat: 'Languages'   },
  { name: 'HTML / CSS',  seed: 4, base: 78, cat: 'Web'         },
  { name: 'AWS Cloud',   seed: 5, base: 70, cat: 'Cloud'       },
  { name: 'Git / GitHub',seed: 6, base: 80, cat: 'Tools'       },
  { name: 'Teamwork',    seed: 7, base: 88, cat: 'Soft Skills'  },
  { name: 'Communication',seed:8, base: 85, cat: 'Soft Skills'  },
]

const PROJECTS = [
  {
    icon: '⛓️',
    title: 'VibeKit (Fork)',
    desc: 'Agentic stack for Algorand builders — works with Claude Code, Cursor & VS Code Copilot. Includes MCP tools, AI skills, and a flowguard app module.',
    tags: ['TypeScript','Algorand','MCP','Claude Code','Bun'],
    link: 'https://github.com/rajshekarsachin9-svg/vibekit',
  },
  {
    icon: '🚰',
    title: 'Water Supply Scheduler',
    desc: 'C CLI tool solving intermittent piped water supply in Indian cities — zone-based scheduling, live status checks, fill/miss logging.',
    tags: ['C','CLI','Systems','Civic Tech'],
    link: 'https://github.com/rajshekarsachin9-svg',
  },
  {
    icon: '🌐',
    title: 'ePortfolio',
    desc: 'This site — Next.js + WebAssembly (compiled from WAT/C). Skill bars, particle canvas, and experience counter all powered by C functions via WASM.',
    tags: ['Next.js','WebAssembly','C','Vercel'],
    link: '#',
  },
]

const EDU = [
  { degree: 'B.Tech — Computer Science', school: 'REVA University',     years: 'Aug 2025 – Aug 2029', grade: null,    score: null  },
  { degree: 'Grade 12 — CBSE, PCMC',     school: 'JSS Public School',   years: 'Apr 2023 – Apr 2025', grade: '12th',  score: null  },
  { degree: 'Grade 10 — ICSE, PCMC',     school: 'ACTS Secondary School',years: 'Completed',           grade: null,    score: 906   },
]

/* ── Particle canvas powered by C hash2 ── */
function ParticleCanvas({ wasm }: { wasm: any }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (!ref.current || !wasm) return
    const canvas = ref.current
    const ctx = canvas.getContext('2d')!
    let raf: number
    const W = canvas.width  = canvas.offsetWidth
    const H = canvas.height = canvas.offsetHeight
    // seed particles using C hash2
    const pts = Array.from({ length: 55 }, (_, i) => ({
      x: (wasm.hash2(i, i * 7 + 1) / 360) * W,
      y: (wasm.hash2(i * 3 + 2, i) / 360) * H,
      vx: (wasm.hash2(i, 99) / 360 - 0.5) * 0.5,
      vy: (wasm.hash2(99, i) / 360 - 0.5) * 0.5,
      hue: wasm.hash2(i * 5, i * 11),
      r: 1.5 + (wasm.hash2(i * 2, i * 3) % 20) / 10,
    }))
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > W) p.vx *= -1
        if (p.y < 0 || p.y > H) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue},70%,65%,0.5)`
        ctx.fill()
      })
      // draw faint lines between nearby particles
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x
          const dy = pts[i].y - pts[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 90) {
            ctx.beginPath()
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
            ctx.strokeStyle = `rgba(124,109,250,${0.15 * (1 - dist / 90)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [wasm])
  return <canvas ref={ref} className={styles.canvas} />
}

/* ── Typewriter ── */
function Typewriter({ texts }: { texts: string[] }) {
  const [display, setDisplay] = useState('')
  const [ti, setTi] = useState(0)
  const [ci, setCi] = useState(0)
  const [deleting, setDeleting] = useState(false)
  useEffect(() => {
    const cur = texts[ti]
    const delay = deleting ? 40 : 80
    const t = setTimeout(() => {
      if (!deleting) {
        setDisplay(cur.slice(0, ci + 1))
        if (ci + 1 === cur.length) setTimeout(() => setDeleting(true), 1800)
        else setCi(ci + 1)
      } else {
        setDisplay(cur.slice(0, ci - 1))
        if (ci - 1 === 0) { setDeleting(false); setTi((ti + 1) % texts.length); setCi(0) }
        else setCi(ci - 1)
      }
    }, delay)
    return () => clearTimeout(t)
  }, [ci, deleting, texts, ti])
  return <span className={styles.typewriter}>{display}<span className={styles.cursor}>|</span></span>
}

/* ── Skill bar ── */
function SkillBar({ name, pct, delay }: { name: string; pct: number; delay: number }) {
  const [width, setWidth] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setWidth(pct), delay); obs.disconnect() }
    }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [pct, delay])
  return (
    <div ref={ref} className={styles.skillRow}>
      <div className={styles.skillLabel}>
        <span>{name}</span>
        <span className={styles.skillPct}>{width}%</span>
      </div>
      <div className={styles.skillTrack}>
        <div className={styles.skillFill} style={{ width: `${width}%`, transition: `width 1s ease ${delay}ms` }} />
      </div>
    </div>
  )
}

/* ── Stars ── */
function Stars({ count }: { count: number }) {
  return <span className={styles.stars}>{Array.from({ length: 5 }, (_, i) => <span key={i} style={{ opacity: i < count ? 1 : 0.2 }}>★</span>)}</span>
}

/* ── Main ── */
export default function Home() {
  const [wasm, setWasm] = useState<any>(null)
  const [months, setMonths] = useState(0)
  const [skills, setSkills] = useState<{ name: string; pct: number }[]>([])
  const [stars906, setStars906] = useState(0)
  const [activeNav, setActiveNav] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    loadWasm().then(w => {
      setWasm(w)
      // C: months_experience(2026, 3, 2026, 6) = 3 months (March→June 2026)
      const mo = w.months_experience(2026, 3, 2026, 6)
      setMonths(mo)
      // C: skill_score for each skill
      const computed = SKILLS.map(s => ({
        name: s.name,
        pct: w.skill_score(s.seed, s.base),
      }))
      setSkills(computed)
      // C: grade_stars(906) = 5
      setStars906(w.grade_stars(906))
    })
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['about','skills','experience','projects','education','contact']
      for (const id of sections) {
        const el = document.getElementById(id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 80 && rect.bottom > 80) { setActiveNav(id); break }
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = ['about','skills','experience','projects','education','contact']

  return (
    <main className={styles.main}>

      {/* NAV */}
      <nav className={styles.nav}>
        <span className={styles.navLogo}>raj@dev:~$</span>
        <ul className={`${styles.navLinks} ${menuOpen ? styles.navOpen : ''}`}>
          {navLinks.map(l => (
            <li key={l}>
              <a href={`#${l}`} className={activeNav === l ? styles.navActive : ''} onClick={() => setMenuOpen(false)}>
                {l}
              </a>
            </li>
          ))}
        </ul>
        <button className={styles.burger} onClick={() => setMenuOpen(o => !o)} aria-label="menu">
          <span /><span /><span />
        </button>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <ParticleCanvas wasm={wasm} />
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>// CS Student · AWS Cloud Club · REVA University</p>
          <h1 className={styles.heroName}>
            K Raj<br /><span className={styles.grad}>Shekar</span>
          </h1>
          <p className={styles.heroSub}>
            <Typewriter texts={[
              'Building on the cloud ☁️',
              'PR @ AWS Cloud Club REVA',
              'First-year CSE @ REVA University',
              'Open to collaborations 🤝',
              'Bengaluru, Karnataka 🇮🇳',
            ]} />
          </p>
          {wasm && (
            <p className={styles.wasmBadge}>
              <span className={styles.cLabel}>{'/* C → WASM */'}</span>
              {' '}Experience counter:{' '}
              <strong>{months} months</strong> at AWS Cloud Club
            </p>
          )}
          <div className={styles.heroCta}>
            <a href="#projects" className={styles.btnPrimary}>View Projects →</a>
            <a href="#contact"  className={styles.btnGhost}>Contact Me</a>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className={styles.section}>
        <p className={styles.label}>About</p>
        <h2 className={styles.sectionTitle}>Who I Am</h2>
        <div className={styles.aboutGrid}>
          <div className={styles.aboutText}>
            <p>I&apos;m <strong>K Raj Shekar</strong> (he/him), a B.Tech Computer Science student at <strong>REVA University, Bengaluru</strong>, graduating in 2029.</p>
            <p>Currently serving as a <strong>PR Team Member at AWS Cloud Club REVA University</strong> — handling community outreach, event communications, and growing the club&apos;s presence across campus.</p>
            <p>I&apos;m into cloud computing, open-source dev, and building things that actually solve real problems. Based in <strong>Bengaluru</strong> — right in the middle of India&apos;s tech scene.</p>
          </div>
          <div className={styles.statsGrid}>
            {[
              { n: '2029', l: 'Expected Graduation' },
              { n: '115+', l: 'LinkedIn Connections' },
              { n: 'AWS',  l: 'Cloud Club Member'   },
              { n: `${months}mo`, l: 'AWS Club Experience (C-computed)' },
            ].map(s => (
              <div key={s.l} className={styles.statCard}>
                <div className={styles.statNum}>{s.n}</div>
                <div className={styles.statLabel}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SKILLS — bars computed by C skill_score() */}
      <section id="skills" className={styles.section}>
        <p className={styles.label}>Skills</p>
        <h2 className={styles.sectionTitle}>
          What I Work With
          <span className={styles.cNote}> {`// scores via C skill_score()`}</span>
        </h2>
        <div className={styles.skillsWrap}>
          {skills.map((s, i) => (
            <SkillBar key={s.name} name={s.name} pct={s.pct} delay={i * 80} />
          ))}
        </div>
      </section>

      {/* EXPERIENCE */}
      <section id="experience" className={styles.section}>
        <p className={styles.label}>Experience</p>
        <h2 className={styles.sectionTitle}>Where I&apos;ve Contributed</h2>
        <div className={styles.timeline}>
          <div className={styles.timelineDot} />
          <div className={styles.timelineContent}>
            <span className={styles.timelineDate}>Mar 2026 – Present · Hybrid</span>
            <h3 className={styles.timelineRole}>PR Team Member</h3>
            <p className={styles.timelineOrg}>AWS Cloud Club REVA University · Bangalore Urban, Karnataka</p>
            <p className={styles.timelineDesc}>
              Handling public relations and community outreach for the AWS Student Builder Group at REVA University.
              Responsible for communications, event promotion, and growing the club&apos;s presence.
            </p>
            <div className={styles.tagRow}>
              {['Teamwork','Communication','Community Outreach','AWS'].map(t => (
                <span key={t} className={styles.tag}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects" className={styles.section}>
        <p className={styles.label}>Projects</p>
        <h2 className={styles.sectionTitle}>Things I&apos;ve Built</h2>
        <div className={styles.projectsGrid}>
          {PROJECTS.map(p => (
            <a key={p.title} href={p.link} target="_blank" rel="noreferrer" className={styles.projectCard}>
              <div className={styles.projectTop}>
                <span className={styles.projectIcon}>{p.icon}</span>
                <span className={styles.projectArrow}>↗</span>
              </div>
              <h3 className={styles.projectTitle}>{p.title}</h3>
              <p className={styles.projectDesc}>{p.desc}</p>
              <div className={styles.tagRow}>
                {p.tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* EDUCATION */}
      <section id="education" className={styles.section}>
        <p className={styles.label}>Education</p>
        <h2 className={styles.sectionTitle}>
          Academic Background
          <span className={styles.cNote}> {`// stars via C grade_stars()`}</span>
        </h2>
        <div className={styles.eduGrid}>
          {EDU.map(e => (
            <div key={e.school} className={styles.eduCard}>
              <p className={styles.eduDeg}>{e.degree}</p>
              <p className={styles.eduSchool}>{e.school}</p>
              <p className={styles.eduYear}>{e.years}</p>
              {e.score && <Stars count={stars906} />}
              {e.score && <span className={styles.tag} style={{ marginTop: '0.5rem', display: 'inline-block' }}>{e.score / 10}%</span>}
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className={styles.section}>
        <p className={styles.label}>Contact</p>
        <h2 className={styles.sectionTitle}>Let&apos;s Connect</h2>
        <div className={styles.contactGrid}>
          <p className={styles.contactSub}>Open to collabs, internships, or just a good tech chat. Hit me up 👇</p>
          <div className={styles.contactLinks}>
            {[
              { icon: '📧', label: 'Email',    val: 'rajshekarsachin9@gmail.com',                     href: 'mailto:rajshekarsachin9@gmail.com'                 },
              { icon: '🐙', label: 'GitHub',   val: 'rajshekarsachin9-svg',                            href: 'https://github.com/rajshekarsachin9-svg'           },
              { icon: '💼', label: 'LinkedIn', val: 'K Raj Shekar',                                    href: 'https://www.linkedin.com/in/k-raj-shekar-a6b519352' },
              { icon: '📍', label: 'Location', val: 'Bengaluru, Karnataka, India',                     href: '#'                                                  },
            ].map(c => (
              <a key={c.label} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className={styles.contactLink}>
                <span className={styles.contactIcon}>{c.icon}</span>
                <div>
                  <small>{c.label}</small>
                  <span>{c.val}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <span>© 2026 K Raj Shekar</span>
        <span className={styles.footerMono}>next.js + webassembly (C) + vercel ⚡</span>
      </footer>

    </main>
  )
}
