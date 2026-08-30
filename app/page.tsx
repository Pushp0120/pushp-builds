'use client'
import { useEffect, useRef, useState } from 'react'
import ThreeBackground from './components/ThreeBackground'

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b', reviewing: '#3b82f6', quoted: '#8b5cf6',
  accepted: '#06b6d4', in_progress: '#10b981', completed: '#059669', rejected: '#ef4444'
}

export default function Home() {
  const [submitting, setSubmitting] = useState(false)
  const [formMsg, setFormMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [toast, setToast] = useState<{ show: boolean; text: string; type: string }>({ show: false, text: '', type: '' })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
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

  function validateEmail(email: string): boolean {
    // Real email validation: must have local part, @, domain with dot, valid TLD (2-10 chars)
    const re = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,10}$/
    if (!re.test(email)) return false
    // No consecutive dots, no leading/trailing dots in local part
    const [local, domain] = email.split('@')
    if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false
    if (domain.startsWith('.') || domain.endsWith('.') || domain.includes('..')) return false
    return true
  }

  function validatePhone(phone: string): boolean {
    // Remove spaces, dashes, parentheses
    const cleaned = phone.replace(/[\s\-().+]/g, '')
    // Accept 10-digit Indian numbers, or with country code 91
    return /^(91)?[6-9]\d{9}$/.test(cleaned)
  }

  function validateForm(data: Record<string, FormDataEntryValue>): Record<string, string> {
    const errors: Record<string, string> = {}
    if (!validateEmail(data.email as string)) {
      errors.email = 'Please enter a valid email address (e.g. you@example.com)'
    }
    const phone = (data.phone as string).trim()
    if (!phone) {
      errors.phone = 'Phone number is required'
    } else if (!validatePhone(phone)) {
      errors.phone = 'Enter a valid 10-digit Indian mobile number'
    }
    return errors
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormMsg(null)
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))

    const errors = validateForm(data)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setFormMsg({ type: 'error', text: '✗ Please fix the errors below before submitting.' })
      return
    }
    setFieldErrors({})
    setSubmitting(true)
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

  const projects = [
    {
      title: 'Talk N Tea',
      description: 'Premium cafe website with menu, gallery, reviews, and location features. A complete digital presence for a local business.',
      tags: ['Next.js', 'React', 'Full-Stack', 'Business Website'],
      link: 'https://talknteaofficial.vercel.app/',
      featured: true,
      color: '#10b981'
    },
    {
      title: 'Vasudhara Milk',
      description: 'E-commerce platform for dairy products with payment integration and order management.',
      tags: ['E-Commerce', 'PHP', 'MySQL', 'Payment Gateway'],
      link: 'https://github.com/Pushp0120/vasudhara_milk',
      featured: false,
      color: '#059669'
    }
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
      <ThreeBackground />

      <div ref={cursorRef} className="cursor" />
      <div ref={ringRef} className="cursor-ring" />

      <nav id="navbar">
        <a href="#" className="nav-logo">pushp<span>-builds</span></a>
        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#projects">Projects</a>
          <a href="#pricing">Pricing</a>
          <a href="#order">Get Quote</a>
          <a href="/admin" style={{ color: 'var(--gray)', fontSize: '0.75rem' }}>Admin ↗</a>
        </div>
        <a href="#order" className="nav-cta">Start Project</a>
      </nav>

      <section className="hero">
        <div className="hero-grid" />
        <div className="hero-content">
          <div className="hero-tag">Available for Premium Projects</div>
          <h1>I Build<br /><span className="line2">Digital Excellence</span><span className="line3">Web Apps · E-Commerce · Custom Solutions</span></h1>
          <p className="hero-desc">Hi, I'm Pushpendra Damor — a professional full-stack developer creating premium digital experiences with modern design and cutting-edge technology. Transform your ideas into reality.</p>
          <div className="hero-actions">
            <a href="#order" className="btn-primary">Submit Your Project →</a>
            <a href="#services" className="btn-outline">See What I Do</a>
          </div>
          <div className="hero-stat">
            <div><div className="stat-n">30+</div><div className="stat-l">Projects Delivered</div></div>
            <div><div className="stat-n">100%</div><div className="stat-l">Client Satisfaction</div></div>
            <div><div className="stat-n">24h</div><div className="stat-l">Response Time</div></div>
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
            <h2 className="section-title reveal">Pushpendra Damor.<br />Full-Stack Developer.</h2>
            <p className="section-sub reveal">I'm a professional full-stack developer specializing in creating premium digital experiences. I help businesses and individuals transform their ideas into sophisticated, high-performance web applications.</p>
            <p className="section-sub reveal" style={{ marginTop: '1rem' }}>From concept to deployment, I deliver end-to-end solutions with focus on clean code, modern design, and exceptional user experience. Your vision, executed with precision.</p>
            <div className="about-skills reveal">{skills.map(s => <span key={s} className="skill-tag">{s}</span>)}</div>
          </div>
          <div className="about-visual reveal">
            <div className="code-block">
              <span className="cmt">// developer profile</span><br />
              <span className="kw">const</span> <span className="fn">developer</span> = {'{'}<br />
              &nbsp;&nbsp;name: <span className="str">"Pushpendra Damor"</span>,<br />
              &nbsp;&nbsp;role: <span className="str">"Full-Stack Developer"</span>,<br />
              &nbsp;&nbsp;focus: <span className="str">"Premium Digital Solutions"</span>,<br />
              &nbsp;&nbsp;skills: [<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="str">"React"</span>, <span className="str">"Next.js"</span>,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="str">"Node.js"</span>, <span className="str">"PHP"</span><br />
              &nbsp;&nbsp;],<br />
              &nbsp;&nbsp;<span className="fn">available</span>: <span className="kw">true</span>,<br />
              &nbsp;&nbsp;<span className="fn">quality</span>: <span className="str">"premium"</span><br />
              {'}'};<br /><br />
              <span className="kw">export default</span> <span className="fn">developer</span>;
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

      <section id="projects" className="projects-bg">
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <span className="section-tag reveal">// featured_projects</span>
          <h2 className="section-title reveal">Featured Work</h2>
          <p className="section-sub reveal">A selection of projects that showcase my skills and attention to detail.</p>
          <div className="projects-grid reveal">
            {projects.map((project, index) => (
              <div key={index} className={`project-card ${project.featured ? 'featured' : ''}`}>
                <div className="project-header" style={{ borderColor: project.color }}>
                  <h3>{project.title}</h3>
                  {project.featured && <span className="featured-badge">Featured</span>}
                </div>
                <p className="project-desc">{project.description}</p>
                <div className="project-tags">
                  {project.tags.map((tag, i) => (
                    <span key={i} className="project-tag" style={{ background: `${project.color}15`, color: project.color }}>{tag}</span>
                  ))}
                </div>
                <a href={project.link} target="_blank" rel="noopener noreferrer" className="project-link" style={{ color: project.color }}>
                  View Project →
                </a>
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

      <section style={{ background: 'var(--surface2)' }}>
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
              <div className="form-field reveal">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="rahul@example.com"
                  required
                  onChange={() => setFieldErrors(prev => ({ ...prev, email: '' }))}
                  style={{ borderColor: fieldErrors.email ? 'var(--accent)' : undefined }}
                />
                {fieldErrors.email && <span style={{ fontSize: '.72rem', color: 'var(--accent)', marginTop: '.2rem' }}>⚠ {fieldErrors.email}</span>}
              </div>
              <div className="form-field reveal">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91 98765 43210"
                  required
                  onChange={() => setFieldErrors(prev => ({ ...prev, phone: '' }))}
                  style={{ borderColor: fieldErrors.phone ? 'var(--accent)' : undefined }}
                />
                {fieldErrors.phone && <span style={{ fontSize: '.72rem', color: 'var(--accent)', marginTop: '.2rem' }}>⚠ {fieldErrors.phone}</span>}
              </div>
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
        <div className="footer-logo">pushp<span>-builds // Pushpendra Damor</span></div>
        <div className="footer-links">
          <a href="#about">About</a><a href="#services">Services</a>
          <a href="#projects">Projects</a>
          <a href="#pricing">Pricing</a><a href="#order">Contact</a><a href="/admin">Admin</a>
        </div>
        <div className="footer-copy">© 2026 pushp-builds. Made with ♥</div>
      </footer>

      {toast.show && <div className={`toast ${toast.type}`}>{toast.text}</div>}
    </>
  )
}

