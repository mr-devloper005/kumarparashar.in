import { cn } from '@/lib/utils'

type LoadingStateProps = {
  label?: string
  className?: string
}

function PulseBlock({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-[14px] bg-[var(--editable-border)]', className)} />
}

export function PageLoadingState({ label = 'Loading', className }: LoadingStateProps) {
  return (
    <div
      className={cn('mx-auto w-full max-w-[var(--editable-container)] px-6 pt-32 sm:px-10 sm:pt-40 lg:px-14 lg:pt-48', className)}
      aria-live="polite"
      aria-busy="true"
    >
      <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-accent)]">
        {label}
      </p>
      <PulseBlock className="mt-8 h-16 w-3/4 max-w-3xl" />
      <PulseBlock className="mt-4 h-5 w-2/3 max-w-2xl" />
      <div className="mt-14 grid gap-8 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="rounded-[18px] border border-[var(--editable-border)] p-6">
            <PulseBlock className="h-44 w-full" />
            <PulseBlock className="mt-5 h-5 w-4/5" />
            <PulseBlock className="mt-3 h-4 w-3/5" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function CardGridLoadingState({ count = 6, className }: LoadingStateProps & { count?: number }) {
  return (
    <div className={cn('grid gap-6 sm:grid-cols-2 lg:grid-cols-3', className)} aria-live="polite" aria-busy="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-[18px] border border-[var(--editable-border)] p-4">
          <PulseBlock className="h-40 w-full" />
          <PulseBlock className="mt-5 h-5 w-5/6" />
          <PulseBlock className="mt-3 h-4 w-2/3" />
          <PulseBlock className="mt-6 h-9 w-32 rounded-full" />
        </div>
      ))}
    </div>
  )
}

export function DetailLoadingState({ label = 'Loading entry', className }: LoadingStateProps) {
  return (
    <div
      className={cn('mx-auto grid w-full max-w-[var(--editable-container)] gap-16 px-6 pt-32 sm:px-10 sm:pt-40 lg:grid-cols-[0.8fr_1.2fr] lg:px-14 lg:pt-48', className)}
      aria-live="polite"
      aria-busy="true"
    >
      <PulseBlock className="h-80 w-full rounded-[24px]" />
      <div>
        <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-accent)]">
          {label}
        </p>
        <PulseBlock className="mt-6 h-16 w-4/5" />
        <PulseBlock className="mt-6 h-4 w-full" />
        <PulseBlock className="mt-3 h-4 w-5/6" />
        <PulseBlock className="mt-3 h-4 w-2/3" />
      </div>
    </div>
  )
}
