'use client'

import { useEffect, useState } from 'react'

/**
 * Fixed-position accent bar that tracks how far the reader has scrolled
 * through the article body. Runs off scroll position, respects reduced motion.
 */
export function EditableReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const compute = () => {
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      if (max <= 0) return setProgress(0)
      const value = Math.min(1, Math.max(0, window.scrollY / max))
      setProgress(value)
    }
    compute()
    window.addEventListener('scroll', compute, { passive: true })
    window.addEventListener('resize', compute)
    return () => {
      window.removeEventListener('scroll', compute)
      window.removeEventListener('resize', compute)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent"
    >
      <div
        className="h-full origin-left bg-[var(--tk-accent,#dce233)]"
        style={{ transform: `scaleX(${progress})`, transition: 'transform 120ms linear' }}
      />
    </div>
  )
}
