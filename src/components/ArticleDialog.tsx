import { useEffect, useRef } from 'react'
import type { ArticleItem } from '../nostr/content'
import { formatAbsolute, toIso } from '../nostr/format'
import { Markdown } from './Markdown'

type Props = {
  article: ArticleItem | null
  onClose: () => void
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

export function ArticleDialog({ article, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!article) return
    const root = ref.current
    const previously = document.activeElement
    const items = () => (root ? [...root.querySelectorAll<HTMLElement>(FOCUSABLE)] : [])
    items()[0]?.focus()

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const focusable = items()
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      if (previously instanceof HTMLElement) previously.focus()
    }
  }, [article, onClose])

  if (!article) return null

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div
        ref={ref}
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="article-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dialog-bar">
          <button type="button" className="dialog-close" onClick={onClose}>
            Close
          </button>
        </div>
        <p className="kicker">Long-form</p>
        <h2 id="article-title">{article.title}</h2>
        <p className="article-date">
          <time dateTime={toIso(article.publishedAt)}>{formatAbsolute(article.publishedAt)}</time>
        </p>
        {article.image && (
          <img className="article-hero" src={article.image} alt="" />
        )}
        <Markdown content={article.content} title={article.title} />
      </div>
    </div>
  )
}
