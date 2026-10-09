/** Site content — edit to match your brand and offers. */
export const site = {
  name: 'Gabriel Salinas',
  tagline:
    'I’m Gabriel Salinas — a digital creator, community organizer, entrepreneur, and creative developer.',
  email: 'hello@example.com',
  location: 'Your City, State',
  npub: '' as string,
  relays: [
    'wss://relay.damus.io',
    'wss://nos.lol',
    'wss://relay.nostr.band',
  ],
  nav: [
    { label: 'Projects', href: '#ventures' },
    { label: 'About Me', href: '#about' },
    { label: 'Services', href: '#services' },
  ],
  social: [
    { label: 'X', href: 'https://x.com/Money2BMrdredBy' },
    { label: 'Instagram', href: 'https://www.instagram.com/gabeorange_' },
    { label: 'Facebook', href: 'https://www.facebook.com/share/1A48b4xecx/' },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/gabe-s-8262401b0',
    },
  ],
  hero: {
    before: '',
    emphasis: 'Creative Developer and entrepreneur',
    after: ' driving innovation in San Antonio',
  },
  heroCta: {
    primary: { label: 'View My Work', href: '#ventures' },
    secondary: { label: 'About Me', href: '#about' },
    tertiary: { label: 'Work with me', href: '#services' },
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
    cta: { label: 'Get a free consultation', href: 'mailto:hello@example.com?subject=Consultation' },
  },
  stats: {
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
        title: 'Venture one',
        body: 'Short description of what it is and who it serves.',
        href: '#',
      },
      {
        title: 'Venture two',
        body: 'Another line of business, product, or media property.',
        href: '#',
      },
    ],
  },
  blog: {
    title: 'Latest writing',
    posts: [
      {
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
          'Three posts show well on the homepage; add more in config and paginate later if you need it.',
        href: '#',
        image:
          'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
      },
    ],
  },
  newsletter: {
    title: 'Stay in touch',
    body: 'Get new posts and updates in your inbox.',
    /** Replace with your form endpoint (Buttondown, Mailchimp, etc.) when ready */
    formAction: '',
  },
  footer: {
    tagline: 'Made with care in your hometown.',
  },
} as const
