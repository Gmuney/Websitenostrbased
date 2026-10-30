import type { Event } from 'nostr-tools/core'
import { SimplePool } from 'nostr-tools/pool'
import { selectArticles, selectNotes, type ArticleItem, type NoteItem } from './content'
import { parseProfile, type NostrProfile } from './profile'

export type AuthorContent = {
  profile: NostrProfile | null
  notes: NoteItem[]
  articles: ArticleItem[]
}

const EMPTY: AuthorContent = { profile: null, notes: [], articles: [] }

/**
 * One pool, three filters: kind 0 (profile), kind 1 (notes), kind 30023
 * (NIP-23 long-form). `maxWait` caps how long a slow relay can hold the page.
 */
export async function loadAuthor(
  relays: readonly string[],
  authorHex: string,
  limits: { notes: number; articles: number; timeoutMs: number },
  signal?: AbortSignal,
): Promise<AuthorContent> {
  const urls = [...new Set(relays.map((url) => url.trim()).filter(Boolean))]
  if (urls.length === 0) {
    throw new Error('Add at least one relay in src/config/site.ts.')
  }
  if (signal?.aborted) return { ...EMPTY }

  const pool = new SimplePool()
  const maxWait = limits.timeoutMs
  const onAbort = () => pool.close(urls)
  signal?.addEventListener('abort', onAbort, { once: true })

  try {
    const noteLimit = Math.min(80, Math.max(limits.notes * 4, limits.notes))
    const articleLimit = Math.min(40, Math.max(limits.articles * 3, limits.articles))

    const profilePromise = pool.get(
      urls,
      { kinds: [0], authors: [authorHex] },
      { maxWait },
    )
    const notesPromise: Promise<Event[]> =
      limits.notes > 0
        ? pool.querySync(
            urls,
            { kinds: [1], authors: [authorHex], limit: noteLimit },
            { maxWait },
          )
        : Promise.resolve([])
    const articlesPromise: Promise<Event[]> =
      limits.articles > 0
        ? pool.querySync(
            urls,
            { kinds: [30023], authors: [authorHex], limit: articleLimit },
            { maxWait },
          )
        : Promise.resolve([])

    const [profileEvent, noteEvents, articleEvents] = await Promise.all([
      profilePromise,
      notesPromise,
      articlesPromise,
    ])

    if (signal?.aborted) return { ...EMPTY }

    return {
      profile: profileEvent ? parseProfile(profileEvent) : null,
      notes: selectNotes(noteEvents, limits.notes),
      articles: selectArticles(articleEvents, limits.articles),
    }
  } catch (error) {
    if (signal?.aborted) return { ...EMPTY }
    throw error
  } finally {
    signal?.removeEventListener('abort', onAbort)
    pool.close(urls)
  }
}
