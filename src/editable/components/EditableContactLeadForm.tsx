'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

const inputBase =
  'h-12 w-full rounded-full border border-[var(--editable-border)] bg-[var(--slot4-page-bg)] px-5 text-[14px] font-medium text-[var(--slot4-page-text)] outline-none transition duration-500 placeholder:text-[var(--slot4-soft-muted-text)] focus:border-[var(--slot4-accent)]'

export function EditableContactLeadForm() {
  const [status, setStatus] = useState<FormStatus>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('submitting')
    setMessage('')
    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.message || 'Unable to send your message.')
      setStatus('success')
      setMessage(data?.message || 'Thanks. Your message has reached the desk.')
      form.reset()
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Unable to send your message.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8">
      <div className="grid gap-4 md:grid-cols-2">
        <Field name="name" label="Full name" placeholder="Your name" required />
        <Field name="email" type="email" label="Email" placeholder="you@example.com" required />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Field name="phone" label="Phone" placeholder="Optional" />
        <Field name="subject" label="Subject" placeholder="How can we help?" />
      </div>
      <label className="mt-6 grid gap-3 text-[12px] font-medium uppercase tracking-[0.2em] text-[var(--slot4-soft-muted-text)]">
        Message
        <textarea
          name="message"
          required
          rows={6}
          placeholder="Tell the desk what you need."
          className="rounded-[18px] border border-[var(--editable-border)] bg-[var(--slot4-page-bg)] px-5 py-4 text-[14px] font-medium leading-[1.7] text-[var(--slot4-page-text)] outline-none transition duration-500 placeholder:text-[var(--slot4-soft-muted-text)] focus:border-[var(--slot4-accent)]"
        />
      </label>
      <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {message ? (
        <div
          className={`mt-6 flex items-start gap-3 rounded-full px-5 py-3 text-[13px] font-semibold ${
            status === 'success'
              ? 'bg-[var(--slot4-accent)] text-[var(--slot4-on-accent)]'
              : 'border border-[var(--editable-border)] text-[var(--slot4-page-text)]'
          }`}
        >
          {status === 'success' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : null}
          <span>{message}</span>
        </div>
      ) : null}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--slot4-accent)] px-6 text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--slot4-on-accent)] transition duration-500 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === 'submitting' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Send to the desk
      </button>
    </form>
  )
}

function Field({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
}: {
  name: string
  label: string
  type?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <label className="grid gap-3 text-[12px] font-medium uppercase tracking-[0.2em] text-[var(--slot4-soft-muted-text)]">
      {label}
      <input name={name} type={type} required={required} placeholder={placeholder} className={inputBase} />
    </label>
  )
}
