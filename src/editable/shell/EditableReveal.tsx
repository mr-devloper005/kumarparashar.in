'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  /** Stagger index (each item = index * 80ms delay) */
  index?: number
  /** Custom delay in ms (overrides `index`) */
  delay?: number
  /** Extra classes */
  className?: string
  /** Render as this tag */
  as?: 'div' | 'section' | 'article' | 'header' | 'li'
}

/**
 * Modda-feel scroll-reveal: fade + slide up + blur out, once, on intersect.
 *
 * Reveal is only *armed* after mount so JS-off visitors see fully rendered
 * content immediately. `prefers-reduced-motion` bypasses the transform.
 */
export function EditableReveal({ children, index = 0, delay, className = '', as = 'div' }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [armed, setArmed] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setArmed(true)
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
            break
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const style: CSSProperties = {
    transitionDelay: `${delay ?? Math.min(index * 80, 720)}ms`,
  }

  const cls = `editable-reveal ${armed ? 'is-armed' : ''} ${visible ? 'is-visible' : ''} ${className}`.trim()
  const Tag = as as 'div'
  return (
    <Tag ref={ref as never} className={cls} style={style}>
      {children}
    </Tag>
  )
}
