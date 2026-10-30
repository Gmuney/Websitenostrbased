import type { ReactNode } from 'react'
import { safeHttpUrl } from '../nostr/format'
import { RichText } from './RichContent'

type Block =
  | { type: 'h'; level: number; text: string }
  | { type: 'p'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'code'; text: string }
  | { type: 'image'; alt: string; url: string }

function parseBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const blocks: Block[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index] ?? ''
    if (!line.trim()) {
      index += 1
      continue
    }
    if (line.startsWith('```')) {
      const buffer: string[] = []
      index += 1
      while (index < lines.length && !lines[index]?.startsWith('```')) {
        buffer.push(lines[index] ?? '')
        index += 1
      }
      index += 1
      blocks.push({ type: 'code', text: buffer.join('\n') })
      continue
    }

    const image = /^!\[([^\]]*)]\((https?:\/\/[^\s)]+)\)$/.exec(line.trim())
    if (image) {
      const url = safeHttpUrl(image[2] ?? '')
      if (url) blocks.push({ type: 'image', alt: image[1] ?? '', url })
      index += 1
      continue
    }

    const heading = /^(#{1,3})\s+(.*)$/.exec(line)
    if (heading) {
      blocks.push({
        type: 'h',
        level: heading[1]?.length ?? 1,
        text: heading[2] ?? '',
      })
      index += 1
      continue
    }

    if (line.startsWith('>')) {
      const buffer: string[] = []
      while (index < lines.length && (lines[index]?.startsWith('>') ?? false)) {
        buffer.push((lines[index] ?? '').replace(/^>\s?/, ''))
        index += 1
      }
      blocks.push({ type: 'quote', text: buffer.join('\n') })
      continue
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = []
      while (index < lines.length && /^\s*[-*]\s+/.test(lines[index] ?? '')) {
        items.push((lines[index] ?? '').replace(/^\s*[-*]\s+/, ''))
        index += 1
      }
      blocks.push({ type: 'ul', items })
      continue
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index] ?? '')) {
        items.push((lines[index] ?? '').replace(/^\s*\d+\.\s+/, ''))
        index += 1
      }
      blocks.push({ type: 'ol', items })
      continue
    }

    const buffer = [line]
    index += 1
    while (
      index < lines.length &&
      (lines[index]?.trim() ?? '') &&
      !/^(#{1,3}\s|>|```|\s*[-*]\s|\s*\d+\.\s|!\[)/.test(lines[index] ?? '')
    ) {
      buffer.push(lines[index] ?? '')
      index += 1
    }
    blocks.push({ type: 'p', text: buffer.join(' ') })
  }

  return blocks
}

function renderInline(text: string, key: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const pattern =
    /(!?\[([^\]]*)\]\((https?:\/\/[^\s)]+)\))|(\*\*([^*]+)\*\*)|(?<!\*)\*([^*]+)\*(?!\*)|(`([^`]+)`)/g
  let last = 0
  let match: RegExpExecArray | null
  let index = 0
  while ((match = pattern.exec(text))) {
    const start = match.index
    if (start > last) {
      nodes.push(<RichText key={`${key}-t-${index}`} text={text.slice(last, start)} />)
    }
    if (match[1]?.startsWith('!')) {
      const url = safeHttpUrl(match[3] ?? '')
      if (url) {
        nodes.push(
          <img key={`${key}-i-${index}`} src={url} alt={match[2] ?? ''} loading="lazy" />,
        )
      }
    } else if (match[1]) {
      const url = safeHttpUrl(match[3] ?? '')
      const label = match[2] || url || match[1]
      nodes.push(
        url ? (
          <a key={`${key}-a-${index}`} href={url} target="_blank" rel="noreferrer">
            <RichText text={label} />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          <RichText key={`${key}-a-${index}`} text={label} />
        ),
      )
    } else if (match[4]) {
      nodes.push(
        <strong key={`${key}-b-${index}`}>
          <RichText text={match[5] ?? ''} />
        </strong>,
      )
    } else if (match[6]) {
      nodes.push(
        <em key={`${key}-e-${index}`}>
          <RichText text={match[6]} />
        </em>,
      )
    } else if (match[7]) {
      nodes.push(<code key={`${key}-c-${index}`}>{match[8]}</code>)
    }
    last = start + match[0].length
    index += 1
  }
  if (last < text.length) {
    nodes.push(<RichText key={`${key}-t-end`} text={text.slice(last)} />)
  }
  return nodes
}

type Props = {
  content: string
  title: string
}

export function Markdown({ content, title }: Props) {
  let source = content
  const leading = /^#\s+(.+)\n?/.exec(source)
  if (leading && leading[1]?.trim() === title.trim()) {
    source = source.slice(leading[0].length)
  }
  const blocks = parseBlocks(source)

  return (
    <div className="markdown">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`
        if (block.type === 'h') {
          const Heading = block.level <= 1 ? 'h3' : block.level === 2 ? 'h4' : 'h5'
          return <Heading key={key}>{renderInline(block.text, key)}</Heading>
        }
        if (block.type === 'quote') {
          return <blockquote key={key}>{renderInline(block.text, key)}</blockquote>
        }
        if (block.type === 'ul') {
          return (
            <ul key={key}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item, `${key}-${itemIndex}`)}</li>
              ))}
            </ul>
          )
        }
        if (block.type === 'ol') {
          return (
            <ol key={key}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item, `${key}-${itemIndex}`)}</li>
              ))}
            </ol>
          )
        }
        if (block.type === 'code') {
          return (
            <pre key={key}>
              <code>{block.text}</code>
            </pre>
          )
        }
        if (block.type === 'image') {
          return <img key={key} src={block.url} alt={block.alt} loading="lazy" />
        }
        return <p key={key}>{renderInline(block.text, key)}</p>
      })}
    </div>
  )
}
