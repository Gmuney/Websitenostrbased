import { useCallback, useEffect, useState, type FormEvent } from 'react'

const copyrightYear = new Date().getFullYear()
import { ArticleDialog } from './components/ArticleDialog'
import { CopyButton } from './components/CopyButton'
import { ExternalLink } from './components/ExternalLink'
import { RichContent } from './components/RichContent'
import { SocialIcon } from './components/SocialIcon'
import { site } from './config/site'
import { useNostrProfile, type NostrSyncState } from './hooks/useNostrProfile'
import type { NoteItem } from './nostr/content'
import {
  externalUrl,
  formatAbsolute,
  formatRelative,
  gatewayUrl,
  initials,
  isRealHref,
  relayHost,
  shortenId,
  toIso,
  websiteLabel,
} from './nostr/format'
import './App.css'

function statusLabel(state: NostrSyncState): string {
  switch (state) {
    case 'loading':
      return 'Syncing Nostr…'
    case 'ready':
      return 'Live from Nostr'
    case 'empty':
      return 'No events on these relays'
    case 'error':
      return 'Relays unreachable'
    default:
      return 'Add an npub to load Nostr'
  }
}

function SocialLinks({
  className,
  npub,
}: {
  className?: string
  npub: string | null
}) {
  const items = [
    ...site.social,
    ...(npub
      ? [{ label: 'Nostr', href: gatewayUrl(site.nostrGateway, npub) }]
      : []),
  ]
  return (
    <ul className={className}>
      {items.map((item) => (
        <li key={item.href}>
          <a
            href={item.href}
            target="_blank"
            rel="me noreferrer"
            aria-label={`${item.label} (opens in a new tab)`}
          >
            <SocialIcon label={item.label} />
          </a>
        </li>
      ))}
    </ul>
  )
}

function Portrait({
  src,
  name,
  loading,
}: {
  src: string | null
  name: string
  loading: boolean
}) {
  const [ok, setOk] = useState(true)

  if (src && ok) {
    return (
      <img
        className="portrait"
        src={src}
        alt={`${name}, profile photo`}
        referrerPolicy="no-referrer"
        onError={() => setOk(false)}
      />
    )
  }
  if (loading) return <div className="portrait portrait-skeleton" aria-hidden />
  return (
    <div className="portrait portrait-fallback" aria-hidden>
      {initials(name)}
    </div>
  )
}

function Banner({ src }: { src: string }) {
  const [ok, setOk] = useState(true)
  if (!ok) return null
  return (
    <img
      className="hero-banner"
      src={src}
      alt=""
      referrerPolicy="no-referrer"
      onError={() => setOk(false)}
    />
  )
}

function NoteCard({ note }: { note: NoteItem }) {
  const [expanded, setExpanded] = useState(false)
  const long = note.content.length > 280
  return (
    <article className="note-card">
      <header className="note-meta">
        <h3>
          <time dateTime={toIso(note.createdAt)} title={formatAbsolute(note.createdAt)}>
            {formatRelative(note.createdAt)}
          </time>
        </h3>
        <ExternalLink href={gatewayUrl(site.nostrGateway, note.noteId)}>Open</ExternalLink>
      </header>
      <div className={long && !expanded ? 'note-body is-clamped' : 'note-body'}>
        <RichContent content={note.content} media={note.media} emoji={note.emoji} />
      </div>
      {long && (
        <button
          type="button"
          className="text-button"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </article>
  )
}

function Skeletons() {
  return (
    <div className="stack" aria-hidden>
      <div className="skeleton" />
      <div className="skeleton" />
      <div className="skeleton short" />
    </div>
  )
}

function App() {
  const {
    displayName,
    about,
    picture,
    banner,
    website,
    nip05,
    lud16,
    nip05Status,
    notes,
    articles,
    state,
    error,
    npub,
    hasNpub,
    retry,
  } = useNostrProfile()
  const [menuOpen, setMenuOpen] = useState(false)
  const [newsletterNote, setNewsletterNote] = useState<string | null>(null)
  const [slug, setSlug] = useState<string | null>(null)

  useEffect(() => {
    document.title = displayName
  }, [displayName])

  useEffect(() => {
    const read = () => {
      const match = /^#writing\/([^/?#]+)/.exec(window.location.hash)
      setSlug(match?.[1] ? decodeURIComponent(match[1]) : null)
    }
    read()
    window.addEventListener('hashchange', read)
    return () => window.removeEventListener('hashchange', read)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const closeArticle = useCallback(() => {
    if (window.location.hash.startsWith('#writing/')) {
      window.location.hash = 'writing'
    }
  }, [])

  const openArticle = slug
    ? (articles.find((article) => article.slug === slug) ?? null)
    : null
  const paragraphs = about
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean)
  const heroAbout = paragraphs[0] ?? ''
  const websiteHref = externalUrl(website)
  const lightning = /^[^\s@]+@[^\s@]+$/.test(lud16) ? lud16 : ''
  const nip05Domain = nip05.includes('@') ? (nip05.split('@').pop() ?? '') : ''
  const nip05Href = nip05Domain ? externalUrl(nip05Domain) : null
  const loading = state === 'loading'

  function onNewsletterSubmit(event: FormEvent<HTMLFormElement>) {
    if (site.newsletter.formAction) return
    event.preventDefault()
    setNewsletterNote(
      'This signup form is not connected yet. Use the contact email instead.',
    )
  }

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <>
      <div className="page" id="top" inert={openArticle ? true : undefined}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>

        <header className="site-header">
          <div className="shell header-inner">
            <a className="brand" href="#top" onClick={closeMenu}>
              <span className="brand-mark" aria-hidden>
                {initials(site.name).slice(0, 1)}
              </span>
              <span>{site.name}</span>
            </a>

            <nav
              id="mobile-nav"
              className={menuOpen ? 'primary-nav is-open' : 'primary-nav'}
              aria-label="Primary"
            >
              <ul className="nav-list">
                {site.nav.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} onClick={closeMenu}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
              <SocialLinks className="nav-social mobile-social" npub={npub} />
            </nav>

            <div className="header-tools">
              <SocialLinks className="nav-social header-social" npub={npub} />
              <button
                type="button"
                className="nav-toggle"
                aria-expanded={menuOpen}
                aria-controls="mobile-nav"
                onClick={() => setMenuOpen((open) => !open)}
              >
                {menuOpen ? 'Close' : 'Menu'}
              </button>
            </div>
          </div>
        </header>

        <main id="main">
          <section className="hero shell" aria-labelledby="hero-title">
            {banner && <Banner src={banner} />}
            <div className="hero-grid">
              <div>
                <p className="status-line">
                  <span className={`status-dot status-dot--${state}`} aria-hidden />
                  <span role="status">{statusLabel(state)}</span>
                </p>
                {displayName !== site.name && <p className="aka">{site.name}</p>}
                <h1 id="hero-title">{displayName}</h1>
                <p className="hero-role">
                  {site.hero.before}
                  <em>{site.hero.emphasis}</em>
                  {site.hero.after}
                </p>
                {heroAbout && <p className="hero-lead">{heroAbout}</p>}
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
              <Portrait
                key={picture ?? 'fallback'}
                src={picture}
                name={displayName}
                loading={loading && !picture}
              />
            </div>
          </section>

          <section className="shell identity-wrap" aria-labelledby="identity-title">
            <h2 id="identity-title" className="sr-only">
              Nostr identity
            </h2>
            {!hasNpub ? (
              <p className="state-card">
                Add an npub in <code>src/config/site.ts</code> to show a live profile, lightning
                address, and NIP-05.
              </p>
            ) : (
              <dl className="identity-grid">
                <div>
                  <dt>npub</dt>
                  <dd translate="no">
                    <span className="mono" aria-hidden>
                      {npub ? shortenId(npub) : '—'}
                    </span>
                    <span className="sr-only">{npub}</span>
                    {npub && <CopyButton value={npub} announce="npub" />}
                  </dd>
                </div>
                <div>
                  <dt>NIP-05</dt>
                  <dd>
                    {nip05 ? (
                      <>
                        {nip05Href ? (
                          <ExternalLink href={nip05Href}>{nip05}</ExternalLink>
                        ) : (
                          <span translate="no">{nip05}</span>
                        )}
                        {nip05Status === 'valid' && <span className="badge badge-good">Verified</span>}
                        {nip05Status === 'checking' && <span className="badge">Checking</span>}
                        {nip05Status === 'mismatch' && (
                          <span className="badge badge-warn" title="This NIP-05 does not point at this npub.">
                            Mismatch
                          </span>
                        )}
                        {nip05Status === 'unverified' && (
                          <span className="badge" title="The browser could not check this identifier.">
                            Unverified
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="muted">
                        {loading ? 'Loading…' : 'Not on this profile'}
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Lightning</dt>
                  <dd>
                    {lightning ? (
                      <>
                        <a href={`lightning:${lightning}`} translate="no">
                          {lightning}
                        </a>
                        <CopyButton value={lightning} announce="lightning address" />
                      </>
                    ) : (
                      <span className="muted">
                        {loading ? 'Loading…' : 'Not on this profile'}
                      </span>
                    )}
                  </dd>
                </div>
                {websiteHref && (
                  <div>
                    <dt>Website</dt>
                    <dd>
                      <ExternalLink href={websiteHref}>{websiteLabel(website)}</ExternalLink>
                    </dd>
                  </div>
                )}
              </dl>
            )}
          </section>

          <section id="about" className="section shell">
            <p className="kicker">About</p>
            <h2>A bit of background</h2>
            {paragraphs.map((paragraph) => (
              <p key={paragraph} className="section-lead">
                {paragraph}
              </p>
            ))}
            <ul className="meta-list">
              {site.location && (
                <li>
                  <span>Based in</span> {site.location}
                </li>
              )}
              {websiteHref && (
                <li>
                  <span>Web</span>{' '}
                  <ExternalLink href={websiteHref}>{websiteLabel(website)}</ExternalLink>
                </li>
              )}
            </ul>
          </section>

          <section id="work" className="section shell">
            <p className="kicker">Work</p>
            <div className="split">
              <div>
                <h2>{site.services.title}</h2>
                <p className="section-lead">{site.services.body}</p>
                <p className="section-cta-wrap">
                  <a className="btn btn-dark" href={site.services.cta.href}>
                    {site.services.cta.label}
                  </a>
                </p>
              </div>
              <ul className="checklist">
                {site.services.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          <section id="ventures" className="section shell">
            <h2>{site.ventures.title}</h2>
            <p className="section-lead">{site.ventures.intro}</p>
            <ul className="venture-grid">
              {site.ventures.items.map((item) => (
                <li key={item.title}>
                  {isRealHref(item.href) ? (
                    <a
                      className="venture-card"
                      href={item.href}
                      {...(/^https?:\/\//i.test(item.href)
                        ? { target: '_blank', rel: 'noreferrer' }
                        : {})}
                    >
                      <h3>{item.title}</h3>
                      <p>{item.body}</p>
                    </a>
                  ) : (
                    <div className="venture-card">
                      <h3>{item.title}</h3>
                      <p>{item.body}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {site.stats.enabled && (
            <section className="stats band" aria-label="Selected numbers">
              <div className="shell">
                <p className="stats-headline">{site.stats.headline}</p>
                <p className="stats-sub">{site.stats.subhead}</p>
                <ul className="stats-grid">
                  {site.stats.items.map((item) => (
                    <li key={item.label}>
                      <span className="stat-value">{item.value}</span>
                      <span className="stat-label">{item.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {site.clients.enabled && (
            <section className="section shell" aria-labelledby="clients-title">
              <h2 id="clients-title" className="clients-intro">
                {site.clients.title}
              </h2>
              <ul className="client-names">
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
          )}

          <section id="notes" className="section shell">
            <p className="kicker">Notes · kind 1</p>
            <h2>Recent notes</h2>
            <p className="section-lead">
              Latest top-level posts from the relays in the config. Replies stay in the thread
              on Nostr.
            </p>
            {loading && notes.length === 0 ? (
              <Skeletons />
            ) : notes.length > 0 ? (
              <div className="stack">
                {notes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            ) : (
              <div className="state-card">
                <h3>{state === 'error' ? 'Notes are unavailable' : 'No notes yet'}</h3>
                <p>
                  {state === 'error'
                    ? error
                    : state === 'idle'
                      ? 'Add an npub in src/config/site.ts and your kind-1 posts will show up here.'
                      : 'Nothing recent came back from these relays. A new note can take a minute to land.'}
                </p>
                {state !== 'idle' && (
                  <button type="button" className="btn btn-outline" onClick={retry}>
                    Try again
                  </button>
                )}
              </div>
            )}
          </section>

          <section id="writing" className="section shell">
            <p className="kicker">Writing · NIP-23</p>
            <h2>{site.blog.title}</h2>
            {loading && articles.length === 0 ? (
              <Skeletons />
            ) : articles.length > 0 ? (
              <>
                <p className="section-lead">Long-form posts published from this npub.</p>
                <ul className="article-grid">
                  {articles.map((article) => {
                    const href = `#writing/${encodeURIComponent(article.slug)}`
                    return (
                      <li key={article.id}>
                        <article className="article-card">
                          {article.image && (
                            <a href={href} className="article-thumb">
                              <img src={article.image} alt="" loading="lazy" />
                            </a>
                          )}
                          <p className="article-date">
                            <time dateTime={toIso(article.publishedAt)}>
                              {formatAbsolute(article.publishedAt)}
                            </time>
                          </p>
                          <h3>
                            <a href={href}>{article.title}</a>
                          </h3>
                          {article.summary && <p>{article.summary}</p>}
                          <a className="text-link" href={href}>
                            Read
                          </a>
                        </article>
                      </li>
                    )
                  })}
                </ul>
              </>
            ) : (
              <>
                <p className="section-lead">{site.blog.fallbackNote}</p>
                {site.blog.posts.length === 0 ? (
                  <p className="state-card">
                    No long-form posts yet. Publish a NIP-23 article and it will replace this
                    space.
                  </p>
                ) : (
                  <ul className="article-grid">
                    {site.blog.posts.map((post) => (
                      <li key={post.title}>
                        <article className="article-card">
                          {post.image &&
                            (isRealHref(post.href) ? (
                              <a href={post.href} className="article-thumb">
                                <img src={post.image} alt="" loading="lazy" />
                              </a>
                            ) : (
                              <img src={post.image} alt="" loading="lazy" />
                            ))}
                          <h3>
                            {isRealHref(post.href) ? (
                              <a href={post.href}>{post.title}</a>
                            ) : (
                              post.title
                            )}
                          </h3>
                          <p>{post.excerpt}</p>
                        </article>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </section>

          <section id="contact" className="section shell contact">
            <div>
              <p className="kicker">Contact</p>
              <h2>{site.contact.title}</h2>
              <p className="section-lead">{site.contact.body}</p>
              <p>
                <a className="btn btn-dark" href={`mailto:${site.email}`}>
                  {site.email}
                </a>
              </p>
              <ul className="contact-links">
                {site.social.map((item) => (
                  <li key={item.href}>
                    <ExternalLink href={item.href}>{item.label}</ExternalLink>
                  </li>
                ))}
                {npub && (
                  <li>
                    <ExternalLink href={gatewayUrl(site.nostrGateway, npub)}>Nostr</ExternalLink>
                  </li>
                )}
              </ul>
            </div>
            <div className="newsletter">
              <h3>{site.newsletter.title}</h3>
              <p>{site.newsletter.body}</p>
              <form
                className="newsletter-form"
                method="post"
                action={site.newsletter.formAction || undefined}
                onSubmit={onNewsletterSubmit}
              >
                <label className="sr-only" htmlFor="newsletter-email">
                  Email
                </label>
                <input
                  id="newsletter-email"
                  name="email"
                  type="email"
                  required
                  placeholder="Email"
                  autoComplete="email"
                  aria-describedby={newsletterNote ? 'newsletter-note' : undefined}
                />
                <button type="submit" className="btn btn-dark">
                  Submit
                </button>
              </form>
              {newsletterNote && (
                <p id="newsletter-note" className="newsletter-note" role="status">
                  {newsletterNote}
                </p>
              )}
            </div>
          </section>
        </main>

        <footer className="site-footer">
          <div className="shell footer-inner">
            <SocialLinks className="nav-social" npub={npub} />
            <p>
              © {displayName} {copyrightYear}. {site.footer.tagline}
            </p>
            <ul className="footer-nav">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
            <p className="footer-relays">
              Relays: {site.relays.map((url) => relayHost(url)).join(', ')}
            </p>
          </div>
        </footer>
      </div>
      <ArticleDialog article={openArticle} onClose={closeArticle} />
    </>
  )
}

export default App
