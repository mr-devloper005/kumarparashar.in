'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { MessageCircle, Send } from 'lucide-react'

type Comment = { id: string; name: string; comment: string; createdAt: string }

const storageKey = (slug: string) => `editable:article-comments:${slug}`

function timeAgo(value?: string) {
  if (!value) return ''
  const then = new Date(value).getTime()
  if (Number.isNaN(then)) return ''
  const mins = Math.max(1, Math.floor((Date.now() - then) / 60000))
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} ${days === 1 ? 'day' : 'days'} ago`
  return new Date(then).toLocaleDateString()
}

function initial(name: string) {
  return (name.trim()[0] || 'G').toUpperCase()
}

export function EditableArticleComments({ slug, comments = [] }: { slug: string; comments?: Comment[] }) {
  const [stored, setStored] = useState<Comment[]>([])
  const [name, setName] = useState('')
  const [text, setText] = useState('')

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(slug))
      setStored(raw ? (JSON.parse(raw) as Comment[]) : [])
    } catch {
      setStored([])
    }
  }, [slug])

  const persist = (next: Comment[]) => {
    setStored(next)
    try {
      window.localStorage.setItem(storageKey(slug), JSON.stringify(next))
    } catch {
      /* storage unavailable — keep the in-memory list */
    }
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const body = text.trim()
    if (!body) return
    const entry: Comment = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim() || 'Guest',
      comment: body,
      createdAt: new Date().toISOString(),
    }
    persist([entry, ...stored])
    setText('')
  }

  const all = useMemo(() => [...stored, ...comments], [stored, comments])

  return (
    <section className="mt-20 border-t border-[var(--tk-line)] pt-14">
      <div className="flex items-center gap-3 editable-mono text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--tk-accent)]">
        <MessageCircle className="h-4 w-4" /> Notes ({String(all.length).padStart(2, '0')})
      </div>

      <form
        onSubmit={submit}
        className="mt-8 rounded-[18px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6"
      >
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name (optional)"
          maxLength={60}
          className="h-11 w-full rounded-full border border-[var(--tk-line)] bg-[var(--tk-bg)] px-5 text-[14px] font-medium text-[var(--tk-text)] outline-none transition duration-500 focus:border-[var(--tk-accent)]"
        />
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Add a note to the piece…"
          rows={3}
          maxLength={1500}
          className="mt-3 w-full resize-y rounded-[18px] border border-[var(--tk-line)] bg-[var(--tk-bg)] px-5 py-4 text-[14px] leading-6 text-[var(--tk-text)] outline-none transition duration-500 focus:border-[var(--tk-accent)]"
        />
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={!text.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-6 py-3 text-[13px] font-semibold text-[var(--tk-on-accent)] transition duration-500 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" /> Post note
          </button>
        </div>
      </form>

      <div className="mt-8 grid gap-4">
        {all.map((comment) => (
          <div
            key={comment.id}
            className="rounded-[18px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] editable-display text-[14px] font-medium text-[var(--tk-accent)]">
                {initial(comment.name)}
              </span>
              <div className="min-w-0">
                <p className="editable-display truncate text-[14px] font-medium text-[var(--tk-text)]">
                  {comment.name || 'Guest'}
                </p>
                {comment.createdAt ? (
                  <p className="editable-mono text-[11px] uppercase tracking-[0.18em] text-[var(--tk-muted)]">
                    {timeAgo(comment.createdAt)}
                  </p>
                ) : null}
              </div>
            </div>
            <p className="mt-4 whitespace-pre-line text-[14px] leading-[1.7] text-[var(--tk-text)]">
              {comment.comment}
            </p>
          </div>
        ))}
        {!all.length ? (
          <p className="text-[13px] text-[var(--tk-muted)]">Be the first to leave a note.</p>
        ) : null}
      </div>
    </section>
  )
}
