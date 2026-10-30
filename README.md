# Gabriel Salinas

Personal site for Gabriel Salinas. Vite, React, and TypeScript. Profile, notes, and long-form posts load live from Nostr.

## Quick start

```bash
npm install
npm run dev
```

## Personalize

Edit [`src/config/site.ts`](src/config/site.ts). Comments in that file mark every placeholder.

- `name`, `tagline`, `hero`, `services`, and `social` are the static page.
- `npub` is the Nostr key (npub or hex). Clear it to turn live content off.
- `relays` is the list the browser asks for a profile (kind 0), notes (kind 1), and long-form posts (NIP-23, kind 30023).
- `notesLimit` and `articlesLimit` control how many of each to show.
- When a profile field exists on the relays, it replaces the static fallback: display name, photo, banner, about, website, NIP-05, and lightning address (`lud16`).
- Kind 30023 posts replace the draft cards in `blog.posts`. Until one is published, those drafts stay on the page.
- `stats` and `clients` stay hidden until you set `enabled: true`. The numbers and client names in the file are not filled in.
- `email` and `newsletter.formAction` need real values before the contact and signup form do anything useful.

The document title in the browser follows the Nostr display name when the profile loads. Crawlers still read [`index.html`](index.html). If you change `name` or `tagline`, update the `<title>`, description, and Open Graph tags there too. Once the site has a domain, point `og:url`, `og:image`, and `twitter:image` at absolute `https://` URLs. The share image is [`public/og.png`](public/og.png).

## Deploy

This is a static build. No server is required.

```bash
npm run build
```

Upload the `dist/` folder to any static host (Netlify, Cloudflare Pages, GitHub Pages, S3, or similar). The site uses root-absolute paths such as `/favicon.svg`. If you host it under a subpath, set `base` in `vite.config.ts` to that path and build again.

SPA redirects are unnecessary: there is one `index.html`, and in-page links are hashes.
