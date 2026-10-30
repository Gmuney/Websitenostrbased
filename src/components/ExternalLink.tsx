import type { ReactNode } from 'react'

type Props = {
  href: string
  className?: string
  children: ReactNode
}

export function ExternalLink({ href, className, children }: Props) {
  return (
    <a href={href} className={className} target="_blank" rel="noreferrer">
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}
