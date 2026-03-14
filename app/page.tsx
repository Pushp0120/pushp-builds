'use client'
import { useEffect, useRef, useState } from 'react'

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b', reviewing: '#3b82f6', quoted: '#8b5cf6',
  accepted: '#06b6d4', in_progress: '#ff6b35', completed: '#00d4aa', rejected: '#ef4444'
}

export default function Home() {
  const [submitting, setSubmitting] = useState(false)
  const [formMsg, setFormMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [toast, setToast] = useState<{ show: boolean; text: string; type: string }>({ show: false, text: '', type: '' })
  const cursorRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const mx = useRef(0); const my = useRef(0)
  const rx = useRef(0); const ry = useRef(0)

  useEffect(() => {
    const move = (e: MouseEvent) => {
      mx.current = e.clientX; my.current = e.clientY
      if (cursorRef.current) { cursorRef.current.style.left = e.clientX + 'px'; cursorRef.current.style.top = e.clientY + 'px' }
    }
    document.addEventListener('mousemove', move)
    let raf: number
    const animate = () => {
      rx.current += (mx.current - rx.current) * 0.12
      ry.current += (my.current - ry.current) * 0.12
      if (ringRef.current) { ringRef.current.style.left = rx.current + 'px'; ringRef.current.style.top = ry.current + 'px' }
      raf = requestAnimationFrame(animate)
    }
    animate()
    return () => { document.removeEventListener('mousemove', move); cancelAnimationFrame(raf) }
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('visible'), 80); obs.unobserve(e.target) } })
    }, { threshold: 0.1 })
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const nav = document.getElementById('navbar')
      if (nav) nav.classList.toggle('scrolled', scrollY > 50)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function showToast(text: string, type: string) {
    setToast({ show: true, text, type })
    setTimeout(() => setToast(t => ({ ...t, show: false })), 4000)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true); setFormMsg(null)
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))
    try {
      const res = await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const json = await res.json()
      if (json.success) {
        setFormMsg({ type: 'success', text: "✓ Project submitted! I'll review it and email you within 24 hours with a quote." })
        showToast('Project submitted successfully!', 'success')
        form.reset()
      } else {
        setFormMsg({ type: 'error', text: '✗ ' + (json.error || 'Something went wrong.') })
        showToast('Submission failed.', 'error')
      }
    } catch {
      setFormMsg({ type: 'error', text: '✗ Network error. Please try again.' })
    }
    setSubmitting(false)
  }

  const services = [
    ['🌐', 'Landing Pages', 'Clean, conversion-focused single pages for your business or portfolio. Fast and mobile-ready.', 'From ₹499', '', ''],
    ['🛒', 'E-Commerce Sites', 'Full online stores with product listings, cart, payment gateway integration.', 'From ₹2,999', 'Vasudhara', 'https://github.com/Pushp0120/vasudhara_milk'],
    ['📋', 'Admin Dashboards', 'Custom CMS/admin panels to manage your content, orders, or users.', 'From ₹1,999', '', ''],
    ['📱', 'Web Apps', 'Functional web applications with user auth, database, and real-time features.', 'From ₹3,999', '', ''],
    ['🔌', 'REST APIs', 'Backend APIs for your mobile app or frontend, with proper auth and documentation.', 'From ₹1,499', '', ''],
    ['🎨', 'UI/UX Design', 'Figma mockups and prototypes before development starts.', 'From ₹999', '', ''],
    ['🤖', 'Automation Scripts', 'Python/PHP scripts to automate repetitive tasks, scraping, or data processing.', 'From ₹799', '', ''],
    ['🔧', 'Bug Fixing', 'Fix broken websites, debug code, or optimize slow-loading pages.', 'From ₹299', '', ''],
  ]

  const plans = [
    { name: 'Starter', range: '₹600 – ₹800', desc: 'Perfect for simple tasks', features: ['Landing page / Portfolio', 'Bug fixes & tweaks', 'Script automation', '3-5 day delivery', '1 revision round'], featured: false },
    { name: 'Standard', range: '₹1,000 – ₹4,999', desc: 'Most popular for small businesses', features: ['Business website', 'Basic e-commerce', 'Admin dashboard', '7-14 day delivery', '3 revision rounds'], featured: true },
    { name: 'Advanced', range: '₹5,000 – ₹15,000', desc: 'Full-featured applications', features: ['Full-stack web app', 'Custom API + frontend', 'Payment integration', '15-30 day delivery', 'Unlimited revisions'], featured: false },
  ]

  const skills = ['PHP', 'MySQL', 'JavaScript', 'React', 'Node.js', 'HTML/CSS', 'Python', 'Laravel', 'WordPress', 'REST API', 'Git', 'Figma']
  const marqueeItems = ['PHP Development', '★', 'MySQL', '★', 'React.js', '★', 'Node.js', '★', 'UI/UX Design', '★', 'REST APIs', '★', 'WordPress', '★', 'Mobile Apps', '★', 'E-Commerce', '★', 'Admin Dashboards', '★']

  return (
    <>
      <style>{`
        body { cursor: none; }
        .cursor { width:10px;height:10px;background:var(--accent);border-radius:50%;position:fixed;pointer-events:none;z-index:9999;transform:translate(-50%,-50%);transition:width .2s,height .2s;mix-blend-mode:difference; }
        .cursor-ring { width:36px;height:36px;border:1px solid rgba(255,107,53,.5);border-radius:50%;position:fixed;pointer-events:none;z-index:9998;transform:translate(-50%,-50%);transition:width .2s,height .2s; }
        nav { position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:1.2rem 2.5rem;border-bottom:1px solid transparent;transition:all .3s; }
        nav.scrolled { background:rgba(8,8,8,.92);backdrop-filter:blur(12px);border-color:var(--border); }
        .nav-logo { font-family:var(--font-mono),monospace;font-size:1.1rem;color:var(--accent);text-decoration:none;letter-spacing:-.02em; }
        .nav-logo span { color:var(--white); }
        .nav-links { display:flex;align-items:center;gap:2rem; }
        .nav-links a { color:var(--gray3);text-decoration:none;font-size:.85rem;transition:color .2s; }
        .nav-links a:hover { color:var(--accent); }
        .nav-cta { background:var(--accent);color:var(--black);padding:.55rem 1.2rem;font-weight:700;font-size:.8rem;text-decoration:none;text-transform:uppercase;letter-spacing:.05em;transition:background .2s; }
        .nav-cta:hover { background:#ff8c5a; }
        .hero { min-height:100vh;display:flex;align-items:center;padding:7rem 2.5rem 4rem;position:relative;overflow:hidden; }
        .hero-bg { position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 60% 60% at 70% 50%,rgba(255,107,53,.07) 0%,transparent 60%),radial-gradient(ellipse 40% 40% at 20% 80%,rgba(0,212,170,.05) 0%,transparent 50%); }
        .hero-grid { position:absolute;inset:0;pointer-events:none;opacity:.03;background-image:linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px);background-size:60px 60px; }
        .hero-content { max-width:800px;position:relative;z-index:1; }
        .hero-tag { display:inline-flex;align-items:center;gap:.5rem;background:rgba(255,107,53,.08);border:1px solid rgba(255,107,53,.2);color:var(--accent);padding:.4rem .9rem;font-family:var(--font-mono),monospace;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;margin-bottom:1.5rem;animation:fadeUp .6s ease both; }
        .hero-tag::before { content:'▸'; }
        .hero h1 { font-size:clamp(3rem,7vw,6rem);font-weight:800;line-height:.95;letter-spacing:-.03em;margin-bottom:1.5rem;animation:fadeUp .6s .1s ease both; }
        .line2 { color:var(--accent);display:block; }
        .line3 { color:var(--gray2);font-size:.55em;display:block;font-weight:400;letter-spacing:-.01em;margin-top:.2rem; }
        .hero-desc { font-size:1.05rem;color:var(--gray3);line-height:1.7;max-width:540px;margin-bottom:2.5rem;animation:fadeUp .6s .2s ease both; }
        .hero-actions { display:flex;gap:1rem;flex-wrap:wrap;animation:fadeUp .6s .3s ease both; }
        .btn-primary { background:var(--accent);color:var(--black);padding:.9rem 2rem;font-weight:700;font-size:.9rem;text-decoration:none;text-transform:uppercase;letter-spacing:.05em;transition:all .2s;display:inline-block; }
        .btn-primary:hover { background:#ff8c5a;transform:translateY(-2px); }
        .btn-outline { border:1px solid var(--border);color:var(--gray3);padding:.9rem 2rem;font-size:.9rem;text-decoration:none;transition:all .2s;display:inline-block; }
        .btn-outline:hover { border-color:var(--accent2);color:var(--accent2); }
        .hero-stat { display:flex;gap:3rem;margin-top:4rem;animation:fadeUp .6s .4s ease both; }
        .stat-n { font-family:var(--font-mono),monospace;font-size:1.8rem;color:var(--accent);font-weight:700; }
        .stat-l { font-size:.75rem;color:var(--gray2);text-transform:uppercase;letter-spacing:.08em;margin-top:.1rem; }
        .marquee-wrap { border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:1rem 0;overflow:hidden;background:var(--surface); }
        .marquee { display:flex;gap:2rem;animation:marquee 20s linear infinite;white-space:nowrap; }
        .marquee span { font-family:var(--font-mono),monospace;font-size:.78rem;color:var(--gray);text-transform:uppercase;letter-spacing:.1em; }
        .maccent { color:var(--accent) !important; }
        section { padding:5rem 2.5rem; }
        .section-tag { font-family:var(--font-mono),monospace;font-size:.7rem;color:var(--accent);text-transform:uppercase;letter-spacing:.15em;margin-bottom:.8rem;display:block; }
        .section-title { font-size:clamp(1.8rem,4vw,3rem);font-weight:800;letter-spacing:-.02em;margin-bottom:1rem; }
        .section-sub { color:var(--gray3);line-height:1.7;max-width:540px; }
        .about-grid { display:grid;grid-template-columns:1fr 1fr;gap:5rem;align-items:center;max-width:1100px;margin:0 auto; }
        .about-visual { position:relative;background:var(--surface);border:1px solid var(--border);padding:2.5rem;aspect-ratio:1;display:flex;align-items:center;justify-content:center;overflow:hidden; }
        .about-visual::before { content:'';position:absolute;inset:0;background:radial-gradient(circle at 30% 70%,rgba(255,107,53,.15),transparent 60%),radial-gradient(circle at 70% 30%,rgba(0,212,170,.1),transparent 60%); }
        .code-block { font-family:var(--font-mono),monospace;font-size:.78rem;color:var(--gray3);line-height:2;text-align:left;position:relative;z-index:1; }
        .kw { color:var(--accent3); } .str { color:var(--accent2); } .fn { color:var(--accent); } .cmt { color:var(--gray);font-style:italic; }
        .about-skills { display:flex;flex-wrap:wrap;gap:.5rem;margin-top:1.5rem; }
        .skill-tag { background:var(--surface2);border:1px solid var(--border);padding:.35rem .8rem;font-size:.75rem;font-family:var(--font-mono),monospace;color:var(--gray3);transition:all .2s;cursor:default; }
        .skill-tag:hover { border-color:var(--accent);color:var(--accent); }
        .services-bg { background:var(--surface); }
        .services-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1px;background:var(--border);max-width:1100px;margin:3rem auto 0; }
        .service-card { background:var(--surface);padding:2rem;transition:background .2s;position:relative;overflow:hidden;cursor:default; }
        .service-card:hover { background:var(--surface2); }
        .service-card::before { content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--accent),transparent);transform:scaleX(0);transform-origin:left;transition:transform .3s; }
        .service-card:hover::before { transform:scaleX(1); }
        .svc-icon { font-size:2rem;margin-bottom:1rem; }
        .service-card h3 { font-size:1rem;font-weight:700;margin-bottom:.5rem; }
        .service-card p { font-size:.83rem;color:var(--gray2);line-height:1.6;margin-bottom:1rem; }
        .svc-price { font-family:var(--font-mono),monospace;font-size:.9rem;color:var(--accent);font-weight:700; }
        .pricing-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1.5rem;max-width:1000px;margin:3rem auto 0; }
        .price-card { background:var(--surface);border:1px solid var(--border);padding:2rem;transition:all .3s;position:relative; }
        .price-card.featured { border-color:var(--accent);background:rgba(255,107,53,.04); }
        .price-card.featured::after { content:'POPULAR';position:absolute;top:-1px;right:1.5rem;background:var(--accent);color:var(--black);font-size:.65rem;font-weight:700;letter-spacing:.1em;padding:.25rem .7rem; }
        .price-card:hover { transform:translateY(-4px);border-color:rgba(255,107,53,.3); }
        .price-card h3 { font-size:.8rem;text-transform:uppercase;letter-spacing:.1em;color:var(--gray2);margin-bottom:.8rem; }
        .price-amount { font-family:var(--font-mono),monospace;font-size:2rem;font-weight:700;color:var(--accent);margin-bottom:.2rem; }
        .price-desc { font-size:.8rem;color:var(--gray2);margin-bottom:1.5rem; }
        .price-features { list-style:none;margin-bottom:1.5rem; }
        .price-features li { font-size:.82rem;color:var(--gray3);padding:.4rem 0;border-bottom:1px solid var(--border); }
        .price-features li::before { content:'✓ ';color:var(--accent2); }
        .btn-price { display:block;text-align:center;padding:.75rem;border:1px solid var(--accent);color:var(--accent);text-decoration:none;font-size:.82rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;transition:all .2s; }
        .btn-price:hover,.price-card.featured .btn-price { background:var(--accent);color:var(--black); }
        .process-steps { display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:2rem;max-width:1000px;margin:3rem auto 0; }
        .process-step { position:relative;padding-left:3rem; }
        .step-num { position:absolute;left:0;top:0;font-family:var(--font-mono),monospace;font-size:2.5rem;font-weight:700;color:rgba(255,107,53,.15);line-height:1; }
        .process-step h3 { font-size:.95rem;font-weight:700;margin-bottom:.5rem; }
        .process-step p { font-size:.8rem;color:var(--gray2);line-height:1.6; }
        .order-bg { background:var(--surface); }
        .form-container { max-width:800px;margin:3rem auto 0; }
        .form-grid { display:grid;grid-template-columns:1fr 1fr;gap:1.5rem; }
        .form-field { display:flex;flex-direction:column;gap:.4rem; }
        .form-field.full { grid-column:1/-1; }
        .form-field label { font-size:.7rem;text-transform:uppercase;letter-spacing:.1em;color:var(--gray2);font-family:var(--font-mono),monospace; }
        .form-field input,.form-field select,.form-field textarea { background:var(--surface2);border:1px solid var(--border);color:var(--white);padding:.85rem 1rem;font-family:var(--font-mono),monospace;font-size:.85rem;outline:none;transition:border-color .2s;width:100%;-webkit-appearance:none; }
        .form-field input:focus,.form-field select:focus,.form-field textarea:focus { border-color:var(--accent); }
        .form-field textarea { min-height:120px;resize:vertical; }
        .form-submit { margin-top:2rem;display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap; }
        .btn-submit { background:var(--accent);color:var(--black);border:none;padding:1rem 2.5rem;font-family:var(--font-syne),sans-serif;font-weight:800;font-size:.95rem;text-transform:uppercase;letter-spacing:.05em;cursor:pointer;transition:all .2s; }
        .btn-submit:hover:not(:disabled) { background:#ff8c5a;transform:translateY(-2px); }
        .btn-submit:disabled { opacity:.6;cursor:not-allowed; }
        .form-note { font-size:.78rem;color:var(--gray); }
        .form-msg { padding:1rem 1.2rem;margin-top:1rem;font-size:.85rem; }
        .form-msg.success { background:rgba(0,212,170,.1);border:1px solid rgba(0,212,170,.3);color:var(--accent2); }
        .form-msg.error { background:rgba(255,107,53,.1);border:1px solid rgba(255,107,53,.3);color:var(--accent); }
        footer { border-top:1px solid var(--border);padding:3rem 2.5rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem; }
        .footer-logo { font-family:var(--font-mono),monospace;font-size:.95rem;color:var(--accent); }
        .footer-logo span { color:var(--gray2); }
        .footer-links { display:flex;gap:1.5rem; }
        .footer-links a { color:var(--gray);font-size:.8rem;text-decoration:none;transition:color .2s; }
        .footer-links a:hover { color:var(--accent); }
        .footer-copy { font-size:.75rem;color:var(--gray);font-family:var(--font-mono),monospace; }
        .toast { position:fixed;bottom:2rem;right:2rem;z-index:999;background:var(--surface);border:1px solid var(--border);padding:1rem 1.5rem;font-size:.85rem;transition:all .3s;max-width:320px;pointer-events:none; }
        .toast.success { border-color:rgba(0,212,170,.4);color:var(--accent2); }
        .toast.error { border-color:rgba(255,107,53,.4);color:var(--accent); }
        @media(max-width:768px){
          nav{padding:1rem 1.2rem;} .nav-links{display:none;}
          section{padding:3.5rem 1.2rem;} .hero{padding:6rem 1.2rem 3rem;}
          .about-grid{grid-template-columns:1fr;gap:2.5rem;}
          .form-grid{grid-template-columns:1fr;} .form-field.full{grid-column:1;}
          footer{flex-direction:column;align-items:flex-start;} .hero-stat{gap:1.5rem;}
        }
      `}</style>

      <div ref={cursorRef} className="cursor" />
      <div ref={ringRef} className="cursor-ring" />

      <nav id="navbar">
        <a href="#" className="nav-logo">dev<span>folio</span></a>
        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#pricing">Pricing</a>
          <a href="#order">Get Quote</a>
          <a href="/admin" style={{ color: 'var(--gray)', fontSize: '0.75rem' }}>Admin ↗</a>
        </div>
        <a href="#order" className="nav-cta">Start Project</a>
      </nav>

      <section className="hero">
        <div className="hero-bg" /><div className="hero-grid" />
        <div className="hero-content">
          <div className="hero-tag">Available for Freelance Work</div>
          <h1>I Build<br /><span className="line2">Digital Products</span><span className="line3">Web Apps · Mobile Apps · Custom Software</span></h1>
          <p className="hero-desc">Hi, I'm Pushpendra Damor — a 3rd Year student with a passion for building clean, functional, and affordable digital solutions. Tell me what you need — I'll make it happen at a price that makes sense.</p>
          <div className="hero-actions">
            <a href="#order" className="btn-primary">Submit Your Project →</a>
            <a href="#services" className="btn-outline">See What I Do</a>
          </div>
          <div className="hero-stat">
            <div><div className="stat-n">30+</div><div className="stat-l">Projects Done</div></div>
            <div><div className="stat-n">₹499</div><div className="stat-l">Starting Price</div></div>
            <div><div className="stat-n">7d</div><div className="stat-l">Avg Delivery</div></div>
          </div>
        </div>
      </section>

      <div className="marquee-wrap">
        <div className="marquee">
          {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className={item === '★' ? 'maccent' : ''}>{item}</span>
          ))}
        </div>
      </div>

      <section id="about">
        <div className="about-grid">
          <div>
            <span className="section-tag reveal">// about.me</span>
            <h2 className="section-title reveal">Pushpendra Damor.<br />Full-Stack Dev.</h2>
            <p className="section-sub reveal">I'm a 3rd year BCA student who builds real-world web apps and mobile applications. I help individuals, startups, and small businesses get their ideas off the ground — without the agency price tag.</p>
            <p className="section-sub reveal" style={{ marginTop: '1rem' }}>You submit your project requirements. I analyze it, quote a fair price, and deliver quality work on time. Simple as that.</p>
            <div className="about-skills reveal">{skills.map(s => <span key={s} className="skill-tag">{s}</span>)}</div>
          </div>
          <div className="about-visual reveal">
            <div className="code-block">
              <span className="cmt">// developer profile</span><br />
              <span className="kw">const</span> <span className="fn">dev</span> = {'{'}<br />
              &nbsp;&nbsp;name: <span className="str">"Pushpendra Damor"</span>,<br />
              &nbsp;&nbsp;year: <span className="str">"3rd Year"</span>,<br />
              &nbsp;&nbsp;role: <span className="str">"Full-Stack Dev"</span>,<br />
              &nbsp;&nbsp;skills: [<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="str">"PHP"</span>, <span className="str">"React"</span>,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="str">"MySQL"</span>, <span className="str">"Node"</span><br />
              &nbsp;&nbsp;],<br />
              &nbsp;&nbsp;<span className="fn">available</span>: <span className="kw">true</span>,<br />
              &nbsp;&nbsp;<span className="fn">pricing</span>: <span className="str">"reasonable"</span><br />
              {'}'};<br /><br />
              <span className="kw">export default</span> <span className="fn">dev</span>;
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="services-bg">
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <span className="section-tag reveal">// what I build</span>
          <h2 className="section-title reveal">Services</h2>
          <p className="section-sub reveal">From landing pages to full-stack applications — I handle it all.</p>
          <div className="services-grid reveal">
            {services.map(([icon, title, desc, price, projectName, projectUrl]) => (
              <div key={title as string} className="service-card">
                <div className="svc-icon">{icon}</div>
                <h3>{title}</h3><p>{desc}</p>
                <div className="svc-price">{price}</div>
                {projectUrl && (
                  <a href={projectUrl as string} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", marginTop: "0.8rem", fontSize: "0.75rem", color: "var(--accent2)", textDecoration: "none", border: "1px solid rgba(0,212,170,0.3)", padding: "0.3rem 0.7rem", transition: "all 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,212,170,0.1)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                    {projectName as string}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <span className="section-tag reveal">// pricing.json</span>
          <h2 className="section-title reveal">Transparent Pricing</h2>
          <p className="section-sub reveal">No hidden costs. What you see is what you pay. Final price quoted after reviewing your requirements.</p>
          <div className="pricing-grid reveal">
            {plans.map(plan => (
              <div key={plan.name} className={`price-card${plan.featured ? ' featured' : ''}`}>
                <h3>{plan.name}</h3>
                <div className="price-amount">{plan.range}</div>
                <div className="price-desc">{plan.desc}</div>
                <ul className="price-features">{plan.features.map(f => <li key={f}>{f}</li>)}</ul>
                <a href="#order" className="btn-price">Get Quote</a>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.78rem', color: 'var(--gray)' }}>* Final price depends on complexity. Submit your project and get a custom quote within 24 hours.</p>
        </div>
      </section>

      <section style={{ background: 'var(--surface)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <span className="section-tag reveal">// how it works</span>
          <h2 className="section-title reveal">Simple Process</h2>
          <div className="process-steps">
            {[['01', 'Submit Request', 'Fill out the form with your project details, features needed, and budget range.'], ['02', 'Get a Quote', 'I review your request within 24 hours and send you a detailed price quote.'], ['03', 'Agree & Start', "Once you accept the quote, I start building. No upfront payment required."], ['04', 'Review & Deliver', 'You review the work, request changes, and I deliver the final files to you.']].map(([n, t, d]) => (
              <div key={n} className="process-step reveal"><div className="step-num">{n}</div><h3>{t}</h3><p>{d}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section id="order" className="order-bg">
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <span className="section-tag reveal">// submit_project()</span>
          <h2 className="section-title reveal">Start Your Project</h2>
          <p className="section-sub reveal">Tell me what you need. I'll review it and get back to you within 24 hours with a quote.</p>
          <div className="form-container">
            <form className="form-grid" onSubmit={handleSubmit}>
              <div className="form-field reveal"><label>Your Name *</label><input type="text" name="name" placeholder="Rahul Sharma" required /></div>
              <div className="form-field reveal"><label>Email Address *</label><input type="email" name="email" placeholder="rahul@example.com" required /></div>
              <div className="form-field reveal"><label>Phone Number</label><input type="tel" name="phone" placeholder="+91 98765 43210" /></div>
              <div className="form-field reveal">
                <label>Project Type *</label>
                <select name="project_type" required>
                  <option value="">Select type...</option>
                  <option value="website">Website</option>
                  <option value="app">Web App</option>
                  <option value="both">Website + App</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-field full reveal"><label>Project Name *</label><input type="text" name="project_name" placeholder="e.g. Food Delivery App, Portfolio Site" required /></div>
              <div className="form-field full reveal"><label>Project Description *</label><textarea name="description" placeholder="Describe what you want to build. What is the purpose? Who will use it?" required /></div>
              <div className="form-field full reveal"><label>Key Features Needed</label><textarea name="features" placeholder="e.g. User login, Product catalogue, Payment gateway, Admin dashboard..." /></div>
              <div className="form-field reveal">
                <label>Budget Range</label>
                <select name="budget_range">
                  <option value="">Not sure yet</option>
                  <option>Under ₹1,000</option><option>₹1,000 – ₹3,000</option>
                  <option>₹3,000 – ₹7,000</option><option>₹7,000 – ₹15,000</option><option>₹15,000+</option>
                </select>
              </div>
              <div className="form-field reveal">
                <label>Desired Timeline</label>
                <select name="timeline">
                  <option>Flexible</option><option>ASAP (1-3 days)</option>
                  <option>1 week</option><option>2 weeks</option><option>1 month</option>
                </select>
              </div>
              <div className="form-field full reveal"><label>Reference Links / Examples</label><input type="text" name="reference_links" placeholder="Websites or apps you like the look of (optional)" /></div>
              <div className="form-field full">
                <div className="form-submit">
                  <button type="submit" className="btn-submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Project →'}</button>
                  <span className="form-note">I'll reply within 24 hours. No spam, ever.</span>
                </div>
                {formMsg && <div className={`form-msg ${formMsg.type}`}>{formMsg.text}</div>}
              </div>
            </form>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-logo">dev<span>folio // Pushpendra Damor & Developer</span></div>
        <div className="footer-links">
          <a href="#about">About</a><a href="#services">Services</a>
          <a href="#pricing">Pricing</a><a href="#order">Contact</a><a href="/admin">Admin</a>
        </div>
        <div className="footer-copy">© {new Date().getFullYear()} DevFolio. Made with ♥</div>
      </footer>

      {toast.show && <div className={`toast ${toast.type}`}>{toast.text}</div>}
    </>
  )
}
