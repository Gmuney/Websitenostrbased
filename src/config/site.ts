/**
 * Personal site content.
 *
 * This is the file to edit. The page reads everything below, then fills in
 * live Nostr data (name, photo, banner, about, website, NIP-05, lightning
 * address, kind-1 notes, and NIP-23 long-form) from `npub` when it is set.
 * Static copy is the fallback when a relay has nothing for that field.
 *
 * Search this file for "PLACEHOLDER" before sharing the site widely.
 *
 * The <title> and social preview text in `index.html` are separate because
 * link-unfurling bots do not run the app. Update those when you change
 * `name` or `tagline`, and set absolute og:image / og:url once you have a domain.
 */

export type LinkItem = {
  label: string
  href: string
}

export type SiteConfig = {
  name: string
  tagline: string
  /** Public contact address. Also used for the consultation mailto. */
  email: string
  location: string
  /**
   * Nostr public key. Accepts an npub1… string or a 64-character hex pubkey.
   * Leave blank to hide live profile, notes, and long-form.
   */
  npub: string
  /**
   * Relays queried for the profile (kind 0), notes (kind 1), and long-form
   * (kind 30023). Order does not matter. A slow relay can delay the first
   * live paint up to `relayTimeoutMs`.
   */
  relays: string[]
  /** How long to wait for each relay query, in milliseconds. */
  relayTimeoutMs: number
  /** How many recent top-level notes to show. Replies are skipped. */
  notesLimit: number
  /** How many NIP-23 long-form posts to show. */
  articlesLimit: number
  /**
   * Public web gateway used for "open on Nostr" links.
   * No trailing path. Example: https://njump.me
   */
  nostrGateway: string
  nav: LinkItem[]
  social: LinkItem[]
  hero: {
    before: string
    emphasis: string
    after: string
  }
  heroCta: {
    primary: LinkItem
    secondary: LinkItem
    tertiary: LinkItem
  }
  services: {
    title: string
    body: string
    bullets: string[]
    cta: LinkItem
  }
  /**
   * Optional proof points. Hidden while `enabled` is false.
   * PLACEHOLDER figures below came with the template — replace them
   * before turning the band on. Do not publish numbers you cannot stand behind.
   */
  stats: {
    enabled: boolean
    headline: string
    subhead: string
    items: { value: string; label: string }[]
  }
  /**
   * Optional client strip. Hidden while `enabled` is false.
   * PLACEHOLDER names below are not real clients.
   */
  clients: {
    enabled: boolean
    title: string
    names: string[]
    industries: string[]
  }
  ventures: {
    title: string
    intro: string
    /** Use a real https URL or an on-page hash. "#" renders as plain text. */
    items: { title: string; body: string; href: string }[]
  }
  blog: {
    title: string
    /**
     * Shown above the cards only when your npub has no NIP-23 posts.
     * Publish a kind 30023 article and these cards are replaced.
     */
    fallbackNote: string
    posts: { title: string; excerpt: string; href: string; image: string }[]
  }
  newsletter: {
    title: string
    body: string
    /**
     * PLACEHOLDER. Form endpoint for Buttondown, Mailchimp, or similar.
     * Leave "" until you have one — the form will not pretend to subscribe anyone.
     */
    formAction: string
  }
  contact: {
    title: string
    body: string
  }
  footer: {
    tagline: string
  }
}

/** PLACEHOLDER — replace with a real inbox before sending people here. */
const email = 'hello@example.com'

export const site: SiteConfig = {
  name: 'Gabriel Salinas',
  tagline:
    'I’m Gabriel Salinas — a digital creator, community organizer, entrepreneur, and creative developer.',
  email,
  /**
   * Shown in About. The hero line below already says San Antonio.
   * Change both together if you want a different place name.
   */
  location: 'San Antonio',
  /**
   * Public "Gabe Orange" key. It matches the Instagram handle in `social`
   * (gabeorange_). Swap it if you want a different identity on this page.
   */
  npub: 'npub1jz990pjzqssak7jx6gmjdmt086j8r7255zkttrjvkadq9496j3aqvjlvk0',
  relays: [
    // Kind-0 directory. Fast place to read a profile.
    'wss://purplepag.es',
    // Relays that currently store this npub's notes.
    'wss://nostr.mom',
    'wss://relay.nostr.net',
    'wss://relay.fountain.fm',
    // Common public relays, in case publishing moves.
    'wss://nos.lol',
  ],
  relayTimeoutMs: 7000,
  notesLimit: 8,
  articlesLimit: 6,
  nostrGateway: 'https://njump.me',
  nav: [
    { label: 'About', href: '#about' },
    { label: 'Work', href: '#work' },
    { label: 'Notes', href: '#notes' },
    { label: 'Writing', href: '#writing' },
    { label: 'Contact', href: '#contact' },
  ],
  social: [
    { label: 'X', href: 'https://x.com/Money2BMrdredBy' },
    { label: 'Instagram', href: 'https://www.instagram.com/gabeorange_' },
    { label: 'Facebook', href: 'https://www.facebook.com/share/1A48b4xecx/' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/gabe-s-8262401b0' },
    { label: 'GitHub', href: 'https://github.com/Gmuney' },
  ],
  hero: {
    before: '',
    emphasis: 'Creative Developer and entrepreneur',
    after: ' driving innovation in San Antonio',
  },
  heroCta: {
    primary: { label: 'View my work', href: '#work' },
    secondary: { label: 'About me', href: '#about' },
    tertiary: { label: 'Work with me', href: '#contact' },
  },
  services: {
    title: 'Transforming ideas into digital reality',
    body: 'I work with brands, creators, and teams looking to scale their digital presence through custom technology and engaging community experiences. From building automation tools and scalable software to crafting effective short-form content strategies, I deliver tailored solutions that amplify your impact.',
    bullets: [
      'Custom software development and automation scripts',
      'Short-form content strategy for social media',
      'Community building and event organization',
      'Bitcoin security and self-custody consulting',
    ],
    cta: {
      label: 'Get a free consultation',
      href: `mailto:${email}?subject=Consultation`,
    },
  },
  stats: {
    enabled: false,
    headline: 'Trusted partners since day one',
    subhead: 'Startups, agencies, and growing brands.',
    items: [
      { value: '50+', label: 'Projects delivered' },
      { value: '$500K+', label: 'Revenue influenced' },
      { value: '25+', label: 'Partner relationships' },
      { value: '5+', label: 'Years building' },
    ],
  },
  clients: {
    enabled: false,
    title: 'Teams I’ve worked with include:',
    names: [
      'Client One',
      'Client Two',
      'Client Three',
      'Client Four',
      'Client Five',
      'Client Six',
    ],
    industries: [
      'Healthcare',
      'Real Estate',
      'SaaS',
      'E-commerce',
      'Legal',
      'Finance',
      'B2B',
      'Home Services',
    ],
  },
  ventures: {
    title: 'My ventures',
    intro: 'A snapshot of projects and brands I’m building or supporting.',
    items: [
      {
        // PLACEHOLDER — replace title, body, and href.
        title: 'Venture one',
        body: 'Short description of what it is and who it serves.',
        href: '#',
      },
      {
        // PLACEHOLDER — replace title, body, and href.
        title: 'Venture two',
        body: 'Another line of business, product, or media property.',
        href: '#',
      },
    ],
  },
  blog: {
    title: 'Writing',
    fallbackNote:
      'These cards are drafts from the config file. A long-form Nostr post (NIP-23) replaces them.',
    posts: [
      {
        // PLACEHOLDER — used only when no kind 30023 posts are found.
        title: 'Your first post title goes here',
        excerpt:
          'A compelling opening paragraph that draws readers in — swap this for your real intro when you publish.',
        href: '#',
        image:
          'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
      },
      {
        title: 'Another idea worth sharing',
        excerpt:
          'Use this grid for essays, updates, or case studies. Images and links are all configurable in site.ts.',
        href: '#',
        image:
          'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
      },
      {
        title: 'Thoughts on your niche',
        excerpt:
          'Three posts show well on the homepage; add more in config if you need them.',
        href: '#',
        image:
          'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
      },
    ],
  },
  newsletter: {
    title: 'Stay in touch',
    body: 'Get new posts and updates in your inbox.',
    formAction: '',
  },
  contact: {
    title: 'Contact',
    body: 'For a project, a consult, or a conversation, send a note.',
  },
  footer: {
    tagline: 'Profile, notes, and long-form posts load live from Nostr.',
  },
}
