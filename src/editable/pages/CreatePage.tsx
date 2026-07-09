'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, CheckCircle2, Lock, Send } from 'lucide-react'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'
import { getTaskTheme } from '@/editable/theme/task-themes'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'

type DraftPost = {
  id: string
  task: TaskKey
  title: string
  category: string
  summary: string
  url: string
  image: string
  body: string
  createdAt: string
}

const STORE_KEY = 'slot4:created-posts'

const fieldClass =
  'h-12 w-full rounded-full border border-[var(--editable-border)] bg-[var(--slot4-page-bg)] px-5 text-[14px] font-medium text-[var(--slot4-page-text)] outline-none transition duration-500 placeholder:text-[var(--slot4-soft-muted-text)] focus:border-[var(--slot4-accent)]'

const textareaClass =
  'w-full rounded-[18px] border border-[var(--editable-border)] bg-[var(--slot4-page-bg)] px-5 py-4 text-[14px] font-medium leading-[1.7] text-[var(--slot4-page-text)] outline-none transition duration-500 placeholder:text-[var(--slot4-soft-muted-text)] focus:border-[var(--slot4-accent)]'

const saveDraft = (draft: DraftPost) => {
  try {
    const existing = JSON.parse(window.localStorage.getItem(STORE_KEY) || '[]')
    const list = Array.isArray(existing) ? existing : []
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft, ...list].slice(0, 50)))
  } catch {
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft]))
  }
}

export default function CreatePage() {
  const { session } = useEditableLocalAuthSession()
  // Profile is functional but not offered as a public creation room.
  const enabledTasks = useMemo(
    () => SITE_CONFIG.tasks.filter((task) => task.enabled && task.key !== 'profile'),
    []
  )
  const [task, setTask] = useState<TaskKey>((enabledTasks[0]?.key || 'article') as TaskKey)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [summary, setSummary] = useState('')
  const [url, setUrl] = useState('')
  const [image, setImage] = useState('')
  const [body, setBody] = useState('')
  const [created, setCreated] = useState<DraftPost | null>(null)

  const activeTheme = getTaskTheme(task)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const draft: DraftPost = {
      id: `draft-${Date.now()}`,
      task,
      title: title.trim(),
      category: category.trim() || 'uncategorized',
      summary: summary.trim(),
      url: url.trim(),
      image: image.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
    }
    saveDraft(draft)
    setCreated(draft)
    setTitle('')
    setCategory('')
    setSummary('')
    setUrl('')
    setImage('')
    setBody('')
  }

  if (!session) {
    return (
      <EditableSiteShell>
        <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
          <section className={`${dc.shell.section} pt-32 sm:pt-40 lg:pt-48`}>
            <div className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
              <EditableReveal>
                <div className="flex h-72 items-center justify-center rounded-[24px] border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)]">
                  <Lock className="h-20 w-20 text-[var(--slot4-accent)]" />
                </div>
              </EditableReveal>
              <EditableReveal index={1}>
                <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-accent)]">
                  {pagesContent.create.locked.badge}
                </p>
                <h1 className="editable-display mt-8 text-[52px] font-medium leading-[0.95] tracking-[-0.03em] sm:text-[72px]">
                  {pagesContent.create.locked.title}
                </h1>
                <p className="mt-8 max-w-xl text-[16px] leading-[1.7] text-[var(--slot4-muted-text)]">
                  {pagesContent.create.locked.description}
                </p>
                <div className="mt-10 flex flex-wrap gap-3">
                  <Link href="/login" className={dc.button.primary}>
                    Sign in <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link href="/signup" className={dc.button.secondary}>
                    Get started
                  </Link>
                </div>
              </EditableReveal>
            </div>
          </section>
        </main>
      </EditableSiteShell>
    )
  }

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className={`${dc.shell.section} pt-32 sm:pt-40 lg:pt-48`}>
          <EditableReveal>
            <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-accent)]">
              {pagesContent.create.hero.badge}
            </p>
            <h1 className="editable-display mt-8 max-w-3xl text-[52px] font-medium leading-[0.95] tracking-[-0.03em] sm:text-[80px]">
              {pagesContent.create.hero.title}
            </h1>
            <p className="mt-8 max-w-xl text-[16px] leading-[1.7] text-[var(--slot4-muted-text)]">
              {pagesContent.create.hero.description}
            </p>
          </EditableReveal>
        </section>

        <section className={`${dc.shell.section} py-16 sm:py-20`}>
          <div className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr]">
            <aside>
              <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-accent)]">
                Pick a room
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {enabledTasks.map((item) => {
                  const active = item.key === task
                  const theme = getTaskTheme(item.key as TaskKey)
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setTask(item.key as TaskKey)}
                      className={`rounded-[18px] border p-5 text-left transition duration-500 ${
                        active
                          ? 'border-[var(--slot4-accent)] bg-[var(--slot4-accent)] text-[var(--slot4-on-accent)]'
                          : 'border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] hover:border-[var(--slot4-accent)]'
                      }`}
                    >
                      <span className="editable-mono text-[11px] font-medium uppercase tracking-[0.2em] opacity-70">
                        Room
                      </span>
                      <span className="editable-display mt-3 block text-[20px] font-medium tracking-[-0.02em]">
                        {theme.kicker}
                      </span>
                      <span className="mt-2 block text-[12px] leading-[1.5] opacity-70">
                        {theme.note}
                      </span>
                    </button>
                  )
                })}
              </div>
            </aside>

            <form
              onSubmit={submit}
              className="rounded-[24px] border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] p-8 sm:p-10"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-accent)]">
                    New entry · {activeTheme.kicker}
                  </p>
                  <h2 className="editable-display mt-3 text-[28px] font-medium tracking-[-0.02em]">
                    {pagesContent.create.formTitle}
                  </h2>
                </div>
                <span className="editable-mono rounded-full border border-[var(--editable-border)] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--slot4-muted-text)]">
                  {session.name}
                </span>
              </div>

              <div className="mt-8 grid gap-4">
                <input
                  className={fieldClass}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Entry title"
                  required
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    className={fieldClass}
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    placeholder="Category"
                  />
                  <input
                    className={fieldClass}
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="Source URL"
                  />
                </div>
                <input
                  className={fieldClass}
                  value={image}
                  onChange={(event) => setImage(event.target.value)}
                  placeholder="Cover image URL"
                />
                <textarea
                  className={`${textareaClass} min-h-24`}
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  placeholder="Lead paragraph"
                  required
                />
                <textarea
                  className={`${textareaClass} min-h-48`}
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="Body — the full entry, notes, and details."
                  required
                />
              </div>

              {created ? (
                <div className="mt-6 flex items-start gap-3 rounded-full bg-[var(--slot4-accent)] px-5 py-3 text-[13px] font-semibold text-[var(--slot4-on-accent)]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    {pagesContent.create.successTitle} — <span className="opacity-70">{created.title}</span>
                  </span>
                </div>
              ) : null}

              <button
                type="submit"
                className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--slot4-accent)] px-6 text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--slot4-on-accent)] transition duration-500 hover:brightness-95"
              >
                <Send className="h-4 w-4" /> {pagesContent.create.submitLabel}
              </button>
            </form>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
