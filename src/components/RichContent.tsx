import { useMemo, type ReactNode } from 'react'
import type { NostrEvent } from 'nostr-tools/core'
import {
  naddrEncode,
  noteEncode,
  npubEncode,
  type AddressPointer,
  type EventPointer,
  type ProfilePointer,
} from 'nostr-tools/nip19'
import { parse } from 'nostr-tools/nip27'
import { site } from '../config/site'
import type { NoteMedia } from '../nostr/content'
import { gatewayUrl, prettyUrl, safeHttpUrl, shortenId, youtubeId } from '../nostr/format'
import { ExternalLink } from './ExternalLink'

type Pointer = ProfilePointer | EventPointer | AddressPointer

function referenceAnchor(pointer: Pointer, key: number) {
  try {
    let href = ''
    let label = ''
    if ('identifier' in pointer && !('id' in pointer)) {
      href = gatewayUrl(
        site.nostrGateway,
        naddrEncode({
          identifier: pointer.identifier,
          pubkey: pointer.pubkey,
          kind: pointer.kind,
          relays: pointer.relays,
        }),
      )
      label = pointer.identifier || 'article'
    } else if ('id' in pointer) {
      const note = noteEncode(pointer.id)
      href = gatewayUrl(site.nostrGateway, note)
      label = shortenId(note)
    } else {
      const npub = npubEncode(pointer.pubkey)
      href = gatewayUrl(site.nostrGateway, npub)
      label = shortenId(npub)
    }
    return (
      <ExternalLink key={key} href={href} className="nostr-ref">
        {label}
      </ExternalLink>
    )
  } catch {
    return null
  }
}

function textWithBreaks(text: string, key: string) {
  const lines = text.split('\n')
  return lines.map((line, index) => (
    <span key={`${key}-${index}`}>
      {index > 0 && <br />}
      {line}
    </span>
  ))
}

function MediaBlock({ url, mime }: { url: string; mime?: string }) {
  const kind = mediaKind(url, mime)
  const youtube = youtubeId(url)
  if (youtube) {
    return (
      <ExternalLink href={url} className="yt-card">
        <img
          src={`https://i.ytimg.com/vi/${youtube}/hqdefault.jpg`}
          alt=""
          loading="lazy"
        />
        <span>Watch on YouTube</span>
      </ExternalLink>
    )
  }
  if (kind === 'image') {
    return (
      <img
        src={url}
        alt="Image attached to this note"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    )
  }
  if (kind === 'video') {
    const src = url.includes('#') ? url : `${url}#t=0.1`
    return <video controls playsInline preload="metadata" src={src} />
  }
  if (kind === 'audio') {
    return <audio controls preload="none" src={url} />
  }
  return (
    <ExternalLink href={url}>
      {prettyUrl(url)}
    </ExternalLink>
  )
}

function mediaKind(url: string, mime?: string): 'image' | 'video' | 'audio' | 'file' {
  if (mime?.startsWith('image/')) return 'image'
  if (mime?.startsWith('video/')) return 'video'
  if (mime?.startsWith('audio/')) return 'audio'
  if (/\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/i.test(url)) return 'image'
  if (/\.(mp4|webm|mov|mkv)(\?|$)/i.test(url)) return 'video'
  if (/\.(mp3|aac|ogg|opus|wav|flac)(\?|$)/i.test(url)) return 'audio'
  return 'file'
}

type RichProps = {
  content: string
  media?: NoteMedia[]
  emoji?: string[][]
}

function useParsed(content: string, emoji: string[][]) {
  return useMemo(() => {
    const event: NostrEvent = {
      kind: 1,
      content,
      tags: emoji,
      created_at: 0,
      pubkey: '',
      id: '',
      sig: '',
    }
    return [...parse(event)]
  }, [content, emoji])
}

function useRichBlocks(content: string, emoji: string[][]) {
  const parsed = useParsed(content, emoji)
  const inline: ReactNode[] = []
  const embedded: { url: string }[] = []

  parsed.forEach((block, index) => {
    if (block.type === 'text') {
      if (block.text) inline.push(textWithBreaks(block.text, `t${index}`))
      return
    }
    if (block.type === 'hashtag') {
      const query = encodeURIComponent(`#${block.value}`)
      inline.push(
        <ExternalLink
          key={index}
          href={`https://nostr.band/?q=${query}`}
          className="hashtag"
        >
          #{block.value}
        </ExternalLink>,
      )
      return
    }
    if (block.type === 'url' || block.type === 'image' || block.type === 'video' || block.type === 'audio') {
      const safe = safeHttpUrl(block.url)
      if (!safe) return
      if (block.type === 'url' && !youtubeId(safe)) {
        inline.push(
          <ExternalLink key={index} href={safe}>
            {prettyUrl(safe)}
          </ExternalLink>,
        )
        return
      }
      embedded.push({ url: safe })
      return
    }
    if (block.type === 'reference') {
      inline.push(referenceAnchor(block.pointer, index))
      return
    }
    if (block.type === 'emoji') {
      const safe = safeHttpUrl(block.url)
      if (!safe) {
        inline.push(<span key={index}>:{block.shortcode}:</span>)
        return
      }
      inline.push(
        <img
          key={index}
          className="emoji"
          src={safe}
          alt={`:${block.shortcode}:`}
          referrerPolicy="no-referrer"
        />,
      )
      return
    }
    if (block.type === 'relay') {
      inline.push(
        <code key={index} className="relay-code">
          {block.url}
        </code>,
      )
    }
  })

  return { inline, embedded }
}

export function RichContent({ content, media = [], emoji = [] }: RichProps) {
  const { inline, embedded } = useRichBlocks(content, emoji)
  const extra = media.filter((item) => !embedded.some((item2) => item2.url === item.url))

  return (
    <div className="rich">
      {inline.length > 0 && <div className="rich-text">{inline}</div>}
      {(embedded.length > 0 || extra.length > 0) && (
        <div className="note-media">
          {embedded.map((item, index) => (
            <MediaBlock key={`${item.url}-${index}`} url={item.url} />
          ))}
          {extra.map((item, index) => (
            <MediaBlock key={`${item.url}-extra-${index}`} url={item.url} mime={item.mime} />
          ))}
        </div>
      )}
    </div>
  )
}

/** Inline nostr text. Safe to place inside paragraphs and headings. */
export function RichText({ text }: { text: string }) {
  const { inline, embedded } = useRichBlocks(text, [])
  return (
    <>
      {inline}
      {embedded.map((item, index) => (
        <MediaBlock key={`${item.url}-${index}`} url={item.url} />
      ))}
    </>
  )
}
