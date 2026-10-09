import type { Event } from 'nostr-tools/core'
import { decode } from 'nostr-tools/nip19'
import { SimplePool } from 'nostr-tools/pool'

export type NostrProfile = {
  name?: string
  display_name?: string
  about?: string
  picture?: string
  website?: string
  nip05?: string
  lud16?: string
}

export function npubToHex(npubOrHex: string): string | null {
  const trimmed = npubOrHex.trim()
  if (!trimmed) return null
  if (/^[a-f0-9]{64}$/i.test(trimmed)) return trimmed.toLowerCase()
  try {
    const decoded = decode(trimmed)
    if (decoded.type === 'npub') return decoded.data
  } catch {
    return null
  }
  return null
}

function parseProfile(event: Event): NostrProfile | null {
  try {
    return JSON.parse(event.content) as NostrProfile
  } catch {
    return null
  }
}

export async function fetchProfile(
  relays: readonly string[],
  authorHex: string,
  signal?: AbortSignal,
): Promise<{ profile: NostrProfile | null; relayCount: number }> {
  const relayUrls = [...relays]
  const pool = new SimplePool()
  const onAbort = () => pool.close(relayUrls)

  if (signal) {
    if (signal.aborted) {
      pool.close(relayUrls)
      return { profile: null, relayCount: relayUrls.length }
    }
    signal.addEventListener('abort', onAbort, { once: true })
  }

  try {
    const event = await pool.get(relayUrls, {
      kinds: [0],
      authors: [authorHex],
      limit: 1,
    })
    return {
      profile: event ? parseProfile(event) : null,
      relayCount: relayUrls.length,
    }
  } finally {
    signal?.removeEventListener('abort', onAbort)
    pool.close(relayUrls)
  }
}
