import type { Event } from 'nostr-tools/core'
import { noteEncode } from 'nostr-tools/nip19'
import { safeHttpUrl } from './format'

export type NoteMedia = {
  url: string
  mime?: string
}

export type NoteItem = {
  id: string
  content: string
  createdAt: number
  /** bech32 note1 id, for gateway links */
  noteId: string
  media: NoteMedia[]
  emoji: string[][]
}

export type ArticleItem = {
  id: string
  slug: string
  title: string
  summary: string
  image?: string
  publishedAt: number
  content: string
}

function tagValue(event: Event, name: string): string | undefined {
  const value = event.tags.find((tag) => tag[0] === name)?.[1]
  return value?.trim() || undefined
}

/**
 * A kind-1 with an `e` tag is a reply, except NIP-10 `mention` markers.
 * Untagged legacy `e` tags are treated as replies so the homepage stays
 * top-level posts. Quote posts use `q` tags and are kept.
 */
export function isReply(event: Event): boolean {
  return event.tags.some((tag) => {
    if (tag[0] !== 'e') return false
    return tag[3] !== 'mention'
  })
}

function imetaMedia(event: Event): NoteMedia[] {
  const media: NoteMedia[] = []
  for (const tag of event.tags) {
    if (tag[0] !== 'imeta') continue
    let url = ''
    let mime: string | undefined
    for (const part of tag.slice(1)) {
      const space = part.indexOf(' ')
      if (space === -1) continue
      const key = part.slice(0, space)
      const value = part.slice(space + 1).trim()
      if (key === 'url') url = value
      if (key === 'm' && value) mime = value
    }
    const safe = safeHttpUrl(url)
    if (safe) media.push({ url: safe, mime })
  }
  return media
}

function emojiTags(event: Event): string[][] {
  return event.tags.filter(
    (tag) => tag[0] === 'emoji' && tag[1] && safeHttpUrl(tag[2] ?? ''),
  )
}

export function selectNotes(events: readonly Event[], limit: number): NoteItem[] {
  const byId = new Map<string, Event>()
  for (const event of events) {
    if (event.kind !== 1 || !event.id) continue
    byId.set(event.id, event)
  }

  const notes: NoteItem[] = []
  for (const event of byId.values()) {
    if (isReply(event)) continue
    const content = event.content.replaceAll('\0', '').trim()
    const media = imetaMedia(event).filter((item) => !content.includes(item.url))
    if (!content && media.length === 0) continue
    let noteId: string
    try {
      noteId = noteEncode(event.id)
    } catch {
      continue
    }
    notes.push({
      id: event.id,
      content,
      createdAt: event.created_at,
      noteId,
      media,
      emoji: emojiTags(event),
    })
  }

  notes.sort((a, b) => b.createdAt - a.createdAt || (a.id < b.id ? 1 : -1))
  return notes.slice(0, Math.max(0, limit))
}

function articleTitle(event: Event): string {
  const titled = tagValue(event, 'title')
  if (titled) return titled
  const heading = /^#\s+(.+)$/m.exec(event.content)
  return heading?.[1]?.trim() || 'Untitled'
}

function articleSummary(event: Event, title: string): string {
  const tagged = tagValue(event, 'summary')
  const source = tagged || event.content
  const plain = source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/[#>*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  const withoutTitle =
    plain.toLowerCase() === title.toLowerCase() ? '' : plain
  if (withoutTitle.length <= 200) return withoutTitle
  const cut = withoutTitle.slice(0, 197)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim()}…`
}

function articleImage(event: Event): string | undefined {
  const tagged = tagValue(event, 'image')
  if (tagged) {
    const safe = safeHttpUrl(tagged)
    if (safe) return safe
  }
  const match = /!\[[^\]]*]\((https?:\/\/[^)\s]+)\)/.exec(event.content)
  return match?.[1] ? safeHttpUrl(match[1]) ?? undefined : undefined
}

function publishedAt(event: Event): number {
  const raw = tagValue(event, 'published_at')
  const parsed = raw ? Number(raw) : NaN
  if (Number.isFinite(parsed) && parsed > 1_000_000_000 && parsed < 4_000_000_000) {
    return parsed
  }
  return event.created_at
}

export function selectArticles(events: readonly Event[], limit: number): ArticleItem[] {
  const newestBySlug = new Map<string, Event>()
  for (const event of events) {
    if (event.kind !== 30023 || !event.id) continue
    const slug = tagValue(event, 'd') || event.id
    const current = newestBySlug.get(slug)
    if (!current || event.created_at >= current.created_at) {
      newestBySlug.set(slug, event)
    }
  }

  const articles: ArticleItem[] = []
  for (const [slug, event] of newestBySlug) {
    const title = articleTitle(event)
    const content = event.content.replaceAll('\0', '').trim()
    if (title === 'Untitled' && !content) continue
    articles.push({
      id: event.id,
      slug,
      title,
      summary: articleSummary(event, title),
      image: articleImage(event),
      publishedAt: publishedAt(event),
      content,
    })
  }

  articles.sort(
    (a, b) => b.publishedAt - a.publishedAt || (a.id < b.id ? 1 : -1),
  )
  return articles.slice(0, Math.max(0, limit))
}
