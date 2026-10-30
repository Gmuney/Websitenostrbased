import { useCallback, useEffect, useState } from 'react'
import { isNip05, isValid } from 'nostr-tools/nip05'
import { npubEncode } from 'nostr-tools/nip19'
import { site } from '../config/site'
import type { ArticleItem, NoteItem } from '../nostr/content'
import { loadAuthor } from '../nostr/load'
import { npubToHex, type NostrProfile } from '../nostr/profile'

export type NostrSyncState = 'idle' | 'loading' | 'ready' | 'empty' | 'error'

export type Nip05Status = 'absent' | 'checking' | 'valid' | 'mismatch' | 'unverified'

function textField(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function httpField(value: unknown): string | null {
  const raw = textField(value)
  if (!raw) return null
  try {
    const url = new URL(raw)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.toString()
  } catch {
    return null
  }
}

function canonicalNpub(raw: string): string | null {
  const hex = npubToHex(raw)
  if (!hex) return null
  try {
    return npubEncode(hex)
  } catch {
    return null
  }
}

/**
 * Loads the configured npub once: profile, recent notes, and NIP-23 articles.
 * Pass `attempt` changes via `retry` to ask the relays again.
 */
export function useNostrProfile() {
  const authorHex = npubToHex(site.npub)
  const configured = site.npub.trim().length > 0

  const [loaded, setLoaded] = useState<{
    attempt: number
    profile: NostrProfile | null
    notes: NoteItem[]
    articles: ArticleItem[]
    outcome: 'ready' | 'empty' | 'error'
    error: string | null
  } | null>(null)
  const [nip05Check, setNip05Check] = useState<{
    value: string
    status: Exclude<Nip05Status, 'absent' | 'checking'>
  } | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!configured || !authorHex) return

    const controller = new AbortController()
    loadAuthor(
      site.relays,
      authorHex,
      {
        notes: site.notesLimit,
        articles: site.articlesLimit,
        timeoutMs: site.relayTimeoutMs,
      },
      controller.signal,
    )
      .then((result) => {
        if (controller.signal.aborted) return
        const any =
          result.profile !== null ||
          result.notes.length > 0 ||
          result.articles.length > 0
        setLoaded({
          attempt,
          profile: result.profile,
          notes: result.notes,
          articles: result.articles,
          outcome: any ? 'ready' : 'empty',
          error: null,
        })
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        console.error(err)
        setLoaded({
          attempt,
          profile: null,
          notes: [],
          articles: [],
          outcome: 'error',
          error: 'The relays could not be reached. Check the connection and try again.',
        })
      })

    return () => controller.abort()
  }, [attempt, authorHex, configured])

  const profile = loaded?.profile ?? null
  const nip05Value = textField(profile?.nip05)

  useEffect(() => {
    if (!nip05Value || !authorHex || !isNip05(nip05Value)) return
    let cancelled = false
    isValid(authorHex, nip05Value)
      .then((ok) => {
        if (!cancelled) {
          setNip05Check({ value: nip05Value, status: ok ? 'valid' : 'mismatch' })
        }
      })
      .catch(() => {
        if (!cancelled) setNip05Check({ value: nip05Value, status: 'unverified' })
      })
    return () => {
      cancelled = true
    }
  }, [authorHex, nip05Value])

  const pending = Boolean(configured && authorHex && loaded?.attempt !== attempt)
  const invalidNpub = configured && !authorHex
  const state: NostrSyncState = !configured
    ? 'idle'
    : invalidNpub
      ? 'error'
      : pending
        ? 'loading'
        : (loaded?.outcome ?? 'loading')
  const error = invalidNpub
    ? 'The npub in src/config/site.ts could not be read. Use an npub1… key or 64 hex characters.'
    : (loaded?.error ?? null)
  const notes = pending ? [] : (loaded?.notes ?? [])
  const articles = pending ? [] : (loaded?.articles ?? [])

  let nip05Status: Nip05Status = 'absent'
  if (nip05Value && authorHex) {
    if (!isNip05(nip05Value)) nip05Status = 'mismatch'
    else if (nip05Check?.value === nip05Value) nip05Status = nip05Check.status
    else nip05Status = 'checking'
  }

  const retry = useCallback(() => setAttempt((value) => value + 1), [])

  const displayName =
    textField(profile?.display_name) || textField(profile?.name) || site.name
  const about = textField(profile?.about) || site.tagline

  return {
    displayName,
    about,
    picture: httpField(profile?.picture),
    banner: httpField(profile?.banner),
    website: textField(profile?.website),
    nip05: textField(profile?.nip05),
    lud16: textField(profile?.lud16),
    nip05Status,
    notes,
    articles,
    state,
    error,
    npub: canonicalNpub(site.npub),
    hasNpub: Boolean(authorHex),
    retry,
  }
}
