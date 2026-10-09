import { useEffect, useState } from 'react'
import { site } from '../config/site'
import { fetchProfile, npubToHex, type NostrProfile } from '../nostr/profile'

export type NostrSyncState = 'idle' | 'loading' | 'live' | 'offline'

export function useNostrProfile() {
  const [profile, setProfile] = useState<NostrProfile | null>(null)
  const [state, setState] = useState<NostrSyncState>('idle')

  useEffect(() => {
    const author = npubToHex(site.npub)
    if (!author) {
      setState('idle')
      return
    }

    const controller = new AbortController()
    setState('loading')

    fetchProfile(site.relays, author, controller.signal)
      .then(({ profile: p }) => {
        if (controller.signal.aborted) return
        setProfile(p)
        setState(p ? 'live' : 'offline')
      })
      .catch(() => {
        if (!controller.signal.aborted) setState('offline')
      })

    return () => controller.abort()
  }, [])

  const displayName =
    profile?.display_name?.trim() ||
    profile?.name?.trim() ||
    site.name

  const about = profile?.about?.trim() || site.tagline
  const picture = profile?.picture?.trim() || null
  const website = profile?.website?.trim() || null
  const nip05 = profile?.nip05?.trim() || null

  return {
    displayName,
    about,
    picture,
    website,
    nip05,
    state,
    hasNpub: Boolean(npubToHex(site.npub)),
  }
}
