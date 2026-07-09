import Link from 'next/link'
import { ArrowUpRight, SearchX } from 'lucide-react'
import { cn } from '@/lib/utils'

type EmptyStateProps = {
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  className?: string
}

export function EmptyState({
  title = 'Nothing on the desk yet',
  description = 'Fresh entries will appear here as they land.',
  actionLabel = 'Back to home',
  actionHref = '/',
  className,
}: EmptyStateProps) {
  return (
    <section
      className={cn(
        'rounded-[24px] border border-dashed border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] p-14 text-center',
        className
      )}
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
        <SearchX className="h-6 w-6" />
      </div>
      <h2 className="editable-display mt-8 text-[32px] font-medium tracking-[-0.02em]">{title}</h2>
      <p className="mx-auto mt-4 max-w-xl text-[14px] leading-[1.65] text-[var(--slot4-muted-text)]">
        {description}
      </p>
      <Link
        href={actionHref}
        className="mt-8 inline-flex items-center gap-2 rounded-full border border-[var(--editable-border-strong)] px-6 py-3 text-[13px] font-semibold text-[var(--slot4-page-text)] transition duration-500 hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]"
      >
        {actionLabel}
        <ArrowUpRight className="h-4 w-4" />
      </Link>
    </section>
  )
}

export function TaskEmptyState({ taskLabel = 'entries', className }: { taskLabel?: string; className?: string }) {
  return (
    <EmptyState
      className={className}
      title={`No ${taskLabel} available yet`}
      description={`Fresh ${taskLabel} land here as they come in — the page stays ready even when the shelf is empty.`}
      actionLabel="Return home"
      actionHref="/"
    />
  )
}

export function ContactSuccessState({ className }: { className?: string }) {
  return (
    <EmptyState
      className={className}
      title="Message received"
      description="Thanks for writing. Your note is with the desk and will be routed through the right lane."
      actionLabel="Return home"
      actionHref="/"
    />
  )
}
