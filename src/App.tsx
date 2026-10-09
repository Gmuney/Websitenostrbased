import { useState, type FormEvent } from 'react'
import { SocialIcon } from './components/SocialIcon'
import { site } from './config/site'
import { useNostrProfile } from './hooks/useNostrProfile'
import './App.css'

function App() {
  const { displayName, about, picture, state } = useNostrProfile()
  const [menuOpen, setMenuOpen] = useState(false)
  const [newsletterNote, setNewsletterNote] = useState<string | null>(null)

  const intro = about || site.tagline

  function onNewsletterSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const email = String(data.get('email') ?? '')
    if (site.newsletter.formAction) {
      e.currentTarget.action = site.newsletter.formAction
      e.currentTarget.submit()
      return
    }
    setNewsletterNote(
      email
        ? `Thanks — connect this form to your email provider to capture ${email}.`
        : 'Enter your email to subscribe.',
    )
  }

  return (
    <div className="page">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="site-header">
        <div className="shell header-inner">
          <nav className="nav-primary" aria-label="Primary">
            <ul className={`nav-list ${menuOpen ? 'is-open' : ''}`}>
              {site.nav.map((item) => (
                <li key={item.href}>
                  <a href={item.href} onClick={() => setMenuOpen(false)}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <ul className="nav-social">
            {site.social.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                >
                  <SocialIcon label={item.label} />
                </a>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="nav-toggle"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="sr-only">Toggle menu</span>
            <span aria-hidden />
            <span aria-hidden />
            <span aria-hidden />
          </button>
        </div>
        <span
          className={`sync sync--${state}`}
          title="Background profile sync"
          aria-hidden
        />
      </header>

      <main id="main">
        <section className="hero shell">
          <div className="hero-grid">
            <div className="hero-content">
              <h1>
                {site.hero.before}
                <em>{site.hero.emphasis}</em>
                {site.hero.after}
              </h1>
              <p className="hero-lead">{intro}</p>
              <div className="hero-cta-row">
                <a className="btn btn-dark" href={site.heroCta.primary.href}>
                  {site.heroCta.primary.label}
                </a>
                <a className="btn btn-outline" href={site.heroCta.secondary.href}>
                  {site.heroCta.secondary.label}
                </a>
              </div>
              <a className="text-link" href={site.heroCta.tertiary.href}>
                {site.heroCta.tertiary.label}
              </a>
            </div>
            {picture && (
              <div className="hero-photo-wrap">
                <img src={picture} alt="" className="hero-photo" />
              </div>
            )}
          </div>
        </section>

        <section id="services" className="section shell">
          <div className="split">
            <div>
              <h2>{site.services.title}</h2>
              <p className="section-lead">{site.services.body}</p>
            </div>
            <ul className="checklist">
              {site.services.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <p className="section-cta-wrap">
            <a className="btn btn-dark" href={site.services.cta.href}>
              {site.services.cta.label}
            </a>
          </p>
        </section>

        <section className="stats band">
          <div className="shell">
            <p className="stats-headline">{site.stats.headline}</p>
            <p className="stats-sub">{site.stats.subhead}</p>
            <hr className="divider" />
            <ul className="stats-grid">
              {site.stats.items.map((item) => (
                <li key={item.label}>
                  <span className="stat-value">{item.value}</span>
                  <span className="stat-label">{item.label}</span>
                </li>
              ))}
            </ul>
            <hr className="divider" />
          </div>
        </section>

        <section className="section shell">
          <p className="clients-intro">{site.clients.title}</p>
          <ul className="client-logos">
            {site.clients.names.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
          <ul className="industry-tags">
            {site.clients.industries.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </section>

        <section id="ventures" className="section shell">
          <h2>{site.ventures.title}</h2>
          <p className="section-lead">{site.ventures.intro}</p>
          <ul className="venture-cards">
            {site.ventures.items.map((item) => (
              <li key={item.title}>
                <h3>
                  <a href={item.href}>{item.title}</a>
                </h3>
                <p>{item.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="about" className="section shell">
          <h2>About me</h2>
          <p className="section-lead">{intro}</p>
          <p className="about-meta">{site.location}</p>
        </section>

        <section className="section shell blog-section">
          <h2>{site.blog.title}</h2>
          <ul className="blog-grid">
            {site.blog.posts.map((post) => (
              <li key={post.title}>
                <article>
                  <a href={post.href} className="blog-thumb-link">
                    <img src={post.image} alt="" loading="lazy" />
                  </a>
                  <h3>
                    <a href={post.href}>{post.title}</a>
                  </h3>
                  <p>{post.excerpt}</p>
                </article>
              </li>
            ))}
          </ul>
        </section>

        <section className="newsletter band">
          <div className="shell newsletter-inner">
            <div>
              <h2>{site.newsletter.title}</h2>
              <p>{site.newsletter.body}</p>
            </div>
            <form className="newsletter-form" onSubmit={onNewsletterSubmit}>
              <label className="sr-only" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Email"
                autoComplete="email"
              />
              <button type="submit" className="btn btn-dark">
                Submit
              </button>
            </form>
            {newsletterNote && (
              <p className="newsletter-note" role="status">
                {newsletterNote}
              </p>
            )}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="shell footer-inner">
          <ul className="nav-social footer-social">
            {site.social.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                >
                  <SocialIcon label={item.label} />
                </a>
              </li>
            ))}
          </ul>
          <p>
            © {displayName || site.name} {new Date().getFullYear()}.{' '}
            {site.footer.tagline}
          </p>
          <ul className="footer-nav">
            {site.nav.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </div>
  )
}

export default App
