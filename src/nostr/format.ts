/** Small pure helpers for Nostr strings and dates. */

export function shortenId(value: string, head = 10, tail = 6): string {
  if (value.length <= head + tail + 1) return value
  return `${value.slice(0, head)}…${value.slice(-tail)}`
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
  const letters = parts.map((part) => part[0] ?? '').join('')
  return letters.toUpperCase() || '•'
}

export function relayHost(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return url.replace(/^wss?:\/\//, '')
  }
}

/** http(s) only. Adds https:// when the profile stored a bare domain. */
export function externalUrl(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    const url = new URL(withProtocol)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    if (!url.hostname.includes('.')) return null
    return url.toString()
  } catch {
    return null
  }
}

export function safeHttpUrl(value: string): string | null {
  try {
    const url = new URL(value)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.toString()
  } catch {
    return null
  }
}

export function websiteLabel(value: string): string {
  return value.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '')
}

export function isRealHref(href: string): boolean {
  const trimmed = href.trim()
  return trimmed !== '' && trimmed !== '#'
}

export function youtubeId(url: string): string | null {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0]
      return id && /^[\w-]{6,}$/.test(id) ? id : null
    }
    if (
      host === 'youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'music.youtube.com'
    ) {
      if (parsed.pathname === '/watch') {
        const id = parsed.searchParams.get('v')
        return id && /^[\w-]{6,}$/.test(id) ? id : null
      }
      const parts = parsed.pathname.split('/').filter(Boolean)
      if ((parts[0] === 'shorts' || parts[0] === 'embed') && parts[1]) {
        return /^[\w-]{6,}$/.test(parts[1]) ? parts[1] : null
      }
    }
    return null
  } catch {
    return null
  }
}

export function formatAbsolute(unixSeconds: number): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(unixSeconds * 1000))
}

export function formatRelative(unixSeconds: number, now = Date.now()): string {
  const delta = Math.round(now / 1000 - unixSeconds)
  if (!Number.isFinite(delta) || delta < 0 || delta >= 86400 * 7) {
    return formatAbsolute(unixSeconds)
  }
  if (delta < 45) return 'Just now'
  if (delta < 3600) {
    const minutes = Math.max(1, Math.round(delta / 60))
    return `${minutes}m ago`
  }
  if (delta < 86400) return `${Math.round(delta / 3600)}h ago`
  return `${Math.round(delta / 86400)}d ago`
}

export function toIso(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toISOString()
}

export function prettyUrl(url: string): string {
  try {
    const parsed = new URL(url)
    const path = parsed.pathname === '/' ? '' : parsed.pathname
    const shown = `${parsed.hostname.replace(/^www\./, '')}${path}`
    return shown.length > 48 ? `${shown.slice(0, 45)}…` : shown
  } catch {
    return url
  }
}

export function gatewayUrl(gateway: string, id: string): string {
  return `${gateway.replace(/\/$/, '')}/${id}`
}
